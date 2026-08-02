# Account deletion retention policy

## Decision

Customer identity and personal account data are deleted. Completed and otherwise
operationally required order records are retained in an anonymised, detached form
for store operations, accounting, tax, fraud, dispute, and legal obligations.

Before final confirmation the customer is told:

> Permanently remove your customer account and personal account data. Some
> order, tax or accounting records may be retained or anonymised where the store
> is legally required to keep them. This action cannot be undone.

This wording and the exact retention duration require legal review before
production publication. No code in this repository establishes a statutory
retention period.

## Retained fields

The retained order includes the order number, timestamps, fulfilment/payment
state, monetary totals, currency, coupon link where applicable, and purchased
item snapshots needed to interpret the transaction. Product/variant references
remain because they are catalogue/transaction data.

## Removed or detached fields

- `Order.userId` and `Order.addressId` are set to null.
- `customerEmail` becomes the shared non-deliverable placeholder
  `retained-order@invalid.a1-haat-bazar.local`.
- `customerPhone` and free-form `notes` are cleared.
- Profile name, email, phone, image, password hash, and verification timestamp
  are cleared while deletion is pending; the profile row is then deleted.
- Addresses, wishlist, carts, linked accounts, sessions, and owned storage are
  deleted.

Retained orders stay admin/server operational data. The deleted customer has no
application session, active profile, Supabase Auth identity, or RLS ownership
mapping with which to access them.

## Hard-delete choice and partial failure

Supabase Auth hard deletion is used only after storage and application-owned PII
cleanup. Soft deletion was not selected because it is irreversible while still
retaining a hashed Auth identity and does not remove the need for application
cleanup.

If cleanup begins but Auth deletion/finalisation fails, the profile remains
`DELETION_PENDING`, all application sessions are removed, and RLS ownership
lookup returns null. The customer is sent to a neutral completion-pending page.
An authorised operator retries by non-sensitive event ID:

```text
npm run account-deletion:retry -- <event-id>
```

The retry repeats storage cleanup and anonymisation safely, treats an already
missing Auth user as success, and clears protected retry identifiers only after
completion. Never run the retry with an app user ID, email address, or browser
payload as the target.

