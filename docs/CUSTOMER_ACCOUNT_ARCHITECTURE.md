# Customer account architecture

## Purpose

The customer account is a storefront feature, not part of the administrator
console. It reuses the public store header, footer, cart, wishlist provider and
mobile bottom navigation while keeping account navigation and customer identity
inside one visual system.

## Routes

| Route | Purpose |
| --- | --- |
| `/account` | Task-focused account overview with recent orders, wishlist preview, safe address summary, profile and help |
| `/account/orders` | Paginated customer order history |
| `/account/orders/[id]` | Customer-owned order detail; `[id]` is the customer-facing order number |
| `/account/addresses` | Add, edit, delete and select a default shipping address |
| `/account/profile` | Edit the supported local customer name and optional phone fields |
| `/account/security` | Password recovery, current-session sign out and the manual deletion-request process |
| `/wishlist` | Customer-owned saved products under the shared account shell |

Communication preferences are not routed because the application has no
marketing-consent data source or outbound marketing system.

## Shared UI

`CustomerAccountShell` owns the compact account header, continue-shopping
action, secondary account menu, desktop sidebar and subsection back navigation.
`AccountSidebar` owns the supported route list and applies `aria-current` from
the active pathname. `MobileAccountQuickActions` is shown only on the overview;
subsections use a back-to-account link instead of a horizontal tab strip.

The persistent storefront bottom navigation remains controlled by
`SiteShell`. Account content inherits its safe-area bottom padding so it is not
covered on mobile.

## Data sources

Customer account data is fetched in React Server Components through Prisma:

- identity: `User`, limited to the authenticated `CUSTOMER`;
- orders: `Order` and `OrderItem`, always filtered by `userId`;
- addresses: `Address`, always filtered by `userId` and `SHIPPING` type;
- wishlist: `Wishlist`, always filtered by `userId`, with a small product and
  active-variant projection;
- session: the hashed server-managed `Session` record referenced by the
  HTTP-only `gsp_session` cookie.

The account overview fetches three independent, limited summaries in parallel.
An unavailable orders, wishlist or address summary renders its own safe error
state without exposing database errors or preventing the other summaries from
rendering.

## Customer profile fields

The supported customer profile contains:

- `name` (full name);
- `email` (account identifier, read-only in the current profile UI);
- `phone` (optional).

The greeting uses the first token of a non-empty stored name. If no name exists,
it displays `Welcome back`; it never manufactures a name from the email
address.

## Formatting

`src/lib/customer-account.ts` centralises:

- customer-friendly order status labels;
- pickup and delivery progress stages backed by existing enum states;
- Adelaide-timezone `en-AU` date formatting;
- fulfilment and payment labels;
- non-sensitive address locality summaries.

Currency continues to use the storefront `formatCurrency` helper and the order's
stored currency.

## Navigation and history

Account sections are real URLs, so refresh, deep linking and browser
Back/Forward work normally. The existing `RouteTransitionManager` resets
forward navigation to the top while leaving history navigation and browser
scroll restoration authoritative. Order-list links use customer-facing order
numbers and do not expose database IDs.

## Loading and empty states

`AccountLoadingShell` preserves the account layout while server data resolves
and never renders fake counts or customer identity. Empty states provide one
relevant next action: shop, save a product, or add an address.
