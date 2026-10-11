# Coding Conventions

**Analysis Date:** 2026-10-11

## Naming Patterns

**Files:**
- React Components: PascalCase with `.tsx` extension (e.g., `src/components/screener/FundCard.tsx`, `src/components/layout/Navbar.tsx`)
- TypeScript Libraries & Engines: kebab-case with `.ts` extension (e.g., `src/lib/smartscore.ts`, `src/lib/simsim-engine.ts`)
- TypeScript Types: kebab-case with `.ts` extension (e.g., `src/types/fund.ts`)
- Build & ETL Scripts: snake_case (e.g., `scripts/generate_static_data.js`, `scripts/logic_audit.py`)

**Functions:**
- Utility & calculation functions: camelCase (e.g., `recalculateSmartScoresForMood`, `fetchFundsSummary`, `getSuperScoreTheme`)
- Event handlers: camelCase prefixed with `handle` (e.g., `handleCardClick`, `handleCompareClick`, `handleSimSimClick`)
- React Components: PascalCase (e.g., `FundCard`, `Navbar`, `SimSimPage`)
- Static engine classes: PascalCase with static methods (e.g., `SimSimEngine.alignNavHistories`, `AnalyticsEngine.filterAndSortFunds`)

**Variables:**
- Local variables and state: camelCase (e.g., `filteredFunds`, `isCompared`, `selectedFundCode`)
- Constants and configuration maps: UPPER_SNAKE_CASE (e.g., `MOOD_WEIGHTS`, `MOOD_CONFIG`, `DEFAULT_FILTERS`, `MARKET_REGIMES`, `DEFAULT_TABLE_COLUMNS`)

**Types & Interfaces:**
- Interfaces: PascalCase without leading `I` prefix (e.g., `FundSummary`, `SmartScore`, `SimulationReport`)
- Component Props: PascalCase suffixed with `Props` (e.g., `FundCardProps`, `NavChartProps`)
- Union and Enum types: PascalCase (e.g., `InvestorMood`, `ViewMode`, `AppPlatformMode`)

## Code Style

**Formatting:**
- Indentation: 2 spaces
- Semicolons: Required
- Quotes: Single quotes for TypeScript/JavaScript strings; double quotes for JSX attributes
- Numeric Display: Tabular lining figures (`font-variant-numeric: tabular-nums lining-nums`) enforced for all metrics and tables (`src/app/globals.css`)

**Linting:**
- Linter: Next.js built-in ESLint via `npm run lint` (`next lint`)
- Type Checking: Strict TypeScript checks via `npm run typecheck` (`tsc --noEmit`)
- Compiler options: `strict: true`, `noEmit: true`, `isolatedModules: true` (`tsconfig.json`)

## Import Organization

**Order:**
1. Client directive: `'use client';` (when required for interactive components)
2. External React and library imports (e.g., `import React, { useState } from 'react';`, `import { LucideIcon } from 'lucide-react';`)
3. Internal type definitions (e.g., `import { FundSummary } from '@/types/fund';`)
4. Internal context and custom hooks (e.g., `import { useScreener } from '@/context/ScreenerContext';`)
5. Internal utility libraries and engines (e.g., `import { recalculateSmartScoresForMood } from '@/lib/smartscore';`)
6. Internal UI components (e.g., `import { AmcBadge } from '@/components/common/AmcBadge';`)

**Path Aliases:**
- `@/*` mapped to `./src/*` configured in `tsconfig.json`

## Error Handling

**Patterns:**
- Asynchronous data fetching uses `try/catch` with safe fallback returns (empty array `[]` or default object `{}`) to prevent UI crashes (`src/lib/data-loader.ts:28-31`)
- Mathematical engines guard against zero denominators, empty time series, and invalid dates (`src/lib/simsim-engine.ts:48, 70`)
- Financial missing metrics: Strictly maintain `null` or `undefined` instead of estimating or fabricating numbers; render explicit `N/A` badges (`src/components/common/InfoBadge.tsx`)
- User feedback: Dispatched via `useToast().showToast(message, type)` for non-intrusive notification

## Logging

**Framework:** Native `console` in browser; Python `print` in backend scripts

**Patterns:**
- Browser: Minimal logging in production. `console.error` and `console.warn` reserved for failed asset fetches (`src/lib/data-loader.ts:29, 64`)
- Build and ETL scripts: Formatted progress banners, execution times, and payload size metrics (`scripts/generate_static_data.js:12, 49`)
- Python stdout configured with UTF-8 encoding fix for cross-platform Windows compatibility (`sys.stdout.reconfigure(encoding='utf-8')`)

## Comments

**When to Comment:**
- Institutional and mathematical formulas (e.g., CAGR ACT/365.25 calculations, Sharpe ratio risk-free benchmark logic, Newton-Raphson XIRR convergence)
- Fiduciary policy explanations (seasoning penalty thresholds, single-sector concentration rules)
- Complex state transitions or coordinate alignment routines

**JSDoc/TSDoc:**
- Used on exported public engine functions and classes (e.g., `recalculateSmartScoresForMood`, `AnalyticsEngine.filterAndSortFunds`)

## Function Design

**Size:**
- Single-purpose functions focused on specific calculations or transformations
- Component bodies cleanly split into handlers, memoized selectors, and JSX markup

**Parameters:**
- Destructured options objects for multi-parameter configurations (e.g., `options: Partial<ScreenerFilterState>` in `AnalyticsEngine.filterAndSortFunds`)
- Props passed as typed interfaces

**Return Values:**
- Immutable transformations: functions return newly cloned arrays/objects rather than mutating inputs

## Module Design

**Exports:**
- Named exports preferred for UI components, context providers, and utility functions (`export const FundCard: React.FC = ...`, `export function fetchFundsSummary()`)
- Default export reserved for Next.js App Router root page (`export default function Home()`)

**Barrel Files:**
- Avoided; components are imported directly from their respective domain directories (e.g., `@/components/screener/FundCard`)

---

*Convention analysis: 2026-10-11*
