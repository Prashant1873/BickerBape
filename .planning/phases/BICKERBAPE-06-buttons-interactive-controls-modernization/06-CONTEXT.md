# Phase 6: Buttons & Interactive Controls Modernization - Context

**Gathered:** 2026-10-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Modernize all interactive buttons, pill tags, filter chips, and switchers following `/frontend-skill` (reference/buttons.md) and Apple HIG physical tactile interaction standards:
- Concentric Corner Radii Geometry (`BTN-01`):
  - Strictly enforce $r_{inner} = \max(0, r_{outer} - \text{padding})$ across outer card/rail containers and inner buttons/indicators, eliminating corner-pinching.
  - Sub-pixel optical centering (`transform: translateY(-0.5px)` or `.optical-icon`) across all SVG and Material Symbol glyphs relative to typography cap-height.
  - High-contrast `:focus-visible` dual rings (`outline: 2px solid var(--primary); outline-offset: 2px`).
- Tactile Physical Dynamics & Viscoelastic Sliding Rails (`BTN-02`):
  - Zero pointer-lag active-down feedback with GPU-accelerated Poisson volume compression (`transform: scale(1.02, 0.95)` on `:active`).
  - Active sliding rail indicators with spring kinetics for Investor Mood switchers (Growth, Safety, Income) in Navbar, Mode Switcher (Screener <-> SimSim), and time horizon pill filters.
</domain>

<decisions>
## Implementation Decisions

### D-01: Concentric Geometry Enforced
- Segmented switchers (outer container `p-1 rounded-2xl` [16px outer, 4px pad] -> inner child `rounded-xl` [12px inner]).
- Small chips (outer container `p-1 rounded-xl` [12px outer, 4px pad] -> inner child `rounded-lg` [8px inner]).
- Inner pill chips inside lists have concentric boundary math applied.

### D-02: GPU-Accelerated Poisson Active Compression
Replace sluggish or linear active transforms with physics-based volume preservation:
- Base: `transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease; will-change: transform;`
- Active: `transform: scale(1.02, 0.95); transition: transform 70ms cubic-bezier(0.1, 0.9, 0.2, 1);`
- Zero layout reflow: no animating padding or margin.

### D-03: Viscoelastic Indicator for Mood & Mode Switchers
In `Navbar.tsx`, implement smooth active indicator positioning with spring transition easing so the active indicator moves organically between options without jump cuts.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 6 requirements (BTN-01, BTN-02)
- `.planning/REQUIREMENTS.md` — Button geometry, optical centering, and sliding rails
- `C:\Users\u1233270\.gemini\config\skills\frontend-skill\reference\buttons.md` — Tactile button & concentric radii standards
- `src/app/globals.css` — Global button states, optical icon centering, and touch-spring physics
- `src/components/layout/Navbar.tsx` — Canonical Mode switcher & Investor Mood 3-way controller
- `src/components/screener/SidebarFilters.tsx` — Strategy presets & category filter buttons
- `src/components/screener/FundTable.tsx` — Action buttons and table triggers

</canonical_refs>

<deferred>
## Deferred Ideas

- Full gesture drag dismiss and velocity handoff physics (deferred to Phase 7: Motion Engine).
- Pixel-matched skeleton loading states (deferred to Phase 8).

</deferred>
