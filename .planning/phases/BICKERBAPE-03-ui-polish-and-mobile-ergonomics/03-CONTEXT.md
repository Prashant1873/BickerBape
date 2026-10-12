# Phase 03: UI Polish & Mobile Ergonomics - Context

## Objective
Optimize BickerBape for mobile devices (375px+ screens) and touch interactions:
1. Ensure `FundDetailDrawer`, `SimSimBasketModal`, and `ComparisonMatrixModal` transform seamlessly into touch-first bottom sheets on mobile with swipe/pull handles, backdrop dismiss, and zero layout overflow.
2. Complete a Fitts's Law touch target audit guaranteeing all primary buttons, toggle switches, filter pills, checkboxes, and table triggers maintain at least 44x44px interactive tap areas.
3. Stabilize `FundTable` with two-dimensional sticky pinning (`thead sticky top-0 z-20`, left column `sticky left-0 z-10`, and top-left intersection `z-30`) plus smooth horizontal scrolling indicators.

## User Constraints & Preferences
- Autopilot execution: Continue without interactive interruption.
- Zero functional regressions: SmartScore recalculation, comparison matrix, SimSim backtesting must function seamlessly.
- Visual and type integrity: `npm run typecheck` and `npm test` must continue to pass with 100% success.
