# Requirements: BickerBape

**Defined:** 2026-10-11
**Core Value:** Zero-bias, institutional-grade quantitative scoring (SmartScore™) and realistic historical portfolio simulation with strict adherence to the Zero Estimations Policy and fiduciary seasoning discipline.

## v1 Requirements

### Testing & CI

- [ ] **TEST-01**: Native TypeScript unit test suite (Vitest) covering `smartscore.ts` (weights, seasoning caps, category re-ranking)
- [ ] **TEST-02**: Native TypeScript unit tests for `simsim-engine.ts` (lumpsum compounding, monthly SIP cashflows, Newton-Raphson XIRR, NAV alignment)
- [ ] **TEST-03**: Native TypeScript unit tests for `analytics.ts` (filtering, quantitative presets, multi-column sorting)
- [ ] **TEST-04**: Automated GitHub Actions CI workflow executing `npm run typecheck` and `npm test` before static export deployment

### Refactoring & Architecture

- [ ] **ARCH-01**: Decompose monolithic `SimSimPage.tsx` (837 lines) into modular sub-components (canvas header, chart container, metrics table, basket summary)
- [ ] **ARCH-02**: Decompose monolithic `FundDetailDrawer.tsx` (698 lines) into isolated tabs (overview, rolling performance, risk metrics, portfolio holdings)
- [ ] **ARCH-03**: Resolve git repository bloat by excluding generated `./out` static build output from version control and updating `.gitignore`

### UI & Mobile Ergonomics

- [ ] **UI-01**: Mobile viewport optimization for FundDetailDrawer and SimSim modal sheets with proper touch dismiss handles and backdrop blur
- [ ] **UI-02**: Fitts's law compliance audit ensuring all interactive buttons and pill tags maintain minimum 44px touch targets
- [ ] **UI-03**: Fund table sticky header stabilization and responsive horizontal scrolling on narrow tablet/mobile screens

### Features & Analytics

- [ ] **FEAT-01**: Benchmark outperformance ratio visualizer and category alpha comparison cards in fund detail view
- [ ] **FEAT-02**: Portfolio export capability in SimSim allowing users to download simulation breakdown as CSV and printable summary sheet

## v2 Requirements

### Analytics & Tools

- **V2-01**: Tax loss harvesting simulator for equity long-term capital gains (LTCG) thresholds
- **V2-02**: Step-up SIP simulation modeling annual percentage contributions increase
- **V2-03**: IndexedDB client-side offline storage for persistent custom portfolio baskets

## Out of Scope

| Feature | Reason |
|---------|--------|
| User login / Auth | BickerBape is an open, private, zero-tracking web utility; no accounts needed |
| Extrapolated / Synthetic Metrics | Fiduciary violation; funds with <1Y or <3Y history must remain explicit `N/A` |
| Regular mutual fund plans | Distributor commission bias; platform strictly evaluates Direct-Growth funds |
| Debt / Hybrid funds | Platform algorithms are specifically tuned for Indian equity risk/return models |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | Phase 1 | Pending |
| TEST-02 | Phase 1 | Pending |
| TEST-03 | Phase 1 | Pending |
| TEST-04 | Phase 1 | Pending |
| ARCH-01 | Phase 2 | Pending |
| ARCH-02 | Phase 2 | Pending |
| ARCH-03 | Phase 2 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| FEAT-01 | Phase 4 | Pending |
| FEAT-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-11*
*Last updated: 2026-10-11 after initial definition*
