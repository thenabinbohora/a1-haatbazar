# Admin dashboard metrics

This document defines the metrics shown on `/admin/dashboard`. It is the source
of truth for interpreting dashboard values.

## Shared rules

- Locale: `en-AU`
- Currency: values are formatted as AUD unless the source order carries another
  currency.
- Store timezone: `STORE_TIME_ZONE`, defaulting to `Australia/Adelaide`.
- A selected range is stored in the URL as `range=today`, `7d`, `30d`,
  `month`, or `previous-month`.
- Range boundaries are local calendar midnights converted to UTC before
  querying PostgreSQL.
- The comparison period is the immediately preceding period with the same
  number of local calendar days.
- Current-state metrics such as fulfilment and inventory do not change with the
  selected sales range.

## Eligible sales order

Revenue, paid order count, average order value, trend data, and top products
use the same eligible-order rule:

1. `paymentStatus` is `PAID`.
2. `status` is not `CANCELLED` or `REFUNDED`.
3. `createdAt` falls within the selected range.
4. `currency` is `AUD`, so different currencies are never summed together.
5. When `ADMIN_EXCLUDE_TEST_DATA=true`, the order email does not match the
   documented development/test patterns.

This includes a paid order while it is pending, confirmed, processing, ready
for pickup, out for delivery, or delivered. It does not treat an unpaid order
request as revenue.

### Revenue

Revenue is the sum of the stored `Order.total` for eligible orders. The stored
total is the final order amount after the recorded discount and including any
recorded shipping and tax. Cancelled or refunded orders are excluded even if a
historical payment value remains.

This is gross paid order revenue, not accounting profit. It does not subtract
cost of goods, payment fees, or operating expenses.

### Paid orders

The number of eligible orders in the selected range. It does not include
cancelled, refunded, unpaid, authorised-only, or failed-payment orders.

### Average order value

`eligible revenue / eligible order count`

When there are no eligible orders, the dashboard shows `$0.00` with zero-data
context instead of dividing by zero.

### Sales trend

Eligible revenue and order count are aggregated by local store calendar day in
PostgreSQL. Missing dates are filled with zero only between the selected range
boundaries. The chart is withheld until eligible orders exist on at least two
different days; it does not render a misleading flat trend from one point.

### Top products

Order item quantities and line totals are summed only from eligible orders.
Products are ranked by units sold, then revenue. Current stock is the sum of
active variants and is not historical stock at the time of sale.

## Current operational metrics

### Pending fulfilment

Current orders in:

- `PENDING`
- `CONFIRMED`
- `PROCESSING`
- `READY_FOR_PICKUP`
- `OUT_FOR_DELIVERY`

The fulfilment panel breaks this into awaiting confirmation, being prepared
(`CONFIRMED` plus `PROCESSING`), ready for pickup, and out for delivery.

### Order status distribution

All actual order statuses created within the selected period, including
cancelled and refunded orders. This distribution is not a revenue calculation.

### Low stock

Active variants where:

`stock > 0 AND stock <= lowStockThreshold`

The variant's own configured threshold is used. No hard-coded global threshold
is applied.

### Out of stock

Active variants where `stock <= 0`. Inactive variants are not counted as
out-of-stock operational alerts.

### Active products

Products where `Product.status = ACTIVE`. This represents current catalogue
state and is not affected by the date range.

## Promotion health

- Active weekly offers: active products with `isWeeklyOffer = true`.
- Active coupon: `isActive = true`, its start is absent or reached, and its
  expiry is absent or still in the future.
- Expiring coupon: active coupon with an expiry in the next seven days.
- Active banner: active, started (or no start), and not ended (or no end).
- Scheduled banner: active with a future start date.

## Development/test data exclusion

Exclusion is disabled by default to avoid silently changing business figures.
When `ADMIN_EXCLUDE_TEST_DATA=true`, sales and operational order metrics omit
records whose customer email:

- ends with `@example.com`;
- contains `stage`;
- contains `smoke`; or
- contains `+test`.

Recent orders are labelled as potential test records when they match these
patterns. See `ADMIN_DATA_GAPS.md` before enabling the exclusion in production.
