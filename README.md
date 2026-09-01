# BickerBape 📈
### Intelligent Indian Equity Mutual Fund Screener & Suggester (Tickertape Alternative)

**BickerBape** is a high-performance web screener and fund suggester for Indian Equity Mutual Funds, built with **zero Node.js dependencies** (pure HTML5, Vanilla ES6 JavaScript, Tailwind CSS via CDN, and Chart.js).

It indexes the **entire universe of 620 active Equity Direct-Growth Mutual Funds in India** sourced directly from the official **AMFI Daily NAV Master (`NAVAll.txt`)** and **MFAPI.in**.

---

## 🌟 Key Features

- **Complete Indian Equity Universe (620 Funds)**:
  - 12 SEBI categories: *Flexi Cap, Large Cap, Mid Cap, Small Cap, Large & Mid Cap, ELSS Tax Saver, Multi Cap, Focused Fund, Value / Contra, Sectoral / Thematic, Index Funds, and Dividend Yield*.
- **Prashant's 10-Step Fund Selection Formula**:
  - Filter out non-equity funds.
  - 5Y and 10Y CAGR vs. Category benchmark averages.
  - **3-Year Rolling Returns** (measures true consistency across bull/bear cycles without point-to-point luck).
  - Risk-adjusted return via **Sharpe Ratio** ($R_f = 6.8\%$ 10Y G-Sec rate) and Alpha outperformance.
  - **Annualized Volatility** ($\sigma \times \sqrt{252}$) vs. category average.
  - Fund Manager tenure and stability.
- **Tickertape-Style Financial Screener Table**:
  - Sortable by Score, 3Y CAGR, 5Y CAGR, 10Y CAGR, 3Y Rolling Avg, Sharpe Ratio, and Volatility.
  - Sub-category delta pills (`+vs Cat` / `-vs Cat`).
- **Collapsible Screener Command Sidebar**:
  - 1-Click Strategies (*Prashant's 10-Step Formula*, *Consistent Compounders*, *Low Volatility Titans*, *High Alpha Champions*, *ELSS Wealth Savers*).
  - Category selector with live scheme counts.
  - Interactive metric cutoff sliders (Rolling return, Sharpe, Volatility).
  - Smooth width collapse (`320px` to `0px`) without page displacement.
- **Apple Fluid Motion Slide-Over Detail Drawer**:
  - 1:1 gesture tracking and drag-to-dismiss.
  - 4 Interactive Chart.js charts:
    1. Historical NAV Growth (`1Y`, `3Y`, `5Y`, `All`).
    2. 3-Year Rolling Return Timeline Curve vs. Category Benchmark.
    3. Returns vs. Sub-Category & Nifty 50 TRI Bar Chart.
    4. Risk-Reward Scatter Quadrant (Sharpe vs. Volatility).
  - In-drawer 10-Step Quality Checklist.
- **Workable Multi-Fund Comparison Tray & Modal**:
  - Compare up to 3 funds side-by-side.
  - Multi-bar Chart.js visual comparison.
  - Side-by-side metric matrix table with one-click fund swap/removal.
- **Zero Horizontal Scrollbar**:
  - Layout fits 100% inside any window resolution with zero horizontal page overflow (`scrollWidth === innerWidth`).

---

## 🛠️ Architecture & Technologies

- **Zero Node.js / Zero Build Step**: Run instantly in any browser or static hosting (GitHub Pages, Vercel, Netlify).
- **Frontend**: HTML5, Vanilla ES6 JavaScript (Modules), Tailwind CSS (Fiscal Clarity Design System), Chart.js.
- **Data Ingestion Engine**: Python 3 concurrent multithreaded worker (`ThreadPoolExecutor`) updating 620 schemes in ~30 seconds.
- **Automated Testing**: Playwright end-to-end test suite testing UI flows, chart rendering, sidebar collapsing, and zero console errors.

---

## 🚀 Getting Started

### 1. Run Locally
Clone the repository and start the lightweight Python server:

```bash
git clone https://github.com/Prashant1873/BickerBape.git
cd BickerBape
python serve.py
```

Visit **http://localhost:8080** in your browser.

### 2. Updating Mutual Fund Data
To fetch the latest daily NAVs and re-calculate all rolling returns and Sharpe ratios for all 620 funds:

```bash
python scripts/update_funds.py
```

### 3. Run Automated Tests
```bash
pip install playwright
python -m playwright install chromium
python scripts/e2e_test.py
```

---

## 📄 License
MIT License
