# Phase 2: Component Refactoring & Code Hygiene - Context

**Gathered:** 2026-10-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Modularize large monolithic React UI components into clean, colocated sub-components with explicit prop boundaries and clean code hygiene:
- Decompose monolithic `SimSimPage.tsx` (901 lines) into modular components under `src/components/simsim/`:
  - `SimSimChart.tsx` (Canvas visualization & time-series chart)
  - `SimSimConstituentsTable.tsx` (Holdings breakdown, weight inputs & rupee allocations)
  - `SimSimSummaryMetrics.tsx` (Capital, CAGR, XIRR, Alpha, Drawdown scorecard)
  - `SimSimControlsBar.tsx` (Investment mode, horizon selector & actions)
- Decompose monolithic `FundDetailDrawer.tsx` (756 lines) into isolated tab components under `src/components/drawer/`:
  - `DrawerHeader.tsx` (Fund title, AMC badge, SuperScore badge, quick action buttons)
  - `DrawerScorecardTab.tsx` (4-pillar SmartScore breakdown & accordion)
  - `DrawerChartsTab.tsx` (Interactive historical NAV chart & period toggles)
  - `DrawerRiskTab.tsx` (Volatility, Sharpe, Sortino & benchmark comparisons)
  - `DrawerChecklistTab.tsx` (Fiduciary checklist, seasoning disclosure & warning flags)
- Ensure `.gitignore` and git history remain clean with zero tracking of static build output (`out/`).

</domain>

<decisions>
## Implementation Decisions

### Component Colocation & Composition
- **D-01:** Sub-components colocated in their respective parent directories (`src/components/simsim/` and `src/components/drawer/`).
- **D-02:** Strict prop typing with interfaces exported for clear contractual boundaries; components remain purely presentational where possible, receiving state from context or parent props.
- **D-03:** Preserve exact visual styling and behavior; zero CSS regressions or layout shifts introduced during decomposition.

### Code Hygiene & Zero Build Warnings
- **D-04:** Verify clean TypeScript compilation with `npm run typecheck` and verify tests pass with `npm test` after decomposition.
- **D-05:** Verify `out/` remains untracked in git.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing:**

- `.planning/ROADMAP.md` — Phase 2 requirements and success criteria
- `.planning/REQUIREMENTS.md` — ARCH-01, ARCH-02, ARCH-03
- `src/components/simsim/SimSimPage.tsx` — Target SimSim page to decompose
- `src/components/drawer/FundDetailDrawer.tsx` — Target Drawer component to decompose
- `src/context/ScreenerContext.tsx` — Shared React context

</canonical_refs>

<deferred>
## Deferred Ideas

None.

</deferred>
