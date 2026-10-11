# Phase 9: UI Design Contract (UI-SPEC.md) — Comprehensive UI/UX Craft Overhaul & Anti-Slop Audit

## 1. Executive Summary & Design Read
- **Target Mode**: `Operate` (Institutional Quantitative Mutual Fund Screener & Simulation Terminal).
- **Design Read**: Clean institutional fintech terminal combining FactSet/Bloomberg information density with Apple fluid spring physics and refined typographic clarity. Zero decorative AI purple gradients, zero nested unearned borders, zero arbitrary layout shifts.
- **Active Dials**:
  - `DESIGN_VARIANCE`: **3** (Disciplined institutional grid, structured financial tables).
  - `MOTION_INTENSITY`: **6** (Snappy Apple spring transitions, 240ms-340ms damping 1.0 settling).
  - `VISUAL_DENSITY`: **8** (High financial data density without visual clutter or cognitive overwhelm).

---

## 2. Cognitive Ergonomics & Laws of UX Contract (UX-01)

### 2.1 Hick's Law: Category & Filter Architecture
- **Problem**: 20 unchunked categories in a single flat vertical list trigger decision fatigue and extensive scrolling.
- **Contract**: Group equity categories into 3 cognitive clusters:
  1. **Core Market-Cap**: Large Cap, Mid Cap, Small Cap, Flexi Cap, Multi Cap, Large & Mid Cap.
  2. **Thematic & Sectoral**: Infrastructure, Healthcare, Technology, Banking & Financial, Consumption, Energy, Thematic.
  3. **Specialized & Tax**: ELSS, Contra, Value, Dividend Yield, Focused Fund.
- Provide a clean segment pill or collapsible group headers so users immediately locate their target market segment.
- Eliminate duplicate reset controls in `SidebarFilters.tsx`: preserve a single top-level reset action with active filter badge.

### 2.2 Jakob's Law: Familiar Table & Data Interactions
- Table header sorting follows universal financial convention:
  - Default: Unsorted (subtle hover state).
  - Active: Bold primary text with directional arrow (`arrow_upward` for asc, `arrow_downward` for desc).
  - Row click navigates to detail drawer; dedicated actions (SimSim, Compare) isolate click events with `stopPropagation`.

### 2.3 Miller's Law: Metric Chunking
- In `FundCard`:
  - **Hero Zone**: Fund name, category chip, AMC badge, SmartScore conic gauge with ranking.
  - **Performance Chunk**: 1Y, 3Y, 5Y CAGR with category outperformance ratio tags.
  - **Risk & Consistency Chunk**: Volatility, Sharpe ratio, and 3Y Rolling Average consistency.
  - Separate chunks via spatial rhythm (8px/12px) rather than heavy bounding boxes.

### 2.4 Doherty Threshold (<400ms Feedback)
- All client-side updates (filter selection, mood change, sorting direction) must calculate and render within 400ms.
- Slider adjustments debounce at 0ms client calculation via `useMemo` with zero DOM reflows.

---

## 3. Chrome Distillation & Anti-Slop Invariants (UX-02)

| Component | Slop Pattern Identified | Distillation Fix |
|-----------|-------------------------|------------------|
| `FundCard.tsx` | Inner metric box with redundant `border border-surface-container` inside already bordered card | Strip inner border; use `bg-surface-container-low/50 rounded-xl` with 8px spatial breathing room |
| `SidebarFilters.tsx` | Tip card multi-stop gradient (`bg-gradient-to-br from-primary/10 via...`) | Strip gradient to clean `bg-surface-container-low border border-surface-container` |
| `SidebarFilters.tsx` | Duplicate "Reset All" buttons inside body and header | Remove inner body reset button; keep single header button |
| `FundTable.tsx` | Inline shadow strings on sticky columns (`shadow-[2px_0_5px_rgba(0,0,0,0.04)]`) | Replace with standardized border line (`border-r border-surface-container`) or `--shadow-card` token |

---

## 4. Typographic Scale & Baseline Rhythm (UX-03)

### 4.1 Strict Typographic Scale
- **Display Financial (`font-display-financial`)**: 24px/32px, `font-black`, tabular figures (`tabular-nums lining-nums`).
- **Headline Medium (`font-headline-md`)**: 18px, `font-bold`, tracking `-0.015em`.
- **Headline Small (`font-headline-sm`)**: 15px, `font-semibold`, tracking `-0.01em`.
- **Body Medium (`font-body-md`)**: 13px-14px, `font-normal`, leading `1.45`.
- **Label Small (`font-label-sm`)**: 11px-12px, `font-bold`, uppercase tracking `0.04em`.
- **Micro / Tabular (`font-mono text-[10px]`)**: 10px-11px, `font-bold`, tabular lining figures.

### 4.2 Baseline & Concentric Geometry
- Concentric corner radii: $r_{inner} = \max(0, r_{outer} - \text{padding})$.
- Optical icon centering: `translateY(-0.5px)` relative to cap-height for all material symbols.
- 4px/8px incremental padding and margin across all cards, containers, and table cells.

---

## 5. Verification & Anti-Slop Checklist
- [ ] No unearned nested borders inside cards.
- [ ] No multi-color gradient slop behind utility components.
- [ ] Category list cleanly chunked without endless unguided scrolling.
- [ ] Strict 4px/8px spacing grid enforced.
- [ ] WCAG 2.2 AA contrast verified (>4.5:1 text, >3:1 icons/borders).
- [ ] All Vitest tests pass with 0 regressions.
