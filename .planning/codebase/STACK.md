# Technology Stack

**Analysis Date:** 2026-10-11

## Languages

**Primary:**
- TypeScript 7.0.2 (`tsconfig.json`) - Core frontend application, UI components, types, calculation engines (`src/**/*.ts`, `src/**/*.tsx`)
- JavaScript / Node.js ES Modules & CommonJS - Data pre-rendering build scripts (`scripts/generate_static_data.js`, `postcss.config.js`, `next.config.mjs`)

**Secondary:**
- Python 3.10+ - Data ingestion engine, quantitative calculations, SQLite database management, and end-to-end / mathematical audit test suites (`scripts/*.py`)
- CSS3 (Tailwind CSS v4) - Custom styling, utility tokens, animations, responsive design tokens (`src/app/globals.css`)
- SQL (SQLite 3) - Audited historical fund database (`data/bickerbape.db`)

## Runtime

**Environment:**
- Node.js v20+ / v22+ (`node_modules`, Next.js 16 runtime)
- Browser environment (Modern ES6+ target: Chrome, Edge, Safari, Firefox)
- Python 3 (`scripts/`) for offline ETL and Playwright testing

**Package Manager:**
- npm (`package-lock.json` present)
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Next.js 16.3.4 (`package.json`, `next.config.mjs`) - App Router framework configured for static export (`output: 'export'`)
- React 19.2.8 (`package.json`) - Core UI library with client components (`'use client'`)
- React DOM 19.2.8 (`package.json`) - DOM renderer

**Testing:**
- Python Playwright (`playwright` via `scripts/logic_audit.py`, `scripts/e2e_test.py`, `scripts/test_mobile_audit.py`)
- `@playwright/test` 1.62.1 (`package.json`)

**Build/Dev:**
- Tailwind CSS 4.3.3 (`package.json`, `@tailwindcss/postcss`) - Utility-first styling engine with native CSS `@theme` tokens in `src/app/globals.css`
- PostCSS 8.5.28 & Autoprefixer 10.5.5 (`package.json`, `postcss.config.js`)
- TypeScript 7.0.2 (`tsconfig.json`) - Type checker (`npm run typecheck`)

## Key Dependencies

**Critical:**
- `chart.js` 4.5.1 & `react-chartjs-2` 5.3.1 (`package.json`) - Interactive historical NAV performance and simulation charting (`src/components/charts/NavChart.tsx`, `src/components/simsim/SimSimPage.tsx`)
- `lucide-react` 1.43.0 (`package.json`) - Consistent iconography across screener and SimSim UI
- SQLite3 (`data/bickerbape.db`) - Embedded database storing ~1.05M+ historical NAV records across 620 Indian equity mutual funds

**Infrastructure:**
- `@types/react` 19.2.18, `@types/react-dom` 19.2.7, `@types/node` 26.5.0 (`package.json`) - Type definitions

## Configuration

**Environment:**
- Static runtime with optional environment variable `NEXT_PUBLIC_BASE_PATH` in `next.config.mjs` for GitHub Pages hosting (`/BickerBape`)
- `.env` files: Not required for runtime; static exports serve pre-built JSON assets from `public/data/`

**Build:**
- `next.config.mjs` - Configures static export (`output: 'export'`), trailing slash, unoptimized images, and optional base path
- `tsconfig.json` - Target `ES2022`, module resolution `bundler`, strict mode enabled, `@/*` path alias mapped to `./src/*`
- `package.json` scripts:
  - `dev`: `next dev -H 127.0.0.1`
  - `build`: `node scripts/generate_static_data.js && next build`
  - `serve`: `python -m http.server 3000 --directory out --bind 127.0.0.1`
  - `typecheck`: `tsc --noEmit`
  - `lint`: `next lint`

## Platform Requirements

**Development:**
- Node.js 20+ / 22+
- npm 9+
- Python 3.10+ (for running ETL and testing scripts in `scripts/`)

**Production:**
- Static Web Hosting / GitHub Pages (automated deployment via `.github/workflows/deploy.yml` pushing static output from `./out` directory)

---

*Stack analysis: 2026-10-11*
