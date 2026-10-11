# Phase 9: Research & Audit Report — Comprehensive UI/UX Craft Overhaul & Anti-Slop Audit

## 1. Context & Objectives
**Goal**: Elevate overall platform UI/UX through cognitive UX laws (Hick's, Jakob's, Miller's, Doherty threshold), refined typographic scale, and an anti-slop craft audit per `/frontend-skill`.
**Requirements**: `UX-01`, `UX-02`, `UX-03`.

---

## 2. Component Audits & Friction Analysis

### A. Sidebar Filters (`src/components/screener/SidebarFilters.tsx`)
- **Friction 1 (Hick's Law violation)**: The category list displays up to 20 unchunked categories in a single vertical list. Users face decision paralysis scrolling past niche thematic categories to find core equity classes.
  - *Fix*: Chunk categories into logical cognitive clusters (e.g. "Core Equity", "Thematic & Sectoral", "Tax Planning") or provide a streamlined compact selector with category search/toggle.
- **Friction 2 (Duplicate Controls / Visual Noise)**: Duplicate "Reset" controls: "Reset All" inside the filter body (line 88) right below the sidebar header "Reset" button (line 319).
  - *Fix*: Distill to a single, authoritative header action with badge showing count of active hurdles.
- **Friction 3 (Unearned Decorative Chrome - UX-02)**: The quant insight tip card uses an unearned 3-stop gradient (`bg-gradient-to-br from-primary/10 via-surface-container-low to-primary/5 border border-primary/20`) and nested borders.
  - *Fix*: Replace with clean institutional surface container (`bg-surface-container-low`) and crisp border token.

### B. Fund Card (`src/components/screener/FundCard.tsx`)
- **Friction 1 (Nested Border Containers - UX-02)**: Metric grid at line 155 is wrapped in `p-2.5 rounded-xl bg-surface-container-low/60 border border-surface-container mb-3 text-center` inside a card that already has `border border-surface-container`.
  - *Fix*: Strip the inner border. Let subtle background tint (`bg-surface-container-low/50`) and spatial padding define the metric zone.
- **Friction 2 (Cognitive Chunking - Miller's Law / UX-01)**: The 3-column metric layout mixes 1Y CAGR, 3Y CAGR, and 5Y CAGR. Spacing and typography should clearly distinguish the primary 3Y fiduciary rolling benchmark from secondary snapshot trailing metrics.

### C. Active Filters Bar (`src/components/screener/ActiveFiltersBar.tsx`)
- **Friction 1 (Jakob's Law)**: View switcher (Cards vs Table) and Sort controls are clear, but active filter chips use individual borders and close buttons.
  - *Fix*: Standardize chip padding and clear affordances. Ensure chips clearly convey constraint relaxation.

### D. Fund Table (`src/components/screener/FundTable.tsx`)
- **Friction 1 (Table Header & Sorting - Jakob's Law)**: Hover state on sortable table headers should cleanly reveal sort indicators and align with standard financial terminals (FactSet / Bloomberg).
- **Friction 2 (Visual Clutter)**: Sticky column uses multiple inline box shadows (`shadow-[2px_0_5px_rgba(0,0,0,0.04)]`). Standardize to elevation design tokens.

### E. Typographic Hierarchy & Scale (`src/app/globals.css`)
- **Modular Scale Audit**:
  - `caption / micro`: 10px-11px (tabular uppercase labels, percentile tags).
  - `label-sm`: 12px (filter chips, button labels, table text).
  - `body-md`: 13px-14px (fund descriptions, manager names).
  - `headline-sm`: 15px-16px (card fund titles, modal subheads).
  - `headline-md`: 18px-20px (section headers).
  - `display-financial`: 24px-32px (present value, SmartScore, CAGR highlights).
- **Anti-Slop Invariants**:
  - Zero arbitrary font sizes (e.g. `text-[13px]`, `text-[15px]` ad-hoc inline declarations standardized).
  - Strict 4px/8px spatial rhythm.
  - `font-feature-settings: 'tnum' 1, 'lnum' 1` enforced on all numeric values.

---

## 3. Implementation Decomposition
1. **Plan 09-01**: Cognitive Ergonomics & Chrome Distillation (UX-01, UX-02)
   - Streamline `SidebarFilters.tsx` categories into cognitive chunks (Core Equity vs Thematic vs Tax Saver).
   - Eliminate duplicate reset controls and strip gratuitous gradients.
   - Distill nested borders in `FundCard.tsx` and `FundTable.tsx`.
   - Ensure sub-400ms Doherty threshold response across all interactive controls.
2. **Plan 09-02**: Typographic Hierarchy, Baseline Grid Rhythm & Pre-Flight Anti-Slop Audit (UX-03)
   - Standardize typographic scales and tabular numeric alignments.
   - Enforce 4px/8px vertical rhythm and baseline alignment across card and table components.
   - Run anti-slop audit across viewports (mobile, tablet, desktop) and verify 100% test passing.
