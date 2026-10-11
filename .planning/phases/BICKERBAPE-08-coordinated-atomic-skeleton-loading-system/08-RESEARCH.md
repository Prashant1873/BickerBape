# Phase 8: Coordinated Atomic Skeleton Loading System - Research

**Researched:** 2026-10-12  
**Domain:** Frontend Performance Engineering, Cumulative Layout Shift (CLS = 0), Synchronous UI Mounting Gates  
**Confidence:** HIGH  

## Summary

Phase 8 implements pixel-matched shimmer skeleton loaders and a synchronized atomic loading gate across BickerBape's mutual fund screener and SimSim portfolio simulator. Currently, data fetching in `ScreenerContext.tsx` sets `loading: true`, but uncoordinated child components mount piecemeal, flashing "Showing 0 of 0 Schemes" in the header counter, rendering crude 6-box placeholders that do not match real `FundCard` or `FundTable` dimensions, and completely collapsing the 380px `SimSimChart` canvas until simulation calculations finish. This creates noticeable layout instability (Cumulative Layout Shift, CLS > 0.15) and visual pop-in.

The primary solution consists of two coordinated pillars:
1. **Pixel-Matched Skeleton Components**: Dedicated zero-shift shimmer components for screener cards (fixed 224px height with 4-cell metric grid), screener table (fixed thead + 12 rows with 52px min-height), SimSim summary cards (4-card responsive grid with 116px height), and SimSim chart canvas (380px height with Cartesian dashed grid placeholder). All shimmer effects utilize calibrated chromatic CSS gradient sweeps (`var(--color-surface-container)` to `var(--color-surface-container-low)`) with `@media (prefers-reduced-motion: reduce)` accessibility overrides.
2. **Atomic Mounting Barrier**: A unified priming gate (`isPrimed: boolean`) in state management that holds back partial layout reveals until all initial dataset requirements (schemes universe and category definitions) and initial filter indexes are primed. Once primed, an interruptible 240ms crossfade reveals the entire interface synchronously with zero layout shift (CLS = 0).

**Primary recommendation:** Build atomic, modular skeleton components (`FundCardSkeleton.tsx`, `FundTableSkeleton.tsx`, `SimSimSummarySkeleton.tsx`, `SimSimChartSkeleton.tsx`) with geometry matching the live DOM nodes exactly, and coordinate page readiness through an `isPrimed` atomic barrier gate in `ScreenerContext` and `ScreenerDashboard`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Atomic Priming Gate | Client State (`ScreenerContext`) | — | Coordinates multi-source asynchronous data fetch (`fetchFundsSummary`, `fetchCategoriesSummary`) behind a single boolean barrier before UI dispatch. |
| Pixel-Matched Skeletons | Browser / Client Components | CSS Design Tokens | Skeleton DOM geometry must mirror exact production element styles, paddings, and line-heights to eliminate layout shifts. |
| Shimmer Sweep Animation | CSS Compositor (`globals.css`) | GPU Transform Layer | CSS keyframes with hardware-accelerated linear gradient shifts prevent main-thread layout reflows during loading. |
| Zero CLS Verification | Vitest Unit & Regression Tests | Client Render Tree | Vitest tests assert skeleton node structures, layout class parity, and state barrier transitions. |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **LOAD-01** | Pixel-matched shimmer skeleton states matching exact primed layout geometries for table, metric summary cards, and chart canvas (CLS = 0) | Section "Architecture Patterns" outlines exact dimensional specifications for `FundCardSkeleton`, `FundTableSkeleton`, `SimSimSummarySkeleton`, and `SimSimChartSkeleton`. |
| **LOAD-02** | Atomic mounting barrier and synchronized data priming gate that reveals all page elements together in a coordinated transition, preventing staggered pop-in | Section "Pattern 2: Atomic Priming Barrier Gate" provides context state synchronization pattern ensuring all modules transition simultaneously via a 240ms crossfade. |
</phase_requirements>

---

## Standard Stack

### Core
| Library / Technique | Version | Purpose | Why Standard |
|---------------------|---------|---------|--------------|
| Native React Skeletons | 19.x (installed) | Pure JSX structure mirroring production components | Zero runtime overhead; eliminates external skeleton library bloat (`[VERIFIED: package.json:20]`) |
| CSS Shimmer Keyframes | Native CSS / Tailwind 4 | Linear gradient sweep animation across surface tokens | GPU-accelerated compositing; zero JavaScript animation runtime (`[VERIFIED: globals.css:1-100]`) |
| React Context Priming Barrier | Native React 19 hooks | Synchronized state latch (`isPrimed`) | Standard React pattern for coordinating multiple async promises before layout commit |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Material Symbols Outlined | Google Fonts | Metric icons in card/summary skeletons | Used to maintain exact icon container dimensions (`w-7 h-7`) during loading |
| Vitest | 5.0.3 (installed) | Automated unit testing for skeleton layout parity and state gate transitions | Run via `npm test` (`[VERIFIED: npm test: 84 passing]`) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom Tailwind Skeletons | `react-loading-skeleton` | Adds external dependency, conflicting CSS resets, and rigid HTML structures that diverge from customized design tokens. |
| Atomic Mounting Gate | Staggered Per-Component Loaders | Staggered loaders cause layout popping, jarring visual flashing, and unstable Cumulative Layout Shift. |

---

## Package Legitimacy Audit

No external packages required. Phase utilizes native React 19 components, Tailwind CSS 4 utility classes, and existing CSS variables.

---

## Architecture Patterns

### System Architecture Diagram

```
[ Initial Page Load ]
         │
         ▼
[ ScreenerContext: loadData() ]
    ├─ Promise.all([ fetchFundsSummary(), fetchCategoriesSummary() ])
    │
    ▼
[ Atomic Gate: isPrimed = false ]
    ├─ ActiveFiltersBar   ──► Renders Counter Skeleton (pulse pill, no "0 of 0" flash)
    ├─ Screener Dashboard ──► Renders FundCardSkeleton Grid OR FundTableSkeleton
    ├─ SimSim Workspace   ──► Renders SimSimSummarySkeleton (4 cards) + SimSimChartSkeleton (380px)
    │
    ▼ (All datasets loaded & initial indexes computed)
[ Atomic Gate: isPrimed = true ]
    │
    ▼
[ 240ms Synchronous Crossfade Transition ]
    └─ Seamless simultaneous reveal of all production views with CLS = 0
```

### Recommended Project Structure
```
src/
├── components/
│   ├── common/
│   │   └── SkeletonShimmer.tsx       # Reusable atomic shimmer wrapper/primitive
│   ├── screener/
│   │   ├── FundCardSkeleton.tsx      # Pixel-matched card skeleton (224px fixed height)
│   │   ├── FundTableSkeleton.tsx     # Pixel-matched table skeleton (10 cols, 12 rows, 52px row min-h)
│   │   └── ActiveFiltersSkeleton.tsx # Skeleton for counter & filter pills
│   └── simsim/
│       ├── SimSimSummarySkeleton.tsx # 4-card metric grid skeleton (116px height)
│       └── SimSimChartSkeleton.tsx   # Fixed 380px chart canvas skeleton with grid axes
└── app/
    └── globals.css                   # Shimmer gradient sweep keyframes & reduced motion rules
```

### Pattern 1: Pixel-Matched Shimmer Component
**What:** Shimmer components that match the exact computed dimensions, flex layouts, border radii, and paddings of production components.  
**Dimensional Specification:**
- **FundCardSkeleton**: Height 224px, rounded-2xl (`rounded-2xl`), border `border-surface-container`, top badge pill (24px), title placeholder (2-line), 4-cell metric grid matching `cagr_3y`, `cagr_5y`, `sharpe_ratio`, `volatility`, and footer action buttons.
- **FundTableSkeleton**: Matches `FundTable` sticky header (`sticky top-0 z-30`), 10 table columns (`Rank`, `Scheme Name`, `SmartScore`, `3Y Return`, `5Y Return`, `Sharpe`, `Volatility`, `TER`, `AUM`, `Compare`), and 12 rows at 52px each (`min-h-[52px]`).
- **SimSimSummarySkeleton**: Responsive 4-card grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`), 116px card height, with 28px icon placeholder, 32px headline placeholder, and secondary trend badge.
- **SimSimChartSkeleton**: Fixed 380px container height (`h-80 w-full`), header title placeholder, legend pills placeholder, and subtle dashed SVG/CSS Cartesian grid axes.

### Pattern 2: Atomic Priming Barrier Gate
**What:** State latch in `ScreenerContext.tsx` and `page.tsx` that blocks rendering partial, half-calculated, or zero-count UI states until all essential asynchronous dependencies have resolved.

```typescript
// Pattern in ScreenerContext
const [isPrimed, setIsPrimed] = useState<boolean>(false);

useEffect(() => {
  async function initializePlatform() {
    setIsPrimed(false);
    try {
      const [fundsData, catData] = await Promise.all([
        fetchFundsSummary(),
        fetchCategoriesSummary()
      ]);
      setRawFunds(fundsData);
      setCategories(catData);
    } finally {
      setIsPrimed(true);
    }
  }
  initializePlatform();
}, []);
```

### Anti-Patterns to Avoid
- **Generic pulse box (`animate-pulse h-56`)**: Crudely shaped boxes that don't match inner card layouts cause micro-shifts when fonts and badges render.
- **Zero-count flash ("Showing 0 of 0 Schemes")**: Rendering unprimed numbers while loading conveys broken state to users.
- **Unbounded chart canvas (`h-auto` or `display: none`)**: Removing chart containers from the DOM during calculation causes 380px jumps when charts mount.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Shimmer Sweep Animation | JavaScript animation loop or `setInterval` | Pure CSS hardware-accelerated `@keyframes shimmerSweep` | Zero main-thread overhead; silky 60fps/120fps motion. |
| Responsive Layout Geometry | Ad-hoc inline CSS widths/heights | Tailwind CSS container tokens matching target components | Guarantees identical responsive breakpoints and grid tracks. |

---

## Common Pitfalls

### Pitfall 1: Cumulative Layout Shift from Table Row Height Variance
**What goes wrong:** Skeleton table rows are 40px tall, but production table rows with two-line fund names or badges expand to 52px, causing a 144px vertical jump upon data load.  
**How to avoid:** Enforce identical vertical padding (`py-3 px-3`) and minimum heights (`min-h-[52px]`) on both `FundTableSkeleton` and `FundTable`.

### Pitfall 2: Reduced-Motion Violation
**What goes wrong:** Fast-sweeping high-contrast shimmer animations trigger vestibular discomfort for users who have requested reduced motion.  
**How to avoid:** Wrap shimmer animations in `@media (prefers-reduced-motion: reduce)` to replace the continuous sliding gradient with a static, subtle opacity pulse.

---

## Code Examples

### CSS Shimmer Keyframe in `globals.css`
```css
@keyframes shimmerSweep {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.shimmer-sweep {
  background: linear-gradient(
    90deg,
    var(--color-surface-container) 0%,
    var(--color-surface-container-low) 50%,
    var(--color-surface-container) 100%
  );
  background-size: 200% 100%;
  animation: shimmerSweep 1.8s infinite linear;
}

@media (prefers-reduced-motion: reduce) {
  .shimmer-sweep {
    animation: none;
    opacity: 0.8;
  }
}
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.0.3 (`[VERIFIED: package.json]`) |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| **LOAD-01** | Pixel-matched skeletons render with accurate structural dimensions, test IDs, and column counts | Unit / Component | `npm test src/lib/__tests__/skeleton-layout.test.ts` | ❌ Wave 0 Gap |
| **LOAD-02** | Atomic priming barrier holds back partial renders until both funds and categories resolve | Unit / State | `npm test src/lib/__tests__/atomic-barrier.test.ts` | ❌ Wave 0 Gap |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test && npm run typecheck`
- **Phase gate:** All 84+ existing tests pass + new skeleton & barrier tests pass.

### Wave 0 Gaps
- [ ] `src/lib/__tests__/skeleton-layout.test.ts` — asserts skeleton column counts, structural geometry, and matching container classes.
- [ ] `src/lib/__tests__/atomic-barrier.test.ts` — asserts that atomic readiness state coordinates async resolution cleanly.

---

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | No | Static presentation and client-side loading states only; no external network inputs accepted. |
| V14 Data Protection | No | Client UI rendering only. |

---

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `src/context/ScreenerContext.tsx`, `src/app/page.tsx`, `src/components/screener/FundTable.tsx`, `src/components/simsim/SimSimPage.tsx`
- `.planning/phases/BICKERBAPE-08-coordinated-atomic-skeleton-loading-system/08-UI-SPEC.md`
- Google Web Vitals Guidelines (Cumulative Layout Shift, CLS < 0.1)

---

## Metadata

**Research date:** 2026-10-12  
**Valid until:** 2026-11-12
