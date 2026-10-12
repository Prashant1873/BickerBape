# Phase 03: UI Polish & Mobile Ergonomics - Research

## Architectural Audit of Mobile Issues

### 1. Modals & Drawers (`UI-01`)
- **`FundDetailDrawer`**:
  - Desktop: Slide-in right panel (`max-w-2xl`).
  - Mobile (<640px): Full-width. Lacks mobile pull/drag indicator at the top. Needs safe-area padding at bottom for iOS home indicators (`pb-safe` or `pb-6`).
  - Backdrop: Has backdrop with click dismiss, which is good.
- **`SimSimBasketModal` & `ComparisonMatrixModal` & `KpiModal`**:
  - Modals use centered flexbox with `p-3 sm:p-4`.
  - On mobile, centering modals with `max-h-[90vh]` causes reachability issues for top close buttons.
  - Recommended mobile ergonomics: Transform into bottom sheets on mobile (`items-end sm:items-center`), with `rounded-t-3xl sm:rounded-3xl`, top grab bar handle (`w-10 h-1 bg-surface-container-highest rounded-full mx-auto my-2 block sm:hidden`), and backdrop click dismiss listener.

### 2. Fitts's Law 44px Touch Targets (`UI-02`)
- **WCAG 2.2 Success Criterion 2.5.8 (Target Size - Minimum)** and Apple HIG mandate interactive elements have a touch target of at least 44x44px.
- **Identified Violations**:
  - `FundTable`: Checkbox container was `w-7 h-7` (28px). Needs minimum `min-h-[44px] min-w-[44px]` touch area.
  - `FundTable`: SimSim toggle button was `h-7` (28px). Needs `min-h-[36px] sm:min-h-[44px]` with adequate touch padding.
  - `Navbar`: Mood pills, search trigger, theme toggle should guarantee 44px tap targets.
  - `ActiveFiltersBar`: Filter removal chips and reset triggers should offer 44px hitboxes.
  - `SidebarFilters`: Category and AMC checkboxes/pills should maintain 44px row heights.

### 3. Fund Table Sticky Headers (`UI-03`)
- **Current State**:
  - `FundTable` wraps table in `overflow-x-auto`.
  - Only `sticky left-0` is applied to the first column.
  - `thead` does NOT have `sticky top-0`. As users scroll down the list of 50+ funds, column headers vanish, breaking Jakob's Law of table navigation.
- **Solution**:
  - Set table wrapper with `max-h-[75vh] overflow-auto` or document-level sticky headers.
  - Give `thead` sticky pinning: `sticky top-0 z-20 bg-surface-container-low shadow-sm`.
  - Give top-left intersection header `sticky top-0 left-0 z-30`.
  - Provide horizontal scroll shadow indicators (`scroll-shadows` or border gradient hints) so users know table columns extend off-screen on mobile.
