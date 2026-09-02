---
name: BickerBape Design System
description: Intelligent Indian Equity Mutual Fund Screener & Suggester Design System
colors:
  primary: "#003d9b"
  primary-container: "#0052cc"
  secondary: "#285ab9"
  secondary-container: "#709bfe"
  gain: "#36B37E"
  gain-text: "#00875A"
  loss: "#FF5630"
  loss-text: "#DE350B"
  warning: "#FF9F0A"
  warning-text: "#B76E00"
  simsim-neon: "#00F090"
  simsim-surface: "#0B0F19"
  simsim-header: "#070A12"
  surface: "#f8f9fb"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f4f6"
  surface-container: "#edeef0"
  surface-container-high: "#e7e8ea"
  surface-container-highest: "#e1e2e4"
  on-surface: "#191c1e"
  on-surface-variant: "#434654"
  outline: "#737685"
  outline-variant: "#c3c6d6"
typography:
  display:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.15
  headline:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.04em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  strategy-chip:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "10px 16px"
  strategy-chip-active:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.surface-container-lowest}"
    rounded: "{rounded.xl}"
    padding: "10px 16px"
  category-pill:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  category-pill-active:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.surface-container-lowest}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  card-interactive:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  view-toggle-btn:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  view-toggle-btn-active:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
---

# Design System: BickerBape

## Overview

**Creative North Star: "The Quant Observatory"**

BickerBape's visual design system, **Fiscal Clarity**, is built around "The Quant Observatory" metaphor: a high-density, precision financial instrument interface engineered for institutional rigor. It combines translucent glass chrome, crisp tabular typography, and Apple-grade fluid spring mechanics to present complex multi-pillar financial data with effortless legibility and confidence.

The aesthetic balances high-trust fiduciary authority with modern digital fluidity. Deep Royal Ultramarine (`#0052cc`) and Institutional Navy (`#003d9b`) establish clear visual hierarchy, while vibrant emerald gain (`#36B37E`) and coral loss (`#FF5630`) indicators provide immediate financial feedback. Surfaces utilize subtle material depth, frosted glass blur (`backdrop-filter: blur(20px)`), and quiet accordions to eliminate visual noise during quantitative fund analysis.

**Key Characteristics:**
- **Precision Tabular Financial Typography:** Hanken Grotesk with explicit `tnum` tabular lining figures to eliminate number jitter.
- **Translucent Frosted Glass Chrome:** Subdued backdrop-blur navigation and floating comparison docks (`glass-chrome`).
- **Tactile Spring Micro-Interactions:** Immediate spring compression (`scale(0.97)`) on pointer down for instant feedback.
- **Institutional Palette with Vivid Accents:** Deep ultramarine primary anchor with crisp semantic risk/gain colors.
- **Quiet Accordion Scorecards:** Closed-by-default drawers to protect focus and reduce cognitive load.

## Colors

The palette character is defined by institutional fiduciary trust, combining rich ultramarine blues with high-contrast neutral surfaces and vivid quantitative indicators.

### Primary
- **Institutional Navy** (`#003d9b`): Used for primary text anchors, brand titles, and deep background accents.
- **Royal Ultramarine** (`#0052cc`): The core interactive accent. Used for active strategy chips, primary action buttons, selected tabs, and top-tier SmartScore badges ($\ge 8.0$).

### Secondary
- **Cobalt Blue** (`#285ab9`): Secondary interactive states, secondary buttons, and slider thumbs.
- **Ice Cobalt Container** (`#709bfe`): Soft background highlight for active filters and secondary selections.

### Semantic Financial Indicators
- **Emerald Alpha Gain** (`#36B37E` for graphics/badges, `#00875A` for text): Highlights positive outperformance ratios ($\ge 1.35\times$), 3Y/5Y alpha generation, and 🚀 Growth Investor Mood presets. Text on light cards uses `#00875A` to ensure WCAG AA compliant $\ge 4.5:1$ contrast.
- **Coral Risk Loss** (`#FF5630` for graphics/badges, `#DE350B` for text): Flags severe underperformance, high annual volatility ($\sigma > 18\%$), and bottom-tier scores ($< 5.0$).
- **Amber Concentration Warning** (`#FF9F0A` for graphics/badges, `#B76E00` for text): Used for 💰 Income Mood accents, single-sector concentration risk badges (`⚠️ Sector Risk`), and track record warnings (<1Y/3Y schemes).

### SimSim™ Time Machine Sub-Palette
- **SimSim Neon Core** (`#00F090`): Primary energy accent for simulation projections, portfolio time-machine triggers, and active model basket chips.
- **SimSim Deep Canvas** (`#0B0F19`): Base dark container for simulation modals and goal-projection drawers.
- **SimSim Obsidian Header** (`#070A12`): Header surface for simulation dialogs.

### Neutral
- **Observatory Cool Surface** (`#f8f9fb`): Base canvas background.
- **Pure White Container** (`#ffffff`): Card background surfaces, active toggle thumbs, and dropdown menus.
- **Soft Slate Container** (`#f3f4f6`): Secondary container background and inactive input fields.
- **Deep Charcoal Text** (`#191c1e`): Primary body text and numerical figures.
- **Slate Variant Text** (`#434654`): Secondary captions, table headers, and metadata labels.
- **Cool Border Grey** (`#737685`): Outlines, input borders, and table gridlines.

### Named Rules
**The One Primary Voice Rule.** Royal Ultramarine (`#0052cc`) is reserved strictly for primary interactive affordances, active filter states, and top-tier score highlights. It covers $\le 10\%$ of any given viewport to maintain maximum visual pop and hierarchy.

## Typography

**Display Font:** Hanken Grotesk (fallback: system-ui, sans-serif)  
**Body Font:** Hanken Grotesk (fallback: system-ui, sans-serif)  
**Label/Mono Font:** Hanken Grotesk with `tabular-nums` (`"tnum" 1`)

**Character:** Clean, highly legible geometric sans-serif engineered for financial clarity, with explicit tabular figure alignment for jitter-free multi-column metric comparisons.

### Hierarchy
- **Display** (800 weight, `clamp(1.875rem, 4vw, 2.25rem)`, line-height 1.15): Used for main page titles, hero metrics, and SimSim score callouts.
- **Headline** (700 weight, 1.375rem / 22px, line-height 1.2): Section headers, drawer titles, and modal headers.
- **Title** (600 weight, 1.125rem / 18px, line-height 1.3): Card titles, fund scheme names, and accordion titles.
- **Body** (400/500 weight, 0.9375rem / 15px, line-height 1.45): Primary analytical copy, fund descriptions, and method disclosures.
- **Label** (700 weight, 0.75rem / 12px, letter-spacing 0.04em, uppercase/semi-bold): Table headers, category badges, metric labels, and pillar tags.

### Named Rules
**The Tabular Numbers Rule.** All financial numbers, percentages, CAGRs, Sharpe ratios, and scores must use tabular lining figures (`font-variant-numeric: tabular-nums`). Proportional numbers in financial tables are strictly forbidden to eliminate horizontal jitter during live data recalibration.

## Layout

The spatial model uses an edge-to-edge full-viewport app shell (`app-shell`) with a collapsible 320px fluid sidebar on the left and a scrollable main content stage. 

- **Grid & Rhythm:** Standard 8px spatial grid (`xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 32px`).
- **Responsive Behavior:** 
  - Desktop ($\ge 1024\text{px}$): Dual-pane split with persistent collapsible sidebar and multi-column grid (2-3 fund cards per row).
  - Tablet/Mobile ($< 1024\text{px}$): Sidebar collapses into an overlay drawer; card grids stack vertically in single-column layout.
- **Container Strategy:** Maximum content width capped at `1400px` for optimal eye-scan lines.

## Elevation & Depth

BickerBape uses a hybrid depth model combining subtle ambient drop shadows with translucent frosted glass chrome (`backdrop-filter: blur(20px)`). Surfaces are flat at rest and gain soft ambient depth on state changes (hover, active, elevated drawer).

### Shadow Vocabulary
- **Resting Card Shadow** (`box-shadow: 0px 4px 12px rgba(9, 30, 66, 0.08)`): Resting state for interactive cards and strategy chips.
- **Elevated Hover Shadow** (`box-shadow: 0px 16px 36px -6px rgba(9, 30, 66, 0.12)`): Hover state for interactive fund cards (`card-interactive`).
- **Floating Dock Shadow** (`box-shadow: 0px 16px 40px rgba(9, 30, 66, 0.16)`): Persistent bottom comparison bar and SimSim floating drawer.

### Named Rules
**The Tactile Spring Rule.** Every interactive element must respond instantly to pointer-down (`:active`) events with a quick scale compression (`transform: scale(0.97)`) using Apple-tuned spring timing (`cubic-bezier(0.2, 0.8, 0.2, 1)`).

## Shapes

Form language is characterized by smooth squircle corner curvatures and clean borders.

- **Strategy Chips & Badges:** `14px` radius squircle border (`rounded-xl`).
- **Interactive Cards:** `20px` radius container curvature (`rounded-2xl`).
- **Category Pills & View Switchers:** Smooth pill curvature (`rounded-full` / `9999px`).
- **Inputs & Dropdowns:** `12px` rounded border (`rounded-lg`) with `1px` subtle outline (`rgba(9, 30, 66, 0.12)`).

## Components

### Strategy Chips
- **Shape:** Gently curved squircle (`14px` radius).
- **Primary Style:** White surface (`#ffffff`), `1px` subtle border, inline radiant gradient emblem (`chip-emblem`).
- **Active State:** Linear gradient background (`#0052cc` to `#00368c`), white text, cobalt glow shadow (`0 8px 24px -3px rgba(0, 82, 204, 0.35)`).
- **Hover/Active:** `translateY(-2px)` lift on hover; `scale(0.97)` squeeze on active click.

### Interactive Fund Cards
- **Corner Style:** `20px` radius squircle (`rounded-2xl`).
- **Background:** White glass surface (`#ffffff`) with subtle `1px` border (`rgba(9, 30, 66, 0.08)`).
- **Hover Treatment:** `translateY(-3px)` subtle lift, border glow (`rgba(0, 82, 204, 0.22)`), and expanded ambient drop shadow.

### View Switcher Toggle
- **Track Style:** Soft grey track (`#edeef0`), `4px` internal padding, full pill radius (`9999px`).
- **Thumb Style:** Floating white pill thumb (`#ffffff`) with crisp navy text (`#003d9b`) and elevation shadow.

### Investor Mood Controller
- **Style:** 3-way segmented pill track with high-contrast color badges:
  - 🚀 **Growth**: Emerald Green accent (`#36B37E`)
  - 🛡️ **Safety**: Royal Ultramarine accent (`#0052cc`)
  - 💰 **Income**: Amber Gold accent (`#FF9F0A`)

## Do's and Don'ts

### Do:
- **Do** apply `font-variant-numeric: tabular-nums` to every numerical figure, score, CAGR, and ratio.
- **Do** keep detail scorecard accordions closed by default on initial drawer opening to prevent visual overwhelm.
- **Do** use translucent glass chrome (`glass-chrome`) for floating navigation bars and comparison docks.
- **Do** enforce fiduciary seasoning flags (`New Scheme (<1Y)` or `Emerging (<3Y)`) with capped scores.

### Don't:
- **Don't** use raw proportional figures or unaligned numbers in multi-column financial comparison tables.
- **Don't** apply heavy, dark opaque drop shadows that obscure surrounding card borders or content.
- **Don't** invent or estimate missing performance numbers; display explicit `N/A` badges.
- **Don't** use saturated primary blue on passive table headers or static text labels.
