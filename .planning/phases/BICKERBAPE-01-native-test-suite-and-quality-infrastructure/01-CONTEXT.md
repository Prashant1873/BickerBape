# Phase 1: Native Test Suite & Quality Infrastructure - Context

**Gathered:** 2026-10-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers a fast, automated TypeScript unit test harness using Vitest for BickerBape's core financial and screening logic, coupled with a mandatory CI verification gate in GitHub Actions. It guarantees that mathematical formulas, seasoning caps, XIRR calculations, and screening filters are strictly verified before production deployment.

</domain>

<decisions>
## Implementation Decisions

### Test Framework & Configuration
- **D-01:** Adopt Vitest as the primary unit testing framework. Vitest executes TypeScript natively with zero-config ESM compatibility and runs in sub-second speeds.
- **D-02:** Test runner configuration (`vitest.config.ts`) configured with `environment: 'node'` to test isolated quantitative functions without DOM simulation overhead.
- **D-03:** Wire `npm test` to `vitest run` and provide `npm run test:watch` for developer iteration.

### Quantitative Precision & Test Vectors
- **D-04:** Floating point assertions use `toBeCloseTo(expected, 4)` for returns and compounding calculations to eliminate precision noise while enforcing mathematical rigor.
- **D-05:** Fiduciary seasoning tests strictly enforce that funds under 1 year are capped at 5.8 and funds under 3 years are capped at 7.0 across all investor moods.
- **D-06:** Zero Estimations Policy tests verify that schemes with insufficient historical periods render explicit `N/A` rather than synthetic or interpolated values.
- **D-07:** Newton-Raphson XIRR solver tested across standard SIP series, edge-case irregular cashflows, and bisection convergence fallback on volatile sequences.

### CI/CD Quality Gate
- **D-08:** Update `.github/workflows/deploy.yml` with a blocking verification gate: `npm run typecheck` and `npm test` must pass 100% prior to static export generation and GitHub Pages publishing.

### Builder Discretion
- User granted full builder discretion ("no discussions do whatever you want") to configure optimal test architecture, test file structure (`test/quant/` or colocated `src/lib/__tests__/`), and strict edge-case fixtures.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Quantitative Engines
- `src/lib/smartscore.ts` — SmartScore 4-pillar calculation model, investor moods, and seasoning caps
- `src/lib/simsim-engine.ts` — Multi-fund portfolio compounding, SIP accumulation, and XIRR engine
- `src/lib/analytics.ts` — Mutual fund screener filters, presets, and sorting routines

### Project Specifications
- `.planning/PROJECT.md` — Core value, zero estimations policy, fiduciary rules
- `.planning/REQUIREMENTS.md` — TEST-01 through TEST-04 acceptance requirements
- `.github/workflows/deploy.yml` — Deployment workflow to be augmented with CI test gates

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/smartscore.ts`: Exported calculation functions (`calculateSmartScore`, `recalibrateMoodScore`)
- `src/lib/simsim-engine.ts`: Core simulation functions (`simulatePortfolio`, `calculateXIRR`)
- `src/lib/analytics.ts`: Data filtering and sorting helpers (`filterFunds`, `sortFunds`)

### Established Patterns
- Pure functions accepting structured fund models without external side effects or network calls.
- Immutable calculations producing deterministic numeric outputs.

### Integration Points
- `package.json`: Scripts definition (`npm test`).
- `.github/workflows/deploy.yml`: Pre-build validation step.

</code_context>

<specifics>
## Specific Ideas

- Fast, lean execution (<2s total test run).
- Comprehensive test coverage for fiduciary caps and edge cases.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-Native-Test-Suite-and-Quality-Infrastructure*
*Context gathered: 2026-10-11*
