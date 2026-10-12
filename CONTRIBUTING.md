# Contributing to BickerBape 🤝

Thank you for your interest in contributing to **BickerBape**. We are building an institutional-grade, zero-bias quantitative intelligence workstation for Indian equity mutual funds.

To maintain the fiduciary integrity, performance, and craft standards of BickerBape, all contributions must adhere to the principles outlined below.

---

## 🏛️ Guiding Philosophies

### 1. The Zero Estimations Policy
* **Never invent, extrapolate, or backfill financial metrics**.
* If a young fund does not have a 3-year or 5-year track record, the value is strictly `N/A`. Do not calculate synthetic estimates or fill with peer averages.
* Maintain fiduciary seasoning discipline: young schemes cannot receive high overall scores without surviving full market cycles.

### 2. Anti-Slop UI & Craft Standards
* **Fitts's Law**: All interactive buttons, chips, icons, and table headers must satisfy a minimum **44px × 44px** touch target bounding box on touch viewports.
* **Hick's & Miller's Laws**: Avoid cognitive overload. Group related filters into digestible clusters (e.g. Core Equity, Market Cap Alpha, Specialized/Thematic).
* **Apple Fluid Spring Motion**: Animations must feel grounded and physically authentic. Spring configs must use critical damping ($\zeta = 1.0$) with zero overshoot or cartoonish bouncing.
* **WCAG 2.2 AA Accessibility**: All financial indicators, score badges, and typography must maintain a contrast ratio $> 4.5:1$ against their respective chromatic backgrounds.

### 3. Engineering Rigor & YAGNI
* Do not introduce unnecessary third-party libraries when native platform features or clean TypeScript logic suffice.
* Maintain clean modular boundaries: isolate pure mathematical functions (`src/lib/`) from presentation components (`src/components/`).

---

## 🛠️ Development Setup & Workflow

### 1. Fork & Branch
```bash
git clone https://github.com/<your-username>/BickerBape.git
cd BickerBape
git checkout -b feature/your-feature-name
```

### 2. Install & Run Locally
```bash
npm install
npm run dev
```
The application will be live at `http://127.0.0.1:3000`.

### 3. Verification Suite
Before committing any changes, run the full verification pipeline:

```bash
# 1. Typecheck: Verify strict TypeScript compiler compliance
npm run typecheck

# 2. Native Test Suite: Run all 98 Vitest unit and quantitative invariant tests
npm test

# 3. Production Static Build: Ensure SSG builds without errors or warnings
npm run build
```

---

## 🧪 Test-Driven Contributions

Every contribution that modifies calculations, business logic, or UI invariants **must include unit tests in `src/lib/__tests__/`**:

* **Quant changes**: Test boundary conditions, zero-division guards, missing-data normalization, and seasoning score caps.
* **Component refactoring**: Verify layout shift prevention (CLS = 0) and touch target dimensions.
* **Formatting & Exporting**: Verify UTF-8 BOM encoding, CSV escaping, and date parsing.

Pull requests with broken tests or omitted test coverage will not be merged.

---

## 📝 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat(screener): add rolling risk-adjusted alpha gauge`
* `fix(simsim): correct leap year cash flow scheduling on leap days`
* `test(smartscore): add test for sectoral fund risk penalty`
* `docs(quant): clarify Sharpe ratio G-sec benchmark formulation`
* `refactor(table): decompose virtual scrolling header logic`

---

## 🚀 Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of `Prashant1873/BickerBape`.
3. Provide a clear summary of your changes, referencing any relevant issues or requirements.
4. Ensure the GitHub Actions CI workflow passes all checks (Typecheck, Vitest, SSG Build).

Thank you for helping build an institutional, transparent investing tool!
