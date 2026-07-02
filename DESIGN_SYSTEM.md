# Design System

Design system generated and refined using the installed `ui-ux-pro-max` skill for Grocery Store Pro.

## Skill Verification

`ui-ux-pro-max` is available and initialized in this project:

`C:\Users\nabin\grocery-store-pro\.codex\skills\ui-ux-pro-max`

The skill's search script was run with the bundled Codex Python runtime because `python` is not installed on the normal shell PATH.

Runtime used:

`C:\Users\nabin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`

No package installation was required.

## Brand Positioning

Grocery Store Pro is a premium but practical grocery ecommerce experience for Nepali, Indian, Asian, and general grocery products. The UI should feel trustworthy, clean, fast, culturally aware, and commercially polished.

The design should communicate:

- Freshness and reliability for daily grocery needs.
- Specialty expertise for South Asian pantry shopping.
- Clear pricing, stock, delivery, and order information.
- A calm admin experience built for repeated operational use.

## Visual Style

The skill recommended a premium ecommerce direction with dark neutrals and a gold CTA accent. It also surfaced "Liquid Glass" as a style match, but for this project that should be used with restraint because grocery shopping requires strong readability and fast product scanning.

Final direction:

- Clean premium commerce.
- Warm neutral surfaces.
- Fresh green success and grocery signals.
- Gold accent for primary conversion moments.
- Minimal translucent treatment only for small overlays, not core product text.
- Mobile-first, dense enough for grocery browsing, but not cluttered.

Avoid:

- Overuse of glassmorphism.
- Low-contrast transparent cards.
- Decorative gradients that obscure product photography.
- One-note green-only grocery theming.
- Emoji icons.
- Marketing-only landing page structure that delays shopping.

## Color Tokens

Use these semantic tokens as the starting point for Tailwind and shadcn theme work in Stage 1.

| Token | Hex | Usage |
| --- | --- | --- |
| `background` | `#FCFCFA` | Main app background |
| `surface` | `#FFFFFF` | Cards, sheets, forms, dropdowns |
| `surface-muted` | `#F7F8F2` | Neutral image wells, filters, and subtle controls |
| `hero` | `#FFF7E2` | Warm homepage hero and small authentic grocery highlights |
| `border` | `#E6E2D8` | Default borders and dividers |
| `text` | `#0C0A09` | Primary text |
| `text-muted` | `#57534E` | Secondary text |
| `primary` | `#0B5D1E` | Primary green actions and brand UI |
| `primary-muted` | `#063D16` | Deep green hover and secondary brand UI |
| `cta` | `#C6922E` | Gold accent, offers, and highlights |
| `cta-hover` | `#A16207` | CTA hover |
| `fresh` | `#15803D` | In-stock, delivery success, produce accent |
| `fresh-soft` | `#EAF7EE` | Soft mint trust, freshness, fresh produce, and success accents |
| `danger` | `#B91C1C` | Destructive actions and errors |
| `danger-soft` | `#FEE2E2` | Error backgrounds |
| `warning` | `#D97706` | Low stock, coupon warnings |
| `info` | `#0369A1` | Informational states |

Contrast rules:

- Body text on light surfaces must meet at least 4.5:1 contrast.
- CTA text must be white or dark enough to meet contrast.
- Do not place text directly on busy product images without a solid or strongly blurred overlay.
- Sale, stock, and delivery badges must use both color and text, not color alone.

## Typography

The skill recommended Satoshi for headings and General Sans for body, with DM Sans as an accessible Google Fonts fallback.

Implementation recommendation:

- Primary web font: `DM Sans`.
- Heading weight: 700 for page titles, 600 for section headings.
- Body weight: 400.
- UI controls: 500 or 600.
- Use `font-display: swap`.

Type scale:

| Use | Mobile | Desktop |
| --- | --- | --- |
| Page title | 32px / 38px | 44px / 52px |
| Section title | 24px / 32px | 32px / 40px |
| Card title | 16px / 24px | 18px / 28px |
| Body | 15px / 24px | 16px / 26px |
| Small UI | 13px / 20px | 14px / 22px |
| Table text | 13px / 20px | 14px / 22px |

Rules:

- Do not scale font size directly with viewport width.
- Letter spacing should remain `0`.
- Product names must wrap cleanly within cards.
- Prices should use tabular numbers where available.

## Spacing And Layout

Use an 8px spacing system.

Core container widths:

- Storefront content: max width 1280px.
- Admin content: max width 1440px.
- Reading-heavy settings pages: max width 960px.

Recommended spacing:

- Mobile page padding: 16px.
- Tablet page padding: 24px.
- Desktop page padding: 32px.
- Section gap storefront: 40px mobile, 64px desktop.
- Admin panel gap: 16px to 24px.
- Card padding: 16px mobile, 20px desktop.

Radius:

- Cards: 8px.
- Inputs and buttons: 8px.
- Badges: 999px only for pill metadata.
- Avoid oversized rounded cards unless a component specifically needs a softer pill shape.

## Component Principles

Use shadcn/ui where it gives accessible primitives and a consistent system.

Preferred shadcn usage:

- Button, Input, Label, Select, Checkbox, Radio Group, Switch.
- Dialog for modal content and confirmations.
- Sheet for mobile filters, cart summary, and admin secondary panels.
- Form patterns with React Hook Form and Zod when packages are approved in a later stage.
- Table primitives for admin data views.
- Toast or inline alert for operation feedback.

Icon rules:

- Use Lucide icons for UI controls.
- Do not use emojis as icons.
- Icon buttons need accessible names and visible focus states.
- Keep icon sizes consistent, usually 16px or 20px.

## Ecommerce UX Rules

- The first storefront screen should let users search or shop immediately.
- Product cards must show image, name, size/unit, price, stock state, and primary action.
- Show clear categories and popular South Asian grocery shortcuts.
- Keep add-to-cart reachable on mobile without layout shift.
- Avoid hiding critical price or delivery information behind hover states.
- Use skeleton loading for product grids and admin tables.
- Use helpful empty states with a recovery action.
- Use disabled states with clear reason text for out-of-stock products.
- Lazy load below-fold product images.
- Use responsive images with stable aspect ratios.

## Accessibility Rules

- Use semantic HTML landmarks: header, nav, main, section, aside, footer.
- Every form input must have a visible label.
- Placeholder text must not be the only label.
- Focus states must be visible.
- All interactive elements must be keyboard reachable.
- Product images require useful alt text.
- Decorative images should use empty alt text.
- Error messages must be programmatically associated with fields.
- Respect `prefers-reduced-motion` for animations.
- Tables need captions or clear headings where context is not obvious.

## Motion

Motion should be subtle and functional.

Use:

- 150ms to 250ms color and border transitions.
- Small opacity transitions for menus, sheets, and dialogs.
- Skeleton loading for async states.
- Reduced motion fallbacks.

Avoid:

- Scale hover effects that shift layout.
- Long animations over 500ms for routine commerce actions.
- Motion that delays checkout, add-to-cart, or admin workflows.

## Stage 13 Polish Decisions

Stage 13 keeps the original premium grocery direction and applies it consistently rather than introducing a new visual language.

- The storefront uses a restrained warm background, white commerce surfaces, black navigation, gold conversion actions, and green trust/stock signals.
- Header, filters, cart, checkout, account, and admin surfaces use visible focus outlines and stable hover states.
- Skeletons use a subtle shimmer and disable motion for users who prefer reduced motion.
- Toast feedback is small, local, and auto-dismissing so it confirms actions without blocking shopping.
- Mobile polish prioritizes no page-level horizontal overflow, readable headings, contained nav scrolling, and stacked card layouts.
- Admin polish remains operational and dense, with horizontal table scroll affordance instead of squeezing columns into unreadable layouts.

## Product Imagery

Product imagery must be the hero of the storefront.

Rules:

- Use consistent square or 4:5 product image frames.
- Use object-fit cover or contain based on product type.
- Avoid dark, blurred, or atmospheric images where shoppers need inspection.
- Use meaningful fallback artwork for missing products.
- Keep image upload validation strict in admin flows.

## Product Detail Interaction

Product detail pages should make variant selection and buying confidence obvious.

- Keep gallery and purchase controls high on the page.
- Use visible button groups for size/pack variants instead of hidden dropdown-only selection when there are few options.
- Update price, sale price, stock, SKU, and image immediately when the selected variant changes.
- Disable add-to-cart for out-of-stock variants and explain the stock state with text, not color alone.
- Keep wishlist and cart placeholders visually honest until persistence exists.
- Treat displayed price and stock as informational; cart and checkout must verify them server-side.

## Admin Media Management

Admin media tools should be operational and explicit.

- Group product media in one section on the edit page.
- Main image controls should support upload, replace, and remove.
- Gallery images should show stable thumbnails with replace and remove actions on each image.
- Variant/SKU images should live beside the saved SKU they represent, not only as a raw URL field.
- Use file inputs with visible labels, safe helper text, and keyboard-visible focus states.
- Preserve the optional variant image URL field for imported images or external fallback URLs.
