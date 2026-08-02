# Account deletion data map

This map contains schema decisions only. It contains no customer records.

| Data type | Relationship | Deletion treatment | Retry behaviour |
|---|---|---|---|
| Supabase Auth user | `User.supabaseAuthUserId` | Hard-deleted after application cleanup | `user_not_found` is treated as already complete |
| Application profile | `User.id` | PII anonymised while pending; row deleted after Auth deletion | Updates/deletes are idempotent |
| Auth method marker | `User.authMethod` | Deleted with profile | No independent data |
| Linked accounts/tokens | `Account.userId`, cascade | Deleted | `deleteMany` |
| Application sessions | `Session.userId`, cascade | All deleted; HTTP-only cookie cleared | `deleteMany` |
| Delivery addresses | `Address.userId`, cascade | Deleted | `deleteMany` |
| Wishlists | `Wishlist.userId`, cascade | Deleted | `deleteMany` |
| Database carts/items | `Cart.userId`; `CartItem.cartId`, cascade | Deleted | Parent `deleteMany` cascades items |
| Browser cart | `grocery-store-pro.cart.v1` | Cleared before neutral redirect | Repeated removal is safe |
| Browser Supabase cache | `sb-*-auth-token` | Cleared before neutral redirect | Repeated removal is safe |
| Orders | Nullable `Order.userId` | Retained and detached | Repeated update matches only still-linked rows |
| Order contact snapshot | `customerEmail`, `customerPhone`, `notes` | Email replaced with a shared invalid placeholder; phone/notes removed | Same fixed values on retry |
| Order delivery link | `Order.addressId` | Set null before address deletion | Safe when already null |
| Order items | `OrderItem.orderId` | Retained for transaction/accounting record | Remains linked only to retained order |
| Inventory audit actor | `InventoryLog.userId`, `ON DELETE SET NULL` | Retained and detached | Database constraint handles final delete |
| Product/catalog data | No customer ownership | Unchanged | Not in deletion scope |
| Storage objects | `storage.objects.owner_id` or namespaced by Auth/app ID | Removed through Storage API before Auth deletion | Listing/removal is repeatable |
| Product image bucket objects | Product-owned; no customer ownership observed | Retained | Not matched by customer owner/namespace |
| Deletion request | `AccountDeletionRequest` | Retained as non-sensitive completion ledger; identity fields cleared on completion | Event ID is the retry key |
| Security audit | `SecurityAuditEvent` | Retained with event ID and pseudonymous identifiers | No FK to deleted profile |
| Security attempt limits | `SecurityRateLimit.keyHash` | HMAC-pseudonymous cooldown state retained until operational pruning | Contains no raw customer ID, email, network address, password, or token |
| Reviews | No table exists | Not applicable | Re-audit if introduced |
| Support requests | No table exists | Not applicable | Re-audit if introduced |
| Customer preferences/notifications | No table exists | Not applicable | Re-audit if introduced |
| Payment-provider customer references | No table/field exists | Not applicable | Add explicit detachment before introducing one |
| Customer avatars | No customer upload path currently exists | `User.image` cleared; owned/namespaced Storage objects removed | Covered by storage scan |

Database foreign keys and Supabase Storage were inspected on 1 August 2026.
At that time the only bucket was public `product-images`, containing no
customer-owned objects.
