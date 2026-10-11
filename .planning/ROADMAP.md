# Roadmap: BickerBape

## Overview

This milestone elevates BickerBape into a hardened, institutional-grade product by introducing a native TypeScript unit test harness, decomposing monolithic frontend components, polishing mobile touch ergonomics, and adding benchmark analytics with portfolio export capabilities.

## Phases

- [ ] **Phase 1: Native Test Suite & Quality Infrastructure** - Establish Vitest test runner, test core quant engines, and wire GitHub Actions CI gate.
- [ ] **Phase 2: Component Refactoring & Code Hygiene** - Decompose monolithic `SimSimPage.tsx` and `FundDetailDrawer.tsx`, resolve git bloat.
- [ ] **Phase 3: UI Polish & Mobile Ergonomics** - Optimize mobile viewports, touch targets (Fitts's Law), and table customization.
- [ ] **Phase 4: Quantitative Feature Expansion & Export** - Add benchmark outperformance visualizer and SimSim CSV/print export.

## Phase Details

### Phase 1: Native Test Suite & Quality Infrastructure
**Goal**: Provide fast, reliable automated regression testing for all mathematical formulas, seasoning rules, and screening logic directly in TypeScript.
**Depends on**: Nothing (first phase)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. `npm test` runs Vitest with 100% pass rate across `smartscore.ts`, `simsim-engine.ts`, and `analytics.ts`.
  2. Newton-Raphson XIRR convergence, lumpsum compounding, seasoning caps, and filter presets are verified by unit tests.
  3. GitHub Actions workflow (`deploy.yml`) runs `npm run typecheck` and `npm test` before building and publishing.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Install Vitest and write unit tests for `smartscore.ts` and `simsim-engine.ts`.
- [ ] 01-02: Write unit tests for `analytics.ts` and configure CI verification gate in `.github/workflows/deploy.yml`.

### Phase 2: Component Refactoring & Code Hygiene
**Goal**: Modularize large presentation files to improve maintainability, reduce cognitive load, and clean git history.
**Depends on**: Phase 1
**Requirements**: ARCH-01, ARCH-02, ARCH-03
**Success Criteria** (what must be TRUE):
  1. `SimSimPage.tsx` (837 lines) decomposed into modular child components under `src/components/simsim/`.
  2. `FundDetailDrawer.tsx` (698 lines) decomposed into modular tab components under `src/components/drawer/`.
  3. `out/` build artifacts excluded from git tracking via `.gitignore`.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Decompose `SimSimPage.tsx` into modular visualizer, table, and summary sub-components.
- [ ] 02-02: Decompose `FundDetailDrawer.tsx` into modular tab scorecards and clean up git build artifacts.

### Phase 3: UI Polish & Mobile Ergonomics
**Goal**: Perfect the mobile browsing experience with seamless touch interactions, Fitts's law compliance, and table controls.
**Depends on**: Phase 2
**Requirements**: UI-01, UI-02, UI-03
**Success Criteria** (what must be TRUE):
  1. Modals and detail drawers operate smoothly on mobile viewports (375px+) with touch dismiss affordances.
  2. Interactive filter pills, buttons, and action triggers guarantee at least 44px tap targets.
  3. Fund comparison table features stable sticky headers and responsive column widths.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Mobile drawer & modal layout refinements with touch gestures and padding adjustments.
- [ ] 03-02: Table sticky header stabilization and responsive column customizer enhancements.

### Phase 4: Quantitative Feature Expansion & Export
**Goal**: Empower investors with visual benchmark outperformance insights and shareable portfolio reports.
**Depends on**: Phase 3
**Requirements**: FEAT-01, FEAT-02
**Success Criteria** (what must be TRUE):
  1. Fund scorecard clearly visualizes outperformance ratios against category benchmark averages.
  2. Users can export SimSim portfolio simulation results to formatted CSV and printable clean summary.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Implement category benchmark outperformance visualizer in drawer scorecard.
- [ ] 04-02: Implement CSV export and printable portfolio summary report in SimSim.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Native Test Suite & Quality Infrastructure | 0/2 | Not started | - |
| 2. Component Refactoring & Code Hygiene | 0/2 | Not started | - |
| 3. UI Polish & Mobile Ergonomics | 0/2 | Not started | - |
| 4. Quantitative Feature Expansion & Export | 0/2 | Not started | - |

---
*Roadmap defined: 2026-10-11*
*Last updated: 2026-10-11 after initial definition*
