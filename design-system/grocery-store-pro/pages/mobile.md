# Mobile Storefront Override

This file overrides `../MASTER.md` for customer-facing viewports below 768px.

## Product principles

1. Preserve at least 44×44px touch targets and 8px separation between unrelated actions.
2. Use 16px editable text to prevent iOS focus zoom.
3. Keep one dominant action in the thumb zone; persistent controls must include safe-area padding and must not cover terminal content.
4. Prefer compact horizontal product/cart rows and swipeable merchandising rails over long vertical repetition.
5. Show price, stock, pack, fulfilment and cart state before supporting marketing copy.

## Mobile structure

- Standard storefront header: compact brand/cart row plus one 48px search row. Utility messaging is part of page content, not sticky chrome.
- Task routes (checkout, authentication and recovery): compact back/brand/security header; no department search or bottom navigation.
- Bottom navigation: Home, Shop, Cart, Wishlist and Account. The shared page-content wrapper reserves `calc(var(--mobile-bottom-nav-height) + env(safe-area-inset-bottom) + 16px)` as the single safe-bottom clearance.
- Homepage: one search, a two-column quick-category grid, and exactly four compact promise cards in a balanced 2Ã—2 grid, followed by offers, popular products and fulfilment reassurance. Merchandising rails use mandatory horizontal snap, equal start/end padding and fully reachable terminal cards; section-level links stay in the heading row or directly beneath their rail.
- Product listing: sticky Sort/Filter toolbar, two-column compact cards down to 320px, 44px wishlist/purchase actions.
- PDP: swipe-friendly gallery, disabled unavailable variants, one mobile purchase bar, explicit cart access.
- Cart: 80–96px media rows, visible subtotal, stock adjustments that can be accepted, sticky checkout action.
- Checkout: early collapsible order summary, preserved address draft, mobile sticky items-total/action, delivery-extra disclosure.

## Performance and motion

- Use opaque mobile sticky surfaces; avoid backdrop blur on low-end scrolling paths.
- Animate drawers, sheets and add-to-cart feedback only, at 150–220ms.
- Never animate initial product text or delay a primary action.
- Reserve image aspect ratios and use responsive `next/image` sizes.

## Verification sizes

- 320×568
- 360×800
- 375×812
- 390×844
- 430×932

Verify landscape safe areas, virtual keyboard behavior, reduced motion, browser back/scroll restoration and slow-network loading states.
