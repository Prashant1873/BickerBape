# Codebase Structure

**Analysis Date:** 2026-10-11

## Directory Layout

```
BickerBape/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD deployment to GitHub Pages
├── data/
│   ├── bickerbape.db             # Audited SQLite database with ~1.05M+ historical records
│   ├── categories_summary.json   # Category benchmark benchmarks & averages
│   └── equity_funds.json         # Master dataset of 620 Indian equity direct-growth funds
├── public/
│   ├── assets/                   # Brand assets and images
│   └── data/                     # Static JSON files generated for client consumption
│       ├── categories_summary.json
│       ├── funds_summary.json    # Lean fund summary payload (~4.1MB)
│       └── nav/                  # Individual fund NAV historical series ({code}.json)
├── scripts/                      # Data sync, calculation engines, and automated test scripts
│   ├── generate_static_data.js   # Prepares static JSON files before Next.js build
│   ├── update_funds.py           # Fetches latest AMFI NAVs and MFAPI records
│   ├── enrich_and_audit_database.py # Calculates quant metrics and populates SQLite
│   ├── logic_audit.py            # Comprehensive math & logic verification suite
│   └── e2e_test.py               # Playwright browser integration tests
├── src/
│   ├── app/                      # Next.js App Router root layout and page
│   │   ├── globals.css           # Tailwind v4 theme, Fiscal Clarity styling, and animations
│   │   ├── layout.tsx            # HTML document shell, font configuration, and meta tags
│   │   └── page.tsx              # Main dashboard entry point and layout shell
│   ├── components/               # React UI components organized by domain
│   │   ├── charts/               # Chart.js visualizers (NavChart.tsx)
│   │   ├── common/               # Reusable UI badges and buttons (AmcBadge, InfoBadge)
│   │   ├── comparison/           # Comparison bar and matrix modal
│   │   ├── drawer/               # Scheme detail drawer with multi-tab scorecard
│   │   ├── layout/               # Global navigation bar (Navbar.tsx)
│   │   ├── screener/             # Screener filter panel, card grid, table, and KPI modal
│   │   └── simsim/               # SimSim simulation workspace, sidebar, and tray
│   ├── context/                  # React Context state management
│   │   ├── ScreenerContext.tsx   # Centralized application state hub
│   │   └── ToastContext.tsx      # Application notification system
│   ├── lib/                      # Core business logic and quantitative algorithms
│   │   ├── analytics.ts          # Screener filter and multi-criteria sorting logic
│   │   ├── data-loader.ts        # Asynchronous data fetching and in-memory caches
│   │   ├── kpi-catalog.ts        # Table columns definition and financial glossaries
│   │   ├── simsim-engine.ts      # Multi-fund historical backtesting & XIRR engine
│   │   ├── simsim-models.ts      # Market regime historical dates and preset baskets
│   │   └── smartscore.ts         # 4-pillar SmartScore calculation & seasoning caps
│   └── types/                    # TypeScript interfaces and type definitions
│       └── fund.ts               # Core domain models (FundSummary, SmartScore, NavPoint)
├── next.config.mjs               # Next.js static export and basePath configuration
├── package.json                  # Project dependencies and npm scripts
├── postcss.config.js             # PostCSS plugin definitions
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript compiler configuration and path aliases
```

## Directory Purposes

**`src/components/`:**
- Purpose: Houses all presentation components separated by feature area
- Contains: React client components (`.tsx`)
- Key files: `src/components/screener/FundCard.tsx`, `src/components/screener/FundTable.tsx`, `src/components/simsim/SimSimPage.tsx`, `src/components/drawer/FundDetailDrawer.tsx`

**`src/context/`:**
- Purpose: Application-level state management and hooks
- Contains: React context providers and custom hooks
- Key files: `src/context/ScreenerContext.tsx`, `src/context/ToastContext.tsx`

**`src/lib/`:**
- Purpose: Pure functional calculation algorithms, financial modeling, and data fetching
- Contains: TypeScript libraries and engine classes
- Key files: `src/lib/smartscore.ts`, `src/lib/simsim-engine.ts`, `src/lib/analytics.ts`, `src/lib/data-loader.ts`

**`scripts/`:**
- Purpose: Offline data pipelines, pre-build asset generation, and Python Playwright test suites
- Contains: Node.js and Python scripts
- Key files: `scripts/generate_static_data.js`, `scripts/logic_audit.py`, `scripts/enrich_and_audit_database.py`

**`data/` & `public/data/`:**
- Purpose: Primary data storage and static client distribution
- Contains: SQLite database file and pre-calculated JSON assets
- Key files: `data/bickerbape.db`, `public/data/funds_summary.json`

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Web client dashboard and application root
- `scripts/generate_static_data.js`: Build-time data generator
- `scripts/update_funds.py`: Offline data sync entry point

**Configuration:**
- `next.config.mjs`: Static export, trailing slash, and base path settings
- `tsconfig.json`: TypeScript configuration with `@/*` path alias
- `src/app/globals.css`: Tailwind v4 `@theme` design tokens and typography

**Core Logic:**
- `src/lib/smartscore.ts`: SmartScore™ multi-pillar recalculation and seasoning rules
- `src/lib/simsim-engine.ts`: SimSim™ lumpsum & SIP backtesting, NAV alignment, and XIRR math
- `src/lib/analytics.ts`: Multi-criteria screening and sorting engine

**Testing:**
- `scripts/logic_audit.py`: Python mathematical and logic verification
- `scripts/e2e_test.py`: Full end-to-end browser tests using Playwright

## Naming Conventions

**Files:**
- React Components: PascalCase (e.g., `FundCard.tsx`, `Navbar.tsx`, `NavChart.tsx`)
- Context Providers: PascalCase with `Context` suffix (e.g., `ScreenerContext.tsx`, `ToastContext.tsx`)
- Libraries & Engines: kebab-case (e.g., `simsim-engine.ts`, `data-loader.ts`, `kpi-catalog.ts`)
- TypeScript Types: kebab-case (e.g., `fund.ts`)
- Scripts: snake_case (e.g., `generate_static_data.js`, `logic_audit.py`, `update_funds.py`)

**Directories:**
- Feature/Domain folders: lowercase kebab-case (e.g., `components/screener`, `components/drawer`, `components/simsim`)

## Where to Add New Code

**New Feature (e.g. New Screener Filter or Preset):**
- Filter Definition: Add filter state to `src/types/fund.ts` and `src/context/ScreenerContext.tsx`
- Filter Logic: Implement filtering condition in `AnalyticsEngine.filterAndSortFunds` in `src/lib/analytics.ts`
- UI Control: Add input or toggle in `src/components/screener/SidebarFilters.tsx`

**New Simulation Metric or Basket Preset:**
- Preset Definition: Add to `src/lib/simsim-models.ts`
- Calculation: Extend `SimSimEngine` in `src/lib/simsim-engine.ts`
- UI Display: Render metric in `src/components/simsim/SimSimPage.tsx`

**New Component/Module:**
- Implementation: Create component in appropriate subdirectory under `src/components/{domain}/`
- Shared/Common: Place in `src/components/common/`

**Utilities:**
- Shared helper functions: Add to `src/lib/`

## Special Directories

**`.planning/`:**
- Purpose: Contains GSD project planning artifacts, codebase maps, and state files
- Generated: Yes (by GSD workflows)
- Committed: Yes

**`public/data/`:**
- Purpose: Contains pre-built static data consumed directly by the web application
- Generated: Yes (by `scripts/generate_static_data.js`)
- Committed: Yes

**`out/`:**
- Purpose: Static export production build output produced by `next build`
- Generated: Yes
- Committed: Yes / Used by GitHub Pages deployment

**`.next/`:**
- Purpose: Next.js internal compilation cache and artifacts
- Generated: Yes
- Committed: No (Ignored via `.gitignore`)

---

*Structure analysis: 2026-10-11*
