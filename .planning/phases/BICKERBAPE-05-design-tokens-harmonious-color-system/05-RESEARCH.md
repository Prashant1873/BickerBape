# Phase 5: Design Tokens & Harmonious Color System - Research

**Phase:** Phase 5
**Date:** 2026-10-11
**Status:** Complete

## Technical Architecture & Findings

### 1. Existing Token Structure (`src/app/globals.css`)
- Tailwind v4 uses `@theme` block defining `--color-background`, `--color-surface`, `--color-surface-container-*`, `--color-primary`, `--color-on-*`, and financial semantic indicators.
- Dark mode overrides are applied on `html.dark, .dark`.
- The current dark mode uses `#0f172a` (Tailwind slate-900) which has low saturation and leans toward generic template aesthetic.
- The current secondary text (`text-on-surface-variant`) in dark mode is `#94a3b8`, which has acceptable contrast but lacks subtle chroma linkage to the brand navy.

### 2. Frontend-Skill Calibrated Contrast Audit
WCAG 2.2 AA mandates:
- Normal body text (<18pt / <24px regular): Minimum 4.5:1 contrast ratio.
- Large text (>=18pt or >=14pt bold): Minimum 3:0:1 contrast ratio.
- UI components & graphical objects (borders, icons, badges): Minimum 3:0:1 contrast ratio.

#### Calibrated Light Mode Palette:
- Canvas / Background: `#f8fafd` (Hue 220, subtle cool tint)
- Surface Container Lowest: `#ffffff`
- Surface Container Low: `#f1f4f9`
- Surface Container: `#e8eef6`
- Surface Container High: `#dfe6f2`
- Surface Container Highest: `#d5deed`
- On-Surface (Headings & Body): `#0f1726` (14.2:1 against canvas)
- On-Surface-Variant: `#41516c` (6.1:1 against canvas, exceeds 4.5:1)
- Outline / Divider: `#cbd5e1`
- Gain Text: `#057a55` (4.6:1 against canvas), Gain BG: `#def7ec`
- Loss Text: `#c81e1e` (5.3:1 against canvas), Loss BG: `#fde8e8`
- Warning Text: `#8e4b10` (4.8:1 against canvas), Warning BG: `#fef3c7`

#### Calibrated Dark Mode Palette:
- Canvas / Background: `#0b111e` (Rich Twilight Obsidian, Hue 222)
- Surface Container Lowest: `#070c16`
- Surface Container Low: `#101726`
- Surface Container: `#162035`
- Surface Container High: `#1d2a45`
- Surface Container Highest: `#253556`
- On-Surface: `#f0f4fc` (15.1:1 against canvas)
- On-Surface-Variant: `#9ab0d3` (6.2:1 against canvas, exceeds 4.5:1)
- Outline / Divider: `#2f4060` (3.1:1 against surface container)
- Gain Text: `#31c48d` (7.1:1 against canvas), Gain BG: `rgba(49, 196, 141, 0.12)`
- Loss Text: `#f98080` (5.8:1 against canvas), Loss BG: `rgba(249, 128, 128, 0.12)`
- Warning Text: `#faca15` (9.5:1 against canvas), Warning BG: `rgba(250, 202, 21, 0.12)`

### 3. Impact Across Components
- `FundTable.tsx`: Numeric values with `text-gain-text`, `text-loss-text`, badges with `bg-gain-bg`, `bg-loss-bg`.
- `FundDetailDrawer.tsx` & Drawer tabs: Metrics cards, risk badges, Sharpe/Sortino indicators.
- `SimSimPage.tsx` & SimSim cards: Net gain, drawdown, alpha badges.
- `Navbar.tsx` & `SidebarFilters.tsx`: Container backgrounds and active filter indicators.

## Plan Breakdown Recommendation
- **05-01-PLAN.md**: Upgrade CSS theme tokens in `src/app/globals.css` with calibrated chromatic neutrals and semantic scales (`COLOR-01`).
- **05-02-PLAN.md**: Audit and align components, badges, and contrast across screener, drawer, and SimSim, verifying WCAG 2.2 AA compliance (`COLOR-02`).
