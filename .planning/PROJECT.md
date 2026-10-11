# BickerBape

## What This Is

High-performance, distraction-free Indian Equity Direct-Growth Mutual Fund screener and SimSim™ portfolio backtesting simulator. Built with Next.js 16 (static export), Tailwind CSS v4, Chart.js, and an offline SQLite quantitative engine indexing ~620 verified schemes from AMFI and MFAPI.

## Core Value

Zero-bias, institutional-grade quantitative scoring (SmartScore™) and realistic historical portfolio simulation with strict adherence to the Zero Estimations Policy and fiduciary seasoning discipline.

## Business Context

- **Customer**: Retail DIY Indian mutual fund investors seeking objective, sales-free analytics.
- **Revenue model**: Free open-source financial utility; zero affiliate bias or commission kickbacks.
- **Success metric**: 100% calculation accuracy, zero runtime NaN/undefined regressions, and sub-100ms client-side filter and simulation response time.

## Current Milestone: v1.0 Production Polish, UI/UX Overhaul & Official Release

**Goal:** Elevate BickerBape into an institutional-grade, distraction-free Indian mutual fund screener with full `/frontend-skill` design standards, Apple fluid physics, atomic zero-shift loading, and verified official GitHub launch.

**Target features:**
- Harmonious color token system and semantic contrast (/frontend-skill colorize)
- Concentric-radius precision buttons, toggles, and viscoelastic segmented controls (/frontend-skill buttons & animate)
- Apple HIG spring physics and interruptible gesture transitions (/frontend-skill animate)
- Coordinated atomic skeleton loading barrier (CLS = 0)
- Cognitive UX law optimization (Hick's, Fitts's, Miller's, Doherty threshold) and anti-slop audit
- Official GitHub release documentation, institutional README, and CI deployment verification

## Requirements

### Validated

- ✓ 620+ Indian Equity Direct-Growth scheme database with ~1.05M+ historical NAV records — existing
- ✓ 4-pillar SmartScore™ quantitative model with Investor Mood recalibration (Growth, Safety, Income) — existing
- ✓ Fiduciary seasoning caps (<1Y capped at 5.8, <3Y capped at 7.0) — existing
- ✓ Zero Estimations Policy (rendering explicit `N/A` for incomplete histories) — existing
- ✓ SimSim™ multi-fund portfolio simulation engine (Lumpsum growth & Monthly SIP with Newton-Raphson XIRR) — existing
- ✓ Interactive scheme detail slideover drawer with performance charts and multi-tab scorecard — existing
- ✓ Dockable comparison tray and head-to-head comparison matrix modal — existing
- ✓ GitHub Actions static export deployment to GitHub Pages — existing

### Active

- [ ] **TEST-01**: Native TypeScript unit test suite (Vitest) covering `smartscore.ts`, `simsim-engine.ts`, and `analytics.ts`
- [ ] **TEST-02**: Native TypeScript unit tests for `simsim-engine.ts`
- [ ] **TEST-03**: Native TypeScript unit tests for `analytics.ts`
- [ ] **TEST-04**: Automated GitHub Actions CI workflow executing `npm run typecheck` and `npm test` before deployment
- [ ] **ARCH-01**: Decompose monolithic `SimSimPage.tsx` (837 lines) into modular sub-components
- [ ] **ARCH-02**: Decompose monolithic `FundDetailDrawer.tsx` (698 lines) into isolated tabs
- [ ] **ARCH-03**: Resolve git repository bloat by excluding generated `./out` static build output from version control
- [ ] **UI-01**: Mobile viewport optimization for FundDetailDrawer and SimSim modal sheets
- [ ] **UI-02**: Fitts's law compliance audit ensuring minimum 44px tap targets
- [ ] **UI-03**: Fund table sticky header stabilization and responsive horizontal scrolling
- [ ] **FEAT-01**: Benchmark outperformance ratio visualizer and category alpha comparison cards
- [ ] **FEAT-02**: Portfolio export capability in SimSim (CSV and printable summary sheet)
- [ ] **COLOR-01**: Semantic chromatic color palette with subtle blue/zinc undertones via `/frontend-skill`
- [ ] **COLOR-02**: WCAG 2.2 AA contrast compliance across all text, cards, and status badges
- [ ] **BTN-01**: Buttons and pills with concentric corner radii and optical SVG icon centering
- [ ] **BTN-02**: Zero pointer-lag active feedback and viscoelastic sliding toggles for mood switchers
- [ ] **ANIM-01**: Apple HIG critically damped spring physics (`damping: 1.0`) for drawers, modals, and tray
- [ ] **ANIM-02**: Interruptible transitions with GPU-accelerated transforms and zero layout thrashing
- [ ] **LOAD-01**: Pixel-matched shimmer skeleton states for table, cards, and chart canvas (CLS = 0)
- [ ] **LOAD-02**: Atomic mounting barrier and synchronized priming gate eliminating piecemeal element pop-in
- [ ] **UX-01**: Cognitive UX laws optimization (Hick's, Jakob's, Miller's, Doherty <400ms threshold)
- [ ] **UX-02**: Chrome distillation stripping unearned borders, heavy shadows, and redundant cards
- [ ] **UX-03**: Pre-flight anti-slop craft audit across all viewports
- [ ] **REL-01**: Institutional README with architecture diagram, SmartScore™ methodology, and setup guide
- [ ] **REL-02**: Comprehensive data pipeline and quantitative formula documentation
- [ ] **REL-03**: v1.0.0 release checklist, static CI export verification, and GitHub launch preparation

### Out of Scope

| Feature | Reason |
|---------|--------|
| User login / Auth | BickerBape is an open, private, zero-tracking web utility; no accounts needed |
| Extrapolated / Synthetic Metrics | Fiduciary violation; funds with <1Y or <3Y history must remain explicit `N/A` |
| Regular mutual fund plans | Distributor commission bias; platform strictly evaluates Direct-Growth funds |
| Debt / Hybrid funds | Platform algorithms are specifically tuned for Indian equity risk/return models |

## Context

- Static Next.js 16 App Router application exported via `output: 'export'` to GitHub Pages.
- Client state handled via `ScreenerContext.tsx` with all filtering and simulations executing client-side.
- Offline data sync pipelines in `scripts/` ingest regulatory feeds from AMFI (`NAVAll.txt`) and MFAPI (`api.mfapi.in`).
- Mathematical verification currently backed by Python Playwright scripts; need native TypeScript unit test harness for developer speed and CI safety.

## Constraints

- **Tech stack**: Next.js 16 static export (`output: 'export'`), React 19, TypeScript, Tailwind CSS v4, Chart.js.
- **Zero Backend**: Must remain completely functional as static HTML/JS/CSS without Node.js server runtime in production.
- **Fiduciary Policy**: Mathematical rigor over marketing hype; never manufacture missing metrics.
- **Performance**: Instant client-side re-ranking and simulation rendering without UI thread freeze.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js Static Export Architecture | Zero hosting overhead, high reliability via GitHub Pages, fast client execution | ✓ Good |
| In-Memory Dynamic Score Recalibration | Instant mood switching (Growth, Safety, Income) without network latency | ✓ Good |
| Dual Python ETL + Node Static Pre-generation | Python provides numeric library convenience; Node pre-splits 19.7MB into lean JSON | ✓ Good |
| Unified 10-Phase Milestone | Expands foundation with frontend-skill UI/UX overhaul, atomic skeleton loading, and launch prep | — Pending |
| Atomic Skeleton Loading Gate | Synchronize data priming behind atomic barrier to guarantee 0 CLS and prevent pop-in | — Pending |
| `/frontend-skill` Design System Alignment | Enforces concentric radii, viscoelastic toggles, Apple springs, WCAG 2.2 AA | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Business Context check — customer, revenue model, success metric still accurate?
4. Audit Out of Scope — reasons still valid?
5. Update Context with current state

---
*Last updated: 2026-10-11 after expanding milestone to 10 phases*
