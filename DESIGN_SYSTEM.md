# A1 Haat Bazar Design System

The canonical storefront design specification is maintained in:

- [`design-system/grocery-store-pro/MASTER.md`](design-system/grocery-store-pro/MASTER.md)

## Quick implementation reference

- **Experience:** premium neighbourhood grocery ecommerce—warm, trustworthy, fast, and search-led.
- **Primary:** `#123C2E`; **accent:** `#C04F1A`; **canvas:** `#F7F6F1`; **text:** `#172019`.
- **Typography:** Plus Jakarta Sans for headings; Inter for body and interface copy, loaded with `next/font`.
- **Shape:** 16–24px card radii; 12–16px controls; fully rounded status/filter pills.
- **Motion:** 150–260ms for feedback and entrances only; reduced-motion preferences are mandatory.
- **Layout:** shared `max-w-7xl` containers, mobile-first responsive grids, persistent storefront search/cart access.
- **Accessibility:** WCAG AA contrast, visible focus, 44px touch targets, semantic landmarks/headings, labelled form controls, and announced errors.

Semantic tokens and global primitives live in [`src/app/globals.css`](src/app/globals.css). Page and component implementations should consume those tokens rather than introducing one-off palette values.
