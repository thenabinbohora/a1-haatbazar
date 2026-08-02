# Admin permissions

## Current role model

The current Prisma schema supports two roles:

- `ADMIN`
- `CUSTOMER`

There is one administrative role, so the console does not invent Owner,
Manager, Inventory, Fulfilment, or Content permissions that the server cannot
enforce.

## Enforcement

| Capability | Required server check |
| --- | --- |
| Protected admin pages | `requireAdmin()` |
| Admin JSON/search API | `requireAdminApi()` |
| Product, category, coupon, banner, order, and inventory actions | Existing server action admin guard |
| Dashboard metrics | Protected layout plus server-only data module |
| Sign out | Authenticated server action |

Sidebar links, hidden controls, and client state never grant access.

## Current ADMIN capabilities

The existing `ADMIN` role can:

- view the operational dashboard;
- search supported admin records;
- manage products and product images;
- manage categories;
- review orders and use validated order transitions;
- adjust inventory with an inventory log;
- manage coupons;
- manage banners;
- view the settings planning page; and
- return to the public storefront.

The settings page intentionally remains non-writable because no persistent
settings model exists.

## Future multiple-role support

Adding multiple administrator roles requires a reviewed server-side capability
model before adding role-specific navigation. A safe future design should:

1. define capabilities such as `catalogue.write`, `inventory.adjust`,
   `orders.fulfil`, `promotions.write`, and `settings.write`;
2. store trusted assignments in server-controlled database data, not editable
   user metadata;
3. check capabilities in page loaders, APIs, and every server action;
4. apply matching database/RLS policies where the Data API is used;
5. filter shell navigation from the same server-derived capability set; and
6. test direct URL/API access for every restricted capability.

Until that work exists, all admin controls require the single `ADMIN` role.
