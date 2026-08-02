# Admin dashboard data gaps

This file records intentionally omitted dashboard features and data-quality
concerns. No records were deleted during the dashboard upgrade.

## Known development/test records

The current connected database contains:

- the requested demo administrator account at `admin@example.com`;
- a paid confirmed order using an `@example.com` customer address; and
- a cancelled/refunded order using an `@example.com` smoke-style customer
  address.

These records are administratively relevant in the current development
database, so the dashboard labels likely test records instead of silently
deleting or hiding them.

For production:

1. use a separate Supabase project/database for automated tests;
2. use explicit test account domains or tags;
3. set `ADMIN_EXCLUDE_TEST_DATA=true` only after reviewing the documented match
   patterns;
4. verify excluded counts against an orders export/query before launch; and
5. archive or delete records only through an approved data-retention process.

## Unsupported widgets

### Recent admin activity

There is no general persistent audit-log model for product, order, coupon,
banner, and settings changes. Inventory has `InventoryLog`, and authentication
emits limited security audit events, but these do not provide a complete
dashboard activity feed. No simulated activity panel is shown.

### Overdue fulfilment and delivery due dates

Orders do not store a promised/due fulfilment timestamp. The dashboard can show
current workflow states but cannot calculate overdue deliveries or pickups.

### Failed fulfilment actions

There is no persisted fulfilment-job or delivery-provider failure model, so
notifications do not invent system issue counts.

### Customers workspace

Customer users exist, but there is no dedicated protected customer-management
route or reviewed privacy scope. The shell does not add an unsupported
Customers link.

### Persistent store settings

The settings route is a planning page. A settings model, validation rules, and
audited writes require a reviewed migration.

### Export

No export button is shown. Secure paginated/streamed exports, privacy-minimised
columns, and audit recording need a dedicated implementation.

### Custom date range

The supported fixed ranges are Today, Last 7 days, Last 30 days, This month,
and Previous month. A custom range picker is omitted until validation, maximum
range, timezone, and export interactions are specified.

### Realtime

The dashboard uses explicit refresh and a visible timestamp. No continuous
Supabase Realtime subscription is opened. A future subscription must be
authorised, deduplicated, unsubscribed on unmount, and must not reorder content
while staff are reading.

### Multiple administrative roles

Only `ADMIN` exists. See `ADMIN_PERMISSIONS.md` for the server-side work needed
before role-specific controls are introduced.

## Accounting limitations

Dashboard revenue is gross stored paid-order total. The schema does not provide
cost of goods, processor fees, remittance settlement, chargeback events, or a
financial ledger. The dashboard is operational reporting, not accounting
reporting.
