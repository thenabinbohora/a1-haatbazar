# A1 Haat Bazar — AI Asset Generation Brief

Prompts for generating a distinctive visual asset library with **Nano Banana Pro** (Google Gemini image gen) or **GPT Images** (`gpt-image-1`), tailored to this codebase's actual branding, layout, and component structure — not generic grocery-app stock art.

## 1. What the app already has (audit)

- **Brand:** A1 Haat Bazar — Nepali & Asian grocery store, Salisbury/Adelaide, South Australia ([src/lib/constants.ts](../src/lib/constants.ts), [src/app/layout.tsx](../src/app/layout.tsx)).
- **Existing files:** `public/brand/LogoHorizontalTrimmed.png` (2294×414, ~5.54:1 horizontal lockup), `public/brand/a1-haat-bazar-favicon.ico` / `.png`, `public/brand/a1-pantry-hero.webp` (homepage hero photo), `public/brand/a1-fresh-vegetables.webp` (produce banner photo), plus real product/category photography in `public/product-images/`.
- **Color tokens** ([src/app/globals.css](../src/app/globals.css)): `--color-background:#FAF8F1`, `--color-hero:#FBF4E3`, `--color-surface-muted:#F4F1E8`, `--color-border:#E7E0D3`, `--color-primary:#174A27`, `--color-primary-muted:#0F2E1A`, `--color-cta:#C6922E` (gold), `--color-cta-soft:#F6E7BD`, `--color-cta-hover:#8F641A`, `--color-fresh:#2E6B3C`, `--color-fresh-soft:#EEF7EF`, `--color-text:#111111`.
- **Type:** Plus Jakarta Sans (display/headings, 700–800 weight) + Inter (body).
- **Layout facts that matter for sizing:** header/footer logo renders at `h-10 w-[220px]`→`h-11 w-[244px]` desktop and `h-[30px] w-[166px]`→`h-10 w-[222px]` light variant ([src/components/brand/brand-logo.tsx](../src/components/brand/brand-logo.tsx)); icon mark is a 512×512 image shown as a `40–44px` circle inside a gold ring; product cards and category cards both use `aspect-[4/3]` image wells ([src/components/product/product-card.tsx](../src/components/product/product-card.tsx), [src/app/page.tsx](../src/app/page.tsx)); the current no-photo fallback ([src/components/brand/product-image-placeholder.tsx](../src/components/brand/product-image-placeholder.tsx)) is a soft cream/mint blob gradient with initials — deliberately quiet, not illustrated.
- **Design system rule to respect** ([DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)): *"Product imagery must be the hero of the storefront"* and *"avoid decorative gradients that obscure product photography"* and *"no emoji icons."* Real product photos stay the star — the new art direction below is for the framing around them (icons, states, marketing surfaces), not a replacement for product photos.

## 2. The art direction: "Modern Haat Folk"

One distinctive, justified style — not generic flat-vector grocery clipart, not stock photography:

**Flat-vector illustration with a hand-pulled gouache/screenprint texture, drawing on Nepali Mithila (Janakpur) folk-art linework and terraced-hillside geometry, restrained to the app's existing cream/forest-green/gold palette.**

Why this and not something generic:
- "Haat" literally means open-air market in Nepali — the brand name already invites a market/folk-craft visual language instead of a bland "flat vector grocery" look every storefront uses.
- Mithila art gives a *recognizable, ownable line quality*: bold uniform outlines, dot-and-dash fill patterns, symmetric framing — distinct from generic rounded blob illustration.
- Terraced rice-paddy silhouettes double as a shape motif for "freshness" without leaning on the overused single leaf/basket icon cliché.
- It stays print-poster/signage flavored (like real market signage), which fits "premium but practical" better than glassy 3D render or cutesy mascot styles.
- Everything is locked to the *existing* hex values so generated assets drop into the current cream/green/gold UI without a re-theme.

Shared style vocabulary to repeat in every prompt below:
- Flat vector shapes, uniform 3–4px-equivalent outline weight, no photorealism, no 3D render, no drop shadows except the soft ones already in the CSS (`rgba(15,46,26,0.08–0.28)`).
- Palette locked to: cream `#FAF8F1`/`#FBF4E3`, forest green `#174A27` and `#0F2E1A`, gold `#C6922E` and `#8F641A`, mint-green `#2E6B3C`/`#EEF7EF`, near-black `#111111` linework. Prayer-flag colors (small red/blue accents) allowed only as tiny pennant details in banners, never dominant.
- Subtle paper-grain / fine halftone texture overlay at low opacity — gives the "hand-pulled print" warmth instead of a flat corporate-clipart finish.
- No emoji-style icons, no glassmorphism, no busy ornamentation that competes with real product photography.
- Typography inside generated images (when present) should look like a bold geometric sans (visually close to Plus Jakarta Sans Extrabold/Black) — clean, chunky, high-legibility, not script or condensed fonts.

## 3. Tool selection logic

| Use Nano Banana Pro when... | Use GPT Images when... |
| --- | --- |
| The asset must match an *existing* brand file closely (logo, favicon, icon set) — it's strongest at staying on-model across a batch and at precise, legible in-image text. | The asset is a fully generative illustrated *scene* (hero backdrop, empty-state character art, promo banner composition) where painterly texture and creative scene-building matter more than exact reproduction. |
| You can feed a reference image (the real logo, an existing icon) and ask for a faithful style-matched variant. | You need a seamless/tileable texture or pattern — GPT Images handles pattern-repeat and organic paper-grain texture generation well. |
| Small-size legibility is critical (favicon at 16px, icon set that must read identically at 40px and 64px). | You want broader stylistic range per prompt without a reference anchor. |

Across both tools: generate the **master resolution** first, then downscale for smaller viewport variants (never upscale a small generation) — the resolution tables below give the master to request and the derived sizes to export.

---

## 4. Asset prompts

### 4.1 Favicon & app icon mark

**Where it's used:** `BRAND_FAVICON_SRC` / `BRAND_ICON_SRC` in [src/app/layout.tsx](../src/app/layout.tsx) `icons` metadata, and the circular `mark` in [brand-logo.tsx](../src/components/brand/brand-logo.tsx) (shown at 40–44px inside a gold ring).

**Tool:** Nano Banana Pro — needs to stay legible at 16px, and should be generated *with the existing `a1-haat-bazar-favicon.png` supplied as a reference image* so the new mark is a refinement, not a random redesign.

**Prompt:**
> Flat vector app icon mark for "A1 Haat Bazar," a Nepali and Asian grocery store. Modern Haat Folk style: bold uniform black-green outline (#0F2E1A), flat fill, no gradients, no photorealism, no drop shadow. Composition: a simplified terraced rice-paddy hillside forming the base, with a single stylized woven market basket sitting on the top terrace, silhouette reading clearly as one solid shape at very small sizes. Palette strictly: forest green #174A27 fill, cream #FBF4E3 background circle, gold #C6922E outline ring, single mint-green #2E6B3C accent stripe on one terrace line. Centered inside a perfect circle with even padding on all sides so it survives cropping into a 16px favicon. No text, no lettering, no emoji style, no 3D bevel. Subtle flat paper-grain texture at very low opacity only, must not reduce contrast or legibility at small sizes.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Master generation | 1024×1024 | 1:1 | Request the master here; downscale for everything else |
| Favicon `.ico` (multi-size) | 16×16, 32×32, 48×48 | 1:1 | Bundle into one `.ico`, matches `sizes="any"` icon entry |
| PNG icon (current `a1-haat-bazar-favicon.png` role) | 512×512 | 1:1 | Matches existing `sizes="512x512"` metadata entry |
| Apple touch icon | 180×180 | 1:1 | iOS home-screen size |
| Header/footer circular mark | 96×96 (@2x of 48px display) | 1:1 | Covers the 40–44px on-screen ring at retina |
| Android maskable icon (optional PWA) | 512×512 with ~20% safe-zone padding | 1:1 | Only needed if a manifest is added later |

---

### 4.2 Wordmark / logo lockup refresh

**Where it's used:** `BRAND_LOGO_SRC`, rendered as `fullLogo` in [brand-logo.tsx](../src/components/brand/brand-logo.tsx) — light variant on cream header/footer background at `h-[30px]–h-11`, dark variant inside a white pill on the dark green footer.

**Tool:** Nano Banana Pro, fed the current `LogoHorizontalTrimmed.png` as a reference — wordmark legibility and exact letterform reproduction across two color variants is a precision task, not a creative-scene task.

**Prompt:**
> Horizontal logo lockup for "A1 Haat Bazar." Bold geometric sans-serif wordmark (visual weight like Plus Jakarta Sans Extrabold/Black, tall x-height, tight letter-spacing, no script or condensed styles), paired to the left with a small square Modern Haat Folk icon mark (terraced hillside + market basket, matching the favicon mark). Two required color variants in one export set: (1) Light variant — forest green #174A27 wordmark and icon fill, transparent background, for use on a cream #FAF8F1 header; (2) Dark variant — cream #FBF4E3 wordmark and gold #C6922E icon fill, transparent background, for use on a deep green #0F2E1A footer. No taglines, no drop shadows, no outline strokes around the whole lockup, generous horizontal breathing room left and right for cropping. Flat vector, no gradients, no photorealism.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Master (both variants) | 2400×432 | ~5.56:1 | Matches current 2294×414 file ratio |
| Header desktop (light) | 488×88 (@2x of `w-244 h-44`) | 5.55:1 | Retina-safe for the `sm:h-11 sm:w-[244px]` render size |
| Header mobile (light) | 444×60 (@2x of `w-222 h-30`) | ~7.4:1 crop-safe / use master ratio | Export from the same master, don't regenerate |
| Footer (dark, inside white pill) | 488×88 | 5.55:1 | Matches `h-11 w-[244px]` dark-variant render |
| Square icon-only crop (mark) | 512×512 | 1:1 | Reuse the icon portion for favicon/app-icon consistency |

---

### 4.3 OG / social share image

**Where it's used:** `openGraph.images` / `twitter.images` in [src/app/layout.tsx](../src/app/layout.tsx), currently pointing at the plain logo file — this replaces that with a purpose-built share card.

**Tool:** Nano Banana Pro — accurate, crisp in-image text rendering ("A1 Haat Bazar" + tagline) is the deciding factor; this is the one asset where legible typography inside the image is non-negotiable.

**Prompt:**
> Social share card, Modern Haat Folk illustration style, flat vector with subtle paper-grain texture. Background: warm cream #FBF4E3 fading to #FAF8F1, with a low-opacity terraced-hillside silhouette pattern running along the bottom edge in forest green #174A27 at 12% opacity. Center-left composition: bold wordmark "A1 HAAT BAZAR" in a chunky geometric sans (Plus Jakarta Sans Extrabold weight) in forest green #174A27, with the tagline "Authentic Nepali & Asian Groceries · Salisbury, Adelaide" beneath it in a smaller gold #8F641A weight. Right third of the frame: a flat-illustrated still-life cluster of grocery silhouettes — rice sack, spice jar, tea cup, momo basket, chili — in forest green and gold flat fills with thin cream outlines, arranged like a folk-art market stall display, no photorealism. One thin gold #C6922E rule line separates the text zone from the illustration zone. Generous safe margin (at least 8% of width) on all sides so no text is cropped by platform overlays.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Master / primary OG (`og:image`) | 1200×630 | 1.91:1 | Standard Open Graph size used by Facebook/LinkedIn/Slack |
| Twitter large card | 1200×630 | 1.91:1 | Same file, `twitter:card=summary_large_image` |
| Square variant (WhatsApp/iMessage link preview) | 1200×1200 | 1:1 | Reflow illustration to fill square, don't just crop the wide version |
| Retina/App export | 2400×1260 | 1.91:1 | Downscale for the actual `<meta>` tag; keep master for future reuse |

---

### 4.4 Homepage hero decorative backdrop

**Where it's used:** the cream `bg-hero` band wrapping the H1/search hero (real photo stays in `HeroVisual` per the design-system rule) — this is a low-opacity pattern layer for the cream background itself, and for the mobile-only image treatment container in [src/app/page.tsx](../src/app/page.tsx:565-653).

**Tool:** GPT Images — this is a generative textured backdrop, not a brand-precision asset, and GPT Images handles large atmospheric illustrated scenes with soft texture well.

**Prompt:**
> Wide decorative background illustration, Modern Haat Folk style, flat vector with gouache paper-grain texture. A gently rolling terraced hillside skyline silhouette along the bottom third, forest green #174A27 terraces on a warm cream #FBF4E3 sky that fades to #FAF8F1 at the top. Scattered small flat-illustrated grocery motifs floating above the terraces at low opacity (18-25%): a rice stalk, a spice pod, a tea leaf, a chili — forest green and gold #C6922E linework only, no fill detail, evenly spaced, never clustered in the center where headline text sits. No people, no photorealistic elements, no busy detail in the middle third of the frame (that area must stay clean for the site's search bar and heading to sit on top). Soft, calm, daylight mood — not nighttime, not moody.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Desktop master | 1920×640 | 3:1 | Behind the `lg:grid-cols-[1.05fr_0.95fr]` hero band |
| Tablet | 1536×512 | 3:1 | Same crop ratio, scaled down |
| Mobile (the `sm:hidden` image strip container) | 750×280 | ~2.68:1 | Matches the mobile-only `h-24`→`sm:hidden` hero strip proportions |
| Retina desktop | 2880×960 | 3:1 | @1.5x for large monitors |

---

### 4.5 Category icon badge set (10 categories)

**Where it's used:** currently the mobile quick-category pills in the hero are plain text ([src/app/page.tsx](../src/app/page.tsx:599-611)); this set gives them (and any future category nav) a small icon. Categories present in the demo catalog: Rice, Lentils & Dal, Spices, Pickles, Noodles, Frozen, Snacks, Oils & Ghee, Hot Beverages/Tea, Vegetables ([public/product-images](../public/product-images) filenames confirm these ten).

**Tool:** Nano Banana Pro — a 10-icon set must stay perfectly consistent in stroke weight, palette, and framing; generate one, then request the rest "in the same style" against that reference for batch consistency.

**Prompt (repeat per category, swapping the bracketed subject and keeping everything else identical):**
> Single flat vector category icon, Modern Haat Folk style, for "[Rice / Lentils & Dal / Spices / Pickles / Noodles / Frozen / Snacks / Oils & Ghee / Hot Beverages / Vegetables]." Bold uniform 3px-equivalent outline in forest green #174A27, flat fill in gold #C6922E or fresh green #2E6B3C (pick whichever reads clearer for the subject), set on a solid cream #F4F1E8 circular badge background. Subject depicted as a single simplified silhouette object central to the category ([Rice: a filled woven sack with grain spilling], [Lentils & Dal: a round bowl with a dal-spoon], [Spices: a small spice jar with a pinch of powder above it], [Pickles: a jar with a wavy lid], [Noodles: a coiled noodle nest in a bowl], [Frozen: a snowflake behind a momo/dumpling], [Snacks: a folded packet with one chip peeking out], [Oils & Ghee: a rounded oil bottle with a pour drop], [Hot Beverages: a steaming cup with a curl of steam], [Vegetables: a cluster of two simplified vegetables]). No text, no photorealism, no gradient, one consistent light source implied only through flat shading blocks, not soft shadow. Must read clearly as a silhouette at 40px.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Master (each of the 10) | 512×512 | 1:1 | One generation per category |
| Mobile quick-category pill icon | 40×40 (@2x of 20px) | 1:1 | Fits inside existing pill left of label text |
| Desktop category nav icon (future use) | 64×64 (@2x of 32px) | 1:1 | If promoted to a persistent nav |
| Sprite sheet (optional bundling) | 2560×1024 (5×2 grid of 512px tiles) | 5:2 | Convenient single export if the tool batches a grid |

---

### 4.6 Product placeholder illustration set (no-photo fallback)

**Where it's used:** replaces/extends [product-image-placeholder.tsx](../src/components/brand/product-image-placeholder.tsx), shown inside `aspect-[4/3]` wells on product cards and category cards whenever `imageUrl` is null.

**Tool:** Nano Banana Pro, using the current placeholder component's cream/mint blob composition as a style reference — this asset must *extend* an existing pattern rather than introduce a clashing new one.

**Prompt (repeat per department: Produce, Pantry & Dry Goods, Frozen, Beverages):**
> Flat vector product-placeholder illustration for the "[Produce / Pantry & Dry Goods / Frozen / Beverages]" department of a grocery storefront, Modern Haat Folk style. Background: soft diagonal gradient from white to cream #FAF8F1 to mint #EEF7EF (matching an existing placeholder gradient), with two or three softly rounded organic blob shapes in low-opacity forest-green #174A27 and gold #C6922E tucked into the corners, echoing existing decorative circles. Center: one simple flat-outline illustrated object representing the department ([Produce: a leafy vegetable bundle], [Pantry & Dry Goods: a stacked rice sack and spice jar], [Frozen: a snowflake-bordered momo tray], [Beverages: a teapot and cup]), forest-green outline, no fill detail beyond one or two flat color blocks, centered with generous padding since product name text overlays below it. Calm, quiet, must not compete visually with real product photography elsewhere on the page — this is a background/fallback graphic, not a hero image.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Master (each of the 4 departments) | 1600×1200 | 4:3 | Matches `aspect-[4/3]` card image well exactly |
| Mobile product card | 340×255 | 4:3 | ~50vw card width at common mobile viewport |
| Desktop grid card (@2x) | 800×600 | 4:3 | Covers `33vw`/`25vw` card slots at retina |
| Compact variant (cart/mini rows) | 480×360 | 4:3 | For the `compact` product-card variant |

---

### 4.7 Empty-state illustration set (cart, wishlist, search, orders)

**Where it's used:** empty states across `/cart`, `/wishlist`, `/search`, `/account/orders` — currently text-only recovery states; add one consistent illustrated motif across all four so the empty states feel designed, not default.

**Tool:** GPT Images — these are small narrative illustrations (a scene/mood), better suited to generative scene composition than to brand-matching precision.

**Prompt (repeat per state, swapping the bracketed detail):**
> Small flat vector empty-state illustration, Modern Haat Folk style, for a grocery storefront's "[empty cart / empty wishlist / no search results / no orders yet]" state. A single simplified woven market basket (the brand's recurring basket motif) sits center frame, [empty cart: shown open and empty with one small dotted motion-line suggesting it's ready to be filled], [empty wishlist: shown with a small outlined heart floating just above it, unfilled], [no search results: shown with a small magnifying glass resting beside it, tipped over], [no orders yet: shown with a small folded receipt tucked beside it, blank]. Flat forest-green #174A27 outline, cream #FBF4E3 basket fill, one gold #C6922E accent detail. Plenty of negative space around the subject (at least 30% margin) since page copy and a call-to-action button sit below it. No people, no photorealism, warm and optimistic mood, not sad or apologetic.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Master (each of the 4 states) | 900×900 | 1:1 | Simple centered subject, easy to crop down |
| Mobile | 240×240 (@2x of 120px) | 1:1 | Sits above empty-state heading, centered |
| Desktop | 320×320 (@2x of 160px) | 1:1 | Slightly larger on wider empty-state layouts |

---

### 4.8 404 / error page illustration

**Where it's used:** [src/app/not-found.tsx](../src/app/not-found.tsx) and [src/app/error.tsx](../src/app/error.tsx), currently plain text with two CTA buttons.

**Tool:** GPT Images — narrative scene illustration, no brand-matching precision required beyond the shared palette.

**Prompt:**
> Flat vector illustration, Modern Haat Folk style, for a grocery site's 404/error page. A simplified market stall/haat awning shown slightly askew or with one support pole missing, suggesting "this stall isn't here right now" — playful but not chaotic. A small woven basket sits empty on the stall counter. Forest-green #174A27 and gold #C6922E outlines on a cream #FBF4E3 background with a very faint terraced-hillside line in the far background at 10% opacity. Centered composition with wide margins on all sides (this sits above a heading, a description paragraph, and two buttons, so the illustration itself must stay compact and not overpower the text). Warm, reassuring, slightly whimsical mood — never alarming or broken-looking.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Master | 1000×750 | 4:3 | Compact hero above the existing centered text block |
| Mobile | 320×240 | 4:3 | Matches the `max-w-2xl` centered mobile layout |
| Desktop | 480×360 (@2x) | 4:3 | Sits comfortably above `text-4xl` heading |

---

### 4.9 Loading / processing brand mark

**Where it's used:** complements the existing CSS `skeleton-shimmer` (which stays for grid skeletons); this is a small looping mark for one-off blocking waits — e.g. checkout order submission, wishlist toggle in flight — where a shimmer skeleton doesn't fit.

**Tool:** GPT Images for the illustrated frame art; the animation itself should be implemented as a CSS-rotated single SVG-friendly PNG rather than a real animated sprite (keeps it lightweight and respects the existing `prefers-reduced-motion` handling in [globals.css](../src/app/globals.css:483-506)).

**Prompt:**
> Single flat vector loading-mark icon, Modern Haat Folk style, designed to be CSS-rotated for a loading spinner. A simplified circular arrangement of one rice stalk, one tea leaf, one chili, and one spice pod, arranged like spokes around a center point, in forest-green #174A27 and gold #C6922E flat fills on a transparent background. Perfectly radially symmetric (4-fold rotational symmetry) so a CSS rotation animation reads smoothly with no visual "jump," equal visual weight on all four spokes, no drop shadow, no outer ring. Compact and simple enough to read clearly at 32px.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Master | 512×512 | 1:1 | Single static mark, transparent background |
| Inline UI spinner | 32×32 (@2x of 16px) | 1:1 | Small inline button-loading state |
| Modal/blocking overlay spinner | 96×96 (@2x of 48px) | 1:1 | Checkout submission overlay |

---

### 4.10 Testimonial / customer avatar placeholders

**Where it's used:** no testimonial section exists yet in this codebase — this is a forward-looking set for a possible future "customer voices" section near `TrustSection` on the homepage ([src/app/page.tsx](../src/app/page.tsx:459-546)). Flagging as prep, not a current gap.

**Tool:** Nano Banana Pro — a set of avatars needs tight stylistic consistency (same linework, same crop, same palette) across every face, which favors its batch-consistency strength.

**Prompt (repeat 6 times with varied simple descriptors, e.g. "older woman," "young man," "middle-aged woman," "young woman," "older man," "middle-aged man" — vary hair/head-covering only, keep everything else identical):**
> Flat vector avatar illustration of a [descriptor] customer, Modern Haat Folk style, head-and-shoulders crop inside a perfect circle. Simplified, warm, friendly facial illustration using only flat color blocks (skin tone, hair, one clothing color) with thin forest-green #174A27 outlines, no photorealism, no gradients, no fine facial detail (keep it iconographic, not portrait-realistic). Background inside the circle: solid cream #F4F1E8. One small optional accent detail is allowed (e.g. a simple patterned scarf or collar in gold #C6922E) to add warmth without adding visual noise. Consistent proportions and crop across the whole set so avatars align in a row.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Master (each of 6) | 512×512 | 1:1 | Circular crop applied in CSS, not baked into the file |
| Mobile testimonial card | 96×96 (@2x of 48px) | 1:1 | |
| Desktop testimonial card | 128×128 (@2x of 64px) | 1:1 | |

---

### 4.11 Promo / weekly-offer campaign banner

**Where it's used:** the `HOME_STRIP` banner placement rendered in [src/app/page.tsx](../src/app/page.tsx:674-685) (`stripBanner`) and the `WeeklyOffersCarousel` section — both are admin-manageable via the `Banner` model, so this is a *template* the admin can regenerate seasonally (e.g. a Dashain/Tihar variant), not a one-off static file.

**Tool:** GPT Images — a full illustrated marketing scene benefits from its broader compositional range; regenerate per season by swapping the bracketed festival/seasonal cue.

**Prompt:**
> Wide promotional banner illustration, Modern Haat Folk style, flat vector with gouache texture, for "[Weekly Offers / Dashain Festival Specials / Tihar Festival Specials]" at a Nepali and Asian grocery store. Left two-thirds: bold flat-illustrated arrangement of grocery goods relevant to the moment — [general weekly offers: rice sack, spice jars, tea cups, a momo basket] / [Dashain: a rice-and-tika ceremonial tray plus market goods] / [Tihar: small oil lamps (diyas) plus market goods] — arranged like a folk-art market stall spread, forest-green #174A27 and gold #C6922E flat fills with cream #FBF4E3 outlines. Right third: clean open cream negative space reserved for a headline and CTA button to be added by the site later — leave this area free of illustration detail. A single thin gold #C6922E rule line separates the two zones. Tiny prayer-flag-colored pennant string (small red, blue, yellow, green triangles) strung along the very top edge only, as a small cultural accent, not dominant. Warm, celebratory, high energy but uncluttered.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Desktop strip banner | 1600×420 | ~3.8:1 | Matches the wide `rounded-lg` strip banner section |
| Tablet | 1200×420 | ~2.86:1 | Recompose slightly tighter, don't just crop |
| Mobile (stacked layout) | 750×560 | ~4:3 | Illustration and text stack vertically on small screens |
| Retina desktop | 2400×630 | ~3.8:1 | @1.5x export |

---

### 4.12 Repeatable background texture / pattern tile

**Where it's used:** a subtle seamless tile to sit behind the `a1-admin-page-header` gradient band, the `bg-hero` cream section, or as a section-divider texture — a lightweight, reusable asset rather than a one-off scene.

**Tool:** GPT Images — seamless/tileable pattern generation with organic paper-grain texture is a strength for scene/texture models over precision-matching models.

**Prompt:**
> Seamless, tileable background pattern, Modern Haat Folk style. Fine paper-grain gouache texture in warm cream #FBF4E3, overlaid with a very sparse, evenly repeating line-art motif at 8-12% opacity: tiny terraced-hillside contour lines alternating with small dot-and-dash Mithila-style fill patterns, drawn in forest-green #174A27. No large shapes, no focal point, must tile edge-to-edge with no visible seam. Extremely subtle — this sits behind UI content and text, contrast must stay low enough that black body text remains fully readable on top of it.

**Resolution / aspect ratio by viewport:**

| Output | Size | Aspect | Notes |
| --- | --- | --- | --- |
| Master tile | 1024×1024 | 1:1 | Must be seamless/tileable |
| Retina tile | 2048×2048 | 1:1 | @2x for high-density displays without visible tiling seams |
| Wide pre-composited strip (optional, for a fixed-height header band) | 1920×240 | 8:1 | Pre-tiled once if you'd rather not rely on CSS `background-repeat` |

---

## 5. Production notes

- **File formats:** export photographic/textured assets (hero backdrop, promo banner, background tile) as `.webp` to match the existing `public/brand/*.webp` convention; export icons/logo/favicon as `.png` with transparency (plus a bundled multi-size `.ico` for the favicon) to match `public/brand/*.png`/`.ico`.
- **Naming convention:** follow the existing `a1-<subject>.<ext>` pattern seen in `public/brand/` (e.g. `a1-category-rice.png`, `a1-empty-cart.png`, `a1-og-share.webp`) so new assets sort predictably next to current files.
- **Consistency technique:** generate section 4.1 (favicon/icon mark) first, then pass it back in as a reference image for 4.2, 4.5, 4.6, 4.9, and 4.10 — every asset that shares the basket/terrace motif should visibly come from the same "hand," not five unrelated generations.
- **Do not regenerate per breakpoint:** every resolution table above is one master generation downscaled/cropped per viewport, not five separate prompts — re-prompting per size is how illustrated sets drift out of consistency.
