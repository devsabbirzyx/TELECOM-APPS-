---
name: OfferHut Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#003211'
  on-tertiary: '#ffffff'
  tertiary-container: '#004b1d'
  on-tertiary-container: '#44c365'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.25rem
---

## Brand & Style

This design system powers a high-trust telecom package marketplace tailored for the Bangladeshi mobile ecosystem. The aesthetic balances institutional reliability with high-velocity transactional clarity—fusing fintech rigor with consumer marketplace energy. 

### Core Attributes
- **Authoritative Trust:** Instills absolute confidence during wallet-level transactions, carrier airtime recharges, and SIM bundle acquisitions.
- **Action-Oriented Vitality:** Leverages energetic call-to-action treatments to highlight limited-time operator offers (Grameenphone, Banglalink, Robi, Airtel, Teletalk) without descending into promotional clutter.
- **Bilingual Typographic Harmony:** Built for seamless optical balance between English technical terms (GB, Validity, Voice Minutes, Cash-Back) and the Bengali currency unit (৳ Taka).

### Visual Movement
Modern Fintech influenced by Material Design 3. Visual hierarchy relies on crisp, elevated white cards floating over a soft slate foundation, generous touch ergonomics (48dp baseline), and deliberate edge radii that soften dense pricing grids into approachable micro-interactions.

## Colors

The palette establishes an immediate institutional anchor via deep cobalt blues, offset by high-visibility saffron-orange for high-conversion paths.

- **Primary (`#1E3A8A`):** Deep Trust Blue. Used for persistent navigation, primary headers, operator categorization tabs, selected states, and structural chrome.
- **Secondary / CTA (`#F97316`):** Vibrant Energetic Orange. Reserved strictly for conversion hotspots: "Recharge Now," "Buy Offer," flash sale tickers, and primary interactive badges.
- **Tertiary / Success (`#16A34A`):** Deep Emerald Green. Denotes cash-back confirmations, bundle savings multipliers, verification checkmarks, and active data bundle statuses.
- **Surface Foundations:**
  - App Canvas Baseline: `#F8FAFC` (Light Slate).
  - Component Cards & Sheets: `#FFFFFF` (Crisp White).
  - Outlines & Dividers: `#E2E8F0` (Crisp Light Border).
- **Text & Foreground Hierarchy:**
  - Primary Text: `#0F172A` (Slate 900) for uncompromised outdoor legibility.
  - Secondary Text: `#475569` (Slate 600) for bundle validity, quotas, and metadata.
  - Muted / Placeholder: `#94A3B8` (Slate 400).

## Typography

Plus Jakarta Sans provides geometric stability with humanized terminal apertures, ensuring numbers, quotas (e.g., "50 GB", "1000 Min"), and monetary figures remain legible at small scales.

### Numeric & Currency Formatting Rules
- **Taka Display (`৳`):** The Taka sign always inherits font weight directly from its associated price value. Do not introduce spacing between `৳` and numerical values (e.g., `৳499`).
- **Data & Pack Highlighting:** Numerical quantities within promotional badges must utilize `title-lg` or `label-lg` with tabular figures enabled to prevent layout jitter across fluctuating list contents.

## Layout & Spacing

The system implements an Android-first fluid 4-column grid on standard viewports (360dp–412dp widths, baseline target 390x844), scaling upward for foldable and tablet displays.

### Layout Mechanics
- **Canvas Margins:** Fixed `16dp` (`1rem`) outer canvas inset to shield content from curved hardware bezels and native OS gesture channels.
- **Column Structure:** 4 fluid columns with `16dp` gutters for single-view vertical feeds, reconfiguring to an 8-column split on large landscape screens.
- **Touch Target Safeguard:** All interactive touch elements conform strictly to the Android Material minimum of `48x48dp`. Visual container bounds may sit at 40dp or 36dp (such as filter chips), provided parent tap bounds expand to `48dp`.
- **Rhythm Rules:** Stacked feed items maintain a default vertical separation of `space-md` (12dp), while card-interior groupings utilize `space-sm` (8dp) to maintain atomic relationships.

## Elevation & Depth

Visual hierarchy uses ambient blue-tinted shadows over flat gray drops, keeping surfaces crisp and layered without heavy outlines.

### Elevation Levels
- **Level 0 (Flat / Canvas):** `#F8FAFC`. Unbacked base plane for background scrolling regions.
- **Level 1 (Resting Cards & Offer Tiles):** `#FFFFFF` surface combined with a dual-stage ambient drop:
  `box-shadow: 0 2px 8px -2px rgba(30, 58, 138, 0.06), 0 4px 16px -4px rgba(0, 0, 0, 0.05);`
  Reinforced with a hairline stroke: `border: 1px solid #E2E8F0`.
- **Level 2 (Active Sheets & Filter Panels):** Floating navigation bars, bottom sheets, and elevated filter pills:
  `box-shadow: 0 8px 24px -4px rgba(30, 58, 138, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04);`
- **Level 3 (Modals & Checkout Dialogs):** Confirmation overlays and carrier switch dialogs:
  `box-shadow: 0 20px 32px -8px rgba(15, 23, 42, 0.20);`

## Shapes

The design uses balanced, rounded geometry to soften data-dense package listings into readable, touch-friendly components.

- **Cards & Offer Modules:** Standardized at `16px` (`rounded-lg`) to create distinct visual grouping.
- **Interactive Controls (Inputs, Primary Buttons):** `16px` to match card corners and preserve visual harmony across forms.
- **Micro Tags & Carrier Indicators:** `8px` (`rounded-sm` / soft standard) to maintain structure at small scales.
- **Action Chips & Pill Filters:** Fully rounded (`9999px`) for horizontal scrolling categories and toggle groups.

## Components

### Buttons
- **Primary Action (CTA):** `#F97316` background, `#FFFFFF` text, `16px` border-radius, minimum height of `48px`, font weight `700`. Subtle active state scale reduction (0.98) on mobile tap.
- **Secondary / Carrier Action:** `#1E3A8A` background with white text, used for primary navigation points and account verification.
- **Outlined Utility:** Crisp `#E2E8F0` border, transparent background, `#1E3A8A` text, used for secondary actions like "View Breakdown."

### Offer Card (Core Marketplace Module)
- Elevated white surface (`#FFFFFF`) with 16px radius and Level 1 blue-tinted shadow.
- Top section houses operator logo (e.g., GP, Banglalink, Robi) beside a badge showing total validity (e.g., "30 Days").
- Central content displays data/voice allowances using `headline-md` (`24px` bold) alongside validity and cash-back badges (`#16A34A` background tint at 10% with solid green label).
- Bottom panel features a price display (`৳` formatted) paired with a full-width or contextual secondary-accent purchase button.

### Input Fields & Search Bars
- Background `#FFFFFF` with `#E2E8F0` border, `16px` radius, `48px` minimum height, and `16px` horizontal padding.
- Focused state applies a `2px` ring using `#1E3A8A`.
- Phone number input features a fixed `+880` prefix locked in `body-md` bold slate text.

### Chips & Filter Tabs
- Operator selection and bundle type filters (Internet, Combo, Voice, Unlimited) use `36px` height containers with pill geometry (`9999px`) inside `48px` touch wrappers.
- Inactive: `#FFFFFF` fill with `#E2E8F0` border and `#475569` text.
- Active: `#1E3A8A` fill with `#FFFFFF` text and zero border.

### Checkboxes & Radio Controls
- Radio selectors for payment routes (bKash, Nagad, Card) use a concentric circle format: `20px` diameter with an active `#1E3A8A` fill and white inner dot.
- Checkboxes use `16px` border-radius (`4px` corner) with `#16A34A` fill when validating terms or add-on packages.

### Lists & Transaction Rows
- Dividers are styled as hairline rules (`#E2E8F0`) inset by `16dp` to align with the text edge.
- Right-aligned values display prices in bold Slate 900, accompanied by a timestamp or status indicator in Slate 400.