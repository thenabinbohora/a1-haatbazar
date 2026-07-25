# A1 Haat Bazar Storefront Design System

**Project:** Grocery Store Pro

**Direction:** Premium neighbourhood grocery ecommerce
**Updated:** 2026-07-13

## Experience principles

1. Make search, categories, product availability, pack size, price, and cart access visible before decorative content.
2. Use warm editorial imagery and generous spacing to feel premium, while keeping controls compact enough for repeat grocery shopping.
3. Keep the shopping journey predictable: discovery → product/variant → cart → fulfilment → contact/address → review.
4. Use motion only for feedback and subtle entrance/lift effects (150–260ms); respect `prefers-reduced-motion`.
5. Meet WCAG AA contrast, 44px touch targets, visible keyboard focus, semantic headings, and descriptive accessible names.

## Visual foundation

| Role | Token | Hex | Purpose |
|---|---|---:|---|
| Canvas | `--color-background` | `#F7F6F1` | Warm, quiet page background |
| Surface | `--color-surface` | `#FFFFFF` | Cards, navigation, forms |
| Soft surface | `--color-surface-muted` | `#EEF2EC` | Filters and secondary areas |
| Hero | `--color-hero` | `#F3EBDD` | Editorial feature panels |
| Text | `--color-text` | `#172019` | Primary copy |
| Muted text | `--color-text-muted` | `#59645D` | Supporting copy (AA-safe) |
| Primary | `--color-primary` | `#123C2E` | Brand, main CTA, navigation |
| Primary dark | `--color-primary-muted` | `#0B2B20` | Hover and footer |
| Accent | `--color-cta` | `#C04F1A` | Offers, focus, highlights (AA with white) |
| Accent soft | `--color-cta-soft` | `#FFF0E3` | Promotional backgrounds |
| Fresh | `--color-fresh` | `#2F6D4A` | Stock and freshness signals |
| Border | `--color-border` | `#DEDCD2` | Quiet separation |

Typography uses **Plus Jakarta Sans** for headings and **Inter** for interface/body copy, both loaded through `next/font` with swap behaviour. Use tabular numerals for prices and totals.

## Shape, space, and depth

- Cards: 16–24px radius, 1px warm border, low diffuse shadow.
- Buttons and inputs: 12–16px radius, 44–52px minimum height.
- Pills: fully rounded; reserve for status, filters, and compact metadata.
- Containers: consistent `max-w-7xl` with 16/24/32px responsive gutters.
- Sections: 48px mobile and 72px desktop vertical rhythm.
- Card hover: maximum 2px lift; never shift neighbouring layout.

## Commerce component rules

- Header: delivery/store-hours strip, persistent search, category shortcuts, visible counted cart on every storefront route.
- Product cards: image first, then availability/category/name/pack, price, and one dominant purchase action. Wishlist stays in a stable top-right position.
- Product listing: show result count and active filters; mobile filtering uses a clear, scroll-safe control.
- PDP: prefer the first sellable variant, keep cart access on mobile, and show fulfilment/payment reassurance adjacent to purchase.
- Cart/checkout: sticky summary on desktop, clear fulfilment choice, inline validation, totals before the final action, and no surprise cart clearing.
- Empty states: explain what happened and offer one primary recovery action.

## Motion and performance

- Standard transition: `180ms cubic-bezier(.2,.8,.2,1)`.
- Drawer: maximum 260ms; toast/menus: 180–200ms.
- No parallax, scroll-jacking, continuous decorative animation, or large blur layers.
- Use responsive `next/image`, lazy-load below-fold media, and reserve aspect ratios to prevent layout shift.

## Do not use

- Emoji as interface icons.
- Gold or orange body copy on light backgrounds.
- Glass effects behind long-form text.
- More than one dominant CTA in a component.
- Hover-only information, invisible focus states, or colour-only status communication.
- Forced animation when reduced motion is requested.

## Delivery checklist

- [ ] Responsive at 375px, 768px, 1024px, and 1440px.
- [ ] No horizontal page overflow.
- [ ] Keyboard navigation and focus visibility verified.
- [ ] Form controls have labels and errors are announced.
- [ ] Images have useful alt text or empty alt when decorative.
- [ ] Cart/search remain reachable throughout the storefront flow.
- [ ] Lint, typecheck, and production build pass.
- [ ] Core funnel manually tested in browser.
