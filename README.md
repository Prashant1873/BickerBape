# BickerBape 📈
<p align="center">
  <img src="assets/logo.png" alt="BickerBape Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 4px 20px rgba(0, 82, 204, 0.2);"/>
</p>

<h3 align="center">Intelligent Indian Equity Mutual Fund Screener & Suggester</h3>

<p align="center">
  <strong>Absolute Financial Hurdle Scoring</strong> • <strong>Zero Estimations Policy</strong> • <strong>SQLite Database Persistence</strong> • <strong>AMFI & MFAPI Verified Data</strong>
</p>

---

**BickerBape** is a high-performance, institutional-grade web screener and fund suggester for Indian Equity Mutual Funds, built with **zero Node.js dependencies** (pure HTML5, Vanilla ES6 JavaScript, Tailwind CSS, SQLite database backend, and Chart.js).

It indexes the **entire universe of 620 active Equity Direct-Growth Mutual Funds in India** verified directly from official regulatory sources:
- **Official AMFI Daily NAV Master (`NAVAll.txt`)**
- **Official AMFI Historical NAV Report Portal (`DownloadNAVHistoryReport_Po.aspx`)**
- **MFAPI Open Mutual Fund API (`api.mfapi.in/mf/{code}`)**

---

## 🌟 Key Architecture & Analytics Principles

### 1. Absolute Financial Hurdle Scoring & Quantitative Mathematical Rigor
Unlike standard retail screeners that scale funds against arbitrary sample percentiles, BickerBape implements an **Institutional Quant Outperformance Model**:
- **Performance & Compounding Evaluated via Outperformance Ratios (Not Raw CAGR)**:
  Raw CAGR across different categories creates severe distortions during cyclical sector rallies (e.g. small cap or pharma bull runs outranking diversified all-weather flexi caps). BickerBape evaluates performance strictly on **Return Ratios vs Category Benchmarks**:
  $$\text{Ratio}_{3Y} = \frac{\text{Fund 3Y CAGR}}{\text{Category Benchmark Average 3Y CAGR}}, \quad \text{Ratio}_{5Y} = \frac{\text{Fund 5Y CAGR}}{\text{Category Benchmark Average 5Y CAGR}}$$
  - A ratio $\ge 1.35\times$ indicates top-tier alpha generation (outperforming peers by $\ge 35\%$).
  - Evaluates whether the fund manager generates genuine alpha over their specific investment mandate.
- **Track Record Seasoning & Fiduciary Penalty for Unproven Funds**:
  - Young schemes ($< 3$ years) lack full market cycle validation and cannot receive top scores.
  - Funds $< 1$ year: Track record score 2.5/10; overall score **strictly capped at 5.8/10** (`New Scheme (<1Y)`).
  - Funds $1 - 3$ years: Track record score 4.5–5.5/10; overall score **strictly capped at 7.0/10** (`Emerging (<3Y)`).
  - Only funds with $\ge 3-5$ years of audited multi-cycle survival can achieve institutional recommendations ($\ge 8.0-9.5$).
- **Sectoral / Thematic Concentration Risk Penalty**:
  - Single-sector thematic funds carry 100% idiosyncratic concentration risk and receive a **-1.5 point deduction** in the Risk pillar, flagged with `⚠️ Sector Risk` warning badges.
  - Diversified funds (Flexi Cap, Large & Mid Cap, Multi Cap, Mid Cap) receive diversification credits for cross-sector downside resilience.
- **Annualized Volatility ($\sigma$)**:
  $$\sigma = \sqrt{\frac{1}{N-1}\sum_{t=1}^N (r_t - \bar{r})^2} \times \sqrt{252} \times 100\%$$
- **Sharpe Ratio (RBI 10Y Sovereign G-Sec Benchmark $R_f = 6.80\%$)**:
  $$\text{Sharpe} = \frac{\text{CAGR}_{3Y} - 6.80\%}{\sigma}$$
- **Sortino Ratio (Downside Semi-Deviation below Daily MAR)**:
  $$\text{Sortino} = \frac{\text{CAGR}_{3Y} - 6.80\%}{D}, \quad D = \sqrt{\frac{1}{N}\sum_{r_t < \text{MAR}} (r_t - \text{MAR})^2} \times \sqrt{252} \times 100\%$$
- **All-Time Peak-to-Trough Max Drawdown (MDD)**:
  $$\text{Drawdown}_t = \frac{\max_{s \le t} \text{NAV}_s - \text{NAV}_t}{\max_{s \le t} \text{NAV}_s} \times 100\%, \quad \text{MDD} = \max_t (\text{Drawdown}_t)$$
- **Dynamic Gradient Visuals**:
  - **Royal Blue (`#0052cc`)**: Elite funds ($\ge 8.0$) with soft blue fill.
  - **Interpolated Smooth Gradient**: Transitioning through purple and amber based on score tier.
  - **Warning Red (`#dc2626`)**: Lagging funds ($< 5.0$) with subtle warning tint.

### 2. Global Product: "Investor Mood" Dynamic Recalibration Engine
BickerBape introduces a first-of-its-kind dynamic portfolio allocation engine called **Investor Mood**:
- **3 Color-Coded Moods**:
  1. **🚀 Growth (Emerald Green)**:
     - **Goal**: Long-term wealth creation and compounding.
     - **Weight Multipliers**: **Performance & Category Return Ratios (45%)**, Track Record & Stability (25%), Risk & Volatility (20%), Direct Fees & Costs (10%).
     - Highlights top compounders and alpha generators beating category benchmarks.
  2. **🛡️ Safety (Royal Blue)**:
     - **Goal**: Capital protection, calm sleep, and downside resilience.
     - **Weight Multipliers**: **Risk & Downside Protection (45%)**, Track Record & Multi-Cycle History (25%), Performance (20%), Direct Fees (10%).
     - Highlights funds with minimal drawdowns, low volatility ($\sigma < 14\%$), and high Sortino ratios.
  3. **💰 Income (Amber Gold)**:
     - **Goal**: Ultra-low expense drag, dividend/debt type stability, and fee efficiency.
     - **Weight Multipliers**: **Cost & Direct Plan Fees (35%)**, Risk & Stability (30%), Track Record (20%), Performance (15%).
     - Rewards funds with rock-bottom Direct Expense Ratios (TER 0.40–0.60%) and steady compounding.
- **Instant Client-Side Dynamic Recalibration**:
  Switching moods instantly recalculates SmartScore™ across all 620 funds and re-ranks each category in real-time, while preserving strict fiduciary seasoning caps for young schemes.

### 3. Zero Estimations Policy
- **No Fabricated Data**: This platform never estimates or invents missing financial metrics.
- If a fund was launched 1.5 years ago, its 3Y, 5Y, and 10Y CAGRs are strictly displayed as **`N/A`** (or `-`), not fabricated.
- The absolute scoring engine evaluates the fund based solely on its **actual verified history** (1Y return, 3M growth, volatility, Sharpe, and expense ratio), normalizing weights across available metrics.

### 4. Relational SQLite Database (`data/bickerbape.db`)
- Complete persistence layer tracking:
  - `schemes`: SEBI scheme metadata, ISINs, fund houses, launch dates, AUM, and managers.
  - `nav_history`: Over **1,050,000+ audited daily NAV records**.
  - `fund_metrics`: Verified CAGR horizons, Sharpe, Volatility, Max Drawdown, and 3M Growth.
  - `smart_scores`: Complete 4-pillar absolute score breakdown.
  - `category_benchmarks`: Live category averages.

### 4. Minimalist Detail View (Scorecard Accordions Closed on First Open)
- On opening a fund's detailed drawer, all scorecard pillar accordions remain **closed** by default to maintain a clean, distraction-free interface. Users click any pillar to inspect its sub-metrics.

### 5. Return vs Category Ratios
- Displays exact outperformance ratios:
  $$\text{Return Ratio} = \frac{\text{Fund 3Y CAGR}}{\text{Category Benchmark Average 3Y CAGR}}$$
  (e.g., `1.46x 3Y Ratio`). Only shown when audited 3-year data exists.

### 6. Distraction-Free Comparison Bar with Toggle & Minimize Dock
- Hidden when empty; centered horizontally at all times; can be summoned or minimized at will.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla ES6 JavaScript (Modules), Tailwind CSS, Chart.js.
- **Data & Persistence**: Python 3, SQLite (`data/bickerbape.db`), AMFI & MFAPI sync pipelines.
- **Testing**: Playwright automated end-to-end verification suite.

---

## 🚀 Getting Started

### 1. Run Web Application
```bash
python serve.py
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser.

### 2. Sync Database & Recompute Absolute Scores
```bash
python scripts/db_manager.py
```

---

## 📄 License
MIT License © 2026 Prashant / BickerBape.
