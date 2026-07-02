# Security Checklist

This checklist is the running security baseline for Grocery Store Pro. Items are marked as planned until the relevant app code exists.

## Stage 13 UI/UX Polish Status

- [x] UI polish did not add new dependencies.
- [x] UI polish did not change database schema, authentication, RBAC, or server action authorization.
- [x] Public header continues to hide admin links.
- [x] Protected admin route structure remains unchanged and server-side guarded.
- [x] Customer-owned account, order, address, and wishlist ownership filters remain unchanged.
- [x] Checked public pages rendered without missing image `alt` attributes.
- [x] Checked public forms rendered with visible labels.
- [x] Mobile responsive checks found and fixed public page horizontal overflow.
- [ ] Production hardening still needs auth rate limiting, CSRF review, checkout abuse prevention, coupon redemption validation, and payment-provider verification before real launch.

## Stage 12 Customer Account And Admin Content Status

- [x] Customer login and registration use server actions and safe validation messages.
- [x] Customer account pages require a server-side session.
- [x] Customer order history queries are scoped by signed-in `userId`.
- [x] Customer address create, update, delete, and default-address changes are scoped by signed-in `userId`.
- [x] Wishlist reads and writes require a signed-in customer session and are scoped by signed-in `userId`.
- [x] Wishlist API validates the product exists and is active before writing.
- [x] Admin category, coupon, and banner create/update/delete actions remain protected by `requireAdmin()`.
- [x] Category image/icon URLs are validated server-side before write.
- [x] Coupon create/update writes validate code, discount type, value, schedule, limits, and active status server-side.
- [x] Banner create/update writes validate placement, image/link URL, schedule, sort order, and active status server-side.
- [ ] Checkout coupon redemption still needs server-side eligibility, expiry, usage-limit, subtotal, and customer restriction validation before discounts affect orders.

## Stage 7 Public Browsing Status

Customer homepage and public product browsing are implemented. Product detail pages are implemented in Stage 8. Cart and checkout are implemented. Wishlist persistence and customer account pages are implemented in Stage 12. Newsletter submission is not implemented yet.

## Stage 8 Product Detail Status

Public product detail pages are implemented with variant selection. Cart, checkout, wishlist persistence, and customer accounts are now implemented through later stages.

Stage 8 security actions completed:

- [x] Product detail slug lookup sanitizes the slug before querying.
- [x] Product detail pages return only `ACTIVE` products.
- [x] Product detail pages return only active variants.
- [x] Product detail pages expose public catalog fields only.
- [x] Variant selector updates display-only price and stock from server-provided public data.
- [x] Add-to-cart is disabled when the selected variant is out of stock.
- [x] Wishlist writes require a signed-in customer and are scoped to the signed-in `userId`.
- [x] Related products use the same public product filtering as listing pages.
- [x] No admin-only data, user data, order data, sessions, or server-only secrets are exposed.

Stage 8 remaining security work:

- [x] Cart quote validates selected variant IDs server-side before display.
- [x] Cart and checkout do not trust client-selected price, sale price, stock, or product status.
- [x] Checkout recalculates item price, stock, and totals server-side.
- [ ] Coupon redemption, tax, and final delivery fee rules still need production-grade server-side validation when those features are enabled.

Stage 7 security actions completed:

- [x] Public storefront pages use server-side Prisma reads only.
- [x] Public product browsing filters products to `ACTIVE` products.
- [x] Public product cards are derived only from active variants.
- [x] Public category and brand filters expose only catalog-safe fields.
- [x] Public search and filters use URL query params and do not perform database writes.
- [x] Public pages do not expose admin forms, admin mutation actions, user records, session records, or order records.
- [x] Public pages do not expose Supabase service role keys or other server-only secrets.
- [x] Public pages do not trust client-side price or stock for checkout because checkout remains unimplemented.
- [x] Product card prices are display-only and derived server-side from active variant data.

Stage 7 remaining security work:

- [x] Add product detail route with public-safe product data only.
- [x] Guest cart storage is device-local and cart quote recalculates server-side from product/variant IDs.
- [x] Checkout server-side price and stock recalculation is implemented before order creation.
- [ ] Add pagination or rate limiting if public catalog search becomes expensive at larger scale.

## Stage 5 Status

Admin product CRUD with variants/SKUs is implemented. Storefront product browsing, product detail pages, and product image upload to Supabase Storage are implemented. Cart and checkout are not implemented yet.

## Stage 6 Product Image Upload Status

Product main image upload, gallery upload, image replacement, and image removal are implemented through protected server actions. Storefront product gallery display is not implemented yet.

Stage 6 image security actions completed:

- [x] Product image upload actions require server-side `ADMIN` via `requireAdmin()`.
- [x] Product image replacement actions require server-side `ADMIN`.
- [x] Product image removal actions require server-side `ADMIN`.
- [x] Variant image upload/removal actions require server-side `ADMIN`.
- [x] Supabase service role key is used only in server-side storage helper code.
- [x] Service role key is not exposed to browser components.
- [x] Image MIME type is validated before upload.
- [x] Image extension is validated before upload.
- [x] Image size is validated before upload.
- [x] Only `jpg`, `jpeg`, `png`, and `webp` are accepted.
- [x] Storage paths are generated server-side.
- [x] Product image URL and storage path are stored in Prisma.
- [x] Variant image uploads are scoped to variants that belong to the current product.
- [x] Variant image removal clears the trusted server-side `ProductVariant.imageUrl` value.
- [x] Removed SKU rows trigger cleanup of variant-linked image metadata, with best-effort storage object cleanup.
- [x] Next.js Server Actions request size is capped at `45mb` so valid admin uploads can reach server-side validation without allowing unbounded request bodies.
- [x] Image upload server actions now return safe success/error redirects without leaking framework redirect internals.
- [x] Supabase Storage setup and policy notes are documented in `docs/STORAGE_SETUP.md`.

Stage 6 image remaining security work:

- [ ] Add image dimension extraction if exact width/height metadata is required.
- [ ] Add malware scanning or moderation workflow before production if uploads are opened to less-trusted admin users.
- [ ] Add orphaned-object cleanup task for rare database/storage partial failure cases.

## Previous Stage 6 Status

Admin category CRUD, coupon CRUD, banner CRUD, order status updates, and inventory adjustments are implemented. Checkout, customer order creation, Supabase Storage uploads, and persistent settings writes are not implemented yet.

Stage 6 security actions completed:

- [x] Category create/update/delete actions are protected server-side with `requireAdmin()`.
- [x] Coupon create/update/delete actions are protected server-side with `requireAdmin()`.
- [x] Banner create/update/delete actions are protected server-side with `requireAdmin()`.
- [x] Order status/payment updates are protected server-side with `requireAdmin()`.
- [x] Inventory adjustments are protected server-side with `requireAdmin()`.
- [x] Category, coupon, banner, order status, and inventory writes are validated with Zod.
- [x] Category slugs are sanitized server-side before database writes.
- [x] Coupon codes are normalized server-side before database writes.
- [x] Banner link inputs are restricted to valid absolute URLs or relative paths.
- [x] Inventory writes happen in a Prisma transaction and create audit-friendly `InventoryLog` entries.
- [x] Inventory adjustments that would produce negative stock are rejected.
- [x] Delete flows for categories, coupons, banners, and products require explicit Yes/No confirmation.
- [x] Prisma ORM is used for all new admin writes.
- [x] No raw SQL was added.
- [x] No real secrets were added to committed files.
- [x] Logged-out direct access to `/admin/categories`, `/admin/coupons`, `/admin/banners`, `/admin/orders`, `/admin/inventory`, and `/admin/settings` redirects to `/admin/login`.
- [x] Admin action success redirects now happen outside error handling, preventing false failure messages after successful writes.
- [x] Product validation failures return safe field-level errors without exposing internal details or losing submitted form data.
- [x] Product database constraint errors are mapped to safe admin-facing messages for duplicate slugs and invalid categories.
- [x] Product variant validation maps blank rows and duplicate SKU/barcode failures to safe row-level admin messages.
- [x] Product creation uses Prisma relation `connect` for category/brand instead of trusting client-side relation payload shape.
- [x] Product creation now inserts product and variants inside one Prisma transaction, keeping catalog writes atomic without nested create payload ambiguity.
- [x] Product creation avoids bulk variant writes so each variant create uses the same validated Prisma path as product editing.

Stage 6 remaining security work:

- [ ] Add full order detail page with line-item audit view.
- [ ] Add stricter order status transition rules before production.
- [ ] Add admin audit logs for category, coupon, banner, order status, and inventory actions.
- [ ] Add persistent settings model with Zod-validated writes.
- [x] Add Supabase Storage upload validation for product images.
- [ ] Add Supabase Storage upload validation for banner images.
- [ ] Add CSRF review before production.

Stage 5 security actions completed:

- [x] Product create/update/delete actions are protected server-side with `requireAdmin()`.
- [x] Product list/create/edit routes remain inside the protected admin route group.
- [x] Logged-out direct access to `/admin/products`, `/admin/products/new`, and edit routes redirects to `/admin/login`.
- [x] Product and variant writes are validated with Zod.
- [x] Invalid price input is rejected.
- [x] Negative stock input is rejected.
- [x] Slug input is sanitized server-side before database writes.
- [x] Delete product flow requires explicit `DELETE` confirmation.
- [x] SKU and barcode uniqueness remains enforced by database constraints.
- [x] Prisma ORM is used for product writes.
- [x] No raw SQL was added.
- [x] No real secrets were added to committed files.

Stage 5 remaining security work:

- [ ] Add Supabase Storage upload validation for real product images.
- [ ] Add admin audit logging for product create/update/delete.
- [ ] Add finer-grained user-facing error display for validation fields.
- [ ] Add CSRF review before production.

## Stage 4 Status

The protected admin dashboard shell and section navigation are implemented. Product CRUD, checkout, customer account UI, and production-grade login abuse prevention are not implemented yet.

Stage 4 security actions completed:

- [x] Kept all new admin pages inside the protected admin route group.
- [x] Confirmed logged-out direct access redirects to `/admin/login` for every new admin page.
- [x] Confirmed admin API access without login returns `401`.
- [x] Kept admin dashboard cards read-only.
- [x] Did not add product CRUD or other admin write workflows.
- [x] Used safe generic admin error UI.
- [x] Did not add real secrets or credentials.

Stage 4 direct URL checks:

- [x] `/admin` redirects to `/admin/login`.
- [x] `/admin/dashboard` redirects to `/admin/login`.
- [x] `/admin/products` redirects to `/admin/login`.
- [x] `/admin/categories` redirects to `/admin/login`.
- [x] `/admin/orders` redirects to `/admin/login`.
- [x] `/admin/inventory` redirects to `/admin/login`.
- [x] `/admin/coupons` redirects to `/admin/login`.
- [x] `/admin/banners` redirects to `/admin/login`.
- [x] `/admin/settings` redirects to `/admin/login`.
- [x] `/api/admin/health` returns `401`.

## Stage 3 Status

Authentication and admin protection are implemented at the app layer. Product CRUD, checkout, customer account UI, and production-grade login abuse prevention are not implemented yet.

Stage 3 security actions completed:

- [x] Added server-side login flow for admin access.
- [x] Added scrypt password hashing with per-password random salt.
- [x] Added HTTP-only session cookie.
- [x] Session token stored in the database is SHA-256 hashed, not the raw cookie token.
- [x] Admin route protection is server-side through the protected admin layout.
- [x] `/admin` redirects to `/admin/login` when no valid session exists.
- [x] Authenticated non-admin users are redirected safely to `/admin/access-denied`.
- [x] Added logout that deletes the server-side session and clears the cookie.
- [x] Added protected admin API example that returns `401` without an admin session.
- [x] Added safe admin creation script that requires a strong password and stores only a hash.
- [x] Added safe customer test creation script for role-denial testing.
- [x] Did not add real secrets or credentials.
- [x] Product CRUD remains unimplemented.

Stage 3 remaining security work:

- [ ] Add auth rate limiting before production.
- [ ] Add account lockout or progressive delay for repeated failed login attempts.
- [ ] Add password reset flow.
- [ ] Add CSRF review for future state-changing forms.
- [ ] Add audit logging for admin sign-in and sensitive admin actions.
- [ ] Apply and review a Prisma migration on a real development Supabase database.

Stage 2 security actions completed:

- [x] Added Prisma schema without embedding real database credentials.
- [x] Kept `.env.example` placeholders only.
- [x] Did not create `.env` or `.env.local`.
- [x] Did not run migrations against a real Supabase database.
- [x] Added unique constraints for email, category slugs, brand slugs, product slugs, variant SKUs, variant barcodes, order numbers, coupon codes, and session tokens.
- [x] Added order item price snapshot fields.
- [x] Added inventory logging model for stock adjustments.
- [x] Added product image metadata fields for future type, size, and dimension validation.
- [x] Added customer-owned models for addresses, carts, wishlist, and orders so future queries can be scoped by authenticated user.
- [x] Added RLS policy plan below.

Stage 2 audit note:

- [ ] `npm audit` reports 5 moderate vulnerabilities: the existing PostCSS advisory through `next`, plus an `@hono/node-server` advisory through Prisma dev tooling. The suggested force fixes would downgrade major packages and were not applied.

Stage 1 security actions completed:

- [x] Added `.env.example` with placeholders only.
- [x] Added `.gitignore` rules that exclude `.env` and `.env.*` while allowing `.env.example`.
- [x] Kept Supabase service role key as a server-only placeholder.
- [x] Added an admin placeholder with no admin data or mutation functionality.
- [x] Documented that admin features must not be enabled before server-side authentication and ADMIN role checks.
- [x] Disabled the `X-Powered-By` response header through Next configuration.

## Secrets And Environment

- [x] Keep real secrets out of source control.
- [x] Do not commit `.env.local`.
- [x] Use `.env.example` with placeholder values only.
- [x] Never expose Supabase service role keys to browser code.
- [x] Use separate environment variables for public browser-safe values and server-only secrets.
- [x] Document all required environment variables in `SETUP_GUIDE.md`.

## Authentication

- [x] Use secure server-side authentication.
- [x] Store sessions with secure, HTTP-only cookie behavior where applicable.
- [x] Do not trust client-provided identity, user ID, role, or permissions.
- [x] Add safe logout and session invalidation behavior.
- [ ] Add login abuse prevention notes before production: rate limiting, suspicious login monitoring, strong password policies if email/password auth is used, and bot protection on auth forms.

## Authorization And RBAC

- [x] Define roles as `ADMIN` and `CUSTOMER`.
- [x] Deny admin access by default.
- [x] Protect admin pages server-side.
- [x] Protect admin server actions and API routes server-side.
- [x] Check role from trusted server-side session and database state.
- [x] Do not rely on frontend hiding for authorization.
- [x] Prevent customers from accessing other users' wishlists, addresses, orders, and account details in Stage 12 account surfaces.
- [ ] Keep customer cart ownership checks in scope when logged-in database carts are enabled.

## Data Validation

- [x] Validate product database writes with Zod.
- [x] Validate category, coupon, banner, product image, order status, inventory, checkout, account address, and customer auth writes with Zod.
- [ ] Validate any future settings, review, notification, and payment provider writes with Zod before enabling persistence.
- [ ] Validate route params and search params before use.
- [ ] Use safe error messages that do not leak internal details.
- [x] Normalize product slugs before write.
- [x] Validate numeric bounds for product price and stock.
- [ ] Validate numeric bounds for quantity, discount, and sort order.

## Database And Prisma

- [x] Use Prisma ORM queries where possible.
- [x] Avoid unsafe raw SQL.
- [ ] If raw SQL is absolutely required, use parameterized queries only.
- [x] Add unique constraints for slugs, SKUs, and other identifiers.
- [x] Add ownership constraints in customer account, address, order, and wishlist query filters.
- [x] Use database transactions for checkout and inventory updates.

## Orders, Pricing, Coupons, And Stock

- [x] Cart display does not trust client-side price, stock, discount, delivery fee, or order total.
- [x] Cart quote recalculates product variant price and stock from the database.
- [x] Cart item storage contains product ID, variant ID, and quantity only.
- [x] Cart quote clamps display quantity to available stock.
- [x] Do not trust client-side price, stock, user ID, role, coupon, shipping fee, tax, or order total during checkout.
- [x] Recalculate item prices server-side during checkout.
- [x] Validate product status and stock server-side before creating an order.
- [x] Reserve or decrement stock in a transaction.
- [x] Store order item price, product name, variant name, and SKU snapshots.
- [x] Create inventory logs when checkout reduces stock.
- [ ] Validate coupon redemption eligibility, expiry, usage limits, minimum order amount, and customer restrictions server-side during checkout.
- [ ] Add order abuse prevention before production: checkout rate limits, fraud monitoring hooks, duplicate order detection, and payment provider verification.
- [ ] Add real payment provider verification before enabling online payments.

## Product Images And Storage

- [x] Use Supabase Storage for product images.
- [x] Validate product image type before upload.
- [x] Schema allows only `jpg`, `jpeg`, `png`, and `webp` through `ImageFormat`.
- [x] Enforce uploaded file MIME and extension validation in server code.
- [x] Validate image size before upload.
- [x] Generate safe storage paths server-side.
- [x] Prevent customers from writing product image assets.
- [x] Keep admin upload actions server-protected.
- [x] Demo catalog images use local public PNG assets and do not require or expose Supabase service role keys.
- [ ] Prefer signed or public-read policies based on final catalog requirements.

## Supabase RLS And Storage Policy Notes

- [ ] Enable RLS on tables that may be accessed directly by Supabase clients.
- [ ] Prefer server-side Prisma access for privileged app behavior.
- [ ] Add RLS policies that deny by default.
- [ ] Customer rows must be scoped to `auth.uid()` where direct access exists.
- [ ] Admin policies must check a trusted role source, not client-editable metadata.
- [ ] Storage policies should allow public reads only for approved product image buckets if the catalog requires public images.
- [ ] Storage writes should be restricted to authenticated admins.
- [ ] Service role usage must remain server-only.

### Stage 2 RLS Policy Plan

RLS SQL will be written in a later stage when Supabase auth integration is chosen. Planned policy posture:

- Enable RLS for all customer-owned tables: `Address`, `Cart`, `CartItem`, `Wishlist`, `Order`, and `OrderItem`.
- Customers may select, insert, update, and delete only rows belonging to their authenticated user ID.
- Cart item access must be mediated through ownership of the parent cart.
- Wishlist access must be scoped to the authenticated user.
- Orders and order items should be customer-readable only after ownership is verified through the parent order.
- Product catalog tables such as `Category`, `Brand`, `Product`, `ProductVariant`, `ProductImage`, active `Banner`, and active public-safe `Coupon` can have public read policies if the storefront uses Supabase client reads.
- Product, variant, image, banner, coupon, and inventory writes must be admin-only.
- Admin checks must use a trusted server-side role source, such as a `User.role` lookup controlled by server code, not client-editable metadata.
- Default policy for sensitive tables should be no access until explicit allow policies exist.
- Storage bucket reads may be public for product images only if images are intended for public catalog display.
- Storage writes, updates, and deletes must be admin-only.
- Service role access must remain restricted to server-only execution contexts.

## Admin Surface

- [x] Admin dashboard requires server-side role check before real admin functionality is added.
- [x] Admin section shell pages are protected server-side.
- [x] Public storefront navigation does not expose admin links.
- [x] Public header/footer chrome is hidden on admin routes.
- [x] Product CRUD requires server-side role check and Zod validation.
- [x] Category management requires server-side role check and Zod validation.
- [x] Order management requires server-side role check and validated status inputs.
- [x] Order detail and invoice views require server-side admin protection.
- [x] Order status updates validate allowed status transitions.
- [x] Order cancellation restores stock transactionally and writes inventory logs.
- [x] Inventory updates require server-side role check, validation, and audit-friendly fields.
- [x] Inventory page exposes SKU-level stock with low-stock and out-of-stock filters.
- [x] Coupon management requires server-side role check and validation.
- [x] Banner management requires server-side role check and validation.
- [ ] Settings management requires a persistent settings model, server-side role check, and Zod validation.

## Demo Data

- [x] Demo catalog seed is non-destructive and uses upsert behavior for demo categories, brands, products, variants, and image records.
- [x] Demo products use `demo-` slugs and demo SKUs use `DEMO-` prefixes to avoid overwriting normal admin-created catalog entries.
- [x] Demo seed does not write real secrets, does not expose `.env.local`, and does not use client-side service role access.
- [x] Demo image records point to local `/demo-products/*.png` files for stable public browsing.

## Future Security Reviews

Each implementation stage should update this checklist with completed controls, remaining risks, and any new attack surfaces introduced by that stage.
