# Phase 7: Apple Fluid Animation & Motion Engine - Context

**Gathered:** 2026-10-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Infuse Apple HIG spring physics and interruptible micro-interactions across slideover drawers, modals, trays, and interactive cards per `/frontend-skill` (animate):
- Apple Fluid Spring Physics (`ANIM-01`):
  - Slideover drawers (`FundDetailDrawer.tsx`), modals (`ComparisonMatrixModal.tsx`, `SimSimBasketModal.tsx`, `KpiModal.tsx`), and dockable tray utilize critically damped spring physics (`cubic-bezier(0.16, 1, 0.3, 1)` with `damping: 1.0` interface settling).
  - Exit faster than entrance (e.g., entrance 300ms, exit 200ms) with natural physical deceleration.
- GPU-Accelerated Interruptible Transforms & Respect for Reduced Motion (`ANIM-02`):
  - Transitions leverage composited properties (`transform`, `opacity`) exclusively with zero layout reflow.
  - Full `prefers-reduced-motion: reduce` graceful fallback path preserving meaningful opacity and state confirmations while removing intense spatial translation.
</domain>

<decisions>
## Implementation Decisions

### D-01: Shared Apple Spring Keyframes & Classes in `globals.css`
Declare reusable GPU-accelerated spring animations:
- `.apple-spring-in`: `transform: translateY(0) scale(1); opacity: 1; cubic-bezier(0.16, 1, 0.3, 1)` (320ms).
- `.apple-drawer-slide-in`: `transform: translateX(0); cubic-bezier(0.16, 1, 0.3, 1)` (340ms).
- `.apple-backdrop-fade`: `backdrop-filter: blur(8px); opacity: 1; cubic-bezier(0.16, 1, 0.3, 1)` (240ms).

### D-02: Modal and Drawer Modernization
Upgrade `FundDetailDrawer.tsx`, `ComparisonMatrixModal.tsx`, `SimSimBasketModal.tsx`, and `KpiModal.tsx` to adopt the Apple fluid spring classes and smooth interruptible backdrop transitions.

### D-03: Accessibility & Zero-Reflow Invariants
Never animate `left`, `right`, `top`, `bottom`, `width`, or `height`. Strict adherence to `prefers-reduced-motion: reduce` preserving opacity transitions without spatial motion.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 7 requirements (ANIM-01, ANIM-02)
- `.planning/REQUIREMENTS.md` — Animation and motion criteria
- `C:\Users\u1233270\.gemini\config\skills\frontend-skill\reference\animate.md` — Apple fluid motion standards
- `src/app/globals.css` — Global motion classes and reduced-motion media query
- `src/components/drawer/FundDetailDrawer.tsx` — Scheme detail slideover drawer
- `src/components/comparison/ComparisonMatrixModal.tsx` — Comparison modal dialog

</canonical_refs>

<deferred>
## Deferred Ideas

- Coordinated atomic skeleton loading gates and CLS zero shimmer (deferred to Phase 8).

</deferred>
