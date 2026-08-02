# Customer account data gaps

This document records features intentionally omitted from the customer account
because there is no verified implementation or data source.

## Not currently supported

### Reorder

There is no server workflow that rechecks every historical variant for current
availability, price and pack-size changes before adding it to the cart.
Therefore order cards do not show a reorder button. `Shop groceries` is the
supported alternative.

### Live tracking and estimated times

The order model has fulfilment statuses but no carrier, GPS, ETA or event-history
source. The account shows only progress stages backed by stored enum values. It
does not show a map, estimated completion time or invented status history.

### Order cancellation requests

There is no customer-authorised cancellation workflow or state-transition
policy. Customers are directed to contact the store for order-specific help.

### Communication preferences

There is no marketing consent model, preference timestamp, campaign integration
or unsubscribe workflow. Transactional order and security communications are
not presented as optional. `/account/preferences` is intentionally absent.

### Email change

The application has no completed email-change verification and identity-linking
workflow across local accounts and Supabase Auth. Email is read-only on the
profile screen.

### Advanced security

The current data model does not support:

- password-last-updated timestamps;
- customer-visible active-session details;
- sign out from other devices;
- two-factor authentication;
- customer-visible security activity.

These controls are omitted rather than represented with placeholder values.

### Automated account deletion

There is no retention-aware, re-authenticated deletion workflow. A verified
manual request through the public store email is the supported process.

### Address validation and delivery notes

Addresses have structured fields but no postal validation provider and no
dedicated delivery-note field. The UI does not imply that an address has been
validated. Order notes are not reused because they may contain operational or
admin-only context.

### Product recommendations

The overview deliberately avoids catalogue or recommendation feeds. It loads
only a small wishlist preview. This prevents unrelated storefront data from
slowing the account.

## Future work requirements

Any future feature must add:

1. an explicit supported data model and ownership policy;
2. server-side authorisation using the authenticated customer ID;
3. matching Supabase RLS where the table is directly exposed;
4. safe empty, loading and failure states;
5. Australian date/currency/address formatting;
6. responsive and accessibility coverage;
7. documentation updates before customer-facing controls are enabled.
