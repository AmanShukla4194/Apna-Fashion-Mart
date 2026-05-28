# Apna Fashion Mart — Backend Deployment Guide

Node.js 20 · AWS Lambda · API Gateway (HTTP API) · RDS Aurora PostgreSQL

---

## 1. Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20.x |
| AWS CLI | v2 |
| AWS SAM CLI | 1.x |
| PostgreSQL client (`psql`) | 15+ (for schema setup) |

```bash
# Verify
node -v && aws --version && sam --version
```

---

## 2. Install Dependencies

```bash
cd backend
npm install
```

---

## 3. Set Up RDS Aurora PostgreSQL

1. Create an Aurora PostgreSQL Serverless v2 cluster in your VPC.
2. Note the **cluster endpoint**, **username**, and **password**.
3. Apply the schema:

```bash
psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -f schema.sql
```

PostGIS is required. Aurora PostgreSQL supports it natively — enable it via the RDS console or the schema script runs `CREATE EXTENSION IF NOT EXISTS postgis`.

---

## 4. Set Up Cognito User Pool

1. Open the AWS Console → Cognito → Create User Pool.
2. Configure sign-in: **Email** (required).
3. Under **Attributes**, add a custom attribute:
   - Name: `role`  |  Type: String  |  Mutable: Yes
4. Create an **App Client** (no client secret for SPA/mobile).
5. Note the **User Pool ID** and **App Client ID**.
6. In your front-end / mobile app, set `custom:role` to `customer`, `vendor`, or `admin` when creating users (admin does this via `adminUpdateUserAttributes`).

---

## 5. Store Secrets in SSM Parameter Store (recommended)

```bash
aws ssm put-parameter --name /afm/db-password --value "YOUR_PW" --type SecureString
aws ssm put-parameter --name /afm/vpc-id      --value "vpc-xxxx" --type String
aws ssm put-parameter --name /afm/private-subnet-1 --value "subnet-xxxx" --type String
aws ssm put-parameter --name /afm/private-subnet-2 --value "subnet-yyyy" --type String
```

---

## 6. Deploy with SAM

```bash
cd backend
sam build
sam deploy --guided
```

SAM will prompt for all required parameters:

| Parameter | Description |
|-----------|-------------|
| `DBHost` | RDS Aurora cluster writer endpoint |
| `DBPort` | Default: `5432` |
| `DBName` | Default: `afm` |
| `DBUser` | Database username |
| `DBPassword` | Database password (NoEcho) |
| `CognitoUserPoolId` | e.g. `ap-south-1_XXXXXXXXX` |
| `CognitoClientId` | Cognito App Client ID |
| `AllowedOrigin` | e.g. `https://apnafashionmart.com` |

After the first deploy, subsequent deploys can skip `--guided`:

```bash
sam build && sam deploy
```

---

## 7. Environment Variables Reference

The Lambda function reads these environment variables at runtime:

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | Yes | RDS endpoint |
| `DB_PORT` | No | Default `5432` |
| `DB_NAME` | No | Default `afm` |
| `DB_USER` | Yes | DB username |
| `DB_PASSWORD` | Yes | DB password |
| `COGNITO_USER_POOL_ID` | Yes | Cognito pool ID |
| `COGNITO_CLIENT_ID` | Yes | Cognito client ID |
| `ALLOWED_ORIGIN` | No | CORS origin, default `*` |

---

## 8. API Routes Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /products | Public | List products |
| GET | /products/featured | Public | Featured products |
| GET | /products/:id | Public | Product detail |
| POST | /products | Vendor | Create product |
| PUT | /products/:id | Vendor | Update product |
| DELETE | /products/:id | Vendor | Deactivate product |
| GET | /shops | Public | List shops |
| GET | /shops/featured | Public | Featured shops |
| GET | /shops/nearby | Public | Shops by geolocation |
| GET | /shops/:id | Public | Shop + products |
| POST | /shops | Vendor | Create shop |
| PUT | /shops/:id | Vendor | Update shop |
| DELETE | /shops/:id | Vendor | Deactivate shop |
| GET | /categories | Public | All categories |
| GET | /orders | Customer/Vendor | List orders |
| GET | /orders/:id | Customer/Vendor | Order detail |
| POST | /orders | Customer | Place order |
| PATCH | /orders/:id/status | Vendor/Admin | Update order status |
| GET | /cart | Customer | View cart |
| POST | /cart | Customer | Add to cart |
| PUT | /cart/:id | Customer | Update cart item |
| DELETE | /cart/:id | Customer | Remove cart item |
| DELETE | /cart | Customer | Clear cart |
| GET | /wishlist | Customer | View wishlist |
| POST | /wishlist | Customer | Add to wishlist |
| DELETE | /wishlist/:productId | Customer | Remove from wishlist |
| GET | /profile | Customer | Own profile |
| PUT | /profile | Customer | Update profile |
| GET | /users/:id/profile | Public | Public profile |
| GET | /addresses | Customer | List addresses |
| POST | /addresses | Customer | Add address |
| PUT | /addresses/:id | Customer | Update address |
| DELETE | /addresses/:id | Customer | Delete address |
| GET | /reviews | Public | Reviews (by shopId or productId) |
| POST | /reviews | Customer | Create review |
| DELETE | /reviews/:id | Customer/Admin | Delete review |

---

## 9. Local Testing

```bash
# Start local API with SAM
sam local start-api --env-vars env.json

# env.json example
# {
#   "AfmApiFunction": {
#     "DB_HOST": "localhost",
#     "DB_PORT": "5432",
#     "DB_NAME": "afm",
#     "DB_USER": "postgres",
#     "DB_PASSWORD": "postgres",
#     "COGNITO_USER_POOL_ID": "ap-south-1_TEST",
#     "COGNITO_CLIENT_ID": "testclientid",
#     "ALLOWED_ORIGIN": "*"
#   }
# }
```

---

## 10. Run Tests

```bash
npm test
```
