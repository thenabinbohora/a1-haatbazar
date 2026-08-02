# Customer authentication security

## Authentication model

- Credentials and provider identities are verified by Supabase Auth.
- The storefront session is an independent random 256-bit token stored only in
  the HTTP-only, SameSite=Lax `gsp_session` cookie. Only its SHA-256 digest is
  stored in `public."Session"`.
- Customer authorization requires an `ACTIVE` `CUSTOMER` application row.
- `supabaseAuthUserId` links the application row to immutable `auth.users.id`.
- `authMethod` records whether the application account uses password, verified
  email OTP, or OAuth identity verification.

The legacy customer sign-in currently verifies an application scrypt hash while
Supabase also stores the Auth credential. Password change and recovery update
both stores. New work should migrate primary sign-in to Supabase before removing
the local compatibility hash; do not silently remove it while existing customer
credentials may differ from historical Auth-sync passwords.

## RLS and deleted-token protection

Customer RLS policies resolve ownership through
`public.current_app_user_id()`. The public function is a `SECURITY INVOKER`
wrapper; privileged lookup lives in the non-exposed `private` schema, checks
`auth.uid()` against `supabaseAuthUserId`, and requires `status=ACTIVE`.

This prevents a short-lived access JWT issued before deletion from reading
profile, address, cart, wishlist, or order rows once the profile is marked
`DELETION_PENDING` or removed. It does not rely on the mutable JWT email claim.
Application session lookup enforces the same active-status rule.

The server-only deletion and audit tables have RLS enabled, no customer policies,
and no anonymous/authenticated Data API grants. The service/secret key is read
only by modules importing `server-only`; it is never prefixed with
`NEXT_PUBLIC_` or imported into client components.

## CSRF, abuse controls, and secrets

Next.js Server Actions provide POST-only action invocation and framework origin
checks. Security actions additionally compare `Origin` with forwarded/host
headers. SameSite cookies, shared Postgres-backed user-plus-network progressive
cooldowns, exact input schemas, and maximum lengths provide defence in depth.
`SecurityRateLimit` stores only HMAC-pseudonymous keys and has RLS enabled with
no anonymous or authenticated Data API access.

Configure an independent high-entropy `AUTH_SECRET` in every production
environment. For compatibility during rollout, the server-only Supabase service
credential is accepted as the HMAC key when `AUTH_SECRET` is absent; rotating
that credential resets active cooldown pseudonyms but does not affect deletion
retries, which use the non-sensitive event ID.

Passwords, confirmations, OTPs, access/refresh tokens, service keys, and full
request payloads must never enter URLs, analytics, browser storage, audit
metadata, or logs. Password fields use password-manager-compatible autocomplete
values and are cleared after every handled result.

## Operational configuration

- Keep Auth access-token lifetime short enough for the application's risk model.
- Enable "require current password" and recent-authentication controls in the
  Supabase Auth dashboard as defence in depth.
- Enable leaked-password protection when the Supabase plan supports it.
- Enable/customise the password-changed security notification template.
- Configure `SECURITY_EMAIL_WEBHOOK_URL` and support webhook variables for
  deletion notifications and completion-pending alerts.
- Keep authentication rate limits enabled; do not replace progressive cooldowns
  with permanent account lockout.
- Re-run Supabase security advisors after every RLS/function migration.
