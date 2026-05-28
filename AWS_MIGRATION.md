# AWS Migration Guide — Apna Fashion Mart
## Complete migration from Supabase + Cloudflare Pages → AWS

**Project:** Apna Fashion Mart (Next.js 15 + Flutter)  
**Operator:** Lattice Teams Technologies Pvt. Ltd.  
**Current stack:** Supabase (auth + DB + storage) · Cloudflare Pages (hosting)  
**Target stack:** AWS (Cognito · RDS Aurora · S3 · Amplify · Lambda · API Gateway)

---

## Table of Contents

1. [Full Audit — What Must Change](#1-full-audit--what-must-change)
2. [AWS Architecture Overview](#2-aws-architecture-overview)
3. [Phase 1 — AWS Account & Foundation](#3-phase-1--aws-account--foundation)
4. [Phase 2 — Database (RDS Aurora PostgreSQL)](#4-phase-2--database-rds-aurora-postgresql)
5. [Phase 3 — Authentication (Amazon Cognito)](#5-phase-3--authentication-amazon-cognito)
6. [Phase 4 — Storage & CDN (S3 + CloudFront)](#6-phase-4--storage--cdn-s3--cloudfront)
7. [Phase 5 — Backend API (Lambda + API Gateway)](#7-phase-5--backend-api-lambda--api-gateway)
8. [Phase 6 — Web App Hosting (AWS Amplify)](#8-phase-6--web-app-hosting-aws-amplify)
9. [Phase 7 — Codebase Refactoring (Web)](#9-phase-7--codebase-refactoring-web)
10. [Phase 8 — Flutter Mobile App Refactoring](#10-phase-8--flutter-mobile-app-refactoring)
11. [Phase 9 — CI/CD Pipeline (GitHub Actions → AWS)](#11-phase-9--cicd-pipeline-github-actions--aws)
12. [Phase 10 — Domain, SSL & DNS (Route 53 + ACM)](#12-phase-10--domain-ssl--dns-route-53--acm)
13. [Phase 11 — Monitoring, Logging & Alerts](#13-phase-11--monitoring-logging--alerts)
14. [Phase 12 — Security Hardening](#14-phase-12--security-hardening)
15. [Environment Variables Reference](#15-environment-variables-reference)
16. [Dependency Changes Summary](#16-dependency-changes-summary)
17. [Files to Delete](#17-files-to-delete)
18. [Cost Estimate](#18-cost-estimate)
19. [Post-Migration Checklist](#19-post-migration-checklist)

---

## 1. Full Audit — What Must Change

### 1.1 Files to DELETE entirely

| File / Directory | Reason |
|---|---|
| `supabase/` (entire directory) | Supabase local config + migrations — replaced by RDS schema migrations |
| `supabase-setup.sql` | Supabase-specific SQL — rewritten for RDS |
| `apps/web/.env.example` | Contains Supabase env var templates |
| `apps/web/src/lib/supabase/` (entire directory) | Browser + server Supabase clients |
| `.github/workflows/deploy.yml` | Cloudflare Pages deployment — replaced with AWS Amplify CI/CD |

### 1.2 Files to REWRITE completely

| File | What it does now | What replaces it |
|---|---|---|
| `apps/web/src/lib/api.ts` | 40+ Supabase `.from().select()` calls | AWS API Gateway REST calls via `fetch` |
| `apps/web/src/contexts/AuthContext.jsx` | `supabase.auth.*` for login/signup/session | `@aws-amplify/auth` Cognito calls |
| `apps/web/middleware.ts` | Supabase SSR session refresh + role check | Cognito JWT verification via `jose` |
| `apps/mobile/lib/main.dart` | `Supabase.initialize()` | AWS Amplify Flutter init |
| `apps/mobile/lib/core/constants/env.dart` | Supabase URL + anon key constants | Cognito + API Gateway URL constants |

### 1.3 Files to PARTIALLY EDIT

| File | Change required |
|---|---|
| `apps/web/package.json` | Remove `@supabase/ssr`, `@supabase/supabase-js`; add `@aws-amplify/auth`, `aws-amplify` |
| `apps/web/next.config.mjs` | Replace `*.supabase.co` image hostname with your CloudFront domain |
| `apps/web/src/types/database.ts` | Keep type definitions, remove Supabase-specific `Database` wrapper type |
| `apps/mobile/pubspec.yaml` | Replace `supabase_flutter` with `amplify_flutter`, `amplify_auth_cognito`, `amplify_api`, `amplify_storage_s3` |
| `.github/workflows/deploy.yml` | Rewrite entirely for AWS Amplify deployment |

### 1.4 Backend integrations currently dependent on Supabase

| Feature | Current implementation | AWS replacement |
|---|---|---|
| User authentication | Supabase Auth (JWT, email/password) | Amazon Cognito User Pool |
| Session management | Supabase SSR cookie refresh | Cognito JWT tokens (stored in httpOnly cookies) |
| Role-based access | `profiles.role` field + Supabase RLS | Cognito Groups (customer / vendor / admin) |
| Database queries | Supabase PostgREST API | Lambda functions → RDS Aurora PostgreSQL |
| Geospatial nearby stores | Supabase RPC `nearby_stores()` with PostGIS | Lambda → RDS PostgreSQL with PostGIS extension |
| File / image storage | Supabase Storage | Amazon S3 + CloudFront CDN |
| Full-text product search | Supabase PostgREST `ilike` filter | Lambda → RDS `pg_trgm` full-text search |
| Real-time updates | (not yet live — planned Supabase Realtime) | AWS AppSync subscriptions or API Gateway WebSockets |
| Row-Level Security | Supabase RLS policies | Handled in Lambda middleware (user_id checks) |
| Auto-profile creation | Supabase trigger `on auth.users insert` | Cognito Post-Confirmation Lambda trigger |
| Rating recalculation | Supabase trigger on reviews table | RDS trigger (same SQL, runs natively) |

---

## 2. AWS Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS Architecture                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Users / Flutter App                                                │
│       │                                                             │
│       ▼                                                             │
│  Route 53 (DNS) + ACM (SSL)                                        │
│       │                                                             │
│       ├──▶ CloudFront (CDN) ──▶ S3 (static assets / media)        │
│       │                                                             │
│       └──▶ AWS Amplify Hosting (Next.js SSR/SSG)                  │
│                 │                                                   │
│                 ▼                                                   │
│  Amazon Cognito ◀── JWT auth middleware                            │
│                 │                                                   │
│                 ▼                                                   │
│  API Gateway (HTTP API)                                             │
│       │                                                             │
│       ├──▶ Lambda: stores / products / search                      │
│       ├──▶ Lambda: cart / wishlist / orders                        │
│       ├──▶ Lambda: auth callbacks / profile                        │
│       ├──▶ Lambda: vendor management                               │
│       ├──▶ Lambda: admin operations                                │
│       └──▶ Lambda: Razorpay webhook                               │
│                 │                                                   │
│                 ▼                                                   │
│  VPC (private subnet)                                               │
│       ├──▶ RDS Aurora PostgreSQL Serverless v2                     │
│       │     (PostGIS + pg_trgm extensions)                         │
│       └──▶ ElastiCache Redis (sessions / cart cache) [optional]   │
│                                                                     │
│  Cross-cutting:                                                     │
│       ├── AWS Secrets Manager (all credentials)                    │
│       ├── CloudWatch Logs + Metrics + Alarms                       │
│       ├── AWS X-Ray (distributed tracing)                          │
│       └── SNS (email alerts, order notifications)                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase 1 — AWS Account & Foundation

### Step 1.1 — Create AWS Account and IAM structure

```bash
# 1. Create AWS account at https://aws.amazon.com
# 2. Enable MFA on root account immediately
# 3. Create an IAM user for deployment (never use root):
#    - Attach: AdministratorAccess (restrict to least-privilege later)
#    - Enable MFA on IAM user
# 4. Install and configure AWS CLI:
pip install awscli
aws configure
# Enter: Access Key ID, Secret Access Key, region (ap-south-1 for Mumbai), output format (json)
```

> **Region recommendation:** `ap-south-1` (Mumbai) — lowest latency for Indian users.

### Step 1.2 — Create VPC with public and private subnets

```bash
# Using AWS Console or Terraform:
# - 1 VPC: 10.0.0.0/16
# - 2 public subnets: 10.0.1.0/24, 10.0.2.0/24 (for Lambda, ALB, NAT Gateway)
# - 2 private subnets: 10.0.3.0/24, 10.0.4.0/24 (for RDS — must be isolated)
# - 1 Internet Gateway (attached to VPC)
# - 1 NAT Gateway (in public subnet, for Lambda to reach internet)
# - Route tables: public subnets → IGW; private subnets → NAT Gateway
```

### Step 1.3 — Set up AWS Secrets Manager

Store all credentials here — never in code or `.env` files committed to git:

```bash
# Create secrets (replace values with your actual credentials):
aws secretsmanager create-secret \
  --name "apna-fashion-mart/prod" \
  --secret-string '{
    "DB_HOST": "your-aurora-cluster-endpoint",
    "DB_NAME": "apna_fashion_mart",
    "DB_USER": "afm_app",
    "DB_PASSWORD": "your-strong-password",
    "COGNITO_USER_POOL_ID": "ap-south-1_XXXXXXXXX",
    "COGNITO_CLIENT_ID": "your-client-id",
    "COGNITO_CLIENT_SECRET": "your-client-secret",
    "S3_BUCKET_NAME": "apna-fashion-mart-media",
    "CLOUDFRONT_DOMAIN": "https://dXXXXXXXXX.cloudfront.net",
    "RAZORPAY_KEY_ID": "rzp_live_XXXXX",
    "RAZORPAY_KEY_SECRET": "your-razorpay-secret",
    "ANTHROPIC_API_KEY": "sk-ant-XXXXX",
    "GOOGLE_MAPS_API_KEY": "AIzaSyXXXXX"
  }'
```

---

## 4. Phase 2 — Database (RDS Aurora PostgreSQL)

### Step 4.1 — Create Aurora PostgreSQL Serverless v2 cluster

```bash
# AWS Console: RDS → Create Database
# Engine: Aurora PostgreSQL (compatible with PostgreSQL 15)
# Capacity: Serverless v2 (0.5 – 16 ACUs — auto-scales)
# Subnet group: your private subnets
# Security group: allow inbound 5432 from Lambda security group only
# Initial database: apna_fashion_mart
# Master username: afm_admin
# Enable: Data API (for Lambda to call without VPC config, optional)
# Enable: Performance Insights
# Enable: Automated backups (7-day retention minimum)
```

### Step 4.2 — Enable required PostgreSQL extensions

Connect to RDS and run:

```sql
-- Connect via AWS RDS Query Editor, psql, or a bastion host
CREATE EXTENSION IF NOT EXISTS postgis;       -- geospatial queries
CREATE EXTENSION IF NOT EXISTS pg_trgm;       -- fuzzy text search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUID generation
CREATE EXTENSION IF NOT EXISTS vector;        -- AI embeddings (optional, requires pgvector)
```

### Step 4.3 — Run schema migrations

The existing `supabase/migrations/001_initial_schema.sql` is standard PostgreSQL and works on RDS with minimal changes. Remove only Supabase-specific parts:

**Changes required before running on RDS:**

```sql
-- REMOVE these Supabase-specific blocks from the migration file:

-- 1. Remove auth.users references (Supabase Auth table):
--    Change: REFERENCES auth.users(id)
--    To:     REFERENCES users(id)   <-- your new users table (see Step 5.3)

-- 2. Remove Supabase RLS enable statements (optional — you can keep RLS on RDS):
--    Or keep them — RDS PostgreSQL supports RLS natively

-- 3. The nearby_stores() function works as-is on RDS with PostGIS
--    No changes needed to the geospatial function

-- 4. Remove any Supabase-specific storage bucket DDL (not in the migration, but if present)
```

**Create an application user with least privilege:**

```sql
CREATE USER afm_app WITH PASSWORD 'your-strong-password';
GRANT CONNECT ON DATABASE apna_fashion_mart TO afm_app;
GRANT USAGE ON SCHEMA public TO afm_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO afm_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO afm_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO afm_app;
```

### Step 4.4 — Set up a bastion host for admin DB access

```bash
# Create a small EC2 instance (t3.micro) in a public subnet
# Install psql: sudo apt-get install postgresql-client
# Connect: psql -h <aurora-endpoint> -U afm_admin -d apna_fashion_mart
# Restrict bastion security group to your office IP only
# OR use AWS Systems Manager Session Manager (no bastion needed, more secure)
```

---

## 5. Phase 3 — Authentication (Amazon Cognito)

### Step 5.1 — Create Cognito User Pool

```bash
# AWS Console: Cognito → User Pools → Create user pool
# Settings:
#   - Sign-in: email (required), phone (optional)
#   - Password policy: min 8 chars, uppercase, lowercase, numbers
#   - MFA: Optional (enforce for admin users via group settings)
#   - Email delivery: Amazon SES (configure SES first for production)
#   - Required attributes: email, name
#   - Custom attributes: role (String, mutable)
#   - App client: "apna-fashion-mart-web" — no client secret (for SPA)
#   - App client: "apna-fashion-mart-mobile" — with client secret
#   - Triggers: Post-confirmation Lambda (creates profile in RDS)
```

### Step 5.2 — Create Cognito User Groups

```bash
aws cognito-idp create-group \
  --user-pool-id ap-south-1_XXXXXXXXX \
  --group-name "customer" \
  --description "Regular customers"

aws cognito-idp create-group \
  --user-pool-id ap-south-1_XXXXXXXXX \
  --group-name "vendor" \
  --description "Boutique vendors"

aws cognito-idp create-group \
  --user-pool-id ap-south-1_XXXXXXXXX \
  --group-name "admin" \
  --description "Platform administrators"
```

### Step 5.3 — Post-Confirmation Lambda trigger

This replaces the Supabase trigger that auto-creates a `profiles` row when a user signs up:

```javascript
// Lambda function: apna-post-confirmation
// Runtime: Node.js 20.x
// Trigger: Cognito Post Confirmation

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.handler = async (event) => {
  const { sub: userId, email, name } = event.request.userAttributes;
  const role = event.request.userAttributes['custom:role'] || 'customer';

  await pool.query(
    `INSERT INTO profiles (id, email, name, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (id) DO NOTHING`,
    [userId, email, name || email.split('@')[0], role]
  );

  // Add user to their Cognito group
  const cognito = new (require('@aws-sdk/client-cognito-identity-provider').CognitoIdentityProviderClient)({});
  await cognito.send(new (require('@aws-sdk/client-cognito-identity-provider').AdminAddUserToGroupCommand)({
    UserPoolId: event.userPoolId,
    Username: event.userName,
    GroupName: role,
  }));

  return event;
};
```

### Step 5.4 — Update the web app auth context

Replace `apps/web/src/contexts/AuthContext.jsx` — full rewrite:

```jsx
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  confirmSignUp,
} from 'aws-amplify/auth';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(async (user) => {
        setCurrentUser(user);
        const attrs = await fetchUserAttributes();
        setProfile({ id: user.userId, email: attrs.email, name: attrs.name, role: attrs['custom:role'] || 'customer' });
      })
      .catch(() => {})
      .finally(() => setInitialLoading(false));
  }, []);

  const login = async (email, password) => {
    const { isSignedIn, nextStep } = await signIn({ username: email, password });
    if (isSignedIn) {
      const user = await getCurrentUser();
      const attrs = await fetchUserAttributes();
      setCurrentUser(user);
      const p = { id: user.userId, email: attrs.email, name: attrs.name, role: attrs['custom:role'] || 'customer' };
      setProfile(p);
      return { user, profile: p };
    }
    return { nextStep };
  };

  const signup = async (email, password, name, role = 'customer') => {
    return signUp({
      username: email,
      password,
      options: { userAttributes: { email, name, 'custom:role': role } },
    });
  };

  const logout = async () => {
    await signOut();
    setCurrentUser(null);
    setProfile(null);
  };

  const value = {
    currentUser, profile, login, signup, logout,
    isAuthenticated: !!currentUser,
    isCustomer: profile?.role === 'customer',
    isVendor: profile?.role === 'vendor',
    isAdmin: profile?.role === 'admin',
  };

  if (initialLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### Step 5.5 — Update middleware.ts

Replace the Supabase SSR middleware with Cognito JWT verification:

```typescript
// apps/web/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const CUSTOMER_ROUTES = ['/wishlist', '/cart', '/checkout', '/orders', '/customer-profile'];
const VENDOR_ROUTES = ['/vendor-dashboard'];
const ADMIN_ROUTES = ['/admin-dashboard'];

const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
const REGION = process.env.NEXT_PUBLIC_AWS_REGION ?? 'ap-south-1';
const JWKS_URL = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get('cognito-access-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
    });
    return payload;
  } catch { return null; }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getUserFromRequest(request);
  const role = user?.['cognito:groups']?.[0] ?? null;

  if (CUSTOMER_ROUTES.some(r => pathname.startsWith(r)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (VENDOR_ROUTES.some(r => pathname.startsWith(r))) {
    if (!user) return NextResponse.redirect(new URL('/shop-login', request.url));
    if (role !== 'vendor') return NextResponse.redirect(new URL('/shop-login', request.url));
  }
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    if (!user) return NextResponse.redirect(new URL('/admin-login', request.url));
    if (role !== 'admin') return NextResponse.redirect(new URL('/admin-login', request.url));
  }

  const isAuthPage = ['/login', '/shop-login', '/admin-login', '/signup'].includes(pathname);
  if (isAuthPage && user) {
    if (role === 'vendor') return NextResponse.redirect(new URL('/vendor-dashboard', request.url));
    if (role === 'admin') return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

---

## 6. Phase 4 — Storage & CDN (S3 + CloudFront)

### Step 6.1 — Create S3 bucket for media

```bash
# Create bucket (replace with your domain/project name):
aws s3api create-bucket \
  --bucket apna-fashion-mart-media \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1

# Block all public access (serve only through CloudFront):
aws s3api put-public-access-block \
  --bucket apna-fashion-mart-media \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Create folder structure:
# apna-fashion-mart-media/
#   products/         product images
#   stores/           store logos and covers
#   avatars/          user profile photos
#   banners/          homepage banners
```

### Step 6.2 — Create CloudFront distribution

```bash
# AWS Console: CloudFront → Create Distribution
# Origin: your S3 bucket
# Origin access: Origin Access Control (OAC) — restricts direct S3 access
# Viewer protocol policy: Redirect HTTP to HTTPS
# Cache policy: CachingOptimized
# Price class: PriceClass_200 (US, Canada, Europe, Asia, Africa) — covers India
# Alternate domain name (CNAME): media.apnafashionmart.com
# SSL certificate: ACM certificate for media.apnafashionmart.com
```

### Step 6.3 — Pre-signed URL upload flow (replaces Supabase Storage upload)

Add this Lambda or Next.js API route to generate pre-signed upload URLs:

```typescript
// apps/web/src/app/api/upload/presign/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'ap-south-1' });

export async function POST(req: NextRequest) {
  const { fileName, fileType, folder } = await req.json();
  const key = `${folder}/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
  const publicUrl = `${process.env.NEXT_PUBLIC_CDN_URL}/${key}`;
  return NextResponse.json({ uploadUrl: url, publicUrl });
}
```

### Step 6.4 — Update next.config.mjs image domains

```javascript
// apps/web/next.config.mjs
images: {
  remotePatterns: [
    // Replace the supabase.co entry with:
    { protocol: 'https', hostname: 'dXXXXXXXXX.cloudfront.net' },  // your CloudFront domain
    { protocol: 'https', hostname: 'media.apnafashionmart.com' },   // your custom CDN domain
    // Keep other existing entries (unsplash, etc.)
    { protocol: 'https', hostname: 'images.unsplash.com' },
  ],
},
```

---

## 7. Phase 5 — Backend API (Lambda + API Gateway)

### Step 7.1 — Architecture decision

You have two options for the backend API. **Option A is recommended** for the existing codebase:

| Option | Description | Best for |
|---|---|---|
| **A: Next.js API Routes on Amplify** | Keep existing `src/app/api/` routes, deploy on AWS Amplify | Fastest migration, minimal refactoring |
| **B: Lambda + API Gateway** | Move all data logic into individual Lambda functions | Maximum scalability, separation of concerns |

**Recommended: Option A** — Keep the Next.js API route pattern, host on AWS Amplify. Amplify handles Next.js SSR natively including API routes. Migrate to Lambda later if needed.

### Step 7.2 — Create the unified API layer (replaces api.ts)

Replace `apps/web/src/lib/api.ts` — all Supabase calls become `fetch` calls to your own Next.js API routes, which talk to RDS via pg:

**New `apps/web/src/lib/api.ts`:**

```typescript
// All functions remain the same interface — only the implementation changes.
// Each function now calls a Next.js API route instead of Supabase directly.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'API error');
  }
  return res.json();
}

export async function getFeaturedStores(limit = 4) {
  return apiFetch<Store[]>(`/api/stores?featured=true&limit=${limit}`);
}

export async function getNearbyStores(lat: number, lng: number, radiusKm = 10) {
  return apiFetch<Store[]>(`/api/stores/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`);
}
// ... replicate all 40+ functions with the same pattern
```

**New `apps/web/src/app/api/stores/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get('featured') === 'true';
  const limit = parseInt(searchParams.get('limit') ?? '12');

  const query = featured
    ? `SELECT * FROM stores WHERE is_verified = true AND is_active = true ORDER BY rating DESC LIMIT $1`
    : `SELECT * FROM stores WHERE is_active = true ORDER BY created_at DESC LIMIT $1`;

  const { rows } = await pool.query(query, [limit]);
  return NextResponse.json(rows);
}
```

**New `apps/web/src/app/api/stores/nearby/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = 'nodejs';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') ?? '19.0596');
  const lng = parseFloat(searchParams.get('lng') ?? '72.8295');
  const radius = parseFloat(searchParams.get('radius') ?? '10');

  // Uses the same nearby_stores() PostGIS function from the original migration
  const { rows } = await pool.query(
    `SELECT * FROM nearby_stores($1, $2, $3)`,
    [lat, lng, radius]
  );
  return NextResponse.json(rows);
}
```

### Step 7.3 — Add pg dependency to web app

```bash
cd apps/web
npm install pg @types/pg
```

### Step 7.4 — Database connection pooling

For production Lambda/Amplify environments, use RDS Proxy or PgBouncer to prevent connection exhaustion:

```bash
# AWS Console: RDS → Proxies → Create proxy
# Engine family: PostgreSQL
# Connection pool: 50% of max_connections
# Secrets: reference your Secrets Manager secret
# VPC: same as your RDS cluster
# IAM auth: enable for Lambda connections

# Update DATABASE_URL to use the proxy endpoint instead of the cluster endpoint
```

---

## 8. Phase 6 — Web App Hosting (AWS Amplify)

### Step 8.1 — Connect repository to Amplify

```bash
# AWS Console: Amplify → New App → Host Web App
# Source: GitHub → select your repository → branch: master
# Framework detection: Next.js (auto-detected)
# Build settings (amplify.yml) — Amplify will auto-generate, or create manually:
```

```yaml
# amplify.yml (place in project root)
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - cd apps/web
            - npm install
        build:
          commands:
            - cd apps/web
            - npm run build
      artifacts:
        baseDirectory: apps/web/.next
        files:
          - '**/*'
      cache:
        paths:
          - apps/web/node_modules/**/*
          - apps/web/.next/cache/**/*
```

### Step 8.2 — Configure environment variables in Amplify

```bash
# AWS Console: Amplify → App Settings → Environment Variables
# Add ALL of these:
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-app-client-id
NEXT_PUBLIC_CDN_URL=https://media.apnafashionmart.com
NEXT_PUBLIC_API_URL=https://api.apnafashionmart.com
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyXXXXX
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXX
DATABASE_URL=postgresql://afm_app:password@your-rds-proxy-endpoint:5432/apna_fashion_mart
RAZORPAY_KEY_SECRET=your-secret   # server-side only, no NEXT_PUBLIC_ prefix
ANTHROPIC_API_KEY=sk-ant-XXXXX
S3_BUCKET_NAME=apna-fashion-mart-media
AWS_REGION=ap-south-1
```

### Step 8.3 — Remove Cloudflare-specific configuration

```bash
# Delete or archive:
rm apps/web/wrangler.toml
rm wrangler.toml

# Remove from package.json scripts:
# "deploy:cf": "npx @cloudflare/next-on-pages"

# Remove from dependencies:
npm uninstall @cloudflare/next-on-pages --workspace=apps/web
```

### Step 8.4 — Remove edge runtime declarations from API routes

The `@cloudflare/next-on-pages` build required `export const runtime = 'edge'` on many routes. AWS Amplify runs standard Node.js, so the payment routes are already correct (`runtime = 'nodejs'`). The chat route can stay on `edge` or be changed to `nodejs`.

```typescript
// apps/web/src/app/api/payment/create-order/route.ts — already 'nodejs', no change needed
// apps/web/src/app/api/payment/verify/route.ts — already 'nodejs', no change needed
// apps/web/src/app/api/chat/route.ts — keep 'edge' or change to 'nodejs' (both work on Amplify)
```

---

## 9. Phase 7 — Codebase Refactoring (Web)

### Step 9.1 — Install AWS Amplify packages

```bash
cd apps/web
npm uninstall @supabase/ssr @supabase/supabase-js
npm install aws-amplify @aws-amplify/auth jose pg @types/pg @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @aws-sdk/client-cognito-identity-provider
```

### Step 9.2 — Create Amplify configuration file

```typescript
// apps/web/src/lib/amplify-config.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      signUpVerificationMethod: 'code',
      loginWith: { email: true },
    },
  },
});
```

```tsx
// apps/web/src/app/layout.tsx — add at the top of the file:
import '@/lib/amplify-config';  // must be imported before any auth usage
```

### Step 9.3 — Delete Supabase client files

```bash
rm -rf apps/web/src/lib/supabase/
# This removes client.ts and server.ts
```

### Step 9.4 — Update all API route files that use the database

For each new API route you create (stores, products, cart, wishlist, orders, etc.), use this pattern:

```typescript
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

**Complete list of API routes to create** (mirrors the existing `api.ts` functions):

```
apps/web/src/app/api/
  stores/
    route.ts                  (GET: featured, paginated list)
    nearby/route.ts           (GET: ?lat=&lng=&radius=)
    [id]/route.ts             (GET: single store)
  products/
    route.ts                  (GET: list with filters; POST: create)
    [id]/route.ts             (GET, PUT, DELETE)
    search/route.ts           (GET: ?q=&category=&min_price=&max_price=)
  cart/
    route.ts                  (GET, POST: requires auth)
    [id]/route.ts             (PUT: quantity, DELETE: remove item)
  wishlist/
    route.ts                  (GET, POST: requires auth)
    [productId]/route.ts      (DELETE: remove item)
  orders/
    route.ts                  (GET: customer orders; POST: create order)
    [id]/route.ts             (GET, PUT: status update)
    vendor/route.ts           (GET: vendor orders — requires vendor role)
  addresses/
    route.ts                  (GET, POST)
    [id]/route.ts             (PUT, DELETE)
    default/route.ts          (PUT: set default)
  reviews/
    route.ts                  (POST: create review)
    product/[id]/route.ts     (GET: product reviews)
    store/[id]/route.ts       (GET: store reviews)
  inquiries/
    route.ts                  (GET, POST)
    [id]/respond/route.ts     (PUT: vendor responds)
  profile/
    route.ts                  (GET, PUT: requires auth)
  admin/
    stats/route.ts            (GET: platform statistics)
    users/route.ts            (GET: paginated user list)
    vendors/pending/route.ts  (GET: unverified stores)
    stores/[id]/verify/route.ts (PUT: verify/unverify store)
  payment/
    create-order/route.ts     (already exists — keep)
    verify/route.ts           (already exists — keep)
  chat/route.ts               (already exists — keep)
  upload/
    presign/route.ts          (POST: generate S3 pre-signed URL)
```

### Step 9.5 — Add authentication middleware to API routes

Create a reusable auth helper for API routes:

```typescript
// apps/web/src/lib/auth-middleware.ts
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { NextRequest } from 'next/server';

const REGION = process.env.NEXT_PUBLIC_AWS_REGION ?? 'ap-south-1';
const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
const JWKS = createRemoteJWKSet(
  new URL(`https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`)
);

export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') ?? req.cookies.get('cognito-access-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
    });
    return {
      userId: payload.sub!,
      role: (payload['cognito:groups'] as string[])?.[0] ?? 'customer',
    };
  } catch { return null; }
}

export function requireAuth(user: { userId: string; role: string } | null) {
  if (!user) throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  return user;
}
```

---

## 10. Phase 8 — Flutter Mobile App Refactoring

### Step 10.1 — Update pubspec.yaml

```yaml
# apps/mobile/pubspec.yaml
# REMOVE:
#   supabase_flutter: ^2.5.0

# ADD:
dependencies:
  amplify_flutter: ^2.3.0
  amplify_auth_cognito: ^2.3.0
  amplify_api: ^2.3.0
  amplify_storage_s3: ^2.3.0
  # Keep all existing dependencies (firebase, maps, etc.)
  firebase_core: ^3.3.0
  firebase_messaging: ^15.0.4
  google_maps_flutter: ^2.6.1
  geolocator: ^12.0.0
  razorpay_flutter: ^1.3.6
  dio: ^5.6.0
  flutter_riverpod: ^2.5.1
  go_router: ^13.2.0
  # ... rest of existing dependencies
```

### Step 10.2 — Create amplifyconfiguration.dart

```dart
// apps/mobile/lib/core/constants/amplify_config.dart
const amplifyConfig = '''{
  "UserAgent": "aws-amplify-cli/2.0",
  "Version": "1.0",
  "auth": {
    "plugins": {
      "awsCognitoAuthPlugin": {
        "UserAgent": "aws-amplify/cli",
        "Version": "0.1.0",
        "IdentityManager": {
          "Default": {}
        },
        "CognitoUserPool": {
          "Default": {
            "PoolId": "ap-south-1_XXXXXXXXX",
            "AppClientId": "your-mobile-client-id",
            "Region": "ap-south-1"
          }
        }
      }
    }
  },
  "api": {
    "plugins": {
      "awsAPIPlugin": {
        "apnaFashionAPI": {
          "endpointType": "REST",
          "endpoint": "https://api.apnafashionmart.com",
          "region": "ap-south-1",
          "authorizationType": "AMAZON_COGNITO_USER_POOLS"
        }
      }
    }
  },
  "storage": {
    "plugins": {
      "awsS3StoragePlugin": {
        "bucket": "apna-fashion-mart-media",
        "region": "ap-south-1"
      }
    }
  }
}''';
```

### Step 10.3 — Rewrite main.dart

```dart
// apps/mobile/lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:amplify_api/amplify_api.dart';
import 'package:amplify_storage_s3/amplify_storage_s3.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/constants/amplify_config.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase (for push notifications — keep FCM)
  await Firebase.initializeApp();

  // Initialize AWS Amplify
  await _configureAmplify();

  runApp(const ProviderScope(child: AfmApp()));
}

Future<void> _configureAmplify() async {
  if (Amplify.isConfigured) return;
  await Amplify.addPlugins([
    AmplifyAuthCognito(),
    AmplifyAPI(),
    AmplifyStorageS3(),
  ]);
  await Amplify.configure(amplifyConfig);
}
```

### Step 10.4 — Replace Supabase auth calls in Flutter

Search for all files using `Supabase.instance.client` and replace:

```dart
// BEFORE (Supabase):
final supabase = Supabase.instance.client;
final response = await supabase.auth.signInWithPassword(email: email, password: password);

// AFTER (Amplify Cognito):
import 'package:amplify_flutter/amplify_flutter.dart';
final result = await Amplify.Auth.signIn(username: email, password: password);
```

```dart
// BEFORE (Supabase data fetch):
final response = await supabase.from('products').select().eq('store_id', storeId);

// AFTER (REST API call):
import 'package:amplify_flutter/amplify_flutter.dart';
final restOperation = Amplify.API.get(
  '/products?store_id=$storeId',
  apiName: 'apnaFashionAPI',
);
final response = await restOperation.response;
final products = jsonDecode(response.decodeBody());
```

### Step 10.5 — Keep Firebase for push notifications

Firebase Cloud Messaging (FCM) stays in the Flutter app — it is AWS-compatible. Do not remove firebase_core or firebase_messaging.

For server-side push notification sending, use **AWS SNS** (Simple Notification Service) as the trigger, which calls FCM/APNs:

```bash
# AWS Console: SNS → Create Platform Application
# Push notification platform: Firebase Cloud Messaging (FCM)
# FCM Server Key: get from Firebase Console → Project Settings → Cloud Messaging
```

---

## 11. Phase 9 — CI/CD Pipeline (GitHub Actions → AWS)

### Step 11.1 — Delete the old Cloudflare workflow

```bash
rm .github/workflows/deploy.yml
```

### Step 11.2 — Create new AWS deployment workflow

```yaml
# .github/workflows/deploy-aws.yml
name: Deploy to AWS Amplify

on:
  push:
    branches: [master, main]
  pull_request:
    branches: [master, main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: apps/web/package-lock.json

      - name: Install dependencies
        working-directory: apps/web
        run: npm ci

      - name: Type check
        working-directory: apps/web
        run: npx tsc --noEmit

      - name: Build
        working-directory: apps/web
        run: npm run build
        env:
          NEXT_PUBLIC_COGNITO_USER_POOL_ID: ${{ secrets.NEXT_PUBLIC_COGNITO_USER_POOL_ID }}
          NEXT_PUBLIC_COGNITO_CLIENT_ID: ${{ secrets.NEXT_PUBLIC_COGNITO_CLIENT_ID }}
          NEXT_PUBLIC_AWS_REGION: ap-south-1
          NEXT_PUBLIC_CDN_URL: ${{ secrets.NEXT_PUBLIC_CDN_URL }}
          NEXT_PUBLIC_RAZORPAY_KEY_ID: ${{ secrets.NEXT_PUBLIC_RAZORPAY_KEY_ID }}
          NEXT_PUBLIC_GOOGLE_MAPS_KEY: ${{ secrets.NEXT_PUBLIC_GOOGLE_MAPS_KEY }}

      # Amplify auto-deploys from GitHub — no manual deploy step needed
      # The build above is just for PR validation
      # Amplify picks up the push and builds/deploys automatically
```

> **Note:** AWS Amplify connects directly to GitHub and triggers builds on push automatically. The GitHub Action above is only for PR validation (type-check + build). The actual Amplify deployment is triggered by the GitHub push webhook inside Amplify Console.

### Step 11.3 — Add GitHub Secrets

In your GitHub repository → Settings → Secrets and Variables → Actions, add:

```
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID
NEXT_PUBLIC_CDN_URL
NEXT_PUBLIC_RAZORPAY_KEY_ID
NEXT_PUBLIC_GOOGLE_MAPS_KEY
```

---

## 12. Phase 10 — Domain, SSL & DNS (Route 53 + ACM)

### Step 12.1 — Transfer or delegate DNS to Route 53

```bash
# Option A: Transfer domain to Route 53 (if domain is elsewhere)
# AWS Console: Route 53 → Registered Domains → Transfer domain

# Option B: Keep domain registrar, delegate NS to Route 53 hosted zone
# AWS Console: Route 53 → Hosted Zones → Create Hosted Zone → apnafashionmart.com
# Copy the 4 NS records Route 53 gives you into your domain registrar's nameserver settings
```

### Step 12.2 — Request SSL certificates via ACM

```bash
# IMPORTANT: Request certificates in us-east-1 for CloudFront, and in ap-south-1 for Amplify/ALB
# AWS Console: ACM → Request Certificate → DNS validation

# Certificate 1 (us-east-1 — for CloudFront):
#   - media.apnafashionmart.com
#   - *.apnafashionmart.com  (wildcard covers all subdomains)

# Certificate 2 (ap-south-1 — for Amplify):
#   - apnafashionmart.com
#   - www.apnafashionmart.com
```

### Step 12.3 — Create DNS records in Route 53

```bash
# After Amplify + CloudFront are set up, add these records:
# A record: apnafashionmart.com → Amplify domain (Alias)
# A record: www.apnafashionmart.com → Amplify domain (Alias)
# CNAME: media.apnafashionmart.com → your CloudFront distribution domain
# CNAME: api.apnafashionmart.com → your API Gateway domain (if using custom domain)
```

---

## 13. Phase 11 — Monitoring, Logging & Alerts

### Step 13.1 — CloudWatch Log Groups

```bash
# Lambda functions automatically log to CloudWatch
# For Next.js on Amplify, enable access logs:
# Amplify Console → App Settings → Monitoring → Enable access logs

# Create custom metric filters for errors:
aws logs put-metric-filter \
  --log-group-name /aws/amplify/apna-fashion-mart \
  --filter-name ErrorCount \
  --filter-pattern "ERROR" \
  --metric-transformations metricName=ErrorCount,metricNamespace=ApnaFashionMart,metricValue=1
```

### Step 13.2 — CloudWatch Alarms

```bash
# Create alarms for:
# 1. High error rate (5XX responses > 10 per minute)
# 2. High latency (P99 > 2000ms)
# 3. RDS CPU > 80%
# 4. RDS free storage < 10GB
# 5. Lambda duration > 10s (timeout approaching)
```

### Step 13.3 — Set up AWS X-Ray for distributed tracing

```typescript
// Add to Lambda functions and API routes:
import { NodeTracerProvider } from '@opentelemetry/sdk-node';
// OR use AWS X-Ray SDK:
import AWSXRay from 'aws-xray-sdk';
const https = AWSXRay.captureHTTPs(require('https'));
```

### Step 13.4 — Set up SNS alerts

```bash
# AWS Console: SNS → Create Topic → ApnaFashionMartAlerts
# Create subscription: protocol=Email → your email address
# Connect CloudWatch alarms to this SNS topic
```

---

## 14. Phase 12 — Security Hardening

### Step 14.1 — IAM least privilege for application

```json
// Lambda execution role policy (minimum required):
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:ap-south-1:*:secret:apna-fashion-mart/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::apna-fashion-mart-media/*"
    },
    {
      "Effect": "Allow",
      "Action": ["cognito-idp:AdminGetUser", "cognito-idp:AdminAddUserToGroup"],
      "Resource": "arn:aws:cognito-idp:ap-south-1:*:userpool/*"
    },
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### Step 14.2 — WAF (Web Application Firewall)

```bash
# AWS Console: WAF & Shield → Create Web ACL
# Associate with: your CloudFront distribution + API Gateway
# Add managed rule groups:
#   - AWS-AWSManagedRulesCommonRuleSet (SQL injection, XSS)
#   - AWS-AWSManagedRulesKnownBadInputsRuleSet
#   - AWS-AWSManagedRulesAmazonIpReputationList (block known malicious IPs)
# Add rate limiting rule: 1000 requests per 5 minutes per IP
```

### Step 14.3 — Admin portal protection

The admin portal at `/portal-afm-x9k2` must have additional protection on AWS:

```bash
# Option 1: Cognito + IP allowlist via WAF
# Add WAF rule: allow /portal-afm-x9k2 only from your office IP(s)

# Option 2: Amplify Basic Auth (password protect entire staging environment)
# Amplify Console → App Settings → Access Control → Enable

# Option 3: AWS Verified Access (zero-trust, corporate-grade)
# For the admin route specifically, require MFA in Cognito admin user pool
```

### Step 14.4 — Environment variable security checklist

```
✅ NEVER commit .env.local — already in .gitignore
✅ All secrets in AWS Secrets Manager
✅ Amplify environment variables encrypted at rest
✅ S3 bucket has no public access (CloudFront only)
✅ RDS in private subnet, no public endpoint
✅ DATABASE_URL never in NEXT_PUBLIC_ env vars
✅ RAZORPAY_KEY_SECRET never in client bundle
✅ Cognito app client has no client secret (web SPA) — prevents secret exposure
```

---

## 15. Environment Variables Reference

### Web app (set in Amplify Console):

```bash
# Public (safe for client bundle):
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CDN_URL=https://media.apnafashionmart.com
NEXT_PUBLIC_API_URL=https://apnafashionmart.com      # same origin for Next.js API routes
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyXXXXXXXXX
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
NEXT_PUBLIC_APP_URL=https://apnafashionmart.com

# Private (server-side only, no NEXT_PUBLIC_):
DATABASE_URL=postgresql://afm_app:password@rds-proxy.ap-south-1.rds.amazonaws.com:5432/apna_fashion_mart
RAZORPAY_KEY_SECRET=your_razorpay_secret
ANTHROPIC_API_KEY=sk-ant-XXXXX
S3_BUCKET_NAME=apna-fashion-mart-media
AWS_REGION=ap-south-1
# (Lambda/Amplify functions use instance role — no AWS_ACCESS_KEY_ID needed)
```

### Flutter app (compile-time constants via --dart-define or .env):

```bash
AWS_REGION=ap-south-1
COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
API_BASE_URL=https://apnafashionmart.com
CDN_URL=https://media.apnafashionmart.com
GOOGLE_MAPS_KEY=AIzaSyXXXXXXXXX
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
```

---

## 16. Dependency Changes Summary

### Web app (`apps/web/package.json`):

**Remove:**
```json
"@supabase/ssr": "^0.6.1",
"@supabase/supabase-js": "^2.49.2"
```

**Add:**
```json
"aws-amplify": "^6.x",
"@aws-amplify/auth": "^6.x",
"jose": "^5.x",
"pg": "^8.x",
"@types/pg": "^8.x",
"@aws-sdk/client-s3": "^3.x",
"@aws-sdk/s3-request-presigner": "^3.x",
"@aws-sdk/client-cognito-identity-provider": "^3.x"
```

### Flutter app (`apps/mobile/pubspec.yaml`):

**Remove:**
```yaml
supabase_flutter: ^2.5.0
```

**Add:**
```yaml
amplify_flutter: ^2.3.0
amplify_auth_cognito: ^2.3.0
amplify_api: ^2.3.0
amplify_storage_s3: ^2.3.0
```

---

## 17. Files to Delete

Run these commands after the migration is complete and tested:

```bash
# Supabase config and migrations
rm -rf supabase/

# Supabase SQL setup script
rm supabase-setup.sql

# Supabase client library files
rm -rf apps/web/src/lib/supabase/

# Old Cloudflare deployment workflow
rm .github/workflows/deploy.yml

# Cloudflare Wrangler configuration files
rm wrangler.toml
rm apps/web/wrangler.toml

# Old environment example files with Supabase vars
rm apps/web/.env.example

# Documentation referencing old stack (update these rather than delete)
# files/01_TECH_STACK_AND_ARCHITECTURE.md  <-- update to reflect AWS
# files/02_EXECUTION_ROADMAP.md            <-- update to reflect AWS
```

---

## 18. Cost Estimate

Monthly cost estimate (ap-south-1, moderate traffic):

| Service | Configuration | Est. Monthly Cost |
|---|---|---|
| **RDS Aurora Serverless v2** | 0.5–2 ACU, 20GB storage | ~$40–80 |
| **AWS Amplify Hosting** | Build minutes + hosting (SSR) | ~$20–50 |
| **Amazon Cognito** | First 50,000 MAU free, then $0.0055/MAU | ~$0–30 |
| **S3 Storage** | 50GB storage + 100GB transfer | ~$5–15 |
| **CloudFront CDN** | 100GB transfer/month | ~$8–15 |
| **API Gateway** | 1M requests/month | ~$3 |
| **Lambda** | (used by Cognito triggers) | ~$1 |
| **Route 53** | 1 hosted zone + queries | ~$1 |
| **Secrets Manager** | 5 secrets | ~$2 |
| **CloudWatch** | Logs + alarms | ~$5 |
| **NAT Gateway** | 1 gateway + data | ~$35 |
| **Total estimate** | | **~$120–230/month** |

> Supabase Pro was ~$25/month. AWS is more expensive but gives full control, better compliance posture, and scales without per-seat limits.

---

## 19. Post-Migration Checklist

Work through this checklist after completing all phases:

### Infrastructure
- [ ] VPC created with public/private subnets in ap-south-1
- [ ] RDS Aurora Serverless v2 running in private subnet
- [ ] PostGIS, pg_trgm extensions installed on RDS
- [ ] Schema migration run successfully on RDS
- [ ] Cognito User Pool created with customer/vendor/admin groups
- [ ] Post-Confirmation Lambda trigger deployed and tested
- [ ] S3 bucket created with public access blocked
- [ ] CloudFront distribution serving from S3
- [ ] AWS Secrets Manager populated with all secrets

### Web Application
- [ ] `@supabase/ssr` and `@supabase/supabase-js` removed from package.json
- [ ] `apps/web/src/lib/supabase/` directory deleted
- [ ] `AuthContext.jsx` rewritten to use `@aws-amplify/auth`
- [ ] `middleware.ts` rewritten to use Cognito JWT + `jose`
- [ ] `api.ts` rewritten to call Next.js API routes (no Supabase client)
- [ ] All Next.js API routes (`/api/**`) rewritten to use `pg` pool
- [ ] `next.config.mjs` updated to reference CloudFront domain
- [ ] Amplify configuration file created and imported in layout.tsx
- [ ] Wrangler config files deleted
- [ ] Build passes: `npm run build`
- [ ] Login / signup flow tested end-to-end
- [ ] Vendor dashboard accessible with vendor role
- [ ] Admin portal accessible with admin role (at `/portal-afm-x9k2`)
- [ ] Nearby shops map working (PostGIS query via API route)
- [ ] Product image upload working (S3 pre-signed URL)
- [ ] Razorpay checkout working (payment routes unchanged)
- [ ] AI chat working (chat route unchanged)

### Mobile App
- [ ] `supabase_flutter` removed from pubspec.yaml
- [ ] `amplify_flutter` and auth/api/storage plugins added
- [ ] `main.dart` rewritten to initialize Amplify
- [ ] `amplifyconfiguration.dart` created with correct Cognito/API config
- [ ] All `Supabase.instance.client` calls replaced with Amplify equivalents
- [ ] Login / signup tested on Android emulator and iOS simulator
- [ ] Product listing API calls working via Amplify REST API
- [ ] Image upload to S3 working
- [ ] Push notifications working (Firebase FCM — unchanged)
- [ ] Razorpay payment working

### Deployment & CI/CD
- [ ] AWS Amplify connected to GitHub repository
- [ ] All environment variables configured in Amplify Console
- [ ] Amplify build succeeds and app deploys
- [ ] GitHub Actions workflow updated for PR validation
- [ ] Route 53 hosted zone created
- [ ] ACM certificates issued and validated
- [ ] Custom domain connected to Amplify
- [ ] CloudFront custom domain for media (media.apnafashionmart.com)
- [ ] HTTPS enforced on all endpoints

### Security
- [ ] WAF deployed and associated with CloudFront + API Gateway
- [ ] IAM roles follow least privilege
- [ ] No secrets in committed code (run `git log --all -S "supabase" --oneline` to verify)
- [ ] MFA enforced for admin Cognito accounts
- [ ] RDS has no public endpoint
- [ ] CloudWatch alarms configured for errors + latency

### Monitoring
- [ ] CloudWatch Log Groups receiving logs
- [ ] Error rate alarm tested
- [ ] RDS metrics visible in CloudWatch
- [ ] SNS alert email confirmed

---

*This document covers the complete migration from Supabase + Cloudflare Pages to a fully AWS-native stack. Execute phases sequentially. Test each phase before proceeding to the next.*
