# Authentication And Admin Protection Setup

Stage 3 adds a server-side email/password login foundation for the admin area.

## What Is Implemented

- `/admin/login` login page.
- HTTP-only session cookie.
- Server-side `/admin` route protection.
- ADMIN role enforcement.
- Safe logout.
- Protected admin API example at `/api/admin/health`.
- Safe scripts for creating an initial admin and a test customer.

## What Is Not Implemented Yet

- Customer account UI.
- Password reset.
- Email verification.
- Rate limiting.
- Product CRUD.
- Order management.
- Payment or checkout.

## Required Database State

The Prisma schema now includes `User.passwordHash`. Apply a reviewed migration to a development Supabase database before trying login against a real database.

Example development migration command:

```bash
npm.cmd exec prisma -- migrate dev --name add-auth-password-hash
```

Only run that after `DATABASE_URL` is set in `.env.local` or your shell. Do not commit `.env.local`.

## Create Initial Admin Safely

Set variables in your local shell, then run the script. Use a strong password with at least 12 characters, uppercase, lowercase, number, and symbol.

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
$env:INITIAL_ADMIN_EMAIL="admin@example.com"
$env:INITIAL_ADMIN_PASSWORD="Use-A-Strong-Password-123!"
$env:INITIAL_ADMIN_NAME="Store Admin"
npm.cmd run admin:create
```

The script upserts a user with role `ADMIN` and stores a scrypt password hash. It does not print the password.

## Create Test Customer For Access-Denied Testing

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
$env:TEST_CUSTOMER_EMAIL="customer@example.com"
$env:TEST_CUSTOMER_PASSWORD="Use-A-Strong-Password-123!"
$env:TEST_CUSTOMER_NAME="Test Customer"
npm.cmd run customer:create-test
```

This creates a `CUSTOMER` role account for confirming that non-admin users cannot enter `/admin`.

## Local Browser Test

Start the app with a real local development database URL:

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
npm.cmd run dev
```

Then test:

- `/admin` redirects to `/admin/login` when logged out.
- Wrong credentials show an error.
- Admin credentials open `/admin`.
- Customer credentials do not open `/admin`.
- Logout returns to `/admin/login`.
- `/api/admin/health` returns `401` without an admin session.

