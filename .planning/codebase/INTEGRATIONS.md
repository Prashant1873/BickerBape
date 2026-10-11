# External Integrations

**Analysis Date:** 2026-10-11

## APIs & External Services

**Regulatory & Market Data APIs (Offline / Sync Pipeline):**
- Association of Mutual Funds in India (AMFI) - Daily NAV master list for active Indian mutual funds
  - Endpoint: `https://www.amfiindia.com/spages/NAVAll.txt`
  - Usage: Scheme universe discovery, category classification, and NAV date verification (`scripts/update_funds.py`, `scripts/enrich_and_audit_database.py`)
  - Auth: None (Public regulatory feed)
- MFAPI (mfapi.in) - Comprehensive historical daily NAV time-series for 620+ Indian equity schemes
  - Endpoint: `https://api.mfapi.in/mf/{scheme_code}`
  - Usage: Backfilling historical NAV time series for rolling returns, CAGR, volatility, Sharpe, and Sortino calculations (`scripts/enrich_and_audit_database.py`)
  - Client: Python standard library `urllib.request` with `concurrent.futures.ThreadPoolExecutor`
  - Auth: None (Public API)

## Data Storage

**Databases:**
- SQLite 3 (Embedded offline database)
  - Location: `data/bickerbape.db` (~58.8 MB with ~1.05M+ historical daily NAV records)
  - Tables: `schemes`, `nav_history`, `fund_metrics`, `smart_scores`, `category_benchmarks`
  - Connection: Local disk file path `data/bickerbape.db`
  - Client: Python `sqlite3` standard library module (`scripts/enrich_and_audit_database.py`)

**File Storage:**
- Local static file system / Web server public assets
  - Location: `public/data/` (compiled from `data/equity_funds.json` and `data/categories_summary.json` via `scripts/generate_static_data.js`)
  - Key files:
    - `public/data/funds_summary.json` (~4.1 MB pre-calculated summary payload)
    - `public/data/categories_summary.json` (Category benchmark averages)
    - `public/data/nav/{code}.json` (Granular historical daily NAV series loaded on-demand for drawer charts and SimSim simulations)

**Caching:**
- Client-side in-memory caching:
  - `cachedFundsSummary` and `cachedCategories` singleton variables (`src/lib/data-loader.ts`)
  - `navCache = new Map<string | number, NavPoint[]>()` for on-demand scheme NAV series (`src/lib/data-loader.ts`)
- Browser HTTP caching for exported static JSON files

## Authentication & Identity

**Auth Provider:**
- None
  - Implementation: Fully client-side financial analytics screener and portfolio simulator. No user accounts, credentials, sessions, or private investor data stored or transmitted.

## Monitoring & Observability

**Error Tracking:**
- None (No external error tracking services like Sentry or Datadog)
- Browser console error handling with fallback states (`src/lib/data-loader.ts`)

**Logs:**
- Browser console warnings (`console.warn`, `console.error` in `src/lib/data-loader.ts`)
- Terminal standard output and structured logging in Node.js build scripts (`scripts/generate_static_data.js`) and Python audit tools (`scripts/logic_audit.py`)

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (`https://prashant1873.github.io/BickerBape/`)

**CI Pipeline:**
- GitHub Actions: `.github/workflows/deploy.yml`
  - Triggers on push to `main` branch or manual `workflow_dispatch`
  - Actions runner: `ubuntu-latest` with Node.js 20
  - Build command: `npm run build` (runs `scripts/generate_static_data.js` followed by `next build`)
  - Deployment action: `actions/deploy-pages@v4` deploying `./out` bundle

## Environment Configuration

**Required env vars:**
- None required for local development or standard execution

**Optional env vars:**
- `NEXT_PUBLIC_BASE_PATH`: Configures base path prefix for subpath deployment (e.g. `/BickerBape` on GitHub Pages; referenced in `next.config.mjs` and `src/lib/data-loader.ts`)
- `NODE_ENV`: Set to `production` during `next build`

**Secrets location:**
- No secrets or credentials required in repository or runtime

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-10-11*
