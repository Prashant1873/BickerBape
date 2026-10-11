# Codebase Concerns

**Analysis Date:** 2026-10-11

## Tech Debt

**Monolithic Large Components:**
- Issue: Several key UI components and context files have grown quite large with mixed presentation, simulation math, and state logic.
- Files: `src/components/simsim/SimSimPage.tsx` (837 lines), `src/components/drawer/FundDetailDrawer.tsx` (698 lines), `src/context/ScreenerContext.tsx` (559 lines)
- Impact: High cognitive load when editing; higher risk of inadvertent regressions during feature updates.
- Fix approach: Extract sub-components (e.g. scorecard tabs, comparison chips, simulation summary cards) into dedicated domain directories.

**Missing Standard NPM Test Runner:**
- Issue: `package.json` defines `"test": "echo \"Error: no test specified\" && exit 1"`. All existing tests exist as offline Python scripts in `scripts/`.
- Files: `package.json`, `scripts/logic_audit.py`, `scripts/e2e_test.py`
- Impact: Standard CI tools, contributors, or automated workflows cannot run `npm test` to validate changes; TypeScript algorithms in `src/lib/` rely on Python test mirrors.
- Fix approach: Install Vitest or Jest with `@testing-library/react` to directly test `src/lib/smartscore.ts`, `src/lib/simsim-engine.ts`, and context reducers in TypeScript.

**Committed Static Output Directory:**
- Issue: The `./out` static build output directory is committed directly into the git repository.
- Files: `out/`
- Impact: Repository size grows with each build commit, causing bloated git history and unnecessary merge churn.
- Fix approach: Add `out/` to `.gitignore` and rely exclusively on GitHub Actions workflow (`.github/workflows/deploy.yml`) to generate `./out` during deployment.

## Known Bugs

**None currently detected in active codebase:**
- Mathematical audits and Playwright test assertions pass with zero `NaN`, `null`, or `undefined` text rendering.

## Security Considerations

**Static Architecture Attack Surface:**
- Risk: Malicious script injection or tampered data if external API responses are parsed unsafely during ETL.
- Files: `scripts/update_funds.py`, `scripts/enrich_and_audit_database.py`
- Current mitigation: Offline execution only; data is strictly sanitized and serialized into JSON numbers/strings before committing to repository.
- Recommendations: Maintain automated dependency vulnerability scanning via `npm audit` and Dependabot for Next.js and npm dependencies.

## Performance Bottlenecks

**Initial Funds Summary Payload Size:**
- Problem: `public/data/funds_summary.json` is ~4.15 MB uncompressed.
- Files: `public/data/funds_summary.json`, `src/lib/data-loader.ts`
- Cause: Contains complete metadata, rolling statistics, CAGR points, and manager history for all 620 schemes.
- Improvement path: Ensure gzip / brotli compression is configured on the static host (GitHub Pages natively compresses), or strip non-critical fields into on-demand secondary JSON payloads loaded only when opening the details drawer.

**Client-Side In-Memory Recalculations:**
- Problem: Recalculating SmartScores and re-ranking within 11 categories on mood change (`recalculateSmartScoresForMood`) executes synchronously on the main UI thread.
- Files: `src/lib/smartscore.ts`, `src/context/ScreenerContext.tsx`
- Cause: Operates across 620 objects and re-sorts arrays on every mood toggle.
- Improvement path: Currently fast (<10ms for 620 items), but if universe expands to 2,500+ Indian schemes, offload to a Web Worker or memoize pre-calculated mood variants in `funds_summary.json`.

## Fragile Areas

**External Financial API Ingestion Format Drift:**
- Files: `scripts/update_funds.py`, `scripts/enrich_and_audit_database.py`
- Why fragile: If AMFI alters the pipe-delimited format of `NAVAll.txt` or MFAPI alters schema responses, the Python scraper will fail or ingest misaligned columns.
- Safe modification: Add schema validation assertions to the Python fetcher before updating `data/bickerbape.db`.
- Test coverage: Partially covered by `scripts/logic_audit.py`.

**NAV History Forward-Fill Alignment:**
- Files: `src/lib/simsim-engine.ts:65-115`
- Why fragile: Forward-filling across funds with different inception dates requires handling leading dates where a newer fund has no valid NAV.
- Safe modification: Always verify `calculateEarliestCommonDate` bounds and validate that funds with <1Y track record are not evaluated across a 5Y or 10Y horizon.
- Test coverage: Verified in `scripts/logic_audit.py` and `scripts/test_simsim.py`.

## Scaling Limits

**Fund Universe Capacity:**
- Current capacity: ~620 Equity Direct-Growth Mutual Funds in India (~1.05M daily NAV points).
- Limit: ~1,500-2,000 schemes before initial JSON payload exceeds 10 MB and client-side sorting incurs perceptible UI stutter (>50ms).
- Scaling path: Segment funds into category-specific chunks or implement IndexedDB for client-side indexed queries.

## Dependencies at Risk

**Tailwind CSS v4 Pre-release / Early Adoption:**
- Package: `@tailwindcss/postcss` 4.3.3 and `tailwindcss` 4.3.3
- Risk: Rapid upstream changes in Tailwind v4 `@theme` directives and plugin architecture.
- Impact: Breaking CSS changes if minor version upgrades change PostCSS pipeline.
- Migration plan: Pin exact version numbers in `package.json` and verify styles across major releases.

## Missing Critical Features

**Automated CI Test Verification Gate:**
- Problem: GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys directly without running `npm run typecheck` or Python mathematical verification scripts.
- Blocks: Catching build or logic breakages before deployment to GitHub Pages.

## Test Coverage Gaps

**TypeScript Unit Test Coverage in Source Tree:**
- What's not tested: Unit-level tests for `src/lib/analytics.ts`, `src/lib/smartscore.ts`, and `src/lib/simsim-engine.ts` using a native JavaScript test runner.
- Files: `src/lib/analytics.ts`, `src/lib/smartscore.ts`, `src/lib/simsim-engine.ts`
- Risk: A regression in frontend TypeScript logic might not be caught if developer forgets to run Python test scripts manually.
- Priority: High

**Component Interaction & Accessibility Testing:**
- What's not tested: Keyboard accessibility (focus trapping in drawers and modals), ARIA screen reader assertions.
- Files: `src/components/drawer/FundDetailDrawer.tsx`, `src/components/screener/KpiModal.tsx`
- Risk: Impaired accessibility for screen-reader users or non-standard pointer interactions.
- Priority: Medium

---

*Concerns audit: 2026-10-11*
