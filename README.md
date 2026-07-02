# Grocery Store Pro

Modern grocery ecommerce application for Nepali, Indian, Asian, and general grocery products.

## Project Stage

Current stage: Stage 13, final UI/UX polish and responsiveness.

The Next.js App Router foundation, Prisma schema, server-side admin authentication, protected admin shell, admin product CRUD, category CRUD with image/icon support, coupon CRUD, banner CRUD, order detail/invoice management, inventory adjustments, product image uploads, storefront browsing, product detail pages, guest cart, checkout, Cash on Delivery order creation, customer login/registration, account dashboard, customer order history, address management, wishlist persistence, and final responsive UI polish are scaffolded. Real online payments, newsletter persistence, customer profile editing, and production abuse-prevention controls are intentionally not built yet.

## Product Direction

Grocery Store Pro should feel like a polished, trustworthy ecommerce experience for everyday grocery shopping and specialty South Asian pantry needs. The storefront should be fast, mobile-first, easy to scan, and conversion-focused without feeling generic.

Target catalog examples:

- Fresh produce, rice, lentils, atta, spices, masala blends, pickles, noodles, snacks, frozen foods, beverages, household essentials, puja items, and seasonal festival products.
- Nepali, Indian, Asian, and general grocery categories.
- Customer-facing shopping flows plus an admin dashboard for product, category, order, inventory, coupon, banner, and settings management.

## Planned Stack

- Next.js App Router: installed
- TypeScript: installed
- Tailwind CSS: installed
- shadcn/ui where suitable
- Prisma
- Supabase PostgreSQL
- Supabase Storage for product images
- Zod validation
- npm only
- Server-side authentication
- Role-based access control with `ADMIN` and `CUSTOMER`: app-layer admin protection implemented

## Documentation

- [PROJECT_STATUS.md](PROJECT_STATUS.md)
- [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- [UI_PAGE_GUIDE.md](UI_PAGE_GUIDE.md)
- [SETUP_GUIDE.md](SETUP_GUIDE.md)
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- [docs/STORAGE_SETUP.md](docs/STORAGE_SETUP.md)

## Stage 0 Notes

The installed `ui-ux-pro-max` skill was verified at `.codex/skills/ui-ux-pro-max`. Its local search script requires Python. Python is not installed on the normal shell PATH, but Codex provides a bundled runtime at:

`C:\Users\nabin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`

No dependency installation was performed.

## Stage 1 Notes

Installed packages:

- `next`
- `react`
- `react-dom`
- `typescript`
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `tailwindcss`
- `@tailwindcss/postcss`
- `eslint`
- `eslint-config-next`

Available scripts:

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run demo:seed
```

Validation completed:

- `npm run build` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.

Security note: `npm audit` reports a moderate PostCSS advisory through the current Next dependency tree. The automated `npm audit fix --force` recommendation would install an old breaking Next version, so it was not applied.

## Stage 2 Notes

Added Prisma setup:

- `prisma.config.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `docs/DATABASE_SETUP.md`

The schema covers users, auth account/session tables, categories, brands, products, variants/SKUs, product images, addresses, carts, wishlists, orders, coupons, banners, and inventory logs.

Validation completed:

- `npm run prisma:validate` passed.
- `npm run prisma:generate` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.

No migration was run against Supabase. No real credentials were added.

## Stage 3 Notes

Added authentication and admin protection:

- `/admin/login`
- Server-side `/admin` protection
- ADMIN and CUSTOMER role checks
- Logout
- Protected admin API example at `/api/admin/health`
- Safe admin creation script
- Safe test customer creation script

Validation completed:

- `npm run prisma:validate` passed.
- `npm run prisma:generate` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.

No real credentials were added. Real browser login testing requires a migrated development PostgreSQL database.

## Stage 4 Notes

Added protected admin shell and section pages:

- `/admin/dashboard`
- `/admin/products`
- `/admin/categories`
- `/admin/orders`
- `/admin/inventory`
- `/admin/coupons`
- `/admin/banners`
- `/admin/settings`

Logged-out direct access to these pages redirects to `/admin/login`. Product CRUD and admin write workflows are not implemented.

## Stage 5 Notes

Added protected admin product CRUD:

- Product list with search/filter.
- Create product page.
- Edit product page.
- Delete with confirmation.
- Multiple variant/SKU management.
- Zod validation for product writes.
- Server-side admin guards on product create, update, and delete actions.

Admin product image upload to Supabase Storage is not implemented yet.

## Stage 6 Notes

Added protected admin management:

- Category CRUD to unblock product creation.
- Coupon CRUD.
- Banner CRUD.
- Order search/filter and status updates.
- Inventory search/filter and audited stock adjustments.
- Settings planning page without fake persistence.

## Stage 12 Notes

Added customer-facing account and wishlist surfaces:

- Customer login and registration at `/login`.
- Customer dashboard at `/account`.
- Customer order history at `/account/orders`.
- Customer address management at `/account/addresses`.
- Customer wishlist page at `/wishlist`.
- Product detail wishlist toggle for signed-in customers.
- Category image/icon URL support in admin category management.

Security notes:

- Customer account, orders, addresses, and wishlist reads/writes are scoped server-side by the signed-in `userId`.
- Admin category, coupon, and banner writes remain protected by server-side `ADMIN` checks and Zod validation.
- Coupon redemption during checkout is still future work and must be recalculated server-side before any discount is trusted.

## Stage 13 Notes

Added final UI/UX polish without changing core commerce behavior:

- Global skip link, refined page background, polished scrollbars, and shimmer skeleton states.
- Responsive public header with contained mobile navigation and no public admin links.
- Product card, product detail, cart, checkout, account, wishlist, and admin shell polish.
- Auto-dismissing local toast feedback for add-to-cart and product detail actions.
- Improved focus states, visible labels, image alt checks, and mobile overflow fixes.

Validation completed:

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
