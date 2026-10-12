# Requirements: BickerBape

**Defined:** 2026-10-11
**Core Value:** Zero-bias, institutional-grade quantitative scoring (SmartScore™) and realistic historical portfolio simulation with strict adherence to the Zero Estimations Policy and fiduciary seasoning discipline.

## v1 Requirements

### Testing & CI

- [x] **TEST-01**: Native TypeScript unit test suite (Vitest) covering `smartscore.ts` (weights, seasoning caps, category re-ranking)
- [x] **TEST-02**: Native TypeScript unit tests for `simsim-engine.ts` (lumpsum compounding, monthly SIP cashflows, Newton-Raphson XIRR, NAV alignment)
- [x] **TEST-03**: Native TypeScript unit tests for `analytics.ts` (filtering, quantitative presets, multi-column sorting)
- [x] **TEST-04**: Automated GitHub Actions CI workflow executing `npm run typecheck` and `npm test` before static export deployment

### Refactoring & Architecture

- [x] **ARCH-01**: Decompose monolithic `SimSimPage.tsx` (837 lines) into modular sub-components (canvas header, chart container, metrics table, basket summary)
- [x] **ARCH-02**: Decompose monolithic `FundDetailDrawer.tsx` (698 lines) into isolated tabs (overview, rolling performance, risk metrics, portfolio holdings)
- [x] **ARCH-03**: Resolve git repository bloat by excluding generated `./out` static build output from version control and updating `.gitignore`

### UI & Mobile Ergonomics

- [x] **UI-01**: Mobile viewport optimization for FundDetailDrawer and SimSim modal sheets with proper touch dismiss handles and backdrop blur
- [x] **UI-02**: Fitts's law compliance audit ensuring all interactive buttons and pill tags maintain minimum 44px touch targets
- [x] **UI-03**: Fund table sticky header stabilization and responsive horizontal scrolling on narrow tablet/mobile screens

### Features & Analytics

- [x] **FEAT-01**: Benchmark outperformance ratio visualizer and category alpha comparison cards in fund detail view
- [x] **FEAT-02**: Portfolio export capability in SimSim allowing users to download simulation breakdown as CSV and printable summary sheet

### Design Tokens & Harmonious Color System (/frontend-skill)

- [x] **COLOR-01**: Establish semantic chromatic color system in CSS/Tailwind tokens with subtle blue/zinc undertones, eliminating dead `#000000` and `#71717A`
- [x] **COLOR-02**: Enforce WCAG 2.2 AA contrast compliance across all text (min 4.5:1 body, 3:1 headings/icons), card surfaces, and status indicators

### Buttons & Interactive Controls (/frontend-skill)

- [x] **BTN-01**: Standardize buttons, chips, and pill filters with concentric corner radii ($r_{inner} = \max(0, r_{outer} - \text{padding})$) and sub-pixel optical icon centering (`translateY(-0.5px)`)
- [x] **BTN-02**: Implement zero-pointer-lag active-down feedback and viscoelastic sliding indicators for mood switchers and toggle groups

### Apple Fluid Animation & Motion Engine (/frontend-skill)

- [x] **ANIM-01**: Implement Apple HIG critically damped spring physics (`damping: 1.0` interface settling, `0.8` momentum gestures) for drawer, modals, and dockable tray
- [x] **ANIM-02**: Ensure all transitions are interruptible and cancelable mid-flight, leveraging GPU-accelerated transforms (`transform`, `opacity`) without layout thrashing

### Coordinated Atomic Skeleton Loading

- [x] **LOAD-01**: Pixel-matched shimmer skeleton states matching exact primed layout geometries for table, metric summary cards, and chart canvas (CLS = 0)
- [x] **LOAD-02**: Atomic mounting barrier and synchronized data priming gate that reveals all page elements together in a coordinated transition, preventing staggered pop-in

### Comprehensive UI/UX Craft Overhaul & Anti-Slop Audit (/frontend-skill)

- [x] **UX-01**: Apply cognitive UX laws: Hick's Law (streamlined filter density), Jakob's Law (standard table controls), Miller's Law (chunked metrics), and Doherty threshold (<400ms feedback)
- [x] **UX-02**: Distill visual noise by stripping unearned borders, gratuitous shadows, and redundant nested card containers for clean institutional aesthetics
- [x] **UX-03**: Complete pre-flight anti-slop audit across all viewports to guarantee typography scale, baseline grid rhythm, and craft excellence

### Official GitHub Release & Launch Readiness

- [ ] **REL-01**: Author institutional `README.md` with visual architecture diagram, SmartScore™ methodology, Zero Estimations fiduciary disclosure, and setup instructions
- [ ] **REL-02**: Author comprehensive documentation covering AMFI/MFAPI data ETL pipelines, quantitative formulas, and contributing guidelines
- [ ] **REL-03**: Finalize v1.0.0 release checklist, verify static export and GitHub Actions CI build passes cleanly, and prepare launch release notes

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
| TEST-01 | Phase 1 | Satisfied |
| TEST-02 | Phase 1 | Satisfied |
| TEST-03 | Phase 1 | Satisfied |
| TEST-04 | Phase 1 | Satisfied |
| ARCH-01 | Phase 2 | Satisfied |
| ARCH-02 | Phase 2 | Satisfied |
| ARCH-03 | Phase 2 | Satisfied |
| UI-01 | Phase 3 | Satisfied |
| UI-02 | Phase 3 | Satisfied |
| UI-03 | Phase 3 | Satisfied |
| FEAT-01 | Phase 4 | Satisfied |
| FEAT-02 | Phase 4 | Satisfied |
| COLOR-01 | Phase 5 | Satisfied |
| COLOR-02 | Phase 5 | Satisfied |
| BTN-01 | Phase 6 | Satisfied |
| BTN-02 | Phase 6 | Satisfied |
| ANIM-01 | Phase 7 | Satisfied |
| ANIM-02 | Phase 7 | Satisfied |
| LOAD-01 | Phase 8 | Satisfied |
| LOAD-02 | Phase 8 | Satisfied |
| UX-01 | Phase 9 | Satisfied |
| UX-02 | Phase 9 | Satisfied |
| UX-03 | Phase 9 | Satisfied |
| REL-01 | Phase 10 | Pending |
| REL-02 | Phase 10 | Pending |
| REL-03 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-11*
*Last updated: 2026-10-11 with Phases 5-10 requirements*
