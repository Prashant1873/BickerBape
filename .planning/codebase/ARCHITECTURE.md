<!-- refreshed: 2026-10-11 -->
# Architecture

**Analysis Date:** 2026-10-11

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Data Sourcing & Offline ETL Layer                     │
├───────────────────────────────────┬─────────────────────────────────────────┤
│ AMFI Master (NAVAll.txt)          │ MFAPI Daily NAV Series                  │
└─────────────────┬─────────────────┴────────────────────┬────────────────────┘
                  │                                      │
                  ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Python Quantitative & Enrichment Pipeline                   │
│   `scripts/update_funds.py`  │  `scripts/enrich_and_audit_database.py`       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Storage: `data/bickerbape.db` (SQLite) & `data/equity_funds.json`            │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Static Data Bundling & Code Generation                      │
│                  `scripts/generate_static_data.js`                          │
│ Splits monolithic JSON into `public/data/funds_summary.json` & NAV files    │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Next.js 16 Static Client App Router                    │
│                      `src/app/page.tsx` & `src/app/layout.tsx`              │
├─────────────────────────────────────┬───────────────────────────────────────┤
│ State: `src/context/ScreenerContext.tsx` & `src/context/ToastContext.tsx`    │
├─────────────────────────────────────┼───────────────────────────────────────┤
│ Core Engines:                       │ UI Presentation:                      │
│ - `src/lib/smartscore.ts`           │ - `src/components/screener/*`         │
│ - `src/lib/analytics.ts`            │ - `src/components/simsim/*`           │
│ - `src/lib/simsim-engine.ts`        │ - `src/components/drawer/*`           │
│ - `src/lib/data-loader.ts`          │ - `src/components/charts/NavChart.tsx`│
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `Home` / `ScreenerDashboard` | Top-level layout orchestrator switching between Screener and SimSim modes | `src/app/page.tsx` |
| `ScreenerProvider` | Centralized state management for filters, moods, bucket, views, and active modals | `src/context/ScreenerContext.tsx` |
| `ToastProvider` | Application-wide ephemeral toast notification dispatcher | `src/context/ToastContext.tsx` |
| `Navbar` | Navigation header, platform mode toggle, search bar, and investor mood selectors | `src/components/layout/Navbar` |
| `SidebarFilters` | Screener filter panel with category selectors, preset triggers, and quant sliders | `src/components/screener/SidebarFilters.tsx` |
| `ActiveFiltersBar` | Filter pill indicators, quick reset triggers, and display limit counts | `src/components/screener/ActiveFiltersBar.tsx` |
| `FundCard` | Interactive fund card rendering score ring, key metrics, and compare/simsim triggers | `src/components/screener/FundCard.tsx` |
| `FundTable` | High-density institutional comparison grid with configurable columns | `src/components/screener/FundTable.tsx` |
| `FundDetailDrawer` | Deep-dive slideover with 4-pillar scorecard, historical NAV chart, and fund metrics | `src/components/drawer/FundDetailDrawer.tsx` |
| `ComparisonBar` & `ComparisonMatrixModal` | Persistent dockable compare tray and multi-fund head-to-head matrix modal | `src/components/comparison/ComparisonBar.tsx`, `src/components/comparison/ComparisonMatrixModal.tsx` |
| `SimSimPage` | Interactive simulation canvas for portfolio backtesting, SIP modeling, and analytics | `src/components/simsim/SimSimPage.tsx` |
| `SimSimSidebar` | Simulation parameter controls (capital, horizon, investment mode, weight sliders) | `src/components/simsim/SimSimSidebar.tsx` |
| `SimSimEngine` | Historical NAV alignment, forward-fill, lumpsum CAGR/alpha, and SIP cashflow XIRR math | `src/lib/simsim-engine.ts` |
| `AnalyticsEngine` | Filtering and multi-column sorting logic based on quant rules and strategy presets | `src/lib/analytics.ts` |
| `SmartScore` Recalibration | Dynamic 4-pillar score calculation and category re-ranking per Investor Mood | `src/lib/smartscore.ts` |
| `DataLoader` | Asynchronous fetching and client-side caching of summary and NAV JSON payloads | `src/lib/data-loader.ts` |

## Pattern Overview

**Overall:** Static Export Client-Side Single Page Application (SPA) with Offline ETL Ingestion.

**Key Characteristics:**
- **Zero-Backend Runtime:** Next.js exports static HTML, CSS, and JS bundles (`output: 'export'`). No server processes (Node.js, databases) run in production.
- **Client-Side Heavy Computation:** All filtering, sorting, score recalculation, and portfolio simulations run in-memory within the client browser thread.
- **Audited Static Ingestion:** Data is processed offline into SQLite (`data/bickerbape.db`) and pre-bundled into granular JSON files (`public/data/`).

## Layers

**UI Presentation Layer:**
- Purpose: Render accessible, high-performance financial interfaces and data visualizations
- Location: `src/components/` and `src/app/`
- Contains: React client components (`.tsx`), CSS utility classes (`src/app/globals.css`)
- Depends on: Context layer, calculation engines, and type definitions
- Used by: End users in web browser

**Context & State Layer:**
- Purpose: Maintain synchronized UI state, active selections, comparison buckets, and filters
- Location: `src/context/`
- Contains: React context providers and hooks (`src/context/ScreenerContext.tsx`, `src/context/ToastContext.tsx`)
- Depends on: Calculation engines, data loader, and types
- Used by: All UI components

**Domain Engine Layer:**
- Purpose: Execute quantitative calculations, risk caps, score adjustments, and portfolio simulations
- Location: `src/lib/`
- Contains: Pure functional calculation algorithms and engines (`smartscore.ts`, `simsim-engine.ts`, `analytics.ts`, `kpi-catalog.ts`)
- Depends on: `src/types/fund.ts`
- Used by: Context layer and UI components

**Data Loader & Static Storage Layer:**
- Purpose: Load pre-generated static JSON datasets with client-side caching
- Location: `src/lib/data-loader.ts` and `public/data/`
- Contains: Asynchronous fetch utilities and JSON data files
- Depends on: Browser `fetch` API
- Used by: Context layer

**Offline Data Ingestion Layer:**
- Purpose: Scrape regulatory data from AMFI/MFAPI, calculate institutional metrics, and populate SQLite
- Location: `scripts/`
- Contains: Python scripts (`update_funds.py`, `enrich_and_audit_database.py`) and Node generator (`generate_static_data.js`)
- Depends on: `urllib.request`, `sqlite3`, `fs`
- Used by: Build pipeline and scheduled maintenance jobs

## Data Flow

### Primary Request Path (Screener Exploration)

1. User visits `/` or reloads application (`src/app/page.tsx:123`)
2. `ScreenerProvider` mounts and triggers `fetchFundsSummary()` and `fetchCategoriesSummary()` (`src/context/ScreenerContext.tsx:128`)
3. `DataLoader` fetches `/data/funds_summary.json` and caches results in memory (`src/lib/data-loader.ts:18`)
4. Raw funds are passed through `recalculateSmartScoresForMood` to enforce active mood weights and seasoning caps (`src/lib/smartscore.ts:53`)
5. Funds are filtered and sorted via `AnalyticsEngine.filterAndSortFunds` based on active search, category, and quant sliders (`src/lib/analytics.ts:7`)
6. UI renders top `displayLimit` fund cards (`src/components/screener/FundCard.tsx`) or data table rows (`src/components/screener/FundTable.tsx`)

### Secondary Flow (SimSim Portfolio Simulation)

1. User adds funds to SimSim bucket via card/table button (`src/components/screener/FundCard.tsx:43`)
2. Context switches to SimSim mode (`appMode = 'simsim'`) (`src/context/ScreenerContext.tsx:42`)
3. For each constituent in bucket, `fetchFundNavHistory(code)` fetches granular daily NAV points from `/data/nav/{code}.json` (`src/lib/data-loader.ts:50`)
4. `SimSimEngine.alignNavHistories` harmonizes dates across all selected funds with forward-filling (`src/lib/simsim-engine.ts:65`)
5. `SimSimEngine` computes lumpsum portfolio growth or monthly SIP unit accumulation with Newton-Raphson XIRR convergence (`src/lib/simsim-engine.ts`)
6. `SimSimPage` renders portfolio performance curve vs category benchmarks and constituent contribution breakdown (`src/components/simsim/SimSimPage.tsx`)

**State Management:**
- React Context API via `ScreenerContext` managing centralized state (filters, sorting, view mode, comparison list, SimSim bucket, weights, capital, horizon, active modals).

## Key Abstractions

**SmartScore™ Model:**
- Purpose: Multi-pillar fiduciary scoring algorithm with seasoning caps
- Examples: `src/lib/smartscore.ts`
- Pattern: Weighted multi-criteria evaluation with non-linear seasoning constraints

**SimSim™ Portfolio Engine:**
- Purpose: Multi-asset historical backtesting engine supporting lumpsum and SIP
- Examples: `src/lib/simsim-engine.ts`
- Pattern: Strategy / Engine pattern with date alignment, unit accumulation, and numerical root-finding (XIRR)

**Analytics Engine:**
- Purpose: Composite filter and multi-key sorter
- Examples: `src/lib/analytics.ts`
- Pattern: Specification / Filter pipeline pattern

## Entry Points

**Web Application Entry Point:**
- Location: `src/app/page.tsx`
- Triggers: User HTTP request to root URL
- Responsibilities: Mounts `ToastProvider`, `ScreenerProvider`, renders `Navbar`, responsive workspace, and modal overlays

**Static Build Entry Point:**
- Location: `scripts/generate_static_data.js`
- Triggers: `npm run build`
- Responsibilities: Prepares `public/data/` structure, splits monolithic `data/equity_funds.json` into lightweight summaries and individual NAV files

**Data Sync Entry Point:**
- Location: `scripts/update_funds.py` and `scripts/enrich_and_audit_database.py`
- Triggers: Manual or scheduled Python execution
- Responsibilities: AMFI NAVAll parsing, MFAPI historical scrape, metrics calculation, and database persistence

## Architectural Constraints

- **Threading:** Single-threaded JavaScript event loop in browser. Intensive operations (like SimSim series calculations) run synchronously on small arrays (2-10 funds over 1-10 years) to keep frame rate high.
- **Global State:** Module-level in-memory caches in `src/lib/data-loader.ts` (`cachedFundsSummary`, `cachedCategories`, `navCache`).
- **Static Export Constraint:** No server-side runtime APIs (e.g., `getServerSideProps`, Server Actions, or dynamic API routes); all features must function in a static export environment.

## Anti-Patterns

### Modifying Fund Data In-Place

**What happens:** Directly mutating fund summary objects in the context.
**Why it's wrong:** Causes React re-render bugs and desynchronizes memoized filters.
**Do this instead:** Return newly created shallow copies with updated fields, as demonstrated in `recalculateSmartScoresForMood` in `src/lib/smartscore.ts`.

### Estimating Missing Financial Data

**What happens:** Synthesizing or interpolating missing CAGR or Sharpe values for funds with short history.
**Why it's wrong:** Violates BickerBape's Zero Estimations fiduciary principle.
**Do this instead:** Retain `null` or `undefined` values and display explicit `N/A` badges in UI components (`src/components/common/InfoBadge.tsx`).

## Error Handling

**Strategy:** Graceful degradation with fallback states and toast alerts.

**Patterns:**
- Network fail-safes in `src/lib/data-loader.ts` returning empty arrays or objects when fetch fails.
- Mathematical safety checks in `src/lib/simsim-engine.ts` guarding against divide-by-zero, negative NAVs, or missing date intervals.
- Ephemeral user feedback via `useToast` (`src/context/ToastContext.tsx`).

## Cross-Cutting Concerns

**Logging:** Standard console warnings and info logs in data loaders; zero external tracker overhead.
**Validation:** Strict TypeScript interfaces in `src/types/fund.ts`; input bounds checking on sliders and input fields.
**Authentication:** Not applicable; public, client-side application.

---

*Architecture analysis: 2026-10-11*
