# Customer account security

## Authentication boundary

`requireCustomer()` accepts only an authenticated user whose server-side role is
`CUSTOMER`. Administrator sessions are redirected to the administrator area and
are never rendered by customer account routes. The storefront wishlist provider
also treats only `CUSTOMER` sessions as customer-authenticated.

Sessions use a random raw token in an HTTP-only, same-site cookie. Only the
SHA-256 hash is stored in `Session`; production cookies use `secure`. Sign out
deletes the matching server session and cookie before redirecting.

## Ownership checks

Every customer query derives `userId` from the authenticated server session.
No customer ID is accepted from route parameters, form fields or query strings.

- Order lists use `where: { userId: user.id }`.
- Order details use both the customer-facing `orderNumber` and
  `userId: user.id`; a mismatch returns the normal not-found page.
- Address reads and mutations use `userId: user.id`. Update, default and delete
  actions first verify ownership inside the transaction.
- Wishlist reads and removals use `userId: user.id`.
- Profile updates use the session ID plus `role: CUSTOMER` and `status: ACTIVE`.

Hidden UI is not treated as authorisation.

## Supabase RLS

The existing Supabase RLS migrations remain unchanged. Direct authenticated
Supabase access maps the JWT email to the application user and scopes customer
Address, Order and Wishlist policies to `current_app_user_id()`. The Next.js
customer account uses server-side Prisma and repeats the same ownership
constraints at the application boundary.

Server actions do not accept or trust customer identity fields. The Supabase
service-role key, database URL, password hashes and session tokens are never
sent to the browser.

## Customer/admin identity separation

The account UI reads `User.name` and `User.email` only after the customer role
guard succeeds. Administrator role labels, administrator navigation, internal
order notes and admin-only operational fields are not selected for or rendered
in customer routes.

Development or test identities are managed by explicit scripts and environment
configuration. They are not hardcoded into account components. Production data
must not be created with the test-customer scripts.

## Address privacy

The overview selects and displays only label, default state, suburb, state and
postcode. Full delivery addresses and operational phone numbers are displayed
only on the dedicated address page or the owning order's detail page.

Address deletion requires an explicit inline confirmation. If the deleted
address was default, the most recently updated remaining shipping address is
promoted within the same transaction.

## Password handling

Password changes use the existing verified Supabase recovery flow. A short-lived
HTTP-only PKCE verifier and recovery cookies are used before updating Supabase
Auth and the local password hash. Password values are not logged or shown by the
account UI.

Active-session enumeration, sign-out-other-devices and two-factor
authentication are not shown because the current application does not support
them.

## Account deletion

Automated deletion is not implemented. The Security page provides the verified
manual request channel using the configured public store email. The UI explains
that identity must be verified and that order or accounting records may need to
be retained. It does not promise immediate or complete deletion.

Any future automated deletion flow must require recent re-authentication,
explicit confirmation, a retention review, session revocation and a signed-out
completion state.

## Error handling

Customer pages render generic messages and never return raw Prisma, PostgreSQL
or Supabase errors. A missing or non-owned order produces the standard 404
response, preventing order-number enumeration from revealing ownership.
