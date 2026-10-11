# Roadmap: BickerBape

## Overview

This milestone elevates BickerBape into an institutional-grade, production-ready mutual fund screener and portfolio simulator. It spans comprehensive TypeScript unit testing, component modularization, mobile touch ergonomics, benchmark analytics, `/frontend-skill` design system adaptation (colors, buttons, fluid animations, craft overhaul), an atomic skeleton loading architecture to eliminate layout pop-in, and final launch preparation with documentation for official GitHub release.

## Phases

- [ ] **Phase 1: Native Test Suite & Quality Infrastructure** - Establish Vitest test runner, test core quant engines, and wire GitHub Actions CI gate.
- [ ] **Phase 2: Component Refactoring & Code Hygiene** - Decompose monolithic `SimSimPage.tsx` and `FundDetailDrawer.tsx`, resolve git bloat.
- [ ] **Phase 3: UI Polish & Mobile Ergonomics** - Optimize mobile viewports, touch targets (Fitts's Law), and table customization.
- [ ] **Phase 4: Quantitative Feature Expansion & Export** - Add benchmark outperformance visualizer and SimSim CSV/print export.
- [ ] **Phase 5: Design Tokens & Harmonious Color System** - Establish `/frontend-skill` colorize tokens, chromatic surfaces, and WCAG 2.2 AA contrast.
- [ ] **Phase 6: Buttons & Interactive Controls Modernization** - Implement concentric radii, optical centering, and viscoelastic toggle rails per `/frontend-skill`.
- [ ] **Phase 7: Apple Fluid Animation & Motion Engine** - Integrate Apple HIG spring kinetics (`damping: 1.0`), interruptible transitions, and zero-jank gestures.
- [ ] **Phase 8: Coordinated Atomic Skeleton Loading System** - Build pixel-matched skeleton screens and an atomic mounting gate to eliminate staggered pop-in.
- [ ] **Phase 9: Comprehensive UI/UX Craft Overhaul & Anti-Slop Audit** - Apply cognitive UX laws (Hick's, Jakob's, Miller's), typographic rhythm, and anti-slop polish.
- [ ] **Phase 10: Official GitHub Release Documentation & Launch Prep** - Author institutional README, quantitative guides, static CI verification, and release checklist.

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

### Phase 5: Design Tokens & Harmonious Color System
**Goal**: Establish a unified, accessible semantic color system derived from `/frontend-skill` (colorize), eliminating dead pure black/gray palettes and guaranteeing WCAG 2.2 AA contrast compliance.
**Depends on**: Phase 4
**Requirements**: COLOR-01, COLOR-02
**Success Criteria** (what must be TRUE):
  1. CSS/Tailwind tokens configure chromatic dark and light surface levels with intentional blue/zinc undertones (no raw `#000000` or `#71717A`).
  2. All text, badge, and icon contrast ratios meet or exceed WCAG 2.2 AA standards (minimum 4.5:1 for body copy, 3:1 for large text and interactive icons).
  3. Status indicators (SmartScore ratings, returns, alpha metrics) use harmonious semantic colors with consistent meaning across screens.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Configure semantic chromatic tokens and surface scales in Tailwind/CSS variables.
- [ ] 05-02: Audit and remediate color contrast across all components for WCAG 2.2 AA compliance.

### Phase 6: Buttons & Interactive Controls Modernization
**Goal**: Re-engineer all buttons, pill tags, and toggles following `/frontend-skill` (buttons & concentric radii), adding viscoelastic switch dynamics and zero pointer-lag active feedback.
**Depends on**: Phase 5
**Requirements**: BTN-01, BTN-02
**Success Criteria** (what must be TRUE):
  1. All buttons, action triggers, and chips adhere to concentric corner radii geometry ($r_{inner} = \max(0, r_{outer} - \text{padding})$).
  2. Investor Mood switches (Growth, Safety, Income), time horizon filters, and table view toggles implement viscoelastic active sliding indicators.
  3. Sub-pixel optical centering (`translateY(-0.5px)`) applied to all SVG icons relative to font cap-height, with high-contrast `:focus-visible` rings.
**Plans**: 2 plans

Plans:
- [ ] 06-01: Standardize button hierarchy with concentric radii, optical centering, and active-down feedback.
- [ ] 06-02: Implement viscoelastic animated sliding rails for mood switchers and toggle groups.

### Phase 7: Apple Fluid Animation & Motion Engine
**Goal**: Infuse Apple HIG spring physics and interruptible micro-interactions across slideover drawers, modals, trays, and interactive cards per `/frontend-skill` (animate).
**Depends on**: Phase 6
**Requirements**: ANIM-01, ANIM-02
**Success Criteria** (what must be TRUE):
  1. Slideover drawers, comparison modals, and dockable trays utilize critically damped spring physics (`damping: 1.0` interface settling, `0.8` momentum gestures).
  2. All animation transitions are interruptible and cancelable mid-flight from current presentation value with zero pointer freeze.
  3. GPU-accelerated transforms (`transform`, `opacity`) ensure silky 60fps/120fps motion without layout reflows or dropped frames.
**Plans**: 2 plans

Plans:
- [ ] 07-01: Implement critically damped spring physics and interruptible transitions for drawer and modal sheets.
- [ ] 07-02: Refine micro-interaction physics across comparison tray, tooltips, and interactive cards.

### Phase 8: Coordinated Atomic Skeleton Loading System
**Goal**: Implement zero-layout-shift (CLS = 0) skeleton loaders and an atomic loading gate so page elements transition synchronously without piecemeal or staggered popping.
**Depends on**: Phase 7
**Requirements**: LOAD-01, LOAD-02
**Success Criteria** (what must be TRUE):
  1. Pixel-matched skeleton states exist for screener table, metric header cards, comparison dock, and SimSim chart canvas.
  2. Page loading state coordinates data initialization and filter priming behind an atomic barrier, transitioning all elements together once primed.
  3. No elements pop in one-by-one or in partially styled/uncalculated states; Cumulative Layout Shift (CLS) remains 0.
**Plans**: 2 plans

Plans:
- [ ] 08-01: Build pixel-matched shimmer skeleton components for table, metrics cards, and chart canvas.
- [ ] 08-02: Implement coordinated atomic mounting barrier and crossfade transition for complete page readiness.

### Phase 9: Comprehensive UI/UX Craft Overhaul & Anti-Slop Audit
**Goal**: Elevate overall platform UI/UX through cognitive UX laws (Hick's, Jakob's, Miller's, Doherty threshold), refined typographic scale, and an anti-slop craft audit per `/frontend-skill`.
**Depends on**: Phase 8
**Requirements**: UX-01, UX-02, UX-03
**Success Criteria** (what must be TRUE):
  1. Filter navigation and table layout adhere to Hick's Law and Miller's Law (cognitive chunking, optimal information density, no visual overwhelm).
  2. Redundant visual chrome (unearned borders, unnecessary nested card enclosures, gratuitous shadows) stripped for clean institutional aesthetics.
  3. Pre-flight anti-slop audit passes 100% across all viewports (mobile, tablet, desktop) with sub-400ms visual response (Doherty threshold).
**Plans**: 2 plans

Plans:
- [ ] 09-01: Streamline cognitive ergonomics, filter information architecture, and distill unnecessary chrome.
- [ ] 09-02: Refine typographic hierarchy, baseline grid rhythm, and complete full anti-slop craft audit.

### Phase 10: Official GitHub Release Documentation & Launch Prep
**Goal**: Prepare BickerBape for public production launch with institutional README, architecture documentation, methodology disclosures, and verified GitHub CI/CD static release.
**Depends on**: Phase 9
**Requirements**: REL-01, REL-02, REL-03
**Success Criteria** (what must be TRUE):
  1. Institutional-grade `README.md` authored with badges, architecture overview, SmartScore™ quantitative methodology, Zero Estimations policy disclosure, and setup instructions.
  2. Dedicated documentation covering offline AMFI/MFAPI data ETL pipelines and SimSim multi-fund compounding engine.
  3. Production build, static export, and GitHub Actions workflow validated with zero build warnings, test failures, or git tracking bloat, ready for v1.0.0 release.
**Plans**: 2 plans

Plans:
- [ ] 10-01: Author institutional README, architecture diagrams, and quantitative methodology documentation.
- [ ] 10-02: Verify production static export, GitHub Actions release pipeline, and finalize v1.0.0 launch readiness.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Native Test Suite & Quality Infrastructure | 0/2 | Not started | - |
| 2. Component Refactoring & Code Hygiene | 0/2 | Not started | - |
| 3. UI Polish & Mobile Ergonomics | 0/2 | Not started | - |
| 4. Quantitative Feature Expansion & Export | 0/2 | Not started | - |
| 5. Design Tokens & Harmonious Color System | 0/2 | Not started | - |
| 6. Buttons & Interactive Controls Modernization | 0/2 | Not started | - |
| 7. Apple Fluid Animation & Motion Engine | 0/2 | Not started | - |
| 8. Coordinated Atomic Skeleton Loading System | 0/2 | Not started | - |
| 9. Comprehensive UI/UX Craft Overhaul & Anti-Slop Audit | 0/2 | Not started | - |
| 10. Official GitHub Release Documentation & Launch Prep | 0/2 | Not started | - |

---
*Roadmap defined: 2026-10-11*
*Last updated: 2026-10-11 with Phases 5-10 for frontend-skill polish, atomic skeleton loading, and official launch*
