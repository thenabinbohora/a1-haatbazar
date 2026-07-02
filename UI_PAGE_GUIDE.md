# UI Page Guide

Page-level UX direction for Grocery Store Pro, created during Stage 0 using `ui-ux-pro-max` design guidance.

## Global Storefront

Stage 7 implementation note:

- The public homepage is now a real storefront surface with hero search, category shortcuts, product rails, benefits, and a newsletter visual placeholder.
- Public navigation now links to home, products, search, wishlist, account, and cart. Admin links stay out of the public storefront navigation.
- Public search forms route to `/search`.
- Product detail, cart, wishlist, customer account, and checkout flows now exist as staged shopping surfaces.

Stage 1 implementation note:

- The public layout now includes a simple accessible header and footer.

Primary navigation:

- Logo and store name.
- Search.
- Category menu.
- Delivery/location indicator when available.
- Account.
- Wishlist.
- Cart with item count.

Mobile navigation:

- Sticky top search area.
- Bottom navigation for Home, Categories, Search, Account, Cart.
- Use a Sheet for category navigation and filters.

Global states:

- Loading: skeletons for product cards, category rows, order cards, and admin tables.
- Empty: short message, useful action, and no blank white screens.
- Error: safe message, retry action, and support path when relevant.
- Offline or network issue: keep cart UI stable and show retry.

Stage 13 polish note:

- The public shell now includes a keyboard skip link, sticky responsive header, contained mobile navigation, refined focus states, and no page-level horizontal overflow in checked mobile routes.
- Loading states use a shared shimmer treatment that respects reduced motion.
- Cart and product feedback uses small auto-dismissing toast messages without adding a dependency.

## Homepage

Stage 7 implementation note:

- `/` now uses live public catalog data from Prisma.
- Homepage includes a search-focused hero, category shortcuts, product imagery, delivery/trust strip, featured categories, featured products, best sellers, weekly offers, benefits, and a newsletter placeholder.
- Newsletter submission is intentionally disabled until a later stage adds validated writes.
- Homepage product cards are browse-only and do not add to cart.
- Public header must not expose admin links; admin routes use their own protected shell.

Goal: Help shoppers begin buying quickly while communicating trust and specialty range.

Structure:

1. Search-focused hero with direct category shortcuts.
2. Delivery promise strip with availability, pickup, or shipping notes.
3. Popular categories such as Rice and Grains, Lentils and Beans, Spices and Masalas, Snacks, Frozen, Fresh Produce, Drinks, Household, Festival.
4. Featured product rails: Best Sellers, Fresh This Week, Nepali Pantry, Indian Essentials, Asian Noodles and Sauces.
5. Promotional banners for seasonal campaigns.
6. Trust section: secure checkout, freshness, local availability, easy support.
7. Footer with store, policies, contact, and account links.

Design notes:

- Homepage should start as a shopping surface, not a marketing splash page.
- Hero headline can be concise, but search and category actions should dominate.
- Use real product imagery when available.
- Keep at least a hint of product/category content visible below the first viewport.
- Stage 13 removes stale stage copy and keeps promotional/newsletter messaging honest when persistence is not implemented.

## Product Listing

Stage 7 implementation note:

- `/products` now supports public product browsing.
- Filters are URL-based and server-rendered.
- Filters include category, brand, price range, in-stock availability, and sale items.
- Sorting includes newest, price low-high, price high-low, popular, and discount.
- `/category/[slug]` reuses the listing layout with the category locked.
- `/search` reuses the listing layout and requires a search query before showing results.
- Product cards show image, category, name, description, badges, stock status, variant count, starting price, and compare-at sale pricing.
- Product detail pages are implemented and product cards route to the variant-aware detail view when shoppers need to choose an option.

Goal: Fast filtering, scanning, and adding to cart.

Required UI:

- Search results title and count.
- Sort control.
- Category breadcrumbs.
- Filter sheet on mobile.
- Sidebar filters on desktop.
- Product grid with stable card dimensions.
- Empty state for no matching products.
- Loading skeleton for grid.

Filters:

- Category.
- Cuisine or region where useful: Nepali, Indian, Asian, General.
- Dietary tags: vegetarian, vegan, gluten-free where available.
- Brand.
- Price range.
- In stock.
- Sale.

Product card:

- Image.
- Name.
- Unit or size.
- Price.
- Sale price and original price when applicable.
- Stock badge.
- Stage 9: show a direct Add to cart button only when there is one in-stock sellable SKU.
- Stage 9: show Choose option for products with multiple SKUs, then route to product detail so shoppers choose size/pack before adding.
- Wishlist icon button with accessible label.
- Stage 13 product cards make the image and title direct product links, use "Aisle" as the secondary category action, and reserve direct add-to-cart for one-SKU in-stock products.

Responsive:

- 2 columns on small mobile where readable, otherwise 1 for narrow cards.
- 3 columns on tablet.
- 4 to 5 columns on desktop depending on container width.

## Product Detail

Stage 8 implementation note:

- `/products/[slug]` now exists for active public products.
- Product detail pages show gallery, title, category, brand, description, product facts, tags, related products, and a purchase panel.
- Variant/SKU selection updates the displayed SKU, size/pack label, image, price, sale price, stock state, and add-to-cart button state.
- Stage 9 connects add-to-cart to the guest cart for the selected variant and quantity.
- Add-to-cart is disabled when the selected variant is out of stock.
- Stage 12 connects the wishlist action to signed-in customer wishlist persistence.
- Client-selected price and stock are display-only; cart and checkout verify them server-side.

Goal: Build confidence and make purchase easy.

Required UI:

- Image gallery with accessible thumbnails.
- Product name.
- Brand.
- Unit or size.
- Price and sale information.
- Stock and delivery availability.
- Quantity selector.
- Add to cart button.
- Wishlist action.
- Product description.
- Ingredients, storage, origin, and allergen notes where available.
- Related products.

Design notes:

- Keep purchase panel visible high on the page.
- Use warning style for low-stock.
- Out-of-stock state should explain whether wishlist or notify-me is available.
- Stage 13 keeps sticky purchase controls below the sticky header and uses toast feedback for cart/wishlist actions.

## Cart

Stage 9 implementation note:

- `/cart` now supports a guest local-storage cart.
- Cart storage contains product ID, variant ID, and quantity only.
- Product detail pages add the selected SKU and quantity to cart.
- Product cards add directly only for one-SKU in-stock products; multi-SKU products use Choose option.
- Cart display refreshes product details, price, and stock through a server API before showing totals.
- Checkout CTA routes to the server-validated checkout flow.

Goal: Let shoppers review and adjust without friction.

Required UI:

- Cart item list with image, name, unit, price, quantity, subtotal, remove.
- Server-derived pricing display.
- Stock warnings and unavailable item warnings.
- Order summary.
- Coupon entry.
- Delivery or pickup estimate placeholder.
- Checkout CTA.
- Empty cart state with return-to-shopping action.
- Stage 13 cart loading states use shimmer skeletons and the desktop order summary respects the sticky header offset.

Security note:

- Cart display can be client-friendly, but checkout must recalculate prices and stock server-side.

## Checkout

Stage 10 implementation note:

- `/checkout` now supports guest checkout for the local-storage cart.
- Checkout collects customer details and delivery address.
- Cash on Delivery is the only active payment method.
- Online payment is shown as a disabled future placeholder only.
- Order summary refreshes cart details from server-derived pricing.
- `/checkout/success` confirms the order number, payment method, item count, and estimated total.
- Success page clears the local cart after order creation.

Goal: Secure, clear, and low-friction completion.

Steps:

1. Contact and auth state.
2. Delivery or pickup details.
3. Address selection or entry.
4. Payment placeholder or provider integration later.
5. Review order.
6. Confirmation.

Required UI:

- Clear step indicator.
- Visible labels on all fields.
- Inline validation on blur.
- Server-side error summary when submission fails.
- Order summary that stays accessible on desktop and collapses on mobile.
- Safe loading state during order creation.
- Stage 13 checkout loading and summary panels match the cart visual language and preserve server-side trust copy.

Security note:

- Stage 10 recalculates prices and validates stock server-side before order creation.
- Do not trust client totals. Future stages must also validate coupons, delivery fees, tax, payment provider status, user identity, and address ownership before final order creation.

## Auth Pages

Stage 3 implementation note:

- `/admin/login` now exists as a focused admin login page.
- It uses visible labels, safe inline error messaging, and clear return navigation.
- Stage 12 adds customer-facing `/login` sign-in and registration while keeping `/admin/login` separate.

Stage 12 implementation note:

- `/login` supports customer sign-in and registration with visible labels, short safe messages, and no admin login leakage.
- Customer sessions route shoppers toward `/account`, while admin authentication remains on `/admin/login`.
- Public auth copy should stay practical and trust-building, not marketing-heavy.

Pages:

- Login.
- Register.
- Forgot password if supported by chosen auth provider.
- Auth callback or verification states.

Design notes:

- Use a focused single-column layout.
- Include visible labels, password visibility toggle, and clear error states.
- Avoid exposing whether a specific email exists when that would create account enumeration risk.
- Provide safe success messages.

## Customer Account

Stage 12 implementation note:

- `/account` provides a customer dashboard with recent orders, saved addresses, wishlist count, and logout.
- `/account/orders` shows order history scoped to the signed-in customer's `userId`.
- `/account/addresses` supports create, update, delete, and default shipping address management with server validation.
- `/wishlist` shows saved products and empty states that route back to browsing.
- Product detail wishlist actions now save or remove products for signed-in customers.

Sections:

- Profile.
- Orders.
- Order detail.
- Addresses.
- Wishlist.
- Account security.

Design notes:

- Use tabs or side navigation depending on viewport.
- Mobile should use stacked cards for orders.
- Desktop can use tables or structured lists.
- Empty states should invite useful action such as "Browse products" or "Add address".
- Keep account actions compact and utility-first. These pages should feel like service tools, not landing pages.
- Stage 13 account navigation uses active states and mobile-contained horizontal tabs.
- Stage 13 address forms use human-readable labels, autocomplete hints, visible focus states, and cleaner address formatting.

Security note:

- Every query must scope records to the authenticated customer server-side.
- Wishlist, address, and order history reads/writes must always filter by signed-in `userId`.

## Admin Dashboard

Stage 4 implementation note:

- `/admin` is protected server-side and requires an authenticated `ADMIN`.
- The admin shell now includes desktop sidebar navigation, a sticky topbar, mobile horizontal navigation, logout, and a storefront link.
- `/admin` redirects to `/admin/dashboard`.
- `/admin/dashboard` includes read-only metric cards for products, orders, low stock, out of stock, and a sales placeholder.
- `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/inventory`, `/admin/coupons`, `/admin/banners`, and `/admin/settings` exist as protected placeholder pages with empty states.
- Loading and safe error states exist for the protected admin group.
- Product CRUD, category management, order management, inventory, coupons, banners, and settings are not implemented yet.

Goal: Operational clarity for a store owner or manager.

Layout:

- Left sidebar on desktop.
- Top bar with search, account menu, and environment/status indicators.
- Collapsible or sheet navigation on mobile.
- Main dashboard cards and tables.

Dashboard widgets:

- Today's orders.
- Revenue summary.
- Low stock items.
- Pending fulfillment.
- Recent orders.
- Top products.
- Coupon usage.

Design notes:

- Admin UI should be quiet, dense, and task-focused.
- Avoid oversized marketing cards.
- Use compact stat cards, clear tables, and direct actions.
- Tables must not overflow mobile. Use horizontal scroll or card layout.
- Stage 13 admin shell uses refined sticky chrome, smaller responsive page titles, shared shimmer loading, and visible horizontal table scrollbars.

Security note:

- Admin page rendering must be blocked server-side for non-admin users.

## Admin Product CRUD

Stage 5 implementation note:

- `/admin/products` now provides protected product search/filter and a product table.
- `/admin/products/new` provides a protected create form.
- `/admin/products/[productId]/edit` provides a protected edit form and delete confirmation.
- Product forms support multiple variant/SKU rows with price, sale price, stock, barcode, availability, and variant image URL.
- Forms use visible labels, stable card sections, clear empty states, and server-side validation.
- Price, sale price, and stock controls include browser-level numeric hints, but server-side Zod validation remains the authority.
- Product validation failures keep entered values in place, mark invalid fields with red borders, and show specific field-level messages.
- Variant/SKU rows also preserve submitted values after validation errors and keep row-level error highlighting.
- Product form top error summaries dismiss after 3 seconds, while field-level messages remain until the next correction attempt.
- Blank variant rows and duplicate SKU/barcode failures must show row-level field errors so admins know exactly what blocked product creation.
- Supabase Storage product media management is implemented on the product edit page.
- Admins can upload, replace, and remove the main listing image.
- Admins can upload multiple gallery images, replace gallery images, and remove gallery images.
- Admins can upload, replace, and remove SKU-specific variant images from the same media section.
- Variant image uploads update the variant image URL automatically so future storefront SKU selection can swap imagery.
- Image upload UI validates safe formats and file size server-side and shows safe admin-facing errors.
- Variant image URL remains available in the product form as an optional fallback for imported or external images.

Required UI:

- Product table with search, filters, status, stock, price, category, and actions.
- Create product form.
- Edit product form.
- Product image uploader.
- Product status controls.
- Delete or archive confirmation dialog.

Fields:

- Name.
- Slug.
- SKU.
- Description.
- Category.
- Brand.
- Region or cuisine tag.
- Unit and size.
- Price.
- Sale price.
- Stock.
- Low-stock threshold.
- Status.
- Images.

Validation:

- Visible required indicators.
- Inline validation.
- Safe image type and size messages.
- Server-side Zod validation for all writes.

## Admin Category Management

Stage 6 implementation note:

- `/admin/categories` now supports protected category create, edit, and delete flows.
- Category creation unblocks product creation because product forms require a valid category.
- Category rows expose parent category, featured flag, sort order, product counts, description, and image URL.
- Delete confirmation now uses a direct Yes/No decision instead of requiring typed text.
- Admin success/error banners dismiss after 3 seconds and clear stale URL query parameters.
- Stage 12 confirms category image/icon URL support for richer category cards and future navigation visuals.

Required UI:

- Category table or tree.
- Create and edit category form.
- Parent category selection.
- Slug management.
- Visibility or featured controls.
- Sort order.

Design notes:

- Show product counts where available.
- Use drag and drop only if keyboard support is included, otherwise provide numeric sort order.

## Admin Order Management

Stage 6 implementation note:

- `/admin/orders` now supports protected order search/filter and validated fulfillment/payment status updates.
- Manual order creation remains out of scope until checkout exists.
- Full order detail view and stricter status transition rules are still planned.

Stage 11 implementation note:

- `/admin/orders` now supports search, status filtering, status updates, detail links, and invoice links.
- `/admin/orders/[orderId]` shows customer details, delivery address, ordered SKU/variant snapshots, current SKU stock, totals, and status controls.
- `/admin/orders/[orderId]?view=invoice` provides a simple invoice-style view.
- The UI displays the existing `PROCESSING` database status as "Packed".
- Admin status choices are limited to allowed next states instead of showing every status for every order.

Required UI:

- Orders table with status, date, customer, total, fulfillment type, payment state.
- Filters by status and date.
- Order detail view.
- Safe status transition controls.
- Customer and address summary.
- Line items with price snapshots.

Design notes:

- Use badges for statuses with text labels.
- Make destructive or irreversible actions require confirmation.
- Keep audit-relevant data visible.

Security note:

- Order status changes require admin role, validated status values, and validated status transitions.

## Admin Inventory

Stage 6 implementation note:

- `/admin/inventory` now supports protected stock search/filter and validated stock adjustments.
- Stock adjustments create `InventoryLog` records and cannot reduce stock below zero.
- Low-stock and out-of-stock states use text and color together.

Stage 11 implementation note:

- `/admin/inventory` now includes summary cards for total SKUs, available SKUs, low stock, and out of stock.
- Low-stock filtering uses each SKU's low-stock threshold.
- Inventory rows show product, variant, SKU, stock, threshold, product status, variant status, latest log, and stock adjustment controls.
- Stock updates write `InventoryLog` records.

Required UI:

- Low stock view.
- Stock adjustment form.
- Inventory history later if supported.
- Bulk update planning later.

Design notes:

- Low stock and out-of-stock states must be visually distinct.
- Use warning color plus text, not color alone.

Security note:

- Stock writes require admin role and server-side validation.

## Admin Coupons

Stage 6 implementation note:

- `/admin/coupons` now supports protected coupon create, edit, and delete flows.
- Coupon forms validate code, type, value, usage limit, minimum subtotal, max discount, active state, and schedule dates.
- Checkout still must recalculate coupon eligibility and totals server-side before any discount is trusted.
- Stage 12 confirms coupon management covers percentage/fixed discounts, expiry, and active status in the protected admin surface.

Required UI:

- Coupon list.
- Create and edit coupon form.
- Discount type.
- Discount value.
- Minimum order.
- Expiry.
- Usage limit.
- Active status.

Design notes:

- Show a plain-language preview of coupon behavior before save.
- Warn for risky values such as very high discounts.

Security note:

- Coupon validity and totals must be recalculated server-side during checkout.

## Admin Banners

Stage 6 implementation note:

- `/admin/banners` now supports protected banner create, edit, and delete flows.
- Banner forms validate title, placement, sort order, image URL, link URL, active state, and schedule dates.
- Supabase Storage upload and responsive image crop previews remain planned.
- Stage 12 confirms banner management supports homepage hero, weekly offer, and category campaign placements for future storefront merchandising.

Required UI:

- Banner list.
- Create and edit banner form.
- Image or text banner options.
- Link target.
- Start and end dates.
- Placement.
- Active status.

Design notes:

- Include preview for desktop and mobile crops.
- Avoid text baked into images where possible.

## Admin Settings

Stage 6 implementation note:

- `/admin/settings` is now a protected planning surface for store profile, delivery, tax, checkout, and storage settings.
- It intentionally does not save settings yet because no persistent settings model exists.
- Save controls should be added only after a settings model, migration, Zod schema, and server actions exist.

Sections:

- Store profile.
- Delivery or pickup settings.
- Tax and fee placeholders.
- Notification settings placeholder.
- Storage and image settings notes.

Design notes:

- Use grouped forms with clear save actions.
- Keep advanced or risky settings visually separated.

Security note:

- Settings writes require admin role and server-side validation.
