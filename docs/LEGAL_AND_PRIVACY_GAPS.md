# Legal and privacy implementation gaps

Last reviewed: 25 July 2026

Status: implementation audit. This document is not legal advice. It separates code and operational mismatches from the business and solicitor decisions tracked in `LEGAL_REVIEW_CHECKLIST.md`.

No secret values, credentials, private project identifiers or customer records are recorded here.

## Severity guide

| Severity | Meaning |
| --- | --- |
| Critical | Credible risk of serious unauthorised access, destructive production impact or major legal/contract mismatch requiring immediate action |
| High | Material privacy, security, customer-remedy or order-integrity risk to resolve before production approval |
| Medium | Important control or process weakness that can cause inconsistent practice, misleading wording or avoidable incidents |
| Low | Defence-in-depth, maintainability or transparency improvement |

## Implementation mismatches

### GAP-01 — Guest checkout can modify another account by email

Severity: High

Observed: checkout performs `User.upsert` using the customer-supplied email and updates the matched row's name and phone without requiring that user's session. A delivery checkout then creates an address and order against that row.

Evidence: `src/app/checkout/actions.ts:184-217`, `src/app/checkout/actions.ts:249-289`.

Impact: a person who knows another customer's or administrator's email can alter that account's profile fields and add an address and order to it. This is an integrity and privacy-boundary failure even though it does not directly reveal the existing address.

Required remediation:

1. For a signed-in checkout, derive `userId` only from the trusted server session and do not accept an email as identity.
2. For a guest checkout, use a separate guest-order/contact model or a verified guest claim flow. Do not update an existing account solely because the email matches.
3. Reconcile existing guest-created rows and contaminated addresses/orders before launch.
4. Add tests covering a guest submission that uses an existing customer and admin email.

Policy handling until fixed: describe guest orders as being recorded against the supplied contact email, but do not imply verified account ownership or safe automatic account association.

### GAP-02 — Guest-created customer records block normal registration

Severity: High

Observed: guest checkout creates a `CUSTOMER` user with no password hash, while registration rejects every email that already exists.

Evidence: `src/app/checkout/actions.ts:184-197`; `src/app/login/actions.ts:80-87`; `prisma/schema.prisma:102-120`.

Impact: a guest purchaser may be unable to create an account with the email used for the order. Identity, access, deletion and order-history requests become harder to fulfil consistently.

Required remediation:

1. Separate guest contacts from login accounts, or implement a verified claim/merge flow.
2. Require email ownership verification before attaching historical guest orders to a login account.
3. Ensure the flow works in both the local user store and Supabase Auth.

### GAP-03 — Password-recovery PKCE flow is internally inconsistent

Severity: High

Observed: the browser Supabase client starts password recovery using PKCE and persists the browser-side verifier. The callback exchanges the code on the server using a new non-persistent Supabase client that cannot read that browser verifier.

Evidence: `src/lib/supabase-browser.ts:15-20`; `src/components/account/customer-auth-card.tsx:99-111`; `src/app/auth/callback/route.ts:21-30`; `src/lib/supabase-auth-server.ts:38-45`.

Impact: password reset can fail even when the email link is valid. This undermines account recovery and any manual access/deletion process that assumes the customer can regain access.

Required remediation:

1. Implement a Supabase-supported SSR/PKCE flow that securely transfers or retrieves the verifier, or exchange the code in the same browser storage context.
2. Keep recovery tokens HTTP-only once exchanged.
3. Add end-to-end tests from reset request through successful local and Supabase password update.
4. Confirm that abandoned verifier storage is removed.

### GAP-04 — Email ownership is not verified before account activation

Severity: Medium

Observed: Supabase Auth users are created with `email_confirm: true`, and the local account session is created immediately.

Evidence: `src/lib/supabase-auth-server.ts:58-68`; `src/app/login/actions.ts:89-109`.

Impact: an account can be opened using an email address the registrant does not control. This can misdirect recovery communications and complicate order ownership and privacy requests.

Required remediation: implement an approved email-verification or verified account-claim process before treating email as an identity link. Keep order contact and account ownership distinct until verification.

### GAP-05 — No implemented account export, profile-correction or account-deletion workflow

Severity: High

Observed: customers can manage addresses and wishlist items, but the account navigation exposes no export, general profile edit or deletion function. Orders restrict deletion of the related user. Supabase Auth and the local user database are separate stores.

Evidence: `src/components/account/account-nav.tsx:7-12`; `src/app/account/page.tsx:85-93`; `src/app/account/actions.ts:58-164`; `prisma/schema.prisma:102-124`, `prisma/schema.prisma:331-359`.

Impact: the Privacy Policy correctly directs customers to email, but there is no documented internal tool or procedure that ensures identity verification, complete export/correction, coordinated deletion, de-identification or lawful order retention.

Required remediation:

1. Create an authenticated request flow or protected staff workflow with identity verification.
2. Define which records are corrected, exported, deleted, de-identified or retained.
3. Coordinate local users, Supabase Auth users, sessions, addresses and wishlists.
4. Preserve order records only under the approved legal/operational retention rule.
5. Record request status and outcome without storing unnecessary identity evidence.

### GAP-06 — Delivery fee is excluded from the persisted total with no recorded acceptance flow

Severity: High

Observed: checkout stores `shippingTotal` as zero and calculates the order total without a delivery fee. The interface says staff will confirm and add a fee later, but the admin order workflow only changes order and payment statuses.

Evidence: `src/app/checkout/actions.ts:180-182`, `src/app/checkout/actions.ts:249-264`; `src/components/checkout/checkout-page-client.tsx:409-413`, `src/components/checkout/checkout-page-client.tsx:581-600`; `src/app/admin/(protected)/orders/actions.ts:65-70`.

Impact: the stored order total, customer confirmation and invoice can differ from the amount later requested. There is no auditable customer agreement to the fee or revised total.

Required remediation:

1. Configure and calculate the fee before submission, or implement a quote/acceptance state before final order acceptance.
2. Store the quoted fee, revised total, acceptance timestamp and actor.
3. Prevent fulfilment or payment-status changes until required acceptance is recorded.
4. Make confirmation and invoice views use the accepted total.

Policy handling until fixed: retain clear “order request” wording and do not state that an unspecified later fee is already part of an accepted total.

### GAP-07 — Delivery coverage and timing are not enforced

Severity: High

Observed: the checkout accepts free-text address, state and country values and has no configured suburb/postcode/radius rule, delivery slot or minimum order. “Local delivery” availability is an operational check outside the application.

Evidence: `src/config/business.ts:104-112`; `src/lib/validation/checkout.ts:28-47`; `src/components/checkout/checkout-page-client.tsx:409-451`.

Impact: customers can submit out-of-area delivery requests, and staff decisions may be inconsistent or difficult to evidence.

Required remediation: either implement an approved service-area and timing check or maintain a documented staff decision process with prompt customer confirmation and no charge before acceptance.

### GAP-08 — No customer substitution, cancellation, return or executable refund workflow

Severity: High

Observed:

- checkout accepts only exact cart items and has no substitution preference;
- customers have no cancellation request action;
- return-related inventory enums exist but no customer return intake or assessment workflow uses them;
- admins can label a payment `REFUNDED`, but no payment processor or refund execution exists;
- the `REFUNDED` order status is not in the admin transition options.

Evidence: `src/lib/validation/checkout.ts:10-27`; `src/app/checkout/actions.ts:132-160`; `src/lib/admin/order-status.ts:3-33`; `src/app/admin/(protected)/orders/actions.ts:29-116`; `prisma/schema.prisma:48-100`.

Impact: detailed public promises about consented substitutions, cancellation outcomes, refund execution or processing times would not be supported by the application. Staff actions may not be recorded consistently.

Required remediation:

1. Approve the business rules first.
2. Add customer contact/preferences and staff decision records for substitutions.
3. Add cancellation and remedy intake with status history, evidence notes and customer communication.
4. Treat a refund status as a record of a completed financial action, not the action itself.
5. Preserve non-excludable Australian Consumer Law remedies regardless of workflow state.

### GAP-09 — Order lifecycle is not fulfilment-specific and has no status history or notification dispatch

Severity: Medium

Observed: the transition table permits `READY_FOR_PICKUP` and `OUT_FOR_DELIVERY` from the same processing state without checking fulfilment type. Status updates overwrite the current value. The application displays contact promises but has no automated order email or SMS sender.

Evidence: `src/lib/admin/order-status.ts:26-34`; `src/app/admin/(protected)/orders/actions.ts:61-71`; `src/components/checkout/checkout-page-client.tsx:343-380`, `src/components/checkout/checkout-page-client.tsx:457-465`; `package.json:24-32`.

Impact: a pickup order can be marked out for delivery, a delivery order can be marked ready for pickup, and there is no auditable timeline or proof that the customer was notified.

Required remediation:

1. Validate transitions against `fulfillmentType`.
2. Add append-only status history with actor and timestamp.
3. Define and implement manual or automated notification records before promising particular channels or timing.

### GAP-10 — Public checkout abuse controls and input limits are incomplete

Severity: High

Observed: authentication actions have a basic limiter, but checkout has no limiter, duplicate-order control or bot protection. Delivery and pickup notes use an unbounded optional string schema, while the global Server Actions body limit is 45 MB to support admin image uploads.

Evidence: `src/app/checkout/actions.ts:72-118`; `src/lib/validation/checkout.ts:4-27`; `next.config.ts:31-35`; `SECURITY_CHECKLIST.md:15-20`.

Impact: automated or oversized submissions can create customer records, addresses, orders and inventory mutations, exhaust stock, and store excessive user-supplied content.

Required remediation:

1. Add production-grade distributed rate limiting and duplicate-order/idempotency protection.
2. Add bot-risk controls appropriate to the business.
3. Set strict per-field note limits and route-specific request limits.
4. Monitor rejected and suspicious attempts without retaining identifiers longer than approved.

### GAP-11 — Authentication rate-limit identifiers outlive the one-minute decision window

Severity: Medium

Observed: rate-limit entries include IP and, for login, email. Expired entries are pruned only after the in-memory map reaches 10,000 entries; below that threshold they remain until the process ends. The limiter is per server instance.

Evidence: `src/lib/rate-limit.ts:8-23`, `src/lib/rate-limit.ts:26-54`; `src/app/login/actions.ts:42-45`, `src/app/login/actions.ts:76-77`; `src/app/admin/login/actions.ts:25-26`.

Impact: technical identifiers can remain in memory longer than the documented one-minute enforcement window, while the control remains ineffective across multiple instances.

Required remediation: use a shared limiter with explicit TTL deletion, hash or minimise identifiers where practical, trust forwarding headers only through a verified proxy configuration, and document the approved retention.

### GAP-12 — The default seed command is destructive to customer and order data

Severity: Critical

Observed: the configured seed deletes banners, coupons, inventory logs, carts, wishlists, order items, orders and catalog data before recreating seed data. Repository documentation elsewhere describes demo seeding as non-destructive.

Evidence: `package.json:14`, `package.json:21-22`; `prisma/seed.ts:244-257`; contradictory statement at `SECURITY_CHECKLIST.md:384-389`.

Impact: running the ordinary seed command against production can permanently erase material customer, order and operational records, undermining retention, consumer-remedy and accounting obligations.

Required remediation:

1. Add a hard production guard and explicit environment confirmation.
2. Replace destructive production-facing seeding with scoped, idempotent catalog fixtures.
3. Separate disposable test reset scripts from ordinary seed commands.
4. Test backup restoration and audit any environment where this command has run.

### GAP-13 — No approved retention, cleanup or de-identification implementation

Severity: High

Observed: customer and order tables have creation/update timestamps but no deletion schedule or de-identification state. Expired sessions are removed only on later access or sign-out. Browser cart and checkout-history local storage have no automatic expiry. Backup and storage cleanup remain future planning items.

Evidence: `prisma/schema.prisma:102-156`, `prisma/schema.prisma:269-359`; `src/lib/auth.ts:50-92`; `src/store/cart-store.tsx:73-86`; `src/components/checkout/order-success-client.tsx:6-39`; `DEPLOYMENT_GUIDE.md:53-60`.

Impact: “keep only as long as needed” is not backed by a schedule or repeatable process, and records may be kept indefinitely or deleted inconsistently.

Required remediation:

1. Approve a legally reviewed data-class retention matrix.
2. Implement scheduled expiry/de-identification with holds for disputes, recalls and required records.
3. Clean expired sessions and unnecessary client-side markers.
4. Align backups, logs and Supabase Auth deletion with the same schedule.
5. Test and audit deletion without using destructive broad seed operations.

### GAP-14 — Marketing consent and unsubscribe controls do not exist

Severity: Medium if marketing is introduced; Low while no marketing is sent

Observed: there is no marketing preference field, subscription list, suppression list, promotional sender or unsubscribe action.

Evidence: `README.md:9`; `SECURITY_CHECKLIST.md:38`; `prisma/schema.prisma:102-124`; `package.json:24-32`.

Impact: promotional email or SMS cannot be introduced lawfully and consistently merely by reusing checkout contact details.

Required remediation: keep marketing disabled until an approved consent basis, preference record, unsubscribe link, manual suppression process and audit trail are implemented. Essential order/security messages must remain separate.

Policy handling: the current Privacy Policy accurately says marketing persistence and sending are not implemented.

### GAP-15 — Google Maps loads as third-party content without a user choice

Severity: Medium

Observed: the homepage lazy-loads a Google Maps iframe. It is not click-to-load and is not controlled by a consent preference. The cookie draft describes application storage as essential while separately acknowledging provider-controlled Google storage.

Evidence: `src/components/home/store-location-map.tsx:5-13`; `src/config/business.ts:91-93`; `src/content/legal-documents.tsx:1037-1052`, `src/content/legal-documents.tsx:1199-1213`.

Impact: Google can receive request and device information when the iframe comes into view even if the visitor does not use directions. Whether this is acceptable without prior choice is a legal/compliance-design decision.

Required remediation: obtain legal approval for the classification and consent approach. If required, use an accessible click-to-load map and keep the written address and directions alternative available.

### GAP-16 — Security logging, monitoring, backups and incident response are not production-complete

Severity: Medium

Observed: the storefront client logs only an error digest, the admin client logs the full error object to its console, and no dedicated monitoring provider or application-wide redaction policy exists. Deployment documentation leaves backup/restore planning for the future.

Evidence: `src/app/error.tsx:13-18`; `src/app/admin/(protected)/error.tsx:10-12`; `package.json:24-32`; `DEPLOYMENT_GUIDE.md:53-60`; `SECURITY_CHECKLIST.md:20`.

Impact: incidents may not be detected or investigated reliably, while provider and browser logs may retain data under unverified settings.

Required remediation:

1. Approve structured server-side logging with field redaction and least-necessary identifiers.
2. Confirm Vercel and Supabase log contents and retention.
3. Implement monitoring/alerting only after updating the provider register and privacy wording.
4. Establish backup, restore, incident-response and eligible-data-breach assessment procedures.
5. Replace client-side full error logging in the admin boundary with a non-sensitive reference.

### GAP-17 — CSP and third-party media policy need hardening

Severity: Low

Observed: security headers are present, but production CSP permits inline scripts/styles and images from any HTTPS origin. There is no CSP reporting endpoint.

Evidence: `next.config.ts:8-29`.

Impact: the CSP provides useful baseline protection but is broader than a nonce/hash and allowlist approach. Admin-configured external images can introduce unreviewed third-party requests.

Required remediation: review nonce/hash support, restrict image origins to approved providers, add reporting without leaking page data, and document any newly approved provider before use.

### GAP-18 — GST treatment is not configured

Severity: Medium

Observed: orders use AUD, but `taxTotal` is always stored as zero and no code or approved configuration states whether displayed prices include GST where applicable.

Evidence: `src/app/checkout/actions.ts:259-264`; `prisma/schema.prisma:340-345`.

Impact: terms, receipts and invoices may misdescribe pricing or tax treatment.

Required remediation: obtain accounting/legal confirmation, implement the approved tax display and calculation approach, and update terms and invoice wording.

### GAP-19 — Terms/privacy acceptance and version are not recorded

Severity: Medium

Observed: registration and checkout forms do not present or record acceptance of a particular terms/privacy version.

Evidence: `src/components/account/customer-auth-card.tsx:198-242`; `src/components/checkout/checkout-page-client.tsx:301-306`, `src/components/checkout/checkout-page-client.tsx:609-615`.

Impact: the business may have difficulty demonstrating which terms were presented for an order or account. A privacy notice is also not surfaced at the point of collection.

Required remediation: obtain legal advice on the required acceptance model, add accessible links and concise collection notice, and store the accepted terms version/timestamp if affirmative acceptance is chosen. Do not bundle optional marketing consent.

### GAP-20 — “Remember me” does not change session duration

Severity: Low

Observed: the login form displays a Remember me checkbox, but the login action never reads it and all sessions expire after seven days.

Evidence: `src/components/account/customer-auth-card.tsx:262-266`; `src/app/login/actions.ts:30-59`; `src/lib/auth.ts:7-24`.

Impact: the interface gives a misleading privacy/session expectation.

Required remediation: remove the checkbox or implement a reviewed shorter/default and remembered duration, then update the cookie register.

### GAP-21 — Password reset does not revoke existing application sessions

Severity: High

Observed: a successful recovery updates the local password hash and the Supabase Auth password, but it does not delete the customer's existing database-backed `gsp_session` records. Those sessions remain usable until their fixed seven-day expiry or an explicit sign-out.

Evidence: `src/app/reset-password/actions.ts:45-56`; `src/lib/auth.ts:7-8`, `src/lib/auth.ts:50-76`.

Impact: if password recovery follows suspected credential or session theft, changing the password does not remove an attacker's already-issued application session.

Required remediation:

1. In the same protected recovery workflow, revoke all existing local sessions for the affected user before issuing any replacement session.
2. Revoke other Supabase Auth sessions if any user-facing Supabase session flow is enabled.
3. Provide a protected “sign out everywhere” control and incident-response procedure.
4. Add an integration test proving that a pre-reset session is rejected immediately after reset.

## Operational and legal questions that are not code defects

The following require owner or solicitor decisions and must not be “fixed” by inventing values:

- registered entity name, ABN/ACN and public telephone number;
- confirmed Privacy Act and APP coverage;
- change-of-mind policy;
- delivery service area, fee, minimum order and failed-delivery charges;
- exact payment tender types and refund method;
- cancellation and substitution rules;
- return-assessment targets and voluntary evidence practices;
- published retention periods;
- exact overseas processing countries and provider subprocessors;
- insurance, licensing and professional-adviser arrangements;
- Google Maps consent classification; and
- approved marketing consent and unsubscribe approach if marketing is later introduced.

These decisions are tracked in `docs/LEGAL_REVIEW_CHECKLIST.md`.

## Verified controls to preserve

- Passwords are hashed with scrypt, and raw session tokens are hashed before database storage (`src/lib/password.ts:8-33`; `src/lib/auth.ts:17-38`).
- The main session cookie is HTTP-only, SameSite Lax and Secure in production (`src/lib/auth.ts:40-47`).
- Prices, product status and stock are recalculated server-side in checkout (`src/app/checkout/actions.ts:118-165`).
- Customer order, address and wishlist reads/writes are generally scoped by signed-in user ID (`src/app/account/actions.ts:58-164`; `src/app/account/orders/page.tsx:14-21`; `src/app/api/wishlist/toggle/route.ts:5-39`).
- Admin pages and mutations use server-side role checks (`src/app/admin/(protected)/layout.tsx:1-11`; `src/lib/auth.ts:103-115`).
- RLS migrations deny broad direct access and scope customer-owned rows (`prisma/migrations/20260701000100_enable_supabase_rls/migration.sql:57-74`, `prisma/migrations/20260701000100_enable_supabase_rls/migration.sql:313-337`, `prisma/migrations/20260701000100_enable_supabase_rls/migration.sql:427-480`).
- Security headers include CSP, nosniff, frame protection, referrer policy, permissions policy and HSTS (`next.config.ts:8-29`).
- No online card processor, analytics platform, advertising pixel, SMS provider or separate error-monitoring SDK is currently integrated (`package.json:24-32`).
- The legal content avoids publishing an invented entity, ABN, phone number, fixed delivery rule, change-of-mind rule or retention period (`src/config/business.ts:63-71`, `src/config/business.ts:104-112`; `src/content/legal-documents.tsx:205-215`, `src/content/legal-documents.tsx:874-897`).
