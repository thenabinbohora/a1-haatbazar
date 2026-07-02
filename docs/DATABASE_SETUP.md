# Supabase PostgreSQL And Prisma Setup

Stage 2 defines the Prisma schema and seed data. It does not run migrations against a real Supabase database.

## Required Environment Variables

Create `.env.local` for local development only. Do not commit it.

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@aws-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@aws-REGION.pooler.supabase.com:5432/postgres"
```

Use real Supabase values only in local `.env.local` or deployment environment settings.

## Supabase Connection Notes

Supabase usually provides multiple PostgreSQL connection strings. For Prisma:

- Use `DATABASE_URL` for runtime app access through the shared transaction-mode pooler.
- Use `DIRECT_URL` for Prisma CLI migrations through the shared session-mode pooler.
- In this Prisma 7 project, `prisma.config.ts` loads `.env.local` and prefers `DIRECT_URL` for CLI commands.
- Never expose `DATABASE_URL` or `DIRECT_URL` to browser code.
- Never use the Supabase service role key in browser code.

For your Supabase project, the URLs should look like this with placeholder values:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@aws-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@aws-REGION.pooler.supabase.com:5432/postgres"
```

Replace `URL_ENCODED_PASSWORD` with the URL-encoded database password, not your Supabase account password.

## Prisma Commands

Generate Prisma Client:

```bash
npm.cmd run prisma:generate
```

Validate the schema:

```bash
npm.cmd run prisma:validate
```

Run seed data after migrations are applied to a development database:

```bash
npm.cmd run db:seed
```

## Migration Plan

When real Supabase credentials are configured outside source control, create and apply the initial migration with a reviewed command such as:

```bash
npm.cmd exec prisma -- migrate dev --name init
```

Do not run migrations against production without review, backup, and rollback planning.

## RLS Planning

Prisma server-side queries are planned for application access. Supabase Row Level Security should still be enabled for tables that may ever be accessed through Supabase clients or admin tools.

See `SECURITY_CHECKLIST.md` for the RLS policy plan.
