# BickerBape

## What This Is

High-performance, distraction-free Indian Equity Direct-Growth Mutual Fund screener and SimSim™ portfolio backtesting simulator. Built with Next.js 16 (static export), Tailwind CSS v4, Chart.js, and an offline SQLite quantitative engine indexing ~620 verified schemes from AMFI and MFAPI.

## Core Value

Zero-bias, institutional-grade quantitative scoring (SmartScore™) and realistic historical portfolio simulation with strict adherence to the Zero Estimations Policy and fiduciary seasoning discipline.

## Business Context

- **Customer**: Retail DIY Indian mutual fund investors seeking objective, sales-free analytics.
- **Revenue model**: Free open-source financial utility; zero affiliate bias or commission kickbacks.
- **Success metric**: 100% calculation accuracy, zero runtime NaN/undefined regressions, and sub-100ms client-side filter and simulation response time.

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
- [ ] **TEST-02**: Automated GitHub Actions CI workflow executing `npm run typecheck` and `npm test` before deployment
- [ ] **REFACTOR-01**: Decompose monolithic `SimSimPage.tsx` (837 lines) into focused sub-components
- [ ] **REFACTOR-02**: Decompose monolithic `FundDetailDrawer.tsx` (698 lines) into modular scorecard components
- [ ] **CLEAN-01**: Resolve repository bloat by excluding `./out` build artifacts from git tracking
- [ ] **UI-01**: Mobile viewport ergonomic polish, touch-spring feedback, and Fitts's law compliance
- [ ] **UI-02**: Enhanced fund table column customizer and sticky header persistence
- [ ] **FEAT-01**: Expanded benchmark comparison metrics and category alpha analytics
- [ ] **FEAT-02**: SimSim portfolio export capability (CSV / JSON / printable summary sheet)

### Out of Scope

- User authentication / cloud database — Purely client-side static web utility with zero data collection
- Synthetic or extrapolated financial metrics — Fiduciary principle: unproven periods remain strictly `N/A`
- Regular mutual fund plans — Fiduciary focus strictly on Direct-Growth schemes to avoid distributor commission drag
- Hybrid / Debt / Commodity fund categories — Dedicated solely to Indian Equity mutual fund analysis

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
| Unified 4-Phase Milestone | User chose to address testing, refactoring, mobile UX, and feature expansion together | — Pending |

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
*Last updated: 2026-10-11 after initialization*
