# Admin dashboard architecture

## Route protection

Every route under `src/app/admin/(protected)` is wrapped by the protected admin
layout. The layout calls `requireAdmin()` before rendering the shared shell.
Anonymous users are redirected to admin sign-in; authenticated non-admin users
are redirected to access denied.

Admin API routes call `requireAdminApi()` and return `401` for anonymous
requests and `403` for authenticated users without the `ADMIN` role. The
browser never receives a database URL or Supabase service-role key.

## Shared console shell

`AdminShell` is used once by the protected layout and therefore covers the
dashboard, products, categories, orders, inventory, coupons, banners, settings,
and nested admin pages.

The shell owns:

- grouped desktop navigation and its locally persisted collapsed preference;
- mobile focus-trapped navigation drawer and body scroll lock;
- contextual page titles and breadcrumbs;
- protected command palette;
- real operational notification counts;
- supported quick-create links;
- storefront and sign-out controls; and
- a centred content container capped at 1600px.

Navigation visibility is a usability feature, not an authorisation boundary.

## Data flow

The dashboard remains a React Server Component. Independent widget queries are
started together with `Promise.allSettled`, so one failed widget can show a
section-level error without removing working sections.

`src/lib/admin/dashboard-data.ts` contains:

- URL range parsing and Adelaide calendar boundaries;
- reusable metric definitions;
- database-level daily and top-product aggregation;
- current fulfilment and inventory summaries;
- recent-order projections containing only dashboard-required fields;
- promotion health; and
- optional test-record exclusion.

The protected layout and dashboard share the React-cached shell summary in a
single request to avoid duplicate notification and stock queries.

PostgreSQL performs revenue, daily trend, low-stock, and top-product
aggregation. Recent orders are explicitly limited to six and inventory alerts
to five. The browser does not download full order or catalogue tables for
filtering.

## Command palette

`GET /api/admin/search?q=...` is an authenticated admin endpoint. It:

- accepts a trimmed query between 2 and 64 characters;
- searches products, orders, categories, and coupons in parallel;
- limits each entity result set;
- returns safe navigation metadata rather than full records;
- does not return customer email, phone, address, or payment data; and
- sends `Cache-Control: no-store`.

The client debounces requests by 250ms, aborts stale requests, supports
Ctrl/Cmd+K, traps focus, and closes on Escape or navigation.

## Chart implementation

The dashboard uses a small in-repository SVG chart instead of adding a charting
dependency. It has:

- revenue, orders, and average-order-value controls;
- focusable data points/bars with text titles;
- a screen-reader summary;
- restrained/no required animation;
- responsive `viewBox` sizing; and
- an explicit insufficient-history state.

## Error, loading, and empty states

The protected route loading file renders dashboard-shaped skeletons to reserve
space. Widget queries settle independently and display compact retry links on
failure. The protected route error boundary handles unexpected page-level
errors without exposing raw database details.

## Invalidation and refresh

The dashboard uses explicit server refresh through `router.refresh()`. It does
not open continuous Realtime subscriptions. Existing admin mutations continue
to invalidate their affected routes. Realtime can be considered later for new
orders and inventory only after an authorised, deduplicated subscription design
is approved.
