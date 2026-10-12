# Phase 5: Design Tokens & Harmonious Color System - Context

**Gathered:** 2026-10-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish a unified, accessible semantic color system derived from `/frontend-skill` (colorize), eliminating dead pure black/gray palettes and guaranteeing WCAG 2.2 AA contrast compliance across light and dark modes:
- Semantic Chromatic Tokens (`COLOR-01`):
  - Calibrated light and dark surface levels with cool financial navy/slate undertones (eliminating raw `#000000`, `#71717a`, or generic washed-out AI slop).
  - Defined 9-step luminance surface ladder for cards, drawers, dialogs, and table rows.
- WCAG 2.2 AA Contrast Compliance & Semantic Palette (`COLOR-02`):
  - Every text color guarantees minimum 4.5:1 contrast against its respective canvas/surface container.
  - Active interactive controls, focus rings, and status badges guarantee minimum 3:1 contrast.
  - Financial semantic indicators (Gain, Loss, Warning, Parity, Benchmark Alpha) unified across screener, table, drawer, and SimSim.
</domain>

<decisions>
## Implementation Decisions

### D-01: Perceptual Hue-Tinted Neutral Standards
Neutral surfaces in dark mode will be grounded in deep twilight obsidian navy (`#0b111e`, `#111a2e`, `#16223b`, `#1e2e4f`) rather than generic lifeless `#0f172a` or pure `#000000`. Light mode surfaces will use clean alpine frost (`#f8fafd`, `#f0f4fa`, `#e6ecf6`).

### D-02: Institutional Financial Semantic System
- **Gain / Alpha Outperformance**: Emerald/Mint with guaranteed 4.5:1+ contrast on both light (`#057a55`) and dark (`#31c48d`).
- **Loss / Drawdown / High Risk**: Crimson/Coral with guaranteed 4.5:1+ contrast on light (`#c81e1e`) and dark (`#f98080`).
- **Warning / Moderate / Seasoning Cap**: Amber/Gold with guaranteed 4.5:1+ contrast on light (`#8e4b10`) and dark (`#faca15`).
- **Primary / Brand Action**: Vivid Institutional Cobalt (`#0052cc` light, `#3b82f6` dark).

### D-03: Zero Regression Strategy
Preserve Tailwind v4 `@theme` mappings while refining CSS variable values in `src/app/globals.css`, ensuring existing classnames (`bg-surface-container`, `text-on-surface`, `text-gain-text`, `bg-gain-bg`) inherit the upgraded palette without breaking JSX references.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 5 requirements (COLOR-01, COLOR-02)
- `.planning/REQUIREMENTS.md` — Color token and contrast specifications
- `C:\Users\u1233270\.gemini\config\skills\frontend-skill\reference\colorize.md` — Perceptual color standards
- `src/app/globals.css` — Core theme variables and token declarations
- `src/components/screener/FundTable.tsx` — High-density financial metrics display
- `src/components/drawer/FundDetailDrawer.tsx` — Detail drawer presentation surfaces

</canonical_refs>

<deferred>
## Deferred Ideas

- Button corner radii concentricity and sliding spring indicators (deferred to Phase 6).
- Motion engine and interruptible gesture transitions (deferred to Phase 7).

</deferred>
