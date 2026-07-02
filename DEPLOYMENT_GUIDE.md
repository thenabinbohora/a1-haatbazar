# Deployment Guide

This guide tracks deployment requirements. Deployment should not be automated from this project without explicit approval.

## Current State

Stage 3. The app builds and has server-side admin authentication/protection, but database migrations, product CRUD, cart, checkout, customer account UI, and real admin workflows are not implemented yet.

## Deployment Principles

- Do not deploy automatically.
- Build must pass before deployment.
- Lint and type checks must pass when scripts exist.
- Production secrets must be configured in the hosting provider, not committed.
- Supabase service role key must remain server-only.
- Database migrations must be reviewed before production execution.

## Planned Hosting

The app is expected to be compatible with a modern Next.js host such as Vercel or another Node-capable platform.

Required production configuration:

- Node runtime compatible with the selected Next.js version.
- PostgreSQL connection to Supabase.
- Supabase project URL and anon key.
- Server-only Supabase service role key if required for admin storage operations.
- Auth secret.
- App URL.
- A migrated PostgreSQL database including the Stage 3 `User.passwordHash` schema change.

## Pre-Deployment Checklist

- [ ] `npm run build` passes.
- [ ] Lint passes if configured.
- [ ] Type checks pass if configured.
- [ ] Prisma schema validates.
- [ ] Prisma migrations are reviewed and applied intentionally.
- [ ] Prisma migrations are reviewed.
- [ ] Environment variables are configured in hosting provider.
- [ ] No real secrets are committed.
- [ ] Admin routes are protected server-side.
- [ ] Admin server actions and API routes are protected server-side.
- [ ] Initial admin account is created through a safe server-side script.
- [ ] Login abuse prevention is enabled before production traffic.
- [ ] Checkout recalculates prices server-side.
- [ ] Stock is validated server-side before order creation.
- [ ] Product image upload validation is implemented.
- [ ] Supabase RLS and Storage policies are documented and reviewed.
- [ ] Safe error messages are used.
- [ ] Login and order abuse prevention strategy is documented.

## Rollback Notes

Future deployment planning should include:

- Database migration rollback strategy.
- Feature flags for risky storefront or checkout changes.
- Backup and restore process for production database.
- Storage object retention and cleanup process.
