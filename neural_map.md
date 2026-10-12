# Neural Map: Subsystem Architecture & Logic Flows

## Subsystems

```text
[AMFI / MFAPI Regulators]
          │
          ▼
[Offline ETL & Quant Pipeline] (scripts/update_funds.py, scripts/enrich_and_audit_database.py)
          │
          ▼
[Audited SQLite DB] (data/bickerbape.db) & Master JSON (data/equity_funds.json)
          │
          ▼
[Static Generator] (scripts/generate_static_data.js)
          │
          ▼
[Public Static Data Bundles] (public/data/funds_summary.json, public/data/nav/{code}.json)
          │
          ▼
[Data Loader & Cache] (src/lib/data-loader.ts)
          │
          ▼
[React State Core] (src/context/ScreenerContext.tsx)
    ├── SmartScore Recalibrator (src/lib/smartscore.ts)
    ├── Analytics Filter & Sort Engine (src/lib/analytics.ts)
    └── SimSim Portfolio Simulation Engine (src/lib/simsim-engine.ts)
          │
          ▼
[Presentation Views]
    ├── Screener Mode: Navbar, SidebarFilters, FundCard, FundTable, FundDetailDrawer (DrawerHeader, DrawerScorecardTab, DrawerChartsTab, DrawerRiskTab, DrawerChecklistTab)
    └── SimSim Mode: SimSimSidebar, SimSimPage (SimSimControlsBar, SimSimSummaryCards, SimSimChart, SimSimConstituentsTable, SimSimEmptyState), SimSimBasketModal, SimSimFloatingTray
```

## State Machines

### 1. App Platform Mode
- `screener`: Browsing, filtering, sorting, and analyzing 620 Indian equity mutual funds.
- `simsim`: Interactive portfolio construction, backtesting, SIP cashflow modeling, and drawdown analysis.
- Transitions: Triggered via Navbar platform toggle or floating SimSim tray button.

### 2. View Mode (Screener)
- `cards`: Responsive card grid (1-col mobile, 2-col tablet, 3-col desktop) with radial score rings.
- `table`: High-density institutional comparison matrix with customizable columns.

### 3. Investor Mood Recalibration
- `growth` ➔ Recalibrates weights to 45% perf, 25% track, 20% risk, 10% cost.
- `safety` ➔ Recalibrates weights to 45% risk, 25% track, 20% perf, 10% cost.
- `income` ➔ Recalibrates weights to 35% cost, 30% risk, 20% track, 15% perf.
- *Constraint*: Seasoning caps (<1Y capped at 5.8, <3Y capped at 7.0) are strictly immutable across all moods.

### 4. SimSim Simulation Mode
- `lumpsum`: Initial capital split across weights; tracks continuous forward-filled NAV compounding.
- `sip`: Monthly cash flow injection on the 1st trading day; tracks unit accumulation and computes XIRR via Newton-Raphson with bisection fallback.

### 5. Coordinated Atomic Loading Barrier
- `idle`: Component unmounted or initial static SSR.
- `skeleton`: Coordinated, full-geometry shimmer skeleton across table, summary metrics, and chart canvas.
- `priming`: Data loader fetches SQLite/JSON, initializes filters, and pre-renders primed DOM in memory.

### 6. AMC Brand Identity & Asset Resolution
- `scripts/fetch_amc_logos.py`: High-res (128px) asset harvester sourcing official AMC brand marks into `public/logos/amc/{slug}.png`.
- `src/components/common/AmcBadge.tsx`: BasePath-aware asset resolver with fallback cascade (official PNG mark -> brand monogram pill on error) ensuring zero broken images. Integrated across FundCard, FundTable, DrawerHeader, ComparisonMatrix, and SimSim.
