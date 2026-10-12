# Phase 2: Component Refactoring & Code Hygiene - Research

**Phase:** Phase 2
**Date:** 2026-10-11
**Status:** Complete

## Technical Architecture & Decomposition Strategy

### 1. `SimSimPage.tsx` Breakdown (~901 lines -> ~180 lines shell)
- Current contents:
  - ChartJS registration & options configuration
  - Simulation state orchestration (`loadingSim`, `report`, NAV history fetching)
  - Controls bar (Mode switch, capital input, equalize weight button, preset loader, horizon pills)
  - Performance Summary cards (Total Invested, Current Value, Profit/Loss, Portfolio CAGR/XIRR, Alpha vs Nifty 50, Max Drawdown)
  - Time-series Chart container (Portfolio vs Invested vs Benchmark)
  - Basket Holdings / Constituents Table (Scheme rows, weight percentage slider/stepper, allocated capital, gains, remove button)
  - Empty basket placeholder state
- Target modular structure:
  - `src/components/simsim/SimSimControlsBar.tsx` (~120 lines): Horizon pills, capital input, model preset dropdown, mode toggle.
  - `src/components/simsim/SimSimSummaryCards.tsx` (~140 lines): Portfolio performance metric cards with tooltips.
  - `src/components/simsim/SimSimChart.tsx` (~160 lines): Chart.js line canvas, dataset preparation, benchmark comparison line.
  - `src/components/simsim/SimSimConstituentsTable.tsx` (~180 lines): Holdings table, weight editing, rupee share display.
  - `src/components/simsim/SimSimEmptyState.tsx` (~60 lines): Friendly zero-state guidance and quick-add preset buttons.
  - `src/components/simsim/SimSimPage.tsx` (~150 lines): Composes sub-components with simulation state.

### 2. `FundDetailDrawer.tsx` Breakdown (~756 lines -> ~150 lines shell)
- Current contents:
  - Slideover portal overlay, escape/backdrop dismiss handlers
  - Header: AMC logo/badge, Fund Name, Category, Inception age, SuperScore pill, Compare & Bucket actions
  - Tab navigation: Scorecard (4 pillars), Charts (historical NAV), Risk (Sharpe/Volatility/Drawdown), Checklist (Fiduciary rules)
  - Tab panels:
    - Scorecard Tab: 4 accordion items (Performance, Track Record, Risk/Volatility, Expense Ratio)
    - Charts Tab: NavChart integration with period filter pills
    - Risk Tab: Risk meter, category comparisons, max drawdown, Sharpe, Sortino
    - Checklist Tab: Fiduciary zero-estimation disclosures, seasoning caps, manager tenure
- Target modular structure:
  - `src/components/drawer/DrawerHeader.tsx` (~110 lines): Fund title, AMC badge, SuperScore badge, close/action buttons.
  - `src/components/drawer/tabs/DrawerScorecardTab.tsx` (~160 lines): Pillar accordions and scores.
  - `src/components/drawer/tabs/DrawerChartsTab.tsx` (~90 lines): Historical NAV chart and time horizon selectors.
  - `src/components/drawer/tabs/DrawerRiskTab.tsx` (~130 lines): Volatility, Sharpe, Sortino, category comparisons.
  - `src/components/drawer/tabs/DrawerChecklistTab.tsx` (~120 lines): Fiduciary disclosures, seasoning caps, red flags.
  - `src/components/drawer/FundDetailDrawer.tsx` (~140 lines): Slideover portal shell with tab navigation and sub-panel rendering.

### 3. Git Bloat & Build Artifact Check (ARCH-03)
- `.gitignore` line 27 already contains `out/`.
- `git ls-files out/` verified empty.
- Add test or check script to confirm no build outputs get checked into git.

## Risk Assessment & Mitigations
- **Context/State Access:** Components can either read from `useScreener()` directly or take clean explicit props. Using clean props for presentation data and `useScreener()` for actions keeps child components reusable and easy to test.
- **Visual Regressions:** Keep all Tailwind class names, markup hierarchy, and responsive grid layouts identical.
