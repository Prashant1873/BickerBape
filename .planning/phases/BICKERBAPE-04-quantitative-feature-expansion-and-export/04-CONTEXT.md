# Phase 4: Quantitative Feature Expansion & Export - Context

**Gathered:** 2026-10-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver advanced quantitative comparison tools and export functionality:
- Category Benchmark Outperformance Ratio Visualizer (`FEAT-01`):
  - Visual ratio gauge/card in [DrawerScorecardTab](file:///c:/Users/u1233270/Downloads/Personal%20Apps/BickerBape/src/components/drawer/tabs/DrawerScorecardTab.tsx) displaying the fund's 3Y and 5Y rolling performance relative to its category median benchmark (e.g. 1.35x outperformance).
  - Category alpha comparison showing excess annualized return over peer group with visual alpha pill.
- SimSim Portfolio Simulation Export Engine (`FEAT-02`):
  - In [SimSimControlsBar](file:///c:/Users/u1233270/Downloads/Personal%20Apps/BickerBape/src/components/simsim/SimSimControlsBar.tsx) / [SimSimPage](file:///c:/Users/u1233270/Downloads/Personal%20Apps/BickerBape/src/components/simsim/SimSimPage.tsx), add:
    - "Export CSV": Generates and triggers browser download of `simsim_portfolio_simulation.csv` with dates, invested capital, simulated portfolio values, benchmark values, and constituent scheme breakdown.
    - "Print / PDF Summary": Client-side formatted printable document triggering browser print preview with cleanly styled metrics, constituent table, and fiduciary disclosures.
</domain>

<decisions>
## Implementation Decisions

### Outperformance Ratio Visualizer
- **D-01:** Embed outperformance cards in `DrawerScorecardTab.tsx` and `DrawerHeader.tsx` displaying calculated ratios against category median, highlighting outperformance (>= 1.25x green, 1.0–1.24x neutral, <1.0x amber).
- **D-02:** Strict zero-estimation policy: if fund history is <3Y, display "N/A (<3Y Seasoning Cap)" rather than hypothetical projections.

### Client-Side Export Engine
- **D-03:** CSV export generated purely client-side via `data:text/csv;charset=utf-8` Blob and programmatic download link; zero server required, 100% offline.
- **D-04:** Print style sheet via CSS `@media print` ensuring headers, metrics, and constituent breakdown render crisp black-and-white without clipped scrollbars or dark theme artifacts.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing:**

- `.planning/ROADMAP.md` — Phase 4 requirements and success criteria
- `.planning/REQUIREMENTS.md` — FEAT-01, FEAT-02
- `src/components/drawer/tabs/DrawerScorecardTab.tsx` — Outperformance visualizer insertion point
- `src/components/simsim/SimSimControlsBar.tsx` — Export actions triggers
- `src/components/simsim/SimSimPage.tsx` — Simulation data source
- `src/lib/simsim-engine.ts` — SimulationReport data model

</canonical_refs>

<deferred>
## Deferred Ideas

None.

</deferred>
