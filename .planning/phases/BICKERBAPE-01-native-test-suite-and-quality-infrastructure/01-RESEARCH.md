# Phase 1: Native Test Suite & Quality Infrastructure - Research

**Phase:** Phase 1
**Date:** 2026-10-11
**Status:** Complete

## Technical Architecture & Approach

### 1. Test Harness: Vitest
- **Package:** `vitest` in `devDependencies`.
- **Configuration:** `vitest.config.ts` configured with `tsconfig-paths` or path aliases `@/` pointing to `./src/`.
- **Environment:** Node environment (fastest, lightweight, dom-free for pure math and quant functions).
- **Scripts in `package.json`:**
  - `"test": "vitest run"`
  - `"test:watch": "vitest"`

### 2. Math & Algorithm Test Coverage
- **`smartscore.ts` (`src/lib/__tests__/smartscore.test.ts`)**:
  - Seasoning discipline:
    - Schemes with `< 1 year` history must never exceed SmartScore of `5.8`.
    - Schemes with `< 3 years` history must never exceed SmartScore of `7.0`.
  - Recalibration weights:
    - `growth`: 45% return, 25% track, 20% risk, 10% cost.
    - `safety`: 45% risk, 25% track, 20% return, 10% cost.
    - `income`: 35% cost, 30% risk, 20% track, 15% return.
  - Zero Estimations Policy: Missing values handled gracefully with explicit null/N/A without throwing NaN.

- **`simsim-engine.ts` (`src/lib/__tests__/simsim-engine.test.ts`)**:
  - Weight normalization: Equal weighting integer splits sum to exactly 100% across arbitrary $N$ schemes (1 to 10).
  - Lumpsum portfolio compounding: Daily forward-filled NAV indexing and portfolio unit value tracking.
  - Monthly SIP cashflows: First trading day contribution allocation and accumulated units.
  - Newton-Raphson XIRR solver: Convergence against known irregular cashflow vectors within $10^{-6}$ tolerance, and fallback bisection stability.

- **`analytics.ts` (`src/lib/__tests__/analytics.test.ts`)**:
  - Search filtering by scheme name, AMFI code, and fund house.
  - Category filters (Large Cap, Mid Cap, Small Cap, Flexi Cap, etc.).
  - Preset filters (Top Rated, Ultra-Low Expense, High Alpha).
  - Sorting stability (SmartScore, AUM, CAGR, Expense Ratio).

### 3. CI/CD Gate in GitHub Actions
- **Workflow:** `.github/workflows/deploy.yml`
- **Enforcement:**
  - After `Install dependencies`, insert verification step:
    ```yaml
    - name: Typecheck & Run Unit Tests
      run: |
        npm run typecheck
        npm test
    ```
  - Fails pipeline immediately on any TypeScript compile errors or Vitest test failures before attempting `npm run build` or static deployment.

## Risk Assessment & Mitigations
- **Path Aliases in Vitest:** Next.js uses `@/*` mapping to `./src/*`. Resolved in `vitest.config.ts` via `resolve.alias: { '@': path.resolve(__dirname, './src') }`.
- **Chart.js / DOM dependencies:** Quant test files only import algorithmic functions (`calculateSmartScore`, `runSimSimSimulation`, `filterFunds`), avoiding canvas or browser mocks.
