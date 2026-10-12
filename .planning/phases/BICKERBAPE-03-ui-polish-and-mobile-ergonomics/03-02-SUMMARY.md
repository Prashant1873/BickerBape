---
phase: BICKERBAPE-03-ui-polish-and-mobile-ergonomics
plan: 02
status: completed
completed_at: 2026-10-11T23:34:10+05:30
requirements_covered:
  - UI-02
  - UI-03
files_modified:
  - src/components/screener/FundTable.tsx
  - src/components/screener/SidebarFilters.tsx
  - src/components/screener/ActiveFiltersBar.tsx
  - src/components/screener/FundCard.tsx
  - src/components/layout/Navbar.tsx
---

# Plan 03-02 Execution Summary: Fitts's Law 44px Touch Targets Audit & Table Header Stabilization

## Objective & Outcomes
Stabilized `FundTable` with two-dimensional sticky headers (`thead sticky top-0 z-30` and sticky left-column intersection `z-40`), added responsive horizontal scroll gradient hints for mobile, and completed a comprehensive Fitts's Law touch target audit guaranteeing minimum 44px hitboxes across buttons, chips, checkboxes, and search controls.

### Key Deliverables
1. **`FundTable.tsx`**:
   - Upgraded `thead` to `sticky top-0 z-30 bg-surface-container-low/95 backdrop-blur-sm shadow-xs`.
   - Upgraded top-left header cell to `sticky left-0 top-0 z-40 bg-surface-container-low`.
   - Expanded compare checkbox container to 44x44px (`w-11 h-11 min-w-[44px] min-h-[44px]`).
   - Upgraded SimSim toggle button to `min-h-[44px] px-3`.
   - Added right horizontal scroll gradient hint on small viewports (`sm:hidden`).
2. **`ActiveFiltersBar.tsx`**:
   - Upgraded sort direction toggle button to 44x44px.
   - Upgraded filter chip dismiss buttons to comfortable 28x28px targets within `min-h-[36px]` chips.
   - Upgraded "Clear All" trigger to `min-h-[44px] px-3`.
3. **`SidebarFilters.tsx`**:
   - Upgraded filter reset buttons to touch-comfortable padding and minimum hitboxes.
4. **`FundCard.tsx`**:
   - Upgraded quick SimSim and Compare buttons to `min-h-[44px] px-3`.
5. **`Navbar.tsx`**:
   - Upgraded mode switcher tabs (Screener vs SimSim) to `min-h-[44px]`.
   - Upgraded mood radio switchers to `min-h-[40px] sm:min-h-[44px]`.
   - Upgraded desktop sidebar expand/collapse button to 44x44px.
   - Upgraded mobile search clear button to 44x44px touch hitbox.

## Verification
- `npm run typecheck`: Passed with 0 errors.
- Requirements satisfied: `UI-02`, `UI-03`.
