# Account security flow

## Scope and trust boundaries

The customer application uses two coordinated security domains:

- Supabase Auth owns password verification, password updates, provider identities, refresh-session revocation, and Auth-user deletion.
- `public."User"` and `public."Session"` own the application profile, role/status gate, and HTTP-only `gsp_session` cookie.

Every customer row is linked to the immutable Supabase UUID through
`User.supabaseAuthUserId`. The app ID and Supabase ID are deliberately not
assumed to match. Security actions derive both identities from the authenticated
server session and never accept a browser-supplied deletion target.

## Password change

1. Next.js Server Action origin/host validation rejects cross-origin requests.
2. The HTTP-only application session is resolved from its SHA-256 token and the
   linked user must be an `ACTIVE` `CUSTOMER` with `authMethod=PASSWORD`.
3. User-ID and user-plus-network rate limits are checked atomically in the
   shared `SecurityRateLimit` table. Keys are HMAC pseudonyms and temporary
   cooldowns increase progressively without creating a permanent lockout.
4. Structural validation rejects missing fields, mismatches, reuse of the current
   password, accidental outer whitespace, and inputs over 128 characters.
5. An isolated non-persistent Supabase client calls `signInWithPassword` using
   the current account email and submitted current password.
6. The returned Supabase user UUID must exactly match `supabaseAuthUserId`.
7. The same isolated client calls `updateUser` with both `current_password` and
   the new password. Supabase remains authoritative for configured weak/leaked
   password rejection.
8. The local scrypt hash used by the legacy application sign-in is updated. If
   this final synchronisation fails, the verified old password is restored in
   Supabase through the server-only admin client.
9. When selected, Supabase `scope: "others"` and all other application sessions
   are revoked. The short-lived verification session is then locally revoked;
   the current application session remains active.
10. Password values are reset by the browser immediately after every handled
    success or failure. Only derived strength-check booleans enter React state.

The project was verified with `@supabase/supabase-js` 2.110.0, which supports
`current_password` and scoped sign-out. The hosted Auth configuration currently
allows a six-character minimum; the UI presents 12+ characters and mixed
character classes as recommendations without falsely labelling a password
"strong". Supabase performs the authoritative policy decision.

The application performs an explicit password sign-in before update because the
hosted project's global "require current password" switch is currently disabled.
Enable that dashboard control as defence in depth. The Supabase security advisor
also reports leaked-password protection disabled; enable it when the project plan
supports the feature.

## Provider-aware verification

`User.authMethod` records the application credential established during account
creation. Current production customers are all `PASSWORD` users. `EMAIL_OTP` and
`OAUTH` accounts do not receive a password field during deletion. They request a
fresh Supabase email OTP with `shouldCreateUser: false`; the returned session user
must match the linked Supabase UUID. Configure the reauthentication email template
to display `{{ .Token }}` before enabling passwordless/OAuth customer sign-in.

## Security notifications

Enable Supabase's `password_changed` security notification template with the
following customer warning:

> Your A1 Haat Bazar password was changed. If you did not make this change,
> reset your password and contact the store.

The app can additionally deliver password-change and deletion-complete notices
through `SECURITY_EMAIL_WEBHOOK_URL`. The server sends only recipient email,
event ID, subject, and fixed text. No password, token, address, or payment data is
included. `SECURITY_SUPPORT_WEBHOOK_URL` receives only a non-sensitive event ID
and failure stage when an authorised deletion retry is required.

## Audit and error handling

`SecurityAuditEvent` is RLS-protected with no anonymous/authenticated policies or
Data API grants. Identifiers are HMAC-pseudonymised with `AUTH_SECRET`. Payloads,
passwords, OTPs, access/refresh tokens, email addresses, and service keys are
never logged. Customer errors are mapped to fixed messages rather than raw
Supabase or database errors.
