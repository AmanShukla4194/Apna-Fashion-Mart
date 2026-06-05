# AWS Setup Guide — Beginner to Production
## A tutorial on how to set up AWS for a full-stack app (Next.js + Flutter)
### Region: ap-south-1 (Mumbai)

---

## PHASE 1 — AWS Account and IAM Setup

### What is AWS IAM?

IAM stands for **Identity and Access Management**. It is AWS's system for controlling who can do what inside your AWS account.

Think of it like this:
- Your AWS account is a company building
- The **root user** is the building owner (has master keys to everything)
- **IAM users** are employees with specific access badges
- **IAM policies** are the rules defining which doors each badge can open

### Why you should never use the root account for daily work

The root account has unrestricted access to everything in your AWS account — including billing, deleting the entire account, and all services. If root credentials are ever compromised (leaked, phished), the attacker has total control. AWS itself recommends: create an IAM admin user on day one, lock away root credentials, and never use root again for daily operations.

### What to do — step by step

1. Log in as root user at aws.amazon.com
2. Select your region (e.g. **ap-south-1 Mumbai** for India — pick the region closest to your users for lowest latency)
3. Go to **IAM → Users → Create user**
4. Create an admin user:
   - **Username**: anything you like (e.g. `MyProject-Admin`)
   - **Policy**: `AdministratorAccess` (can do everything except manage billing root settings)
   - **Console access**: Enabled with a password
5. Log out of root
6. Log in as the IAM user — use this account for all future AWS work

### Understanding the ARN (Amazon Resource Name)

Every single resource in AWS has a unique identifier called an ARN. Example:

```
arn:aws:iam::099090990394:user/Latticeteams-Admin
 │    │    │       │              │
 │    │    │       │              └── Resource type and name
 │    │    │       └── Your 12-digit account ID
 │    │    └── The AWS service (iam, rds, lambda, s3, etc.)
 │    └── The partition (always "aws" for standard regions)
 └── Prefix that identifies this as an Amazon Resource Name
```

You will see ARNs everywhere in AWS — when setting permissions, connecting services, and reading logs.

---

## PHASE 2 — AWS Cognito (Authentication)

### What problem Cognito solves

Every app that has user accounts needs:
- Sign up with email + password
- Email verification
- Login and logout
- "Forgot password" flow
- Keeping users logged in (session/token management)
- Protecting API routes so only logged-in users can access them

Building all of this yourself is time-consuming and risky (password storage, hashing, token expiry, security vulnerabilities). **AWS Cognito is a managed service that handles all of this for you.**

### Key concept: User Pool vs Identity Pool

**User Pool** (what we use):
- A database of your app's users
- Handles sign-up, sign-in, email verification, password reset
- Returns JWT tokens (JSON Web Tokens) after successful login
- Think of it as: "Who is this person and did they provide the right password?"

**Identity Pool** (we do NOT use this):
- Maps users to AWS IAM roles
- Used when users need to directly access AWS services (like uploading to S3 from the browser)
- We handle S3 uploads via Lambda pre-signed URLs instead, so we skip this

### What a JWT token is

When a user logs in successfully, Cognito returns 3 tokens:

**1. IdToken**
- Contains information ABOUT the user: their email, name, Cognito user ID (`sub`), custom attributes
- Your Lambda functions read this to know who is making the request
- Expires in 1 hour
- Example decoded content:
  ```json
  {
    "sub": "abc-123-xyz-unique-id",
    "email": "aman@gmail.com",
    "name": "Aman",
    "cognito:username": "aman@gmail.com",
    "exp": 1748000000
  }
  ```

**2. AccessToken**
- Proves the user is currently authenticated
- Used for Cognito API calls (like changing password)
- Expires in 1 hour

**3. RefreshToken**
- Used to get new IdToken and AccessToken when they expire (without asking the user to log in again)
- Expires in 30 days by default
- Stored securely on the device

### How the login flow works end to end

```
Step 1: User opens the app and types email + password

Step 2: App sends a POST request directly to Cognito (not your Lambda):
  URL: https://cognito-idp.ap-south-1.amazonaws.com/
  Header: X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth
  Body: {
    "AuthFlow": "USER_PASSWORD_AUTH",
    "ClientId": "your-client-id",
    "AuthParameters": {
      "USERNAME": "aman@gmail.com",
      "PASSWORD": "their-password"
    }
  }

Step 3: Cognito verifies the password and returns:
  {
    "AuthenticationResult": {
      "IdToken": "eyJhbGc...(long JWT string)",
      "AccessToken": "eyJhbGc...",
      "RefreshToken": "eyJhbGc...",
      "ExpiresIn": 3600
    }
  }

Step 4: App stores the tokens:
  Flutter → FlutterSecureStorage (encrypted storage on Android/iOS)
  Next.js → httpOnly cookie (can't be read by JavaScript, safe from XSS)

Step 5: Every API call to your backend includes the IdToken:
  GET https://your-api-gateway-url/products
  Authorization: Bearer eyJhbGc...(IdToken)

Step 6: API Gateway checks the token automatically using a JWT Authorizer
  - Fetches Cognito's public keys (JWKS endpoint)
  - Verifies the token signature is genuinely from your Cognito User Pool
  - Checks the token hasn't expired
  - If valid → passes the request to Lambda
  - If invalid → returns 401 Unauthorized immediately (Lambda never even runs)

Step 7: Lambda reads the user info from the token:
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  // now we know who is making the request
```

### What "SPA app client" means

When creating the User Pool, you choose the "app type." Choose **Single-page application (SPA).**

This determines:
- **No client secret** — because Flutter apps and browser apps cannot safely store a secret (anyone can decompile the app and find it). SPA apps authenticate without a secret.
- **Auth flow**: `USER_PASSWORD_AUTH` — the app sends username + password directly to Cognito
- **Token delivery**: tokens returned directly in the API response (not via redirect)

This type works correctly for both a Flutter mobile app AND a Next.js web app from the same User Pool.

### What happens when a new user signs up

```
Step 1: User fills out sign-up form (name, email, password)

Step 2: App sends sign-up request to Cognito:
  Action: AWSCognitoIdentityProviderService.SignUp
  Body: { email, password, name }

Step 3: Cognito creates the user in the User Pool (status: UNCONFIRMED)
  AND sends a verification email with a 6-digit code

Step 4: User enters the code in the app

Step 5: App sends confirm request to Cognito:
  Action: AWSCognitoIdentityProviderService.ConfirmSignUp

Step 6: Cognito marks the user as CONFIRMED
  AND fires a "Post Confirmation" trigger (a Lambda function you connect)

Step 7: The trigger Lambda runs and inserts a new row into your database:
  INSERT INTO users (cognito_sub, email, full_name, role)
  VALUES ('abc-123-xyz', 'aman@gmail.com', 'Aman', 'customer');

Step 8: Now the user exists in BOTH Cognito (for auth) AND your database (for profile data)
```

### How Cognito connects to your database

Cognito and your database are completely separate systems. They are linked by a single value: the **`cognito_sub`**.

- `sub` is short for "subject" — it is a UUID that Cognito assigns to every user
- It never changes, even if the user changes their email
- Your `users` table has a `cognito_sub` column that stores this value
- When Lambda processes an API request, it reads the `sub` from the JWT token and uses it to look up the user:
  ```sql
  SELECT * FROM users WHERE cognito_sub = 'abc-123-xyz';
  ```

### How to create the User Pool — step by step

1. In AWS Console, search for **Cognito** → **User Pools** → **Create user pool**
2. Configure:
   - App type: **Single-page application**
   - Pool name: your app name (e.g. `my-app`)
   - Sign-in identifier: **Email**
   - Self-registration: **On** (users can sign up themselves)
   - Required attributes: **name** (email is always required)
   - Return/callback URL: your app's URL
3. After creation, note down:
   - **User Pool ID** — looks like `ap-south-1_XXXXXXXXX`
   - **Client ID** — found in the App clients tab, looks like `2p1qrpgnb70skct4ea6o3ompnd`

### Where these IDs are used in code

**Flutter** (`lib/core/constants/env.dart`):
```dart
class Env {
  static const cognitoUserPoolId = String.fromEnvironment(
    'COGNITO_USER_POOL_ID',
    defaultValue: 'ap-south-1_XXXXXXXXX',
  );
  static const cognitoClientId = String.fromEnvironment(
    'COGNITO_CLIENT_ID',
    defaultValue: 'your-client-id-here',
  );
  static const cognitoRegion = 'ap-south-1';
}
```

**Next.js** (`.env.local`):
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_COGNITO_REGION=ap-south-1
```

The `String.fromEnvironment` in Dart means: at build time, inject this value from the environment. The `defaultValue` is the fallback for local development. In production Flutter builds, you pass real values via `--dart-define`.

---

## PHASE 3 — RDS Aurora PostgreSQL (Database)

### What is RDS Aurora?

**RDS** = Relational Database Service — AWS's managed database service. You don't install or maintain the database server yourself; AWS handles backups, patches, failover, and scaling.

**Aurora** = Amazon's own database engine built for the cloud. It is fully compatible with PostgreSQL (you use the exact same SQL, same drivers, same tools) but with better performance and cloud-native features.

**Aurora Serverless v2** = a version of Aurora that automatically scales compute capacity up and down based on how much load the database is under — and can scale all the way down to zero when there is no traffic, saving you money.

### Why PostgreSQL and not MySQL or DynamoDB?

- **PostgreSQL** supports advanced features like `PostGIS` for geospatial queries (finding shops near a user's location) and `pg_trgm` for fuzzy text search on product names
- **DynamoDB** (AWS's NoSQL database) is great for simple key-value lookups but complex queries (e.g. filter products by category AND price AND size AND nearby location) are significantly harder to write
- Relational data (users have orders, orders have items, items are products from shops) fits a relational database naturally

### What "Serverless v2" means

Traditional database: you pay for a fixed server size (e.g. 2 CPU, 8GB RAM) 24/7 even when nobody is using your app at 3am.

Serverless v2: the database scales from **0 ACU** (Aurora Capacity Units) to your configured maximum. At 0 ACU it is essentially paused. When a request comes in it wakes up in approximately 1–2 seconds.

Recommended configuration for a new project:
- **Min: 0 ACU** — scales to zero after inactivity (costs nothing when idle)
- **Max: 4 ACU** — handles ~800 simultaneous connections under peak load
- **Pause after**: 300 seconds (5 minutes) of inactivity

### What "IAM Authentication" means for the database

Normally you connect to a PostgreSQL database with a username + password. The password is fixed and must be stored somewhere, which creates a security risk if it leaks.

With IAM authentication:
- There is no fixed password
- Instead, your Lambda function uses its AWS identity to request a **temporary auth token** that is valid for only 15 minutes
- The token is generated automatically using the AWS SDK — no password to store anywhere, no secret to leak
- This is AWS best practice for Lambda-to-RDS connections

```
Lambda function runs
      ↓
AWS SDK generates an IAM auth token using the Lambda's IAM role
(token is valid for 15 minutes, generated fresh per connection)
      ↓
Lambda connects to Aurora using the token as the password
      ↓
Aurora verifies the token with AWS IAM
      ↓
Connection established — no stored password anywhere
```

### How to create the database — step by step

1. AWS Console → **RDS** → **Create database**
2. Settings to select:
   - Engine: **Aurora (PostgreSQL Compatible)**
   - Creation method: **Express configuration** (gives you Serverless v2 with sensible defaults)
   - DB engine version: latest (e.g. 17)
   - DB cluster identifier: a name for your cluster (e.g. `my-app-db`)
   - Instance type: **Serverless** (auto-scaling)
   - Min ACU: `0`, Max ACU: `4`
   - Pause after inactivity: `300` seconds
   - Internet access gateway: **Enabled** (needed for development — restrict in production)
   - Authentication: **IAM**
3. Click **Create database** and wait ~5 minutes
4. After creation, go to **Connectivity & security → Endpoints** and note:
   - **Writer endpoint** — use this for all database connections from Lambda
   - **Port**: 5432 (standard PostgreSQL)

### Fixing the security group (required before connecting)

Even though the database is publicly accessible, a security group (firewall) still blocks port 5432 by default. You must open it:

1. RDS → your cluster → Connectivity & security → VPC security groups → click the group name
2. **Inbound rules** → **Edit inbound rules** → **Add rule**:
   - Type: `PostgreSQL`
   - Port: `5432`
   - Source: `0.0.0.0/0` (anywhere — fine for development, restrict to Lambda's security group in production)
3. **Save rules**

### Running the schema via AWS CloudShell

Since the database uses IAM authentication (no password), you use the AWS CloudShell (a browser-based terminal already logged in as your IAM user) to connect:

**Step 1** — Open CloudShell: click the `>_` icon in the AWS console toolbar

**Step 2** — Check what PostgreSQL version is already available (CloudShell usually has one pre-installed):
```bash
psql --version
```
If it shows `psql (PostgreSQL 16.x)` or any version, skip the install — use it directly. If nothing is found, install:
```bash
sudo dnf install -y postgresql15
```
Note: CloudShell's pre-installed version may conflict with installing a different version. Always check first.

**Step 3** — Generate an IAM auth token (valid for 15 minutes):
```bash
TOKEN=$(aws rds generate-db-auth-token \
  --hostname YOUR_WRITER_ENDPOINT \
  --port 5432 \
  --region ap-south-1 \
  --username postgres)
```

**Step 4** — Connect to the database (SSL is required for IAM auth):
```bash
PGPASSWORD=$TOKEN psql \
  "host=YOUR_WRITER_ENDPOINT port=5432 user=postgres dbname=postgres sslmode=require"
```

**Step 5** — You will see a `postgres=#` prompt. Paste your schema SQL and press Enter to run it.

### What to put in the schema

A well-designed schema for a marketplace app should have:

**`users`** — Profile data for every user. Linked to Cognito via `cognito_sub`. Stores name, phone, city, role (customer/vendor/admin).

**`categories`** — Product categories. Has a `parent_id` for subcategories (e.g. "Ethnic Wear" → "Kurtas").

**`shops`** — Vendor stores. Stores address, GPS location (for nearby search), opening hours, ratings, and a status field so admins can approve new shops before they go live.

**`products`** — Every item for sale. Linked to a shop and category. Store prices as **integers in the smallest currency unit** (paise for India: ₹1 = 100 paise) to avoid floating-point precision bugs. Never store money as a decimal.

**`addresses`** — Saved delivery addresses per user. Multiple allowed, one marked as default.

**`orders`** — Each purchase. Always store a **snapshot** of the delivery address and product details at order time — if the user later changes their address or the vendor changes the price, the order history must remain accurate.

**`order_items`** — Each product line within an order, with the price locked at the time of purchase.

**`reviews`** — Ratings (1–5 stars). Mark reviews from verified purchasers (linked to a real order) differently from unverified ones.

**`wishlist`** — Products a customer has saved. A simple join table between users and products.

**`cart_items`** — Server-side cart so it persists across devices and app restarts.

### Special PostgreSQL extensions worth knowing

**`uuid-ossp`** — Generates UUID primary keys with `uuid_generate_v4()`. Better than auto-increment integers because they don't reveal how many records exist and can be safely generated on the client before the record is saved.

**`pg_trgm`** — Trigram fuzzy search. Breaks text into overlapping 3-character chunks and indexes them. Lets users search "banarasi" and find "Banarsi Silk Saree". Enabled via a GIN index on your product name column.

**`postgis`** — Geospatial data types and functions. Stores GPS coordinates as `GEOGRAPHY(POINT)` and enables queries like "find all shops within 5km of this location" using accurate spherical geometry.

### Database triggers (automatic background logic)

Triggers are functions that run automatically after database operations — no application code needed:

**`set_updated_at()`** — Fires on every row UPDATE. Sets `updated_at = NOW()` automatically so your application never has to remember to do it.

**`update_product_rating()`** — Fires after any INSERT/UPDATE/DELETE on the reviews table. Recalculates and stores the average rating and review count directly on the product row, so you never need a slow `AVG()` query at read time.

**`update_shop_product_count()`** — Fires after any product change. Keeps the shop's `product_count` column in sync automatically.

---

## Summary: How Phases 1, 2, and 3 work together

```
User opens the app
        ↓
Phase 2 (Cognito) handles login
"Are you who you say you are?"
        ↓ returns JWT token
        ↓
User makes a request (e.g. view their orders)
        ↓
App sends: GET /orders
           Authorization: Bearer <JWT from Cognito>
        ↓
API Gateway (Phase 6) verifies the JWT with Cognito's public keys
        ↓
Lambda function runs (Phase 5)
Reads cognito_sub from the JWT token
        ↓
Phase 3 (Aurora) is queried:
SELECT * FROM orders WHERE user_id = (
  SELECT id FROM users WHERE cognito_sub = 'abc-123-xyz'
)
        ↓
Result returned to the user
```

**Phase 1 (IAM)** is the invisible foundation — it defines what your Lambda functions are allowed to do. Without IAM roles and permissions, Lambda cannot generate the database auth token and cannot call Cognito APIs. Everything else builds on top of it.

---

## Progress Tracker

| Phase | Service | Status |
|---|---|---|
| 1 | IAM | ✅ Done |
| 2 | Cognito | ✅ Done |
| 3 | RDS Aurora PostgreSQL | ✅ Done |
| 4 | S3 + CloudFront | ✅ Done |
| 5 | Lambda | ✅ Done |
| 6 | API Gateway | Pending |
| 7 | Amplify | Pending |

---

## PHASE 4 — S3 + CloudFront (Media Storage)

### What problem this solves

Your app needs to store and serve images — product photos, shop logos, user avatars, review images. You need:
- A place to **store** the files (S3)
- A way to **serve** them fast to users worldwide (CloudFront CDN)
- Security so users can only access files they're allowed to see

### What is S3?

**S3** = Simple Storage Service. It is AWS's file storage — like a hard drive in the cloud. You store files in **buckets** (think: folders at the top level). Each file inside is called an **object**.

Key facts:
- Virtually unlimited storage
- Files are stored redundantly across multiple data centers automatically
- You pay only for what you store and transfer (very cheap)
- Each file has a unique URL

### What is CloudFront?

**CloudFront** is AWS's CDN (Content Delivery Network). It has servers in 450+ locations worldwide (called **edge locations**). When a user requests an image:

```
Without CloudFront:
User in Mumbai → S3 bucket in Mumbai → image served (fast, same region)
User in Delhi  → S3 bucket in Mumbai → image served (ok)
User in USA    → S3 bucket in Mumbai → image served (slow, long distance)

With CloudFront:
User anywhere → nearest CloudFront edge (maybe 10km away) → image served instantly
CloudFront fetches from S3 once, caches it, serves from edge forever after
```

CloudFront also adds HTTPS automatically and hides your S3 bucket URL (security).

### Why keep S3 private and use CloudFront?

- If S3 is public, anyone can access any file directly and also see your bucket structure
- With CloudFront + OAC (Origin Access Control), S3 is completely private — only CloudFront can read from it
- Users always go through CloudFront, getting caching + HTTPS + access control for free

### How image uploads work (pre-signed URLs)

You never upload images through your Lambda function (that would waste Lambda memory and bandwidth). Instead:

```
Step 1: App asks your Lambda: "I want to upload a product image"
Step 2: Lambda generates a pre-signed S3 URL (valid for 5 minutes)
        — this URL gives temporary permission to upload ONE specific file
Step 3: Lambda returns the pre-signed URL to the app
Step 4: App uploads the image DIRECTLY to S3 using that URL
        — Lambda is not involved in the actual upload
Step 5: S3 stores the file
Step 6: App saves the CloudFront URL of the file to your database
        (e.g. https://d3tgg59fq5q8wc.cloudfront.net/products/image.jpg)
```

This keeps Lambda fast and cheap — it only generates a short URL, not handles megabytes of data.

### How to create the S3 bucket — step by step

1. AWS Console → search **S3** → **Create bucket**
2. Settings:
   - **Bucket name**: must be globally unique (e.g. `apna-fashion-mart-media`)
   - **Region**: same as everything else (`ap-south-1`)
   - **Block all public access**: **ON** (leave all checkboxes checked — CloudFront will serve files, not S3 directly)
   - **Versioning**: Off (not needed for media files)
3. Click **Create bucket**

### Folder structure inside the bucket

Create these "folders" (they're just key prefixes in S3, but helps organise):
- `products/` — product images
- `avatars/` — user profile photos
- `shops/` — shop logos and banners
- `reviews/` — images attached to customer reviews

To create folders: click the bucket → **Create folder** → type the name.

### How to create the CloudFront distribution — step by step

1. AWS Console → search **CloudFront** → **Create distribution**
2. Settings:
   - **Origin domain**: select your S3 bucket from the dropdown
   - **Origin access**: select **Origin access control settings (recommended)**
   - Click **Create new OAC** → keep defaults → **Create**
   - **Viewer protocol policy**: **Redirect HTTP to HTTPS**
   - **Cache policy**: **CachingOptimized** (from the dropdown)
   - **Price class**: **Use only North America and Europe** OR **Use all edge locations** (all edge locations = better for India)
3. Click **Create distribution**
4. Note your **Distribution domain name** and **Distribution ID** from the confirmation screen.
5. The new CloudFront wizard **automatically writes the S3 bucket policy for you** — no manual copy-paste needed. It appears under S3 → your bucket → Permissions → Bucket policy as `PolicyForCloudFrontPrivateContent` with the statement `AllowCloudFrontServicePrincipal`.

**Actual values for this project:**
```
Distribution domain: d3tgg59fq5q8wc.cloudfront.net
Distribution ID:     E3A1ODOBS34TDC
```

For reference, the bucket policy that CloudFront auto-generates looks like this:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNTID:distribution/DISTRIBUTIONID"
        }
      }
    }
  ]
}
```

Now CloudFront can read from S3 but nobody else can.

### Where the CloudFront URL is used in code

Once a file is uploaded to S3 at path `products/abc123.jpg`, the public URL is:
```
https://d3tgg59fq5q8wc.cloudfront.net/products/abc123.jpg
```

This URL is what gets stored in your database `products.images` column (it's a `TEXT[]` array of these URLs).

In Lambda environment variables, store:
```
CLOUDFRONT_URL=https://d3tgg59fq5q8wc.cloudfront.net
S3_BUCKET_NAME=apna-fashion-mart-media
```

Lambda builds the full URL as: `${process.env.CLOUDFRONT_URL}/${s3Key}`

### CORS configuration for S3 (needed for browser uploads)

When the Next.js web app uploads directly to S3 from the browser, S3 needs to allow cross-origin requests. Go to S3 → your bucket → **Permissions** tab → **Cross-origin resource sharing (CORS)** → **Edit** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": [
      "https://apnafashionmart.com",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

---

## PHASE 5 — Lambda Functions (API Business Logic)

### What is Lambda?

**AWS Lambda** is a service that runs code without you managing any servers. You upload your code, Lambda runs it when called, and you pay only for the milliseconds it actually runs. There is no server sitting idle — Lambda wakes up per request.

Compared to a traditional Express.js server running on a VPS:
- **Traditional server**: always on, you pay 24/7 even at 3am with zero traffic
- **Lambda**: runs only when a request comes in, scales to thousands of requests automatically, costs almost nothing for a new app

### What our Lambda does

We use a single Lambda function as the entire API. It receives every HTTP request, routes it internally by path (like a tiny Express router), and calls the right handler.

```
HTTP Request: GET /products?category=sarees
       ↓
API Gateway (Phase 6) receives it and calls Lambda
       ↓
Lambda index.js:
  1. Reads the JWT token from the Authorization header
  2. Verifies it with Cognito (aws-jwt-verify library)
  3. Looks up the user's DB row (cognito_sub → users.id)
  4. Routes to the right handler: /products → products.handle()
       ↓
products.handle() queries Aurora PostgreSQL
       ↓
Returns { statusCode: 200, body: JSON } to API Gateway
       ↓
API Gateway returns the response to the client
```

### Lambda and IAM Authentication for the database

Lambda does NOT connect to the database with a stored password. Instead:

1. Lambda has an IAM role (assigned when you create it)
2. The AWS SDK uses that role to generate a temporary auth token (valid 15 minutes)
3. Lambda connects to Aurora using this token as the password
4. The token is regenerated automatically when it expires

This means there is no password stored anywhere — not in environment variables, not in code. The IAM role is the credential.

### File structure built in this phase

```
backend/
  index.js                    ← Main Lambda handler — routes all requests
  src/
    db.js                     ← Database connection (IAM auth + connection pool)
    auth.js                   ← JWT verification with Cognito
    response.js               ← Helpers: ok(), error(), CORS headers
    auth-trigger.js           ← SEPARATE Lambda: Cognito post-confirmation trigger
    handlers/
      products.js             ← GET/POST/PUT/DELETE /products
      shops.js                ← GET/POST/PUT/DELETE /shops, GET /shops/nearby
      orders.js               ← GET/POST /orders, PATCH /orders/:id/status
      cart.js                 ← GET/POST/PUT/DELETE /cart
      wishlist.js             ← GET/POST/DELETE /wishlist
      addresses.js            ← GET/POST/PUT/DELETE /addresses
      reviews.js              ← GET/POST/DELETE /reviews (product reviews only)
      categories.js           ← GET /categories
      profile.js              ← GET/PUT /profile, GET /users/:id
      uploads.js              ← POST /uploads (generates S3 pre-signed URL)
  template.yaml               ← SAM template for deploying to AWS
  package.json
```

### The Cognito Post-Confirmation trigger

This is a **second, separate Lambda function** (`src/auth-trigger.js`). You wire it to your Cognito User Pool's "Post Confirmation" event. When a user confirms their email:

```
User clicks verification link in email
       ↓
Cognito marks user as CONFIRMED
       ↓
Cognito calls auth-trigger Lambda automatically
       ↓
auth-trigger Lambda inserts a row into the users table:
  INSERT INTO users (cognito_sub, email, full_name, role)
  VALUES ('abc-123-xyz', 'user@email.com', 'Aman', 'customer')
```

Without this trigger, users would exist in Cognito but not in your database, and no profile or order data could be stored for them.

### How pre-signed S3 URLs work (uploads handler)

When a user wants to upload a product image:

```
Step 1: App calls POST /uploads with: { folder: "products", filename: "shirt.jpg", contentType: "image/jpeg" }
Step 2: Lambda generates a pre-signed PUT URL (valid 5 minutes) using the AWS SDK
Step 3: Lambda returns:
  {
    "uploadUrl": "https://s3.amazonaws.com/apna-fashion-mart-media/...?X-Amz-Signature=...",
    "publicUrl": "https://d3tgg59fq5q8wc.cloudfront.net/products/1748123456-abc.jpg",
    "key": "products/1748123456-abc.jpg"
  }
Step 4: App uploads the image directly to S3 using uploadUrl (PUT request)
Step 5: App saves publicUrl to the product's images array in the database
```

Lambda never touches the image bytes — it only generates the signed URL. S3 handles all the upload bandwidth.

### Key schema decisions this code enforces

- **Prices in paise**: All prices stored as integers (`price INT`). ₹150 = 15000 paise. Avoids floating-point bugs. The app divides by 100 before displaying.
- **One shop per order**: The `orders.shop_id` is a single FK. If a user wants products from two shops, they place two orders. This keeps fulfilment simple — each vendor manages their own orders.
- **Order number**: Auto-generated as `AFM-000001`, `AFM-000002`, etc. using a PostgreSQL sequence created on first order.
- **Shipping address snapshot**: The `shipping_address` JSONB column stores a copy of the address at order time. If the user later changes their address, the order history stays accurate.
- **Vendor auth via DB**: `vendor_id` on shops and `user.dbId` in Lambda. The Cognito sub (JWT) is translated to the database UUID on every request via `getDbUser()`. This ensures all FK relationships use the correct internal ID.

### How to deploy (manual steps)

**Step 1** — Install dependencies locally:
```bash
cd backend
npm install
```

**Step 2** — Create the Lambda function in AWS Console:
1. Go to **Lambda → Create function**
2. Function name: `afm-api`
3. Runtime: **Node.js 20.x**
4. Architecture: x86_64
5. Click **Create function**

**Step 3** — Set environment variables in the Lambda console (Configuration → Environment variables):
```
DB_HOST=database-1.cluster-c7cs8eykme39.ap-south-1.rds.amazonaws.com
DB_NAME=postgres
DB_USER=postgres
COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id
ALLOWED_ORIGIN=https://apnafashionmart.com
S3_BUCKET_NAME=apna-fashion-mart-media
CLOUDFRONT_URL=https://d3tgg59fq5q8wc.cloudfront.net
AWS_REGION=ap-south-1
```
Note: No `DB_PASSWORD` — Lambda uses IAM auth.

**Step 4** — Give Lambda permission to access RDS with IAM auth:
1. Lambda → Configuration → Permissions → click the Execution role name
2. Attach policy: `AmazonRDSDataFullAccess`
3. Also attach an inline policy for S3:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject"],
    "Resource": "arn:aws:s3:::apna-fashion-mart-media/*"
  }]
}
```

**Step 5** — Package and upload the code:
```bash
cd backend
npm install --production
zip -r function.zip . -x '*.git*'
```
Then in Lambda console: **Upload from** → **.zip file** → upload `function.zip`

**Step 6** — Create the Auth Trigger Lambda:
Same as above but:
- Function name: `afm-auth-trigger`
- Handler: `src/auth-trigger.handler`
- Same DB env vars
- Wire it to Cognito: Cognito → User Pool → User pool properties → Add Lambda trigger → Post confirmation → select `afm-auth-trigger`

---

## Progress Tracker

| Phase | Service | Status |
|---|---|---|
| 1 | IAM | ✅ Done |
| 2 | Cognito | ✅ Done |
| 3 | RDS Aurora PostgreSQL | ✅ Done |
| 4 | S3 + CloudFront | ✅ Done |
| 5 | Lambda | ✅ Done |
| 6 | API Gateway | ✅ Done |
| 7 | Amplify + Custom Domain | ✅ Done |

---

## PHASE 6 — API Gateway (HTTP API)

### What problem API Gateway solves

Your Lambda function is code sitting in AWS. Nothing can call it yet. API Gateway gives it a public HTTPS URL that the real world can send HTTP requests to.

```
Flutter app or Next.js browser
    ↓ HTTPS request
    ↓ GET https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/products
API Gateway
    ↓ triggers
Lambda function (afm-api)
    ↓ queries
Aurora PostgreSQL
    ↓ response
API Gateway returns JSON to the caller
```

API Gateway also handles:
- **CORS** — tells browsers it's allowed to call this API from your web domain
- **Throttling** — limits how many requests per second can hit Lambda (protects from abuse)
- **Logging** — records every request/response for debugging

### HTTP API vs REST API

AWS offers two types of API Gateway:

**HTTP API** (what we use):
- Simpler to configure
- Cheaper (~70% less than REST API)
- Supports JWT authorizers (Cognito integration)
- Faster cold start
- Perfect for most apps

**REST API** (we do NOT use):
- More features (request/response transformation, caching, API keys)
- More complex, more expensive
- Used for large enterprise APIs with complex routing rules

### Why our Lambda handles auth internally (not API Gateway)

API Gateway can verify JWT tokens itself (JWT Authorizer) and reject requests before Lambda runs. But this only works if you want all routes to require a token.

Our app has **mixed routes** — some public (anyone can browse products), some protected (only logged-in users can place orders). Since Lambda already checks auth internally per route, we let all requests through API Gateway and let Lambda decide what's allowed.

This is the simpler, more flexible setup for our use case.

### How to create the API Gateway — step by step

**Step 1** — Go to AWS Console → search **API Gateway** → click **Create API**

**Step 2** — Choose **HTTP API** → click **Build**

**Step 3** — Add integration:
- Click **Add integration**
- Integration type: **Lambda**
- AWS Region: **ap-south-1**
- Lambda function: select **afm-api** (your main API function)
- Click **Next**

**Step 4** — Configure routes:
- The wizard will auto-suggest a route. Replace it with:
  - Method: **ANY**
  - Resource path: **/{proxy+}**
  - Integration target: **afm-api** (already selected)
- Click **Add route** and add a second one:
  - Method: **ANY**
  - Resource path: **/**
  - Integration target: **afm-api**
- Click **Next**

**Step 5** — Define stages:
- Stage name: **$default** (leave as is — this auto-deploys every change)
- Auto-deploy: **Enabled**
- Click **Next**

**Step 6** — Review and create:
- Click **Create**
- Note your **Invoke URL** — it looks like:
  `https://XXXXXXXXXX.execute-api.ap-south-1.amazonaws.com`

### Configure CORS (required for browsers)

After creation:
1. Click your API → **CORS** in the left menu
2. Click **Configure**
3. Fill in:
   - **Access-Control-Allow-Origin**: `https://apnafashionmart.com` (add `http://localhost:3000` too for dev)
   - **Access-Control-Allow-Headers**: `Content-Type, Authorization`
   - **Access-Control-Allow-Methods**: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
   - **Access-Control-Max-Age**: `86400`
4. Click **Save**

### Give API Gateway permission to invoke Lambda

After creating the API, you need to allow API Gateway to call your Lambda:
1. Go to **Lambda** → **afm-api** → **Configuration** → **Permissions**
2. Scroll to **Resource-based policy statements**
3. You should see an auto-added statement from API Gateway. If not:
   - Click **Add permissions**
   - Principal: `apigateway.amazonaws.com`
   - Action: `lambda:InvokeFunction`
   - Source ARN: `arn:aws:execute-api:ap-south-1:YOUR_ACCOUNT_ID:YOUR_API_ID/*/*`

(Usually API Gateway adds this automatically when you select the Lambda in the wizard.)

### Actual values for this project

```
API ID:     709m6g0t8a
API name:   afm-api
Invoke URL: https://709m6g0t8a.execute-api.ap-south-1.amazonaws.com
Stage:      $default (auto-deploy enabled)
Route:      ANY /{proxy+} → Lambda afm-api (Integration ID: sb6qes4)
```

### What actually happened during setup (real steps taken)

The wizard was used to create the API and attach the Lambda integration in Step 1. Routes were skipped during the wizard (optional step). After creation:
1. Went to **Routes** → **Create** → `ANY /{proxy+}`
2. Went to **Integrations** → clicked `ANY` under `/{proxy+}` → **Create and attach an integration** → selected Lambda `afm-api` with "Grant API Gateway permission to invoke" toggled ON
3. Went to **CORS** → **Configure** → filled in all origins, headers, methods → **Save**
4. Auto-deploy triggered automatically — no manual Deploy button needed

### Update your app with the real API URL

**`apps/web/.env.local`** (already updated):
```
NEXT_PUBLIC_API_URL=https://709m6g0t8a.execute-api.ap-south-1.amazonaws.com
```

**Flutter** (`lib/core/constants/env.dart`) (already updated):
```dart
static const apiUrl = String.fromEnvironment('API_URL',
  defaultValue: 'https://709m6g0t8a.execute-api.ap-south-1.amazonaws.com');
```

### Test your API is working

From your terminal or browser, test a public endpoint:
```bash
curl https://709m6g0t8a.execute-api.ap-south-1.amazonaws.com/categories
```
You should see the categories from your database.

Test a protected endpoint (should return 401 without a token):
```bash
curl https://709m6g0t8a.execute-api.ap-south-1.amazonaws.com/profile
# Returns: { "error": "Unauthorized" }
```

---

---

## PHASE 7A — Cognito Post-Confirmation Lambda Trigger (afm-auth-trigger)

### What this phase does

When a new user signs up and confirms their email in Cognito, Cognito automatically calls a Lambda function. That function inserts the new user into your Aurora database. Without this, users exist in Cognito but not in your database — so no profile, orders, or cart can be stored for them.

### How to create the auth trigger Lambda — step by step

**Step 1** — AWS Console → **Lambda** → **Create function**
- Function name: `afm-auth-trigger`
- Runtime: **Node.js 20.x**
- Architecture: x86_64
- Click **Create function**

**Step 2** — Set the handler (Runtime settings)
- Lambda → afm-auth-trigger → **Configuration** → **General configuration** → Edit
- Handler: `src/auth-trigger.handler`
- Note: The handler field is NOT on the General configuration page — it is under **Runtime settings** (scroll down on the Code tab, or go to Configuration → Runtime settings → Edit)
- Save

**Step 3** — Add environment variables (Configuration → Environment variables)
These are the same DB vars as the main afm-api function:
```
DB_HOST=database-1.cluster-c7cs8eykme39.ap-south-1.rds.amazonaws.com
DB_NAME=postgres
DB_USER=postgres
```
No `DB_PASSWORD` — Lambda uses IAM authentication.

**Step 4** — Upload the same function.zip
Lambda → Code → Upload from → .zip file → upload the same `function.zip` you created for `afm-api`. Both functions live in the same zip; the handler field controls which file/export runs.

**Step 5** — Attach IAM permissions to the trigger's role
Lambda → Configuration → Permissions → click the Execution role name → Add permissions → Attach policies:
- `AmazonRDSDataFullAccess`

**Step 6** — Wire the trigger to Cognito
1. AWS Console → **Cognito** → **User Pools** → your pool
2. **User pool properties** tab (in the newer Cognito UI, there is no "Triggers" tab — look for the Properties tab or scroll down to find Lambda triggers section)
3. Click **Add Lambda trigger**
4. Trigger type: **Authentication** → **Post confirmation trigger**
   - Or: Trigger type: **Sign-up** → **Post confirmation trigger** (the exact wording depends on Cognito UI version — look for "Post confirmation")
5. Lambda function: select **afm-auth-trigger**
6. Click **Add Lambda trigger**

### What the code does

`backend/src/auth-trigger.js`:
```javascript
exports.handler = async (event) => {
  const { sub, email, name } = event.request.userAttributes;
  // Connects to Aurora using IAM auth token
  // Runs: INSERT INTO users (cognito_sub, email, full_name, role) VALUES (...)
  // ON CONFLICT (cognito_sub) DO NOTHING  ← safe to call twice
  return event; // must return event back to Cognito
};
```

The function must always return the `event` object back to Cognito or the sign-up flow will fail.

---

## PHASE 7B — AWS Amplify (Next.js Hosting + CI/CD)

### What problem Amplify solves

You need somewhere to host your Next.js website. Amplify is AWS's managed hosting service for frontend apps. It:
- Connects to your GitHub repository
- Automatically rebuilds and deploys when you push to the main branch
- Handles HTTPS, global CDN, and custom domains
- Works natively with Next.js (server-side rendering, API routes, etc.)

### What is a monorepo?

A **monorepo** is a single Git repository that contains multiple projects in subdirectories. Our repo is structured like this:

```
root/
  apps/
    web/          ← the Next.js website
  Mobile App Version/   ← the Flutter app
  backend/        ← Lambda code
```

Everything lives together in one repo. This is convenient (one `git push` can touch all projects) but requires telling Amplify: "the website is not at the root, it is inside `apps/web/`."

### The amplify.yml build spec

Amplify uses a file called `amplify.yml` to know how to build your app. The key rule: for a monorepo, this file must be at the **repository root** (not inside `apps/web/`) and must use the `applications` key with `appRoot`.

**Correct format** (file at repo root: `amplify.yml`):
```yaml
version: 1
applications:
  - appRoot: apps/web
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
```

**Wrong format** (what happens if you put `amplify.yml` inside `apps/web/` without the `applications` key):
```yaml
version: 1
frontend:
  phases:
    ...
```
Amplify build log error: `"Monorepo spec provided without 'applications' key"`

### Common build failure: npm ci fails with missing packages

`npm ci` requires the `package-lock.json` to be in sync with `package.json`. If you install new packages locally (`npm install`) but don't commit the updated `package-lock.json`, the CI build fails with errors like:

```
npm error Could not resolve dependency:
npm error peer @smithy/types@"^4.0.0" from @aws-sdk/...
```

**Fix**: After any `npm install`, commit the updated `apps/web/package-lock.json`.

### How to set up Amplify — step by step

**Step 1** — AWS Console → **Amplify** → **Create new app**
- Source code provider: **GitHub**
- Authenticate and select your repository
- Branch: **master** (or `main` — Amplify will deploy whenever this branch gets a push)

Note: `master` and `main` are just names. Git's default was `master` historically. GitHub changed the default to `main` in 2020. Your repo uses `master`. The name itself does not matter — what matters is you select whichever branch you actually push to.

**Step 2** — App settings
- App name: anything (e.g. `apna-fashion-mart`)
- **Important**: Amplify will detect `amplify.yml` from your repo automatically. You do NOT need to re-enter the build commands here.

**Step 3** — Add environment variables
Amplify → your app → **Environment variables** → **Manage variables**

Add all the production values from `.env.local`:
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID  = ap-south-1_3HoR7ATA9
NEXT_PUBLIC_COGNITO_CLIENT_ID     = 2p1qrpgnb70skct4ea6o3ompnd
NEXT_PUBLIC_COGNITO_REGION        = ap-south-1
NEXT_PUBLIC_API_URL               = https://709m6g0t8a.execute-api.ap-south-1.amazonaws.com
NEXT_PUBLIC_APP_URL               = https://apnafashionmart.com
ANTHROPIC_API_KEY                 = (your key)
RESEND_API_KEY                    = (your key)
RESEND_FROM_EMAIL                 = noreply@apnafashionmart.com
NEXT_PUBLIC_RAZORPAY_KEY_ID       = (your key)
RAZORPAY_KEY_SECRET               = (your key)
```

**Step 4** — Review and deploy
- Review the settings
- Click **Save and deploy**
- Amplify starts a build — you can watch the log in real time

**Step 5** — View your deployed URL
After a successful build, Amplify gives you a URL like:
```
https://master.dcrhvhpc3mowo.amplifyapp.com
```
This always works even before you connect your custom domain.

### Actual values for this project

```
App ID:          dcrhvhpc3mowo
Default URL:     https://master.dcrhvhpc3mowo.amplifyapp.com
CloudFront:      d37mc4rhfdnuca.cloudfront.net
Custom domain:   apnafashionmart.com + www.apnafashionmart.com
```

---

## PHASE 7C — Custom Domain with Cloudflare DNS

### The situation

The domain `apnafashionmart.com` is registered and was previously deployed via Cloudflare Pages. Cloudflare is the DNS provider and the Cloudflare proxy (orange cloud) provides DDoS protection, WAF, and CDN.

The goal: point the domain to Amplify while keeping Cloudflare's security features.

### Two approaches: Route 53 vs Manual configuration

**Route 53** (AWS's DNS service):
- Amplify can automatically create all DNS records
- BUT: requires a paid AWS account. Free Tier accounts get the error:
  `"Free Tier accounts are not supported for this service."`
- You also lose Cloudflare's DDoS/CDN/WAF protection if you move DNS to Route 53

**Manual configuration** (what we use):
- Keep Cloudflare as the DNS provider
- Manually add the DNS records Amplify tells you to add
- Keep the orange cloud proxy (Cloudflare DDoS protection stays active)

Use manual configuration: in Amplify → Hosting → Custom domains → Add domain → when Amplify asks about DNS provider, select **Manual configuration** (not Route 53).

### The DNS records you need to add in Cloudflare

Amplify gives you specific records to add. For this project:

| Type | Name | Target | Cloudflare Proxy | Purpose |
|------|------|--------|-----------------|---------|
| CNAME | `_783c117a...` (validation name) | `_783c117a...acm-validations.aws` | DNS only (grey) | ACM SSL certificate validation |
| CNAME | `@` (root domain) | `d37mc4rhfdnuca.cloudfront.net` | Proxied (orange) | Route apnafashionmart.com to Amplify |
| CNAME | `www` | `d37mc4rhfdnuca.cloudfront.net` | Proxied (orange) | Route www.apnafashionmart.com to Amplify |

**Critical rules:**
- The SSL validation CNAME (`_783c117a...`) must be **DNS only (grey cloud)**. If it is proxied, AWS cannot verify the certificate and the SSL setup will stall.
- The traffic CNAMEs (`@` and `www`) should be **Proxied (orange cloud)** to keep Cloudflare's DDoS protection and CDN.

### Why keeping Cloudflare proxy is safe with Amplify

When Cloudflare proxy is orange, traffic flows like this:
```
User → Cloudflare edge (DDoS filter, WAF, cache) → Amplify CloudFront → your app
```
The user's request goes through Cloudflare first (security benefits) then to Amplify.

The potential conflict: Cloudflare adds HTTPS, Amplify adds HTTPS. Two HTTPS layers can cause a redirect loop.

**Fix**: Set Cloudflare SSL/TLS encryption mode to **Full (strict)**.

- **Flexible** = Cloudflare ↔ origin is HTTP. Causes loops because Amplify redirects HTTP to HTTPS.
- **Full** = Cloudflare ↔ origin is HTTPS but Cloudflare doesn't verify the certificate. Works but less secure.
- **Full (strict)** = Cloudflare ↔ origin is HTTPS AND verifies the certificate. Correct and secure.

Go to Cloudflare → your domain → **SSL/TLS** → **Overview** → select **Full (strict)**.

### Amplify domain activation states

After adding DNS records, Amplify goes through these states:
```
SSL creation       → Amplify requests a certificate from AWS ACM
SSL configuration  → Amplify waits for you to add the validation CNAME
Domain activation  → Amplify detects the DNS records and activates the domain
```

Once you add the DNS records in Cloudflare:
- Cloudflare updates DNS within seconds
- ACM certificate validation takes 2–30 minutes to propagate globally
- Amplify domain activation: typically 5–30 minutes after DNS propagates

You do NOT need to click anything. Amplify polls the DNS automatically and progresses when it detects the records.

### What to delete from Cloudflare before adding new records

Before adding the new CNAME records, delete any old DNS records pointing to the previous hosting provider (Cloudflare Pages, Vercel, etc.). If old `@` or `www` CNAMEs exist pointing elsewhere, the new records will conflict.

### The TXT record and TTL explained

Amplify may also ask you to add a TXT record for additional ownership verification. TTL (Time To Live) is how long DNS servers cache the record before checking again. A 1 hour TTL means DNS changes propagate globally within ~1 hour. This is standard — you do not need to lower it.

### After domain activation

Once Amplify shows the domain as active:
- `https://apnafashionmart.com` → serves your Next.js app via Amplify + Cloudflare
- `https://www.apnafashionmart.com` → same
- Old Cloudflare Pages deployment is bypassed (the DNS records now point to Amplify's CloudFront)

### Verify the deployment

Test key pages:
```
https://apnafashionmart.com         → home page loads
https://apnafashionmart.com/api/... → Next.js API routes work
```

Check that environment variables are working:
- Open the app and try to sign in (tests Cognito)
- Browse products (tests API Gateway → Lambda → Aurora)
- Check the browser Network tab — API calls should go to `709m6g0t8a.execute-api.ap-south-1.amazonaws.com`

---

## Final Architecture Overview

```
                    ┌─────────────────────────────────────┐
                    │         apnafashionmart.com          │
                    │         www.apnafashionmart.com      │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │         Cloudflare Proxy             │
                    │   DDoS protection, WAF, CDN cache    │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │     AWS Amplify + CloudFront         │
                    │  d37mc4rhfdnuca.cloudfront.net       │
                    │  Hosts Next.js (SSR + API routes)    │
                    └──────────────┬──────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
 ┌────────────▼───┐   ┌────────────▼───┐   ┌──────────▼────────┐
 │ AWS Cognito    │   │  API Gateway   │   │  S3 + CloudFront  │
 │ User Pool      │   │ afm-api HTTP   │   │  Media storage    │
 │ Authentication │   │ 709m6g0t8a...  │   │  d3tgg59fq5...    │
 └────────────────┘   └───────┬────────┘   └───────────────────┘
         │                    │
         │            ┌───────▼────────┐
         │            │  Lambda afm-api │
         │            │  Node.js 20.x  │
         │            └───────┬────────┘
         │                    │
         │            ┌───────▼────────┐
         │            │ Aurora Serverless│
         │            │ PostgreSQL      │
         │            │ IAM auth        │
         └────────────► afm-auth-trigger│
                       (Post Confirmation)
```

## Progress Tracker

| Phase | Service | Status |
|---|---|---|
| 1 | IAM | ✅ Done |
| 2 | Cognito | ✅ Done |
| 3 | RDS Aurora PostgreSQL | ✅ Done |
| 4 | S3 + CloudFront | ✅ Done |
| 5 | Lambda | ✅ Done |
| 6 | API Gateway | ✅ Done |
| 7A | Cognito Auth Trigger | ✅ Done |
| 7B | Amplify Hosting + CI/CD | ✅ Done |
| 7C | Custom Domain (Cloudflare + Amplify) | ✅ Done |
