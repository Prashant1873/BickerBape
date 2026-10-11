# Testing Patterns

**Analysis Date:** 2026-10-11

## Test Framework

**Runner:**
- Python Playwright Test Suite (`playwright.sync_api`) executed via custom Python test scripts in `scripts/`
- Node.js / Next.js verification commands via `package.json`:
  - Type checking: `npm run typecheck` (`tsc --noEmit`)
  - Linting: `npm run lint` (`next lint`)
- Browser Automation: `@playwright/test` 1.62.1 (`package.json`) & Python `playwright`

**Assertion Library:**
- Python native `assert` statements with descriptive failure diagnostics

**Run Commands:**
```bash
# Run mathematical logic audit suite
python scripts/logic_audit.py

# Run browser end-to-end integration tests
python scripts/e2e_test.py

# Run mobile viewport UI audit
python scripts/test_mobile_audit.py

# Run SimSim portfolio workflow tests
python scripts/test_simsim.py

# Verify static build and TypeScript types
npm run typecheck
npm run build
```

## Test File Organization

**Location:**
- Dedicated test scripts directory: `scripts/`

**Naming:**
- Mathematical and audit tests: `logic_audit.py`, `ui_audit.py`
- End-to-end tests: `e2e_test.py`, `test_simsim.py`, `test_mobile_audit.py`
- Feature-specific verification scripts: `verify_mobile_ui_fixes.py`, `verify_chunk1.js`

**Structure:**
```
scripts/
├── e2e_test.py                      # Full user journey E2E test
├── logic_audit.py                   # Math, allocation, and XIRR verification
├── test_mobile_audit.py             # Mobile layout and touch responsiveness
├── test_simsim.py                   # SimSim simulation feature tests
├── test_simsim_design_language.py   # Visual design token audit
├── test_card_buttons_responsive.py  # Fitts's Law touch target audits
└── verify_features.py               # Feature regression verification
```

## Test Structure

**Mathematical Unit Test Organization (from `scripts/logic_audit.py`):**
```python
def test_mathematical_units():
    print("============================================================")
    print("  BICKERBAPE & SIMSIM™ MATHEMATICAL & LOGIC AUDIT")
    print("============================================================")

    # 1. Equal-weight integer remainder test for N in 1..10
    for n in range(1, 11):
        base_pct = 100 // n
        remainder = 100 % n
        weights = [base_pct + (1 if idx < remainder else 0) for idx in range(n)]
        total = sum(weights)
        assert total == 100, f"Failed for n={n}: weights={weights}, total={total}"
    print("  PASSED: Equal weight integer percentages sum to exactly 100%!")

    # 2. XIRR Newton-Raphson & Bisection Convergence
    # ...
```

**Playwright Browser Test Organization (from `scripts/logic_audit.py`):**
```python
def test_browser_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://127.0.0.1:3000")
        page.wait_for_selector(".card-interactive")
        # Verify absence of NaN or undefined text
        content = page.content()
        assert "NaN" not in content, "Found NaN in rendered HTML"
        assert "undefined" not in content, "Found undefined in rendered HTML"
        browser.close()
```

## Mocking

**Framework:** None. Real-data and pure algorithmic verification.

**Patterns:**
- Algorithmic tests generate known mathematical vectors (e.g., standard monthly SIP cashflows with predetermined annualized rates).
- Browser tests execute against the live Next.js dev server (`http://127.0.0.1:3000`) or static preview (`http://127.0.0.1:3000` via `python -m http.server 3000 --directory out`).

**What to Mock:**
- External AMFI/MFAPI HTTP requests during offline test execution.

**What NOT to Mock:**
- Mathematical formulas (CAGR, XIRR, Sample Std Dev, Sharpe ratio).
- SmartScore seasoning capping rules.

## Fixtures and Factories

**Test Data:**
- Real historical fund dataset in `data/equity_funds.json` (~620 schemes, 19.7 MB).
- Precomputed categories benchmark summary in `data/categories_summary.json`.

**Location:**
- `data/` directory

## Coverage

**Requirements:** None formally enforced via CI badge; 100% test pass required across `scripts/logic_audit.py` and `scripts/e2e_test.py`.

**View Coverage:**
- Run Python verification scripts:
```bash
python scripts/logic_audit.py
```

## Test Types

**Unit Tests:**
- Mathematical equations: XIRR convergence, sample standard deviation sqrt(252) annualization, Sharpe ratio calculation with 6.80% risk-free rate, and integer remainder distribution across 1 to 10 funds (`scripts/logic_audit.py`).
- Seasoning caps: Verification that funds with <1Y history cannot exceed 5.8/10 score and funds with <3Y history cannot exceed 7.0/10 score.

**Integration Tests:**
- Static data generation pipeline (`scripts/generate_static_data.js` and `scripts/verify_chunk1.js`) ensuring all fund records generate valid individual NAV files with no missing dates.

**E2E Tests:**
- Playwright headless browser tests verifying card clicks, slideover drawer rendering, comparison bar interactions, SimSim basket additions, and mobile viewport responsive behavior (`scripts/e2e_test.py`, `scripts/test_mobile_audit.py`).

## Common Patterns

**Async Testing (in Python Playwright):**
```python
page.wait_for_selector(".card-interactive", timeout=10000)
page.click("[data-tab='performance']")
page.wait_for_timeout(500)
```

**Error Testing:**
- String scanning rendered HTML for unwanted error artifacts:
```python
assert "NaN" not in page.content()
assert "undefined" not in page.content()
assert "null" not in page.locator(".metric-value").all_text_contents()
```

---

*Testing analysis: 2026-10-11*
