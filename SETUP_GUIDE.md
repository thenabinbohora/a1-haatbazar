# Setup Guide

This guide is the local setup reference as the app is built one stage at a time.

## Current State

The repository is in Stage 6. The Next.js foundation, Prisma schema, server-side admin authentication, protected admin shell, admin product CRUD with variants/SKUs, category CRUD, coupon CRUD, banner CRUD, order status management, and inventory adjustment tools have been scaffolded.

Installed:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- ESLint
- Prisma
- Zod
- Server-side admin authentication foundation
- Protected admin dashboard shell
- Protected admin product CRUD foundation
- Protected admin category, coupon, banner, order, and inventory management foundations

## Stage 1 Setup Plan

Stage 1 created the base Next.js App Router project with:

- TypeScript.
- Tailwind CSS.
- App Router.
- npm.
- Initial project scripts.
- Base lint and build checks.

Before any future package installation or scaffold command is run, the command must be shown, the reason must be explained, and approval must be received.

## Planned Environment Variables

The project includes `.env.example` with placeholder values only.

Likely variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="replace-with-anon-key"
SUPABASE_SERVICE_ROLE_KEY="server-only-placeholder"
SUPABASE_STORAGE_BUCKET="product-images"
AUTH_SECRET="replace-with-secure-random-value"
APP_URL="http://localhost:3000"
```

Rules:

- Do not put real secrets in `.env.example`.
- Do not commit `.env.local`.
- Service role keys must only be used server-side.
- Browser code may only use public Supabase URL and anon key.

For database details, see `docs/DATABASE_SETUP.md`.
For product image storage details, see `docs/STORAGE_SETUP.md`.

## Local Commands

Use `npm.cmd` in PowerShell if `npm` is blocked by script execution policy.

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run prisma:validate
npm run prisma:generate
npm run db:seed
npm run demo:seed
npm run admin:create
npm run customer:create-test
```

Stage 1 validation passed with:

```bash
npm.cmd run build
npm.cmd run typecheck
npm.cmd run lint
```

Stage 2 validation passed with:

```bash
npm.cmd run prisma:validate
npm.cmd run prisma:generate
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Stage 3 validation passed with:

```bash
npm.cmd run prisma:validate
npm.cmd run prisma:generate
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Stage 5 validation passed with:

```bash
npm.cmd run prisma:validate
npm.cmd run prisma:generate
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Stage 6 validation passed with:

```bash
npm.cmd run prisma:validate
npm.cmd run prisma:generate
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

To run the app locally:

```bash
npm.cmd run dev
```

Then open:

```text
http://localhost:3000
```

## Supabase Setup Notes

Setup now includes:

- Create Supabase project.
- Create PostgreSQL connection string.
- Configure Prisma migrations.

Future setup should include:

- Create product image storage bucket.
- Review RLS policy notes for all relevant tables.
- Review Storage policies for product image reads and admin-only writes.

No real Supabase credentials are stored in committed project files. Keep real database URLs in `.env.local` only, and keep `.env.local` out of source control.

## Prisma Setup Notes

Stage 2 added:

- Prisma schema.
- Database models for users, auth accounts and sessions, products, variants, categories, brands, carts, wishlists, addresses, orders, order items, inventory logs, coupons, and banners.
- Seed script for development categories and demo products, with no real secrets.
- Non-destructive demo catalog seed available with `npm run demo:seed`; it upserts local demo categories, brands, products, SKUs, and image metadata without deleting users, orders, or custom admin-created records.

Future setup should include:

- Production hardening for auth, including rate limiting, password reset, and audit logging.
- Settings model if/when store settings are implemented.

## Dependency Audit Notes

`npm audit` previously reported moderate advisories through the installed Next dependency tree and Prisma dev tooling. Suggested force fixes should not be applied blindly because they may downgrade major packages.
