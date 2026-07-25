# Legal review checklist

Last reviewed: 25 July 2026

Status: draft for owner and Australian solicitor review. This checklist records facts that were verified from the application and matters that still require a business, operational or legal decision. It is not legal advice.

Do not publish a registered entity name, ABN, ACN, telephone number, provider location, delivery rule, return period or retention period unless it has been confirmed and the central configuration and policies have been updated.

## Verified public and implementation facts

| Item | Verified position | Evidence |
| --- | --- | --- |
| Trading name | A1 Haat Bazar | `src/lib/constants.ts:1`; `src/config/business.ts:63-65` |
| Store address | 3/170 Commercial Rd, Salisbury SA 5108, Australia | `src/config/business.ts:4`, `src/config/business.ts:72-80` |
| Opening hours | Open daily, 9:00 AM–7:00 PM | `src/config/business.ts:85-90` |
| Public email | hello@a1haatbazar.com.au | `src/lib/constants.ts:11`; `src/config/business.ts:69` |
| Business description | Local Salisbury grocery store selling Nepali, Indian and Asian groceries, fresh vegetables, frozen products and everyday essentials | `src/config/business.ts:67-68` |
| Jurisdiction used by the drafts | South Australia, Australia | `src/config/business.ts:36-39`, `src/config/business.ts:94-97` |
| Current production URL | `https://grocery-store-pro.vercel.app` | `src/config/business.ts:71`; the live URL returned HTTP 200 and the production canonical URL during the audit |
| Hosting | Vercel | `.vercel/README.txt:1-7`; live response identified Vercel |
| Database | Supabase-hosted PostgreSQL, accessed through Prisma | `package.json:25-29`; `.env.example:6-16`; `prisma/schema.prisma:5-7` |
| Authentication | Hybrid implementation: local password hashes and database-backed sessions, plus Supabase Auth for account creation and password recovery | `src/app/login/actions.ts:48-59`, `src/app/login/actions.ts:89-109`; `src/lib/supabase-auth-server.ts:38-68` |
| Product-image storage | Supabase Storage through protected server-side helpers | `src/lib/supabase-storage.ts:57-74`, `src/lib/supabase-storage.ts:87-112` |
| Maps | Embedded Google Maps iframe and Google Maps directions link | `src/config/business.ts:91-93`; `src/components/home/store-location-map.tsx:6-12` |
| Online payments | Not implemented; no card fields or payment processor were found | `src/app/checkout/page.tsx:47-50`; `src/components/checkout/checkout-page-client.tsx:524-534` |
| Supported payment timing | Payment on delivery for delivery orders; payment at pickup for pickup orders. The exact tender types accepted in person are not configured | `src/lib/validation/checkout.ts:26-50`; `src/components/checkout/checkout-page-client.tsx:524-534` |
| Currency | Australian dollars | `src/config/business.ts:40-45`, `src/config/business.ts:98-103`; `src/app/checkout/actions.ts:264` |
| Guest checkout | Supported, although the implementation has identity-linking gaps recorded in `LEGAL_AND_PRIVACY_GAPS.md` | `src/app/checkout/page.tsx:16-41`; `src/app/checkout/actions.ts:184-197` |
| Price and stock checks | Product status, current price and available stock are checked server-side before an order is created | `src/app/checkout/actions.ts:118-165` |
| Order creation | Submission creates a `PENDING`, `UNPAID` order, decrements stock and writes inventory records | `src/app/checkout/actions.ts:219-290` |
| Delivery | Offered, but availability and any fee are stated to be confirmed by staff; no verified service area, fixed fee or minimum order is configured | `src/config/business.ts:104-112`; `src/components/checkout/checkout-page-client.tsx:409-451` |
| Pickup | Enabled and described as free from the Salisbury store; readiness contact is an operational promise | `src/config/business.ts:113-118`; `src/components/checkout/checkout-page-client.tsx:457-475` |
| Substitutions | No automatic substitution preference or substitution workflow exists | `src/lib/validation/checkout.ts:10-27`; `src/app/checkout/actions.ts:132-160` |
| Returns and refunds | Order/payment status fields exist, but there is no customer returns workflow or payment-refund integration | `prisma/schema.prisma:48-65`, `prisma/schema.prisma:83-100`; `src/app/admin/(protected)/orders/actions.ts:65-104` |
| Cart | Product ID, variant ID and quantity are stored in browser local storage; database cart models are not used by the current storefront | `src/store/cart-store.tsx:6-12`, `src/store/cart-store.tsx:73-86` |
| Wishlist | Stored in the database for signed-in customers and scoped by signed-in user ID | `src/app/api/wishlist/ids/route.ts:5-18`; `src/app/api/wishlist/toggle/route.ts:5-39` |
| Address correction | Signed-in customers can add, update and delete their saved delivery addresses | `src/app/account/actions.ts:58-151` |
| Account export/deletion/profile edit | No self-service export, account-deletion or general profile-editing feature exists | `src/components/account/account-nav.tsx:7-12`; `src/app/account/page.tsx:85-93` |
| Marketing | No persistent newsletter list, marketing-consent field, promotional messaging provider or unsubscribe implementation was found | `README.md:9`; `SECURITY_CHECKLIST.md:38`; `prisma/schema.prisma:102-124` |
| Analytics/advertising | No analytics package, advertising pixel or third-party runtime script was found | `package.json:24-32`; `src/components/home/store-location-map.tsx:6-12` |
| Error monitoring | No dedicated error-monitoring provider was found | `package.json:24-32`; `src/app/error.tsx:13-18` |
| SMS | No SMS provider or sending workflow was found | `package.json:24-32` |
| Security controls | HTTP-only secure-in-production session cookies, hashed session tokens and passwords, server-side role checks, validation, RLS migrations and security headers exist | `src/lib/auth.ts:17-47`; `src/lib/password.ts:8-33`; `src/app/admin/(protected)/layout.tsx:1-11`; `next.config.ts:8-29`; `prisma/migrations/20260701000100_enable_supabase_rls/migration.sql:57-74` |
| First-party storage register | Four first-party cookies, two application local-storage keys and a provider-generated Supabase PKCE verifier were identified; no application `sessionStorage` use was found | `src/lib/auth.ts:7-47`; `src/lib/supabase-auth-server.ts:4-6`, `src/lib/supabase-auth-server.ts:82-100`; `src/app/checkout/actions.ts:320-332`; `src/store/cart-store.tsx:6-7`; `src/components/checkout/order-success-client.tsx:6-39`; `src/lib/supabase-browser.ts:15-20` |

## Business identity and publication approval

- [ ] Confirm the registered legal entity or individual carrying on the A1 Haat Bazar business. The repository verifies only the trading name.
- [ ] Confirm whether an ABN or ACN should be published and the exact verified number.
- [ ] Confirm whether a public business telephone number should be published.
- [ ] Confirm that the store address, public email and opening hours remain current.
- [ ] Confirm that A1 Haat Bazar is authorised to use the supplied branding, product images and website content.
- [ ] Decide whether the current Vercel production URL is the approved customer-facing canonical URL or whether a custom domain will be connected before publication.
- [ ] Confirm who within the business can approve policy changes and receive privacy, consumer-law and accessibility complaints.

## Privacy-law review

- [ ] Obtain legal advice on whether the Privacy Act 1988, the Australian Privacy Principles or any small-business exemptions apply. The draft intentionally does not claim confirmed APP coverage.
- [ ] Approve a written retention and deletion schedule for customer records, orders, addresses, wishlists, sessions, security information, support correspondence and operational records.
- [ ] Confirm legal, tax, accounting, dispute and fraud-prevention retention needs before setting any fixed period.
- [ ] Establish an identity-verification and fulfilment procedure for access, correction, portable-copy and deletion requests received at the public email address.
- [ ] Decide how local application accounts, Supabase Auth users, sessions, addresses, wishlists and order records will be closed, erased, de-identified or retained together.
- [ ] Establish an owner for privacy complaints, a response workflow and internal response targets. The public draft promises only a reasonable period.
- [ ] Confirm whether any sensitive information is intentionally collected. Delivery and pickup notes should not be used to solicit passwords, payment credentials or unnecessary sensitive information.
- [ ] Confirm the business approach to information relating to children without inventing an age threshold.
- [ ] Approve the wording and process for material policy-change notices.

## Providers, overseas processing and records

- [ ] Confirm the current Vercel, Supabase and Google account settings, contracts, subprocessors and support arrangements.
- [ ] Confirm the countries in which customer information may be stored, processed, cached, backed up or remotely accessed. Infrastructure evidence indicates overseas processing is possible, but a complete public country list was not verified.
- [ ] Confirm the configured Supabase database region and Vercel compute/logging regions through the provider dashboards before naming countries publicly.
- [ ] Confirm whether Supabase uses its default email service or a separately configured SMTP provider for password-recovery messages.
- [ ] Confirm whether Vercel or Supabase platform logs contain IP addresses, user agents, URLs, query strings or other customer identifiers, and approve their retention periods.
- [ ] Confirm database backup, restore, disaster-recovery and storage-object cleanup arrangements. Existing deployment documentation lists these as future planning items (`DEPLOYMENT_GUIDE.md:53-60`).
- [ ] Review provider privacy terms and data-processing terms with professional advice before legal approval.

## Orders, pricing and payment

- [ ] Confirm whether displayed grocery prices include GST where applicable. The application currently stores `taxTotal` as zero and has no approved GST rule (`src/app/checkout/actions.ts:259-264`).
- [ ] Confirm the exact point at which a delivery order request and a pickup order become accepted and binding.
- [ ] Confirm when and how a customer must accept a delivery fee or another post-submission change.
- [ ] Confirm the exact tender types accepted on delivery and at pickup, such as cash, EFTPOS or another method. Do not name one until verified.
- [ ] Confirm who can cancel an order, the latest practical cancellation point and how customers make a request.
- [ ] Confirm what happens to coupon usage and stock when an order is cancelled.
- [ ] Confirm any promotion-specific limits, eligibility, non-combinability and per-customer restrictions. The current coupon model does not enforce a general one-per-customer rule.
- [ ] Confirm the process for obvious pricing errors without reserving an unlimited right to alter a confirmed order.

## Delivery and pickup

- [ ] Approve the actual delivery suburbs, postcode list or radius, or retain checkout-by-checkout availability wording.
- [ ] Approve any fixed delivery fee, fee calculation, free-delivery threshold or minimum order. None is currently verified.
- [ ] Confirm delivery days, requested windows, lead times, delay handling and customer contact procedures.
- [ ] Decide whether unattended delivery is offered. The current application has no explicit unattended-delivery selection.
- [ ] Approve failed-delivery procedures for unavailable recipients, unsafe access, incorrect addresses and inability to contact the customer. Do not add a redelivery fee without approval.
- [ ] Confirm whether delivery notes may be treated as safe-location instructions and how temperature-sensitive products are handled.
- [ ] Confirm pickup readiness communication, identification requirements, collection by another person and uncollected-order handling.
- [ ] Confirm how long chilled and frozen orders can safely be held and the customer handover instructions.

## Stock, substitutions and product information

- [ ] Decide whether substitutions will be offered. If so, approve a customer preference and consent workflow before publishing detailed substitution promises.
- [ ] Approve rules for allergen-sensitive or materially different substitutions and price differences.
- [ ] Confirm operational tolerances for fresh produce appearance and weight-based products.
- [ ] Confirm who validates online ingredients, allergens, nutrition, origin, storage and preparation information against current physical labels.
- [ ] Establish a product-recall and safety-notice workflow, including how affected customers are identified and contacted.
- [ ] Confirm whether manufacturer information or links may be published and how often they are reviewed.

## Returns, remedies and complaints

- [ ] Obtain Australian Consumer Law review of the public returns, refunds and replacements wording.
- [ ] Confirm whether A1 Haat Bazar offers any voluntary change-of-mind return policy. None was verified, so the public draft does not promise one.
- [ ] Approve the intake and assessment process for faulty, unsafe, damaged, spoiled, missing or incorrect products.
- [ ] Confirm acceptable proof-of-purchase and evidence practices without making original packaging or a receipt an unlawful absolute requirement.
- [ ] Confirm the practical refund method for each accepted tender type.
- [ ] Confirm how delivery and return costs are assessed for statutory remedies.
- [ ] Confirm internal processing targets without imposing an unlawful short deadline on consumer-guarantee claims.
- [ ] Train staff not to use “no refunds”, “all sales are final” or similar wording that could misstate non-excludable rights.

## Marketing and service communications

- [ ] Confirm that no customer data is currently used for promotional email or SMS.
- [ ] If marketing is introduced, implement and approve a consent basis, preference record, sender identification, unsubscribe facility and suppression process before sending.
- [ ] Keep essential account, security, order, delivery, pickup, safety and recall communications operationally separate from optional marketing.
- [ ] Confirm how order and pickup communications are currently sent. The application stores contact details and displays contact promises but has no automated order email or SMS integration.

## Security and operational sign-off

- [ ] Resolve the high-severity identity-linking, password-recovery, destructive-seed and delivery-fee issues in `docs/LEGAL_AND_PRIVACY_GAPS.md`.
- [ ] Revoke all existing local application sessions after a password reset or other credential-compromise event.
- [ ] Complete production CSRF review, checkout abuse prevention, bot/duplicate-order controls and shared rate limiting.
- [ ] Add an approved procedure for administrative access, access reviews, staff departures and privileged Supabase credentials.
- [ ] Approve log-redaction, incident-response, breach-assessment and customer-notification procedures.
- [ ] Confirm that production database RLS, storage policies and migrations match the reviewed repository.
- [ ] Add audit history for sensitive admin and order changes where required by the approved operational process.
- [ ] Review Content Security Policy allowances, external image sources and Google Maps loading against the intended privacy approach.
- [ ] Decide whether the Google Maps embed should remain automatic, become click-to-load, or be governed by another approved consent approach.

## Final legal-document approval

- [ ] Australian solicitor has reviewed all seven documents.
- [ ] Business owner has approved every operational promise in the documents.
- [ ] All public contact details and the canonical production URL have been rechecked.
- [ ] No raw placeholders, secret values, private provider identifiers or unverified registration details appear in production.
- [ ] `LEGAL_REVIEW_STATUS` is changed to `approved` only after approval. Draft is the safe default (`src/config/legal.ts:31-35`).
- [ ] The production build does not display the draft notice (`src/config/legal.ts:119-120`).
- [ ] Policy dates and related links are correct.
- [ ] The implementation gaps that would contradict public promises are closed or the public wording is narrowed and re-reviewed.
