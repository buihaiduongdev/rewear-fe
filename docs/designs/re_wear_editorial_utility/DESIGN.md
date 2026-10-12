---
name: RE/WEAR Editorial & Utility
colors:
  surface: '#f9f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f9f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f5'
  surface-container: '#edeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e4'
  on-surface: '#1a1c1d'
  on-surface-variant: '#434934'
  inverse-surface: '#2f3132'
  inverse-on-surface: '#f0f0f2'
  outline: '#747a62'
  outline-variant: '#c4c9ae'
  surface-tint: '#4d6700'
  primary: '#4d6700'
  on-primary: '#ffffff'
  primary-container: '#c3f832'
  on-primary-container: '#547000'
  inverse-primary: '#a5d700'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#585f6c'
  on-tertiary: '#ffffff'
  tertiary-container: '#dfe6f6'
  on-tertiary-container: '#606774'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0f42e'
  primary-fixed-dim: '#a5d700'
  on-primary-fixed: '#151f00'
  on-primary-fixed-variant: '#3a4d00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#dce2f3'
  tertiary-fixed-dim: '#c0c7d6'
  on-tertiary-fixed: '#151c27'
  on-tertiary-fixed-variant: '#404754'
  background: '#f9f9fb'
  on-background: '#1a1c1d'
  surface-variant: '#e2e2e4'
typography:
  display-hero:
    fontFamily: DM Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: DM Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: DM Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  data-mono:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system bridges the curated tactile elegance of an independent luxury fashion house with the operational clarity of a precision inventory terminal. Designed for circular fashion enthusiasts, archival curators, and conscious consumers, it reframes second-hand commerce as an intentional, high-taste ritual rather than a thrift clearance.

The visual signature relies on a dual aesthetic cadence:
1. **Editorial Storefront:** Generous white space, architectural structural lines, gallery-ratio product imagery, and decisive typographic hierarchy that treats pre-owned garments like museum inventory.
2. **High-Density Utility (Seller Dashboard & Logistics):** Compact metadata matrices, scannable condition grading rubrics, and high-contrast status feedback optimized for rapid item staging, verification, and transaction tracking.

The resulting tone is sharp, modern, and disciplined. A distinct electric lime signature injects an energetic, contemporary pulse into an otherwise monochromatic, high-contrast canvas.

## Colors

The palette employs strict functional stratification: an uncompromising monochrome foundation complemented by a high-visibility kinetic accent.

### Color Roles & Semantics
- **Primary Accent (`#C3F832`):** A sharp, electric lime engineered for high-intent focal points: primary checkout actions, verification badges, live drop indicators, and active navigational pills. Whenever applied as a fill, foreground typography strictly defaults to Solid Black (`#000000` or `#111111`) to guarantee AAA accessible legibility.
- **Secondary Tone (`#111111`):** Deep charcoal/ink black. Governs primary headlines, critical structural borders, key interactive icons, and solid invert buttons.
- **Tertiary Tone (`#6B7280`):** Neutralized mid-tone slate used for secondary product specs (materials, measurements, seller location), disabled states, and metadata labels.
- **Neutral Base Canvas (`#FFFFFF` and `#F9F9FB`):** Primary editorial background is `#FFFFFF`, while utility surfaces, data-grid rows, and filtration sidebars utilize `#F9F9FB` to establish soft structural zoning without heavy shadow planes.
- **Structural Dividing Lines (`#EEEEEE` and `#E5E7EB`):** Crisp hairline rules that cleanly demarcate functional cells and editorial bounds.

### Condition Tonal Coding
Garment grading tags utilize distinct monochromatic micro-containers with tonal typography to preserve editorial restraint:
- **Pristine / New With Tags:** Black fill (`#111111`) with Crisp White (`#FFFFFF`) text and an optional `#C3F832` micro-dot.
- **Excellent:** Crisp White fill with `#111111` 1px border and text.
- **Very Good:** Muted background (`#F4F4F6`) with dark slate text (`#1F2937`).
- **Good (Minor Wear):** Subdued canvas (`#F4F4F6`) with warm neutral text (`#4B5563`) and subtle amber hairline detail (`#F59E0B`) in dashboard views.

## Typography

The type system is powered by **DM Sans**, delivering sharp geometry, tight aperture, and contemporary warmth without eccentricities that would distract from curated imagery. 

### Typographic Rules
- **Headline Rendering:** All display and section headlines use tight letter-spacing (`-0.02em` to `-0.03em`) and condensed leading to produce an authoritative editorial magazine presence.
- **Label Capitalization:** Technical labels, product IDs, condition indicators, and garment dimensions utilize `label-sm` or `data-mono` set in uppercase with deliberate tracking (`0.04em`) to establish visual separation against descriptive body copy.
- **Utility Data:** `data-mono` (fallback system monospace or Space Mono) is reserved strictly for tracking numbers, consignment ledger codes, and authentication hash identifiers.

## Layout & Spacing

The layout model adapts between dual runtime environments:
- **Storefront View:** A 12-column responsive fluid grid with wide gutters (`2rem`) and generous section margins (`margin-lg: 3rem`) creating airy breathing space around garment photography (3:4 portrait ratios).
- **Utility Dashboard:** An asymmetrical 12-column or fixed-sidebar layout (260px fixed navigation + flexible data container) prioritizing high vertical density, 8px/16px cell increments, and synchronized row alignment.

### Responsive Breakpoints & Reflow
- **Desktop (≥ 1280px):** 12 columns, `margin-lg` outer gutter, product grids render 4 columns.
- **Tablet (768px – 1279px):** 8 columns, `margin-md` outer gutter, product grids compress to 2 or 3 columns, dashboards convert sub-tables into modular vertical cards.
- **Mobile (< 768px):** 4 columns, `margin` (1rem), product lists reflow into a clean 2-column or high-impact single-column vertical stream; utility controls collapse into sticky floating dock sheets.

## Elevation & Depth

This design system avoids blurry drop shadows, embracing **crisp architectural layering** and **low-contrast tactile outlines**.

### Depth Layers
- **Surface Canvas (Layer 0):** Pure `#FFFFFF` in storefront mode; `#F9F9FB` in utility views.
- **Elevated Cards & Containers (Layer 1):** `#FFFFFF` bordered with a crisp `1px solid #EEEEEE` rule. Depth is achieved via contrast against the soft canvas rather than diffuse shadows.
- **Floating Modals & Flyouts (Layer 2):** Pure `#FFFFFF` bordered with `1px solid #111111` or `#E5E7EB`, paired with a structured, ultra-crisp offset shadow: `0 4px 12px rgba(0, 0, 0, 0.05)`.
- **Active State Highlights:** Border color dynamically shifts from `#EEEEEE` to Solid Black (`#111111`) or Electric Lime (`#C3F832`), avoiding blurry halos.

## Shapes

The interface balances sharp editorial boundaries with soft internal touchpoints. Setting `roundedness: 2` establishes an 8px base radius (`rounded-md`), scaling to 12px (`rounded-lg`) for primary cards and 16px (`rounded-xl`) for elevated modals. 

Tags, pills, and dynamic filter controls break from the standard geometry into full pill geometries (`9999px`) to create an immediate structural distinction between transactional surfaces and metadata tags.

## Components

### Buttons
- **Primary CTA:** Solid Electric Lime (`#C3F832`) background, crisp `#000000` text, 48px height, `rounded-lg` (12px), `label-lg` weight. Hover induces subtle darkening to `#B8F228`.
- **Secondary CTA:** Solid Charcoal (`#111111`) background, `#FFFFFF` text, `rounded-lg`.
- **Outlined / Tertiary:** Transparent background, `1px solid #E5E7EB` border, `#111111` text. Hover shifts border to `#111111`.

### Chips & Filter Pills
- **Filter Chip (Default):** `#FFFFFF` fill, `1px solid #E5E7EB`, text `#111111`, fully rounded (`rounded-full`), height 34px.
- **Filter Chip (Selected):** `#111111` fill, `#FFFFFF` text, border `#111111`.
- **Accent Indicator Chip:** `#C3F832` fill, `#111111` text, uppercase tracking.

### Garment Condition Badges (Proprietary Component)
- Compact, high-precision badges placed over product imagery:
  - **Pristine:** Black badge, white type, top-left corner placement, 4px inner dot in `#C3F832`.
  - **Excellent / Very Good:** Glass-effect or stark white badge, 1px `#E5E7EB` border, dark text.
  - **Good (Minor Flaw):** Soft stone badge (`#F4F4F6`), subtle label detailing inspection notes on click.

### Product & Utility Cards
- **Editorial Product Card:** Unbordered imagery with 3:4 aspect ratio, subtle 8px corner radius. Brand, garment name, condition badge, and price are stacked below with zero-margin discipline.
- **Utility Dashboard Card:** White container, `1px solid #EEEEEE`, 12px corner radius, internal padding `space-md` (1rem). Header rows feature tabular item thumbnails, condition pill, SKU, payout value, and status dropdown.

### Input Fields
- Form inputs feature 44px height, `#FFFFFF` fill, `1px solid #E5E7EB` default border, `rounded-md` (8px). 
- Active focus transitions the border directly to `1.5px solid #111111`, eliminating default browser glow rings. Error states use `1.5px solid #EF4444`.

### Checkboxes & Radio Controls
- Square with 4px corner radius for checkboxes; circular for radio.
- Inactive: `#FFFFFF` fill with `1.5px solid #D1D5DB`.
- Checked: `#111111` fill with crisp white iconographic check/dot, providing clear graphic feedback without clutter.