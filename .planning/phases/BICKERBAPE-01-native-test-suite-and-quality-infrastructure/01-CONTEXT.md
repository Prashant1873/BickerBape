# Phase 1: Native Test Suite & Quality Infrastructure - Context

**Gathered:** 2026-10-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver native TypeScript automated unit testing and CI verification gates for BickerBape:
- Vitest configuration with fast TypeScript execution
- Comprehensive unit tests covering `src/lib/smartscore.ts` (weights, seasoning caps, dynamic mood recalibration)
- Comprehensive unit tests covering `src/lib/simsim-engine.ts` (lumpsum compounding, monthly SIP cashflows, Newton-Raphson XIRR convergence, NAV alignment)
- Unit tests covering `src/lib/analytics.ts` (filters, quantitative presets, multi-column sorting)
- GitHub Actions CI workflow gate in `.github/workflows/deploy.yml` executing `npm run typecheck` and `npm test` prior to build and deployment

</domain>

<decisions>
## Implementation Decisions

### Test Harness & Runner
- **D-01:** Vitest as test runner — fast, native TypeScript ESM support, zero transpilation overhead.
- **D-02:** Test placement colocated in `src/lib/__tests__/*.test.ts` (`smartscore.test.ts`, `simsim-engine.test.ts`, `analytics.test.ts`).

### Test Fixtures & Mathematical Verification
- **D-03:** Hardcoded deterministic synthetic vectors for financial calculations (XIRR convergence against known cashflows, seasoning caps at 1Y/3Y boundaries, 100% portfolio weight allocation invariance).
- **D-04:** Zero external network or runtime dependencies during test execution; tests must run 100% offline and sub-second.

### CI Integration Gate
- **D-05:** Strict blocking gate in `.github/workflows/deploy.yml` requiring both `npm run typecheck` and `npm test` to pass with 0 exit code before static export and deployment.

### Autopilot Delegation
- User confirmed autopilot mode: all implementation decisions delegated to standard institutional best practices.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing:**

- `.planning/ROADMAP.md` — Phase 1 success criteria and requirements
- `.planning/REQUIREMENTS.md` — TEST-01, TEST-02, TEST-03, TEST-04 specifications
- `src/lib/smartscore.ts` — SmartScore quantitative scoring implementation
- `src/lib/simsim-engine.ts` — SimSim simulation and XIRR calculation engine
- `src/lib/analytics.ts` — Filtering and sorting logic
- `.github/workflows/deploy.yml` — GitHub Actions deployment pipeline

</canonical_refs>

<deferred>
## Deferred Ideas

None.

</deferred>
