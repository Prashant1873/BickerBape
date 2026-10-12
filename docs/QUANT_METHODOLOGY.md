# BickerBape Quantitative Methodology & Fiduciary Specifications 📐

This document defines the mathematical foundations, risk metrics, scoring hurdles, and compounding formulas implemented in **BickerBape**.

---

## 1. Core Principles: The Zero Estimations Mandate

Standard commercial fund screeners frequently fabricate, backfill, or geometrically interpolate missing performance metrics for young funds to populate tabular displays. BickerBape enforces an uncompromising **Zero Estimations Policy**:

1. **Empirical Ground Truth**: Missing data points (e.g. 3-year CAGR for an 18-month-old fund) are strictly classified as non-existent and displayed as `N/A`.
2. **Weight Normalization**: Missing metrics do not receive default values or proxy estimates. Instead, pillar scoring weights are normalized over available data:
   $$w'_i = \frac{w_i}{\sum_{k \in \mathcal{A}} w_k}$$
   where $\mathcal{A}$ is the set of available metrics with audited historical records.
3. **Fiduciary Seasoning Discipline**: A young scheme cannot earn an institutional recommendation regardless of how explosive its 6-month or 1-year trailing return might be.

---

## 2. SmartScore™ 4-Pillar Hurdle Model

SmartScore™ is an absolute multi-factor rating on a scale of $1.0$ to $10.0$:

$$\text{SmartScore} = w_p \cdot S_{\text{performance}} + w_t \cdot S_{\text{track\_record}} + w_r \cdot S_{\text{risk}} + w_c \cdot S_{\text{cost}}$$

### Dynamic Mood Weight Matrix

The weight distribution dynamically responds to the user's fiduciary stance:

| Pillar | Growth Mood ($w$) | Safety Mood ($w$) | Income Mood ($w$) | Primary Objective |
|--------|-------------------|-------------------|-------------------|-------------------|
| **Performance ($S_p$)** | **0.45** | 0.20 | 0.15 | Category Outperformance Ratios & Alpha |
| **Track Record ($S_t$)**| 0.25 | 0.25 | 0.20 | Multi-cycle survival & AUM seasoning |
| **Risk & Volatility ($S_r$)**| 0.20 | **0.45** | 0.30 | Downside semi-deviation, Sortino, MDD |
| **Direct Cost ($S_c$)** | 0.10 | 0.10 | **0.35** | Total Expense Ratio (TER) efficiency |

---

## 3. Mathematical Specifications of Pillar Metrics

### 3.1 Pillar 1: Performance & Category Outperformance Ratios

Raw CAGR introduces sector-bias distortions during cyclical bull markets (e.g., small-cap or sectoral rallies outperforming all-weather flexi-caps). BickerBape evaluates performance relative to the official SEBI category benchmark average:

$$\text{Ratio}_{3Y} = \frac{\text{CAGR}_{3Y}^{\text{Fund}}}{\overline{\text{CAGR}}_{3Y}^{\text{Category}}}$$

$$\text{Ratio}_{5Y} = \frac{\text{CAGR}_{5Y}^{\text{Fund}}}{\overline{\text{CAGR}}_{5Y}^{\text{Category}}}$$

#### Scoring Mapping
* $\text{Ratio} \ge 1.35\times$: **10.0 / 10** (Top decile alpha generator, outperforming category by $\ge 35\%$).
* $1.15\times \le \text{Ratio} < 1.35\times$: **8.0 – 9.5 / 10** (Consistent alpha producer).
* $0.95\times \le \text{Ratio} < 1.15\times$: **6.0 – 7.9 / 10** (Market-matching performance).
* $\text{Ratio} < 0.95\times$: **< 5.0 / 10** (Benchmark laggard; capital drag).

#### Category Alpha
$$\alpha_{\text{category}} = \text{CAGR}_{3Y}^{\text{Fund}} - \overline{\text{CAGR}}_{3Y}^{\text{Category}}$$

---

### 3.2 Pillar 2: Multi-Cycle Track Record & Fiduciary Seasoning

To protect capital against survivorship bias and short-term manager luck, BickerBape caps overall scores based on scheme vintage:

| Scheme Age | Track Record Score ($S_t$) | Maximum SmartScore™ Cap | Status Tag | Fiduciary Rationale |
|------------|----------------------------|-------------------------|------------|---------------------|
| $< 1$ Year | $2.5 / 10$ | **5.8 / 10** | `New Scheme (<1Y)` | Zero full-cycle validation; untested in drawdown. |
| $1 \le \text{Age} < 3$ Years | $4.5 - 5.5 / 10$ | **7.0 / 10** | `Emerging (<3Y)` | Partial cycle validation; incomplete rolling history. |
| $\ge 3$ Years | $7.0 - 10.0 / 10$ | **10.0 / 10** (Uncapped) | `Established (3Y+)` | Validated through multiple market regimes. |

---

### 3.3 Pillar 3: Downside Risk & Capital Preservation

#### Annualized Daily Volatility ($\sigma$)
Calculated from audited daily percentage NAV returns $r_t = \frac{\text{NAV}_t - \text{NAV}_{t-1}}{\text{NAV}_{t-1}}$:

$$\sigma = \sqrt{\frac{1}{N-1}\sum_{t=1}^N (r_t - \bar{r})^2} \times \sqrt{252} \times 100\%$$

#### Sharpe Ratio ($R_f = 6.80\%$)
Measures total risk-adjusted return over the Sovereign 10-Year Indian Government Bond yield:

$$\text{Sharpe} = \frac{\text{CAGR}_{3Y} - 6.80\%}{\sigma}$$

#### Sortino Ratio (Downside Semi-Deviation)
Penalizes strictly harmful negative volatility falling below the daily Minimum Acceptable Return (MAR = $\frac{6.80\%}{252}$):

$$\text{Sortino} = \frac{\text{CAGR}_{3Y} - 6.80\%}{D}$$

$$D = \sqrt{\frac{1}{N}\sum_{t=1}^N \min(0, r_t - \text{MAR})^2} \times \sqrt{252} \times 100\%$$

#### Maximum Drawdown (MDD)
The maximum observed peak-to-trough decline across all historical daily NAV records:

$$\text{Drawdown}_t = \frac{\max_{s \le t} \text{NAV}_s - \text{NAV}_t}{\max_{s \le t} \text{NAV}_s} \times 100\%$$

$$\text{MDD} = \max_{t} \left(\text{Drawdown}_t\right)$$

#### Sectoral & Thematic Concentration Penalty
Single-sector thematic funds (e.g. Healthcare, Technology, Infrastructure, Energy) carry unhedged structural risk. An unconditional **$-1.5$ point risk penalty** is applied:

$$S_r^{\text{thematic}} = \max\left(1.0, S_r^{\text{standard}} - 1.5\right)$$

All thematic schemes display a prominent `⚠️ Sector Risk` warning badge.

---

### 3.4 Pillar 4: Direct Expense Ratio (TER) Efficiency

BickerBape evaluates Direct-Growth plans only. Scoring rewards low ongoing fee friction:

* $\text{TER} \le 0.40\%$: **10.0 / 10**
* $0.41\% - 0.70\%$: **8.5 – 9.5 / 10**
* $0.71\% - 1.00\%$: **7.0 – 8.0 / 10**
* $1.01\% - 1.40\%$: **5.0 – 6.5 / 10**
* $\text{TER} > 1.40\%$: **< 4.0 / 10**

---

## 4. SimSim™ Historical Compounding Engine

SimSim™ simulates actual historical investor outcomes by replaying real cash flows against daily historical NAV sequences.

### 4.1 Cash Flow & Unit Accumulation Mechanics

For an investor committing cash flow $C_t$ on scheduled date $t$:
1. If day $t$ is a trading holiday or weekend, the allocation executes on the next available trading day $t'$ with an audited NAV record:
   $$\text{NAV}(t') = \min \{\tau \ge t \mid \exists \text{NAV}_\tau\}$$
2. Incremental units acquired:
   $$\Delta U_t = \frac{C_t}{\text{NAV}(t')}$$
3. Total cumulative units accumulated through day $T$:
   $$U_{\text{total}}(T) = \sum_{t \le T} \Delta U_t$$
4. Portfolio valuation on terminal valuation date $T$:
   $$V_T = \sum_{i=1}^M \left( U_{i, \text{total}}(T) \times \text{NAV}_{i}(T) \right)$$
   where $M$ is the number of constituent funds in the portfolio basket.

---

### 4.2 XIRR Internal Rate of Return Solver

Because SIP cash flows occur on irregular calendar intervals (differing days per month, leap years, trading holidays), standard CAGR is inaccurate. SimSim™ executes a high-precision **Newton-Raphson numerical solver** to calculate the annualized Extended Internal Rate of Return (XIRR):

$$f(\text{XIRR}) = \sum_{j=1}^K \frac{C_j}{(1 + \text{XIRR})^{(t_j - t_0)/365}} + \frac{V_T}{(1 + \text{XIRR})^{(t_T - t_0)/365}} = 0$$

The solver iterates until convergence criteria are met:
$$|\text{XIRR}_{n+1} - \text{XIRR}_n| < 10^{-7}$$

---

### 4.3 Historical Market Regime Stress Testing

SimSim™ includes curated historical crisis and expansion periods to evaluate portfolio resilience under real market conditions:

| Regime Name | Date Window | Economic Characteristics |
|-------------|-------------|--------------------------|
| **COVID-19 Crash & Rebound** | 2020-01-01 to 2021-12-31 | Rapid 38% market drawdown followed by unprecedented liquidity rally. |
| **Global Rate Hike & War Cycle**| 2022-01-01 to 2023-03-31 | Sticky inflation, aggressive central bank rate hikes, sector rotation. |
| **Post-Correction Bull Expansion**| 2023-04-01 to 2024-09-30 | Broad-market momentum, mid/small-cap valuation expansion. |
| **All-Weather 5-Year Horizon** | Rolling 5-Year Window | Full economic cycle comprising bull, bear, and consolidation phases. |

---

## 5. Audit & Mathematical Invariant Testing

All formulas documented above are continuously tested against 98 automated Vitest unit tests in `src/lib/__tests__/`:

```bash
npm test
```

* `smartscore.test.ts`: Validates pillar weighting, seasoning score caps (<1Y capped at 5.8, <3Y capped at 7.0), and thematic risk penalties.
* `analytics.test.ts`: Validates volatility $\sigma$, Sharpe, Sortino downside semi-deviation, and Max Drawdown against analytical benchmark values.
* `simsim-engine.test.ts`: Validates cash flow scheduling, next-trading-day fallback, unit accumulation, and Newton-Raphson XIRR numerical convergence.
