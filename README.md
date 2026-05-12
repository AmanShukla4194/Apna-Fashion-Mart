# Apna Fashion Mart

> A premium location-based multi-vendor fashion marketplace connecting local clothing shops with nearby customers.

[![Deploy to Cloudflare Pages](https://github.com/AmanShukla4194/Apna-Fashion-Mart/actions/workflows/deploy.yml/badge.svg)](https://github.com/AmanShukla4194/Apna-Fashion-Mart/actions/workflows/deploy.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com/)

---

## What is Apna Fashion Mart?

Apna Fashion Mart is a hyperlocal fashion-tech platform where customers can discover nearby clothing stores, browse their products, add items to a wishlist or cart, and place orders — all based on their location.

Unlike standard single-brand e-commerce sites, this is a **multi-vendor marketplace**:

- **Customers** discover local fashion stores on an interactive map, browse products, and shop online or in-person.
- **Vendors (Shop Owners)** get a digital storefront, inventory management, and order tracking.
- **Admins** moderate the platform, manage users, verify shops, and monitor analytics.

---

## Features

### Customer
- Location-based store discovery with interactive map
- Browse products by category, price, and relevance
- Wishlist and shopping cart
- Order placement and live order tracking
- Customer profile management

### Vendor / Shop Owner
- Dedicated vendor dashboard
- Product and inventory management (add, edit, delete listings)
- Order management and fulfillment
- Shop profile with images and contact details
- Store verification badge

### Admin
- Admin portal with full platform oversight
- User and vendor management
- Product and category moderation
- Analytics and reporting

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Radix UI, Framer Motion |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Deployment | Cloudflare Pages via `@cloudflare/next-on-pages` |
| CI/CD | GitHub Actions |
| Forms | React Hook Form + Zod |
| Charts | Recharts |

---

## Project Structure

```
.
├── apps/
│   └── web/                    # Next.js 15 application
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── views/          # Page-level view components
│       │   ├── components/     # Shared UI components
│       │   ├── contexts/       # React context providers (Auth, Cart, Wishlist)
│       │   ├── lib/            # Supabase client, API helpers
│       │   └── hooks/          # Custom React hooks
│       ├── public/
│       ├── next.config.mjs
│       ├── tailwind.config.ts
│       └── wrangler.toml
├── supabase/                   # Supabase migrations & config
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
└── wrangler.toml
```

---

## Getting Started Locally

### Prerequisites

- Node.js 22+
- npm
- A [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/AmanShukla4194/Apna-Fashion-Mart.git
cd Apna-Fashion-Mart
```

### 2. Install dependencies

```bash
cd apps/web
npm install
```

### 3. Set up environment variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

The app is deployed to **Cloudflare Pages** automatically on every push to `master` via GitHub Actions.

### Required GitHub Secrets

Set these in your repository under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous public key |
| `NEXT_PUBLIC_APP_URL` | Your production domain (e.g., `https://apnafashionmart.com`) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages Edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

### Manual Build (Cloudflare Pages)

```bash
cd apps/web
npx @cloudflare/next-on-pages
```

Output is written to `apps/web/.vercel/output/static`.

---

## Live Site

**[apnafashionmart.com](https://apnafashionmart.com)**

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Author

**Aman Shukla** — [@AmanShukla4194](https://github.com/AmanShukla4194)
