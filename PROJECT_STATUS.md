# Project Status

## Current Stage

Stage 16: Trust section ("Why shop with A1 Haat Bazar?") production polish.

Status: Complete.

Date: 2026-07-06

## Completed In Stage 16

- Kept the existing layout: desktop 2x2 grid, mobile stacked, soft sage radial-gradient background, "A local grocery experience built on trust" heading, and the final short copy plus micro-labels (all already matched the approved copy).
- Unified icon badge styling: the featured first card keeps its deep green filled badge; the other three keep the cream fill but now use a green (`fresh`) border instead of gold, so all four badges read as one family. All badges are 48x48 with 20x20 icons at 1.8 stroke, centered via `grid place-items-center`.
- Tightened card spacing: dropped the larger `sm:p-6` desktop padding to a uniform `p-5`, reduced the title-to-description gap to `mt-1.5`, and moved the micro-label to `mt-auto pt-4` inside a flex-column card so labels bottom-align.
- Balanced card heights with `lg:auto-rows-fr` so all four desktop cards are exactly equal (verified 164px each at 1280px wide).
- Refined desktop-only hover (all `md:` prefixed): 2px lift, slightly deeper shadow, subtly stronger border color per variant, icon badge scales to 1.02, 200ms transition, `motion-reduce:transition-none` preserved.
- Trimmed section vertical padding (`py-9 sm:py-11 lg:py-12`, was `py-10 sm:py-12 lg:py-14`) and header-to-grid gap so the following "Visit our store" section sits closer, especially on mobile.
- Accessibility unchanged and intact: icons are `aria-hidden`, text colors and sizes untouched, reduced motion respected.

## Stage 16 Validation

Passed:

```bash
npm run typecheck
npm run lint
npm run build
```

Verified against a local production server (`next start`) via DOM inspection:

- Desktop (1280px): 2-column grid, four equal 164px cards, labels aligned 21px from each card bottom, no horizontal overflow, 0.2s card transition.
- Badges: featured card `rgb(23,74,39)` deep green fill, others cream `rgb(255,249,234)`; all 48x48 with centered 20x20 icons and matching green-tinted borders.
- Mobile (375px): single stacked column, 36px section vertical padding, no transform at rest, no horizontal overflow; hover styles are `md:`-only so mobile is unaffected.
- No browser console errors were captured during verification.

Security checks:

- No new dependencies were installed.
- Changes are limited to Tailwind class strings in the homepage trust section; no data, auth, or write-action behavior was touched.

## Completed In Stage 15

- Diagnosed the "...." artifact on product cards: it was not manual truncation but a mid-string sentence period landing exactly at the CSS `line-clamp-2` cut, rendering as ".…".
- Updated `customerProductSummary` in `src/lib/display.ts` to normalize literal ellipsis characters and dot runs, keep only the first sentence, and strip trailing punctuation, so clamped card descriptions can never show double punctuation.
- Card descriptions continue to truncate purely via `line-clamp-2` (`line-clamp-1` in compact variant) with the browser's natural single ellipsis; no manual slicing or appended dots anywhere in card rendering. This applies to every card surface since they all render through `ProductGrid` → `ProductCard` (homepage featured/best sellers/fresh vegetables, products listing, search, category, offers, related products, wishlist).
- Refined the "View details" link on product cards: plain text at rest, hover shows a thin (`decoration-1`) close (`underline-offset-2`) underline spanning only the text width (`w-fit`), with a subtle color shift to full primary.
- Changed the product detail page meta description truncation to use a single `…` character instead of `...` (SEO metadata only; visible detail-page descriptions remain full and unclamped).
- Added a `start` configuration and `autoPort` to `.claude/launch.json` so a verification server can run alongside the user's dev server on port 3000.

## Stage 15 Validation

Passed:

```bash
npm run typecheck
npm run lint
npm run build
```

Verified against a local production server (`next start`):

- Homepage featured cards: 11 descriptions, zero dot runs, zero trailing periods; the black tea card now reads "Rich black tea leaves for milk tea, masala chiya, and everyday brewing" with no "....".
- `/products`: 18 cards, 12 clamp naturally via CSS with a single ellipsis, zero dot runs or trailing periods.
- "View details" link measures 77px wide (text width, not card width), no decoration at rest, 2px underline offset on hover.
- Product detail page still renders the full two-sentence description unchanged.
- No browser console errors were captured during verification.

Security checks:

- No new dependencies were installed.
- No auth, database, cart, wishlist, variant, filter, search, or Supabase behavior was changed; edits touch display formatting and one CSS class string only.

## Completed In Stage 14

- Added `metadataBase`, default Open Graph, Twitter card, keywords, and locale metadata in the root layout using a new `src/lib/site.ts` site URL helper (`APP_URL` / `NEXT_PUBLIC_SITE_URL` / Vercel URL fallback).
- Set the default title to "A1 Haat Bazar | Authentic Nepali & Asian Groceries in Salisbury Adelaide" with a matching local-intent description.
- Added `src/app/robots.ts` allowing public catalog pages and disallowing `/admin`, `/api`, `/account`, `/cart`, `/checkout`, `/wishlist`, `/login`, `/reset-password`, and `/auth`.
- Added `src/app/sitemap.ts` serving static routes plus live category and active product URLs, with a safe static-only fallback if the database is unavailable.
- Added `GroceryStore` JSON-LD (address, opening hours, area served) on the homepage via a new escaped `JsonLd` component.
- Added `Product` (with `AggregateOffer`) and `BreadcrumbList` JSON-LD plus canonical URLs and Open Graph images to product detail pages.
- Added canonical URLs and Open Graph data to `/products` and `/category/[slug]`.
- Added `noindex` robots metadata to cart, checkout, checkout success, search, login, reset password, wishlist, and account pages.
- Added a branded root `not-found.tsx` (shop/home/search CTAs) and root `error.tsx` (retry + home, logs only the error digest).
- Documented in `.env.example` that `APP_URL` drives canonical URLs, robots, and the sitemap in production.

## Stage 14 Validation

Passed:

```bash
npm run typecheck
npm run lint
npm run build
```

Verified with the local dev server:

- `/robots.txt` serves the expected allow/disallow rules and sitemap link.
- `/sitemap.xml` serves 30 URLs from the live catalog.
- Homepage renders canonical, Open Graph, Twitter, and `GroceryStore` JSON-LD tags.
- A product detail page renders canonical, Open Graph image, `Product` JSON-LD with `AggregateOffer` (AUD low/high price, availability), and `BreadcrumbList` JSON-LD.
- `/cart` renders `noindex` robots metadata.
- An invalid product URL renders the branded 404 page with header and footer.
- No browser console errors were captured during verification.

Security checks:

- No new dependencies were installed.
- JSON-LD output escapes `<` to prevent script breakout from data values.
- No secrets were added; `.env.example` contains placeholders only.
- No auth, database, or write-action behavior was changed.

## Completed In Stage 13

- Reconfirmed `ui-ux-pro-max` guidance for a premium grocery ecommerce UI and kept the existing black, gold, fresh green, and warm neutral system.
- Added global polish primitives for skip links, refined background treatment, contained scrollbars, shimmer skeletons, and reduced-motion compatibility.
- Added a small local toast message component without installing packages.
- Improved public header responsiveness, sticky behavior, keyboard focus, and mobile overflow containment.
- Improved product cards with direct image/title links, clearer secondary "Aisle" action, contained hover treatment, and auto-dismissing cart toast feedback.
- Improved product detail page polish, sticky purchase panel offset, toast feedback, and stale checkout wording.
- Improved cart and checkout loading states, sticky summary offsets, and stale checkout copy.
- Improved account navigation with active states and horizontal mobile behavior.
- Improved account, wishlist, and address pages with clearer labels, focus states, responsive headings, and cleaner address formatting.
- Improved admin shell polish, admin loading skeletons, admin page title scaling, and horizontal table scroll affordance.
- Removed stale shopper-facing stage wording from homepage, cart, and product detail surfaces.

## Stage 13 Validation

Passed:

```bash
npm run typecheck
npm run lint
npm run build
```

Visual QA performed with the local dev server:

- Checked `/`, `/products`, `/products/demo-premium-basmati-rice`, `/cart`, `/checkout`, `/login`, and `/admin/login` at desktop and mobile viewport sizes.
- Confirmed mobile public pages no longer have page-level horizontal overflow at `390px` width.
- Confirmed checked pages had no missing `alt` attributes on rendered images.
- Confirmed checked forms had visible labels.
- Confirmed browser console had no captured client errors during the final screenshot pass.
- Protected admin pages still require a valid admin session; `/admin/login` was visually checked, and protected admin layout polish was verified by code and build because the attempted local admin password was not accepted.

Security checks:

- No new dependencies were installed.
- No database schema, authentication, authorization, or write-action behavior was changed.
- Admin route protection remains server-side.
- Customer-owned account, order, address, and wishlist ownership checks remain unchanged.
- No secrets were added or exposed.

## Completed In Stage 12

- Verified existing protected admin category CRUD with category image/icon URL support.
- Verified existing protected admin coupon CRUD for code, percentage/fixed amount, expiry dates, and active status.
- Verified existing protected admin banner CRUD for homepage hero, home strip, and category placements.
- Added customer login and registration at `/login`.
- Added customer logout action.
- Added `/account` customer dashboard.
- Added `/account/orders` customer order history scoped to the signed-in customer.
- Added `/account/addresses` customer address management with create, update, delete, and default-address behavior.
- Added `/wishlist` customer wishlist page.
- Added protected `/api/wishlist/toggle` endpoint.
- Product detail pages can now save/remove products from the signed-in customer's wishlist.
- Added account and wishlist links to the public navigation.

## Stage 12 Validation

Passed:

```bash
npm run typecheck
npm run lint
npm run build
```

Smoke tested locally:

- `/account` returned `200` with a temporary customer session.
- `/account/orders` returned `200` with a temporary customer session.
- `/account/addresses` returned `200` with a temporary customer session.
- `/wishlist` returned `200` with a temporary customer session.
- `/api/wishlist/toggle` returned `200` and saved a product with a temporary customer session.
- `/account` redirected without a customer session.
- `/admin/categories`, `/admin/coupons`, and `/admin/banners` returned `200` with a temporary admin session.
- Temporary test sessions and wishlist smoke-test record were cleaned up.

Security checks:

- Customer account routes require a server-side session.
- Customer orders are queried by `userId`.
- Customer addresses are queried and mutated by `userId`.
- Wishlist reads and writes are scoped to the signed-in `userId`.
- Admin category, coupon, and banner writes remain protected by `requireAdmin()`.
- Coupon and banner writes continue to use Zod validation.

## Completed In Stage 11

- Improved `/admin/orders` order list with search, status filtering, customer/location context, totals, status labels, and detail/invoice links.
- Added `/admin/orders/[orderId]` protected order detail page.
- Order detail shows customer details, delivery address, ordered product snapshots, SKU, variant, quantity, current stock, and totals.
- Added simple invoice view at `/admin/orders/[orderId]?view=invoice`.
- Added validated admin order status transitions:
  - Pending to Confirmed or Cancelled.
  - Confirmed to Packed or Cancelled.
  - Packed to Out for delivery or Cancelled.
  - Out for delivery to Delivered or Cancelled.
  - Delivered and Cancelled are terminal.
- “Packed” is represented by the existing database `PROCESSING` status to avoid a risky enum migration.
- Cancelling an order restores ordered SKU stock once and writes inventory logs.
- Improved `/admin/inventory` with total SKU, available, low-stock, and out-of-stock summary cards.
- Inventory low-stock filtering now uses each SKU's configured low-stock threshold.
- Inventory table shows SKU-level stock, threshold, product status, variant status, latest log, and adjustment controls.

## Stage 11 Validation

Passed:

```bash
npm run typecheck
npm run lint
npm run build
```

Smoke tested locally:

- `/admin/orders` returned `200` with a temporary admin session.
- `/admin/orders/[orderId]` returned `200` with a temporary admin session.
- `/admin/orders/[orderId]?view=invoice` returned `200` with a temporary admin session.
- `/admin/inventory?stock=low` returned `200` with a temporary admin session.
- The temporary admin session was deleted after testing.
- `/admin/orders` redirected without an admin session.
- `/admin/inventory` redirected without an admin session.
- Verified the latest order has order items, address data, and customer data.
- Verified inventory metrics can count total, low-stock, and out-of-stock SKUs.

Security checks:

- Order list, order detail, invoice view, and inventory remain behind the protected admin layout.
- Order status writes still call `requireAdmin()`.
- Inventory adjustment writes still call `requireAdmin()`.
- Order status input is validated with Zod.
- Status transitions are checked against the current database order status.
- Cancellation stock restoration is transactional and logged.
- Inventory adjustments validate quantity, reason, and negative-stock prevention.

## Completed In Stage 10

- Added `/checkout` checkout page.
- Added customer details form with name, email, and phone.
- Added delivery address form with address lines, suburb/city, state, postcode, country, and delivery notes.
- Added checkout order summary that refreshes cart items through the server quote API.
- Added payment method section with Cash on Delivery enabled.
- Added online payment as a disabled future placeholder only.
- Added server action for order creation.
- Server action validates customer, address, payment method, and cart input with Zod.
- Server action creates or reuses a CUSTOMER user by email for guest checkout.
- Server action creates a shipping address row for the order.
- Server action recalculates item prices from active database variants.
- Server action validates product and variant status.
- Server action rejects checkout when requested quantity exceeds stock.
- Server action creates order items with product name, variant name, SKU, quantity, unit price, sale price, and line total snapshots.
- Server action generates order numbers in `GSP-YYYYMMDD-XXXXXX` format.
- Server action atomically decrements stock with `updateMany` stock guards.
- Server action writes inventory logs with `SALE` and `ORDER_CREATED`.
- Added `/checkout/success` order success page.
- Success page clears the local guest cart after successful order redirect.

## Stage 10 Validation

Passed:

```bash
npm run typecheck
npm run lint
npm run build
```

Smoke tested locally:

- `/checkout` returned `200`.
- `/checkout/success?order=GSP-20260627-460034` returned `200`.
- `/cart` returned `200`.
- A real Cash on Delivery smoke order was created: `GSP-20260627-460034`.
- Smoke order created one order item and reduced stock from 180 to 179.
- Over-stock checkout was rejected with no order created and no stock change.

Security checks:

- Checkout does not trust client-side price, subtotal, discount, delivery fee, or total.
- Checkout recalculates prices from database variants server-side.
- Checkout validates stock server-side before creating an order.
- Stock decrement is guarded in the database transaction.
- Checkout validates customer and address input with Zod.
- Checkout only accepts Cash on Delivery for this stage.
- Online payment is a disabled placeholder only; no fake real payment processing was implemented.

## Completed In Stage 9

- Added `/cart` cart page with empty, loading, item list, and order summary states.
- Added guest cart storage using local storage for `productId`, `variantId`, and quantity only.
- Added storefront header cart link with live item count.
- Product detail pages now add the selected variant/SKU and requested quantity to the cart.
- Product cards now add directly only when a product has one in-stock SKU.
- Product cards with multiple SKUs send shoppers to the product detail selector with `Choose option`.
- Added quantity controls, remove item, and clear cart actions.
- Added `/api/cart/quote` to recalculate cart display data from the database.
- Cart quote includes current product/variant names, image, SKU, stock, unit price, line totals, subtotal, discount placeholder, delivery fee placeholder, and estimated total.
- Quantity is clamped to available stock in the cart quote.
- Checkout remains intentionally disabled because checkout is a later stage.

## Stage 9 Validation

Passed:

```bash
npm run typecheck
npm run lint
npm run build
```

Smoke tested locally:

- `/cart` returned `200`.
- `/products/demo-premium-basmati-rice` returned `200`.
- `/api/cart/quote` returned a server-derived cart quote for a real demo SKU.
- `/api/cart/quote` clamped a requested quantity of 99 to available stock.
- `/api/cart/quote` returned `400` for invalid quantity data.

Security checks:

- Cart local storage stores only product ID, variant ID, and quantity.
- Cart display prices and stock are recalculated from the database through `/api/cart/quote`.
- Invalid cart payloads are rejected with a safe error.
- Client-provided cart price, subtotal, discount, delivery fee, and total are not accepted.
- Checkout remains unimplemented; future checkout must recalculate price, stock, coupon, delivery fee, and final total server-side inside order creation.

## Completed In Stage 8

- Added public `/products/[slug]` product detail route.
- Added safe public product slug lookup that sanitizes slugs and only returns `ACTIVE` products with active variants.
- Added product detail metadata for product pages.
- Added product image gallery with thumbnails and selected image state.
- Added product title, description, category, brand, tags, and product facts.
- Added client-side variant/SKU selector for different sizes and packs.
- Variant selection updates displayed image, SKU, price, sale price, stock status, and add-to-cart state.
- Add-to-cart button is disabled for out-of-stock selected variants.
- Add-to-cart remains a placeholder because cart persistence is not part of Stage 8.
- Added wishlist placeholder button.
- Added related products from the same category.
- Updated product cards to link to `/products/[slug]`.
- Added loading skeleton for product detail pages.

## Demo Catalog Data

Added after Stage 8 for browser testing and storefront polish:

- Created local demo product PNG assets in `public/demo-products`.
- Added non-destructive `npm run demo:seed` command.
- Upserted 10 demo categories, 4 demo brands, 14 demo products, 35 demo SKUs/variants, and 14 product image records.
- Demo product slugs use the `demo-` prefix and demo SKUs use the `DEMO-` prefix.
- The demo seed can be rerun without deleting admin users, customer users, orders, or user-uploaded product images.

## Public Navigation Cleanup

- Removed the public `Admin` link from the storefront header.
- Added a route-aware site shell so public header/footer chrome does not render on `/admin` pages.
- Direct admin URLs remain protected server-side and continue to redirect unauthenticated visitors to `/admin/login`.

## Stage 8 Validation

Passed:

```bash
npm run typecheck
npm run lint
npm run build
npm run demo:seed
```

Smoke tested locally:

- `/products/rice-and-lentils` returned `200`.
- `/products/not-a-real-product` rendered the not-found path.
- Demo catalog verification returned 10 categories, 4 brands, 14 products, 35 variants, and 14 images.
- `/` no longer includes public admin links.
- `/admin` redirects to `/admin/login` for unauthenticated requests.
- `/admin/login` no longer renders public product navigation.

Security checks:

- Product slug lookup is sanitized before database access.
- Product detail pages expose only public catalog fields.
- Product detail pages filter to `ACTIVE` products and active variants.
- Displayed price and stock are public display values only.
- Cart and checkout remain unimplemented; future cart/checkout must recalculate selected variant price and stock server-side.

## Completed In Stage 7

- Replaced the placeholder homepage with a modern grocery storefront.
- Added a search-focused hero section with category shortcuts and product imagery.
- Added homepage sections for featured categories, featured products, best sellers, weekly offers, benefits, and a newsletter visual placeholder.
- Added public `/products` page with server-rendered product browsing.
- Added public `/category/[slug]` page for category browsing.
- Added public `/search` page.
- Added public filters for category, brand, price range, in-stock availability, and sale items.
- Added sorting for newest, price low-high, price high-low, popular, and discount.
- Added responsive product cards with image, name, description, category, badges, stock status, variant count, starting price, and compare-at sale price.
- Updated public header and footer for storefront browsing.
- Added loading skeletons for `/products`, `/search`, and `/category/[slug]`.
- Kept product detail pages, cart, wishlist, newsletter submission, and checkout out of scope.

## Stage 7 Validation

Passed:

```bash
npm run typecheck
npm run lint
npm run build
```

Smoke tested locally:

- `/` returned `200`.
- `/products` returned `200`.
- `/search?q=rice` returned `200`.
- `/category/rice` returned `200`.

Security checks:

- Public pages query only server-side Prisma data.
- Public pages filter products to `ACTIVE` products with active variants.
- Public pages do not expose admin routes, admin forms, user data, or server-only Supabase service keys.

## Completed In Stage 6

- Added Supabase Storage product image upload through protected server actions.
- Raised the Next.js Server Actions body limit to support admin image uploads above the framework's 1MB default while keeping each image capped at 5MB.
- Fixed product image upload, replacement, and removal actions so successful Next.js redirects are not caught and shown as `NEXT_REDIRECT` errors.
- Admins can upload or replace the product main image from the product edit page.
- Admins can now remove the product main image from the product edit page.
- Admins can upload multiple gallery images from the product edit page.
- Admins can replace individual gallery images.
- Admins can remove product images with Yes/No confirmation.
- Admins can upload, replace, and remove SKU-specific variant images from the product edit media section.
- Variant image uploads update `ProductVariant.imageUrl` and create product image metadata tied to the variant ID.
- Removing a variant from the product form also removes variant-linked image metadata and attempts storage cleanup.
- Added server-side image validation for MIME type, file extension, and file size.
- Allowed image types are `jpg`, `jpeg`, `png`, and `webp`.
- Product image metadata is stored in `ProductImage` with public URL, storage path, alt text, format, size, sort order, and primary flag.
- Added `docs/STORAGE_SETUP.md` with bucket setup and policy notes.
- Kept storefront product gallery display and customer-facing catalog pages out of scope.

## Stage 6 Image Upload Validation

Passed:

```bash
npm run prisma:validate
npm run prisma:generate
npm run typecheck
npm run lint
npm run build
```

Latest fix validation:

```bash
npm run typecheck
npm run lint
npm run build
```

## Previous Admin Management Stage

- Added shared admin action message component for success/error states.
- Fixed admin server action success redirects so completed writes no longer appear as false `error=failed` messages.
- Admin success/error messages now clear themselves and remove `error`/`success` query params after 3 seconds.
- Replaced typed `DELETE` admin deletion flows with Yes/No confirmation controls.
- Improved product create/edit validation so invalid submissions keep entered values, highlight invalid fields, and show specific inline error messages.
- Fixed product variant validation behavior so variant/SKU rows also keep submitted values after a failed product save.
- Improved product database error mapping so duplicate slugs and invalid/missing categories show field-level messages instead of a generic save error.
- Product form top error banners now dismiss after 3 seconds while inline field errors remain visible for correction.
- Improved product variant validation so blank variant rows and duplicate SKU/barcode errors highlight variant fields instead of only showing a generic save error.
- Fixed product creation to use Prisma relation `connect` for category/brand while creating nested variants, avoiding runtime create failures from mixed relation payloads.
- Updated product creation again to avoid nested create payload validation entirely: product and variants are now inserted separately inside one Prisma transaction.
- Product variant creation now uses individual Prisma `create` calls inside the transaction, matching the edit flow and avoiding `createMany` validation differences.
- Added development-only product form error details for unresolved Prisma validation failures.
- Added Zod validation schemas for:
  - Categories
  - Coupons
  - Banners
  - Order status updates
  - Inventory adjustments
- Built protected category CRUD at `/admin/categories`.
- Category creation now unblocks `/admin/products/new`.
- Added category parent selection, featured flag, sort order, description, and image URL fields.
- Added protected coupon CRUD at `/admin/coupons`.
- Added coupon validation for code, type, value, minimum subtotal, max discount, usage limit, date windows, and active state.
- Added protected banner CRUD at `/admin/banners`.
- Added banner validation for placement, URLs, schedule dates, sort order, and active state.
- Added protected order management at `/admin/orders`.
- Orders can be searched and filtered, and admins can update fulfillment and payment status.
- Added protected inventory adjustments at `/admin/inventory`.
- Inventory adjustments update variant stock and write `InventoryLog` records.
- Prevented inventory adjustments that would make stock negative.
- Replaced the settings placeholder with a protected planning page that does not pretend to save data without a settings model.
- Kept checkout, customer order creation, Supabase Storage uploads, and persistent settings writes out of scope.

## Stage 6 Validation

Passed:

```bash
npm run prisma:validate
npm run prisma:generate
npm run typecheck
npm run lint
npm run build
```

Security checks:

- Logged-out `/admin/categories` redirects to `/admin/login`.
- Logged-out `/admin/coupons` redirects to `/admin/login`.
- Logged-out `/admin/banners` redirects to `/admin/login`.
- Logged-out `/admin/orders` redirects to `/admin/login`.
- Logged-out `/admin/inventory` redirects to `/admin/login`.
- Logged-out `/admin/settings` redirects to `/admin/login`.

## Completed In Stage 5

- Installed `zod` for server-side form validation.
- Added product merchandising and SEO fields to Prisma:
  - `tags`
  - `seoTitle`
  - `seoDescription`
  - `isBestSeller`
  - `isWeeklyOffer`
- Applied migration `20260627004219_add_product_admin_fields`.
- Built admin product list with search and filters for status/category.
- Built protected create product page at `/admin/products/new`.
- Built protected edit product page at `/admin/products/[productId]/edit`.
- Added delete product flow with `DELETE` text confirmation.
- Added variant/SKU management:
  - SKU code
  - Size/pack label
  - Price
  - Sale price
  - Stock
  - Barcode
  - Availability
  - Variant image URL
- Admins can add, edit, and remove multiple variants on the product form.
- Added Zod validation for products and variants.
- Added slug sanitization in client form and server validation.
- Added browser-level numeric hints for price, sale price, and stock inputs while keeping server validation authoritative.
- Protected all create/update/delete actions with server-side `requireAdmin()`.
- Kept storefront product pages, product image upload, cart, checkout, and customer-facing catalog out of scope.

## Stage 5 Validation

Passed:

```bash
npm run prisma:generate
npm run typecheck
npm run lint
npm run build
```

Security/validation checks:

- Logged-out `/admin/products` redirects to `/admin/login`.
- Logged-out `/admin/products/new` redirects to `/admin/login`.
- Logged-out `/admin/products/not-real/edit` redirects to `/admin/login`.
- Zod rejects invalid price input.
- Zod rejects negative stock input.
- Slug input is sanitized.

## Completed In Stage 4

- Built a modern protected admin shell with:
  - Desktop sidebar navigation.
  - Sticky topbar.
  - Mobile horizontal admin navigation.
  - Signed-in admin identity summary.
  - Storefront link and logout action.
- Added protected admin pages:
  - `/admin/dashboard`
  - `/admin/products`
  - `/admin/categories`
  - `/admin/orders`
  - `/admin/inventory`
  - `/admin/coupons`
  - `/admin/banners`
  - `/admin/settings`
- Updated `/admin` to redirect to `/admin/dashboard`.
- Added dashboard cards for:
  - Total products.
  - Total orders.
  - Low stock.
  - Out of stock.
  - Total sales placeholder.
- Added admin loading, empty, and safe error states.
- Kept all admin pages inside the protected route group.
- Kept product CRUD, category CRUD, order management, inventory writes, coupon writes, banner writes, and settings writes out of scope.

## Stage 4 Validation

Passed with a placeholder `DATABASE_URL`:

```bash
npm run prisma:validate
npm run prisma:generate
npm run typecheck
npm run lint
npm run build
```

Logged-out direct access check:

- `/admin` redirects to `/admin/login`.
- `/admin/dashboard` redirects to `/admin/login`.
- `/admin/products` redirects to `/admin/login`.
- `/admin/categories` redirects to `/admin/login`.
- `/admin/orders` redirects to `/admin/login`.
- `/admin/inventory` redirects to `/admin/login`.
- `/admin/coupons` redirects to `/admin/login`.
- `/admin/banners` redirects to `/admin/login`.
- `/admin/settings` redirects to `/admin/login`.
- `/api/admin/health` returns `401`.

## Completed In Stage 3

- Added server-side email/password admin login at `/admin/login`.
- Added secure password hashing using Node `crypto.scrypt`.
- Added HTTP-only session cookies backed by the Prisma `Session` table.
- Added `User.passwordHash` to the Prisma schema.
- Added server-side ADMIN role enforcement for `/admin`.
- Restructured admin routing so `/admin/login` remains public and `/admin` is protected.
- Added safe access denied page for authenticated non-admin users.
- Added logout server action.
- Added protected admin API example at `/api/admin/health`.
- Added reusable admin API guard in `src/lib/admin-guard.ts`.
- Added safe initial admin creation script: `npm run admin:create`.
- Added safe test customer creation script: `npm run customer:create-test`.
- Added `docs/AUTH_SETUP.md`.
- Kept product CRUD, product admin, cart, checkout, and customer account UI out of scope.

## Stage 3 Validation

Passed with a placeholder `DATABASE_URL`:

```bash
npm run typecheck
npm run lint
npm run build
```

Also passed:

```bash
npm run prisma:validate
npm run prisma:generate
```

Important: Real login testing requires a migrated development PostgreSQL database because Stage 3 uses Prisma-backed users and sessions.

## Completed In Stage 2

- Installed approved Prisma packages:
  - `@prisma/client`
  - `prisma`
  - `tsx`
- Added Prisma 7 configuration in `prisma.config.ts`.
- Added PostgreSQL Prisma schema in `prisma/schema.prisma`.
- Added schema models for:
  - `User`
  - `Account`
  - `Session`
  - `Category`
  - `Brand`
  - `Product`
  - `ProductVariant`
  - `ProductImage`
  - `Address`
  - `Cart`
  - `CartItem`
  - `Wishlist`
  - `Order`
  - `OrderItem`
  - `Coupon`
  - `Banner`
  - `InventoryLog`
- Product variants support size, pack size, price, sale price, stock, SKU, barcode, and optional image URL.
- Added seed data for rice, lentils, spices, noodles, tea, snacks, oil, frozen items, and vegetables.
- Added variants such as `1kg`, `5kg`, `10kg`, `1L`, `2L`, `5L`, single pack, `5 pack`, and `30 pack`.
- Added `docs/DATABASE_SETUP.md` with Supabase `DATABASE_URL` setup notes.
- Added Prisma scripts:
  - `prisma:validate`
  - `prisma:generate`
  - `db:seed`
- Kept UI CRUD, auth, cart, checkout, and real database migration out of scope.

## Stage 2 Validation

Passed:

```bash
npm run prisma:validate
npm run prisma:generate
npm run typecheck
npm run lint
npm run build
```

Prisma commands were run with temporary placeholder environment variables only.

Audit note:

```bash
npm audit
```

now reports 5 moderate vulnerabilities:

- PostCSS advisory through `next`.
- `@hono/node-server` advisory through Prisma dev tooling.

The suggested `npm audit fix --force` path would downgrade major packages, so it was not applied.

## Completed In Stage 1

- Installed the approved Next.js foundation packages with npm.
- Created a Next.js App Router project structure under `src/app`.
- Added TypeScript configuration.
- Added Tailwind CSS v4 configuration through PostCSS and global design tokens.
- Added ESLint configuration for Next.js and TypeScript.
- Created the requested folder structure:
  - `src/app`
  - `src/components`
  - `src/components/ui`
  - `src/components/layout`
  - `src/components/product`
  - `src/components/admin`
  - `src/lib`
  - `src/types`
  - `src/hooks`
  - `src/services`
  - `src/store`
  - `prisma`
  - `docs`
- Created a public layout with header and footer.
- Created a homepage placeholder.
- Created an admin layout and admin page placeholder with no admin functionality.
- Added `.env.example` with placeholders only.
- Added `.gitignore` rules to exclude real environment files and build output.
- Kept database, auth, products, cart, and checkout out of scope.

## Stage 1 Validation

Passed:

```bash
npm run build
npm run typecheck
npm run lint
```

Audit note:

```bash
npm audit
```

reports 2 moderate vulnerabilities related to a PostCSS advisory through `next`. The suggested `npm audit fix --force` would install a breaking old Next version, so it was not applied.

## Completed In Stage 0

- Verified that `ui-ux-pro-max` is present in this project at `.codex/skills/ui-ux-pro-max`.
- Loaded and followed the skill workflow.
- Confirmed that no Next.js project exists yet in this folder.
- Used the skill's design search through the bundled Codex Python runtime.
- Created the core project documentation files.
- Defined the initial premium grocery ecommerce design system.
- Defined page-level UI direction for storefront, account, checkout, and admin flows.
- Added security planning notes for auth, RBAC, database access, storage, order integrity, and abuse prevention.

## Build And Checks

Stage 5 checks passed. Future stages must continue to run `npm run build`, and should also run `npm run typecheck`, `npm run lint`, and relevant Prisma validation when schema changes.

## Current Files

- `README.md`
- `PROJECT_STATUS.md`
- `SECURITY_CHECKLIST.md`
- `DESIGN_SYSTEM.md`
- `UI_PAGE_GUIDE.md`
- `SETUP_GUIDE.md`
- `DEPLOYMENT_GUIDE.md`
- `.env.example`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `tsconfig.json`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/globals.css`
- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`
- `prisma.config.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `docs/DATABASE_SETUP.md`
- `docs/AUTH_SETUP.md`
- `src/lib/auth.ts`
- `src/lib/password.ts`
- `src/lib/prisma.ts`
- `src/lib/admin-guard.ts`
- `src/app/admin/login/page.tsx`
- `src/app/admin/login/actions.ts`
- `src/app/admin/access-denied/page.tsx`
- `src/app/admin/(protected)/layout.tsx`
- `src/app/admin/(protected)/page.tsx`
- `src/app/api/admin/health/route.ts`
- `scripts/create-admin.ts`
- `scripts/create-test-customer.ts`
- `src/components/admin/admin-shell.tsx`
- `src/components/admin/admin-navigation.ts`
- `src/components/admin/admin-nav-link.tsx`
- `src/components/admin/admin-page-header.tsx`
- `src/components/admin/admin-section-placeholder.tsx`
- `src/components/admin/admin-states.tsx`
- `src/app/admin/(protected)/loading.tsx`
- `src/app/admin/(protected)/error.tsx`
- `src/app/admin/(protected)/dashboard/page.tsx`
- `src/app/admin/(protected)/products/page.tsx`
- `src/app/admin/(protected)/categories/page.tsx`
- `src/app/admin/(protected)/orders/page.tsx`
- `src/app/admin/(protected)/inventory/page.tsx`
- `src/app/admin/(protected)/coupons/page.tsx`
- `src/app/admin/(protected)/banners/page.tsx`
- `src/app/admin/(protected)/settings/page.tsx`
- `src/app/admin/(protected)/products/actions.ts`
- `src/app/admin/(protected)/products/new/page.tsx`
- `src/app/admin/(protected)/products/[productId]/edit/page.tsx`
- `src/components/admin/product-form.tsx`
- `src/components/admin/product-status-message.tsx`
- `src/lib/slug.ts`
- `src/lib/validation/product.ts`
- `prisma/migrations/20260627004219_add_product_admin_fields/migration.sql`

## Next Stage

Stage 9 should be defined by the user. Cart persistence, wishlist persistence, customer auth pages, and checkout have not been started.

Before installing any additional package, the exact command must be shown, the reason must be explained, and user approval must be received.
