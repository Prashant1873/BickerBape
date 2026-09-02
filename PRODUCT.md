# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML5, Vanilla ES6 JavaScript (Modules), Tailwind CSS CDN (`plugins=forms,container-queries`), Chart.js, SQLite database (`data/bickerbape.db`) with Python data sync pipelines (`serve.py`, `scripts/`). Zero Node.js build step or npm dependencies.

## Users

Retail DIY investors in India comparing Indian Equity Mutual Funds for long-term wealth creation, seeking transparent, institutional-grade analytics without sales bias or arbitrary percentile rankings.

## Product Purpose

Provide a high-performance, distraction-free screener and fund suggester that indexes the entire universe of ~620 active Equity Direct-Growth Mutual Funds in India using verified regulatory sources (AMFI & MFAPI). Success means empowering investors to select funds based on objective financial hurdle scoring rather than cyclical sector hype or marketing pitches.

## Positioning

Zero-bias institutional quantitative scoring model (SmartScore™) with dynamic "Investor Mood" weight recalibration (🚀 Growth, 🛡️ Safety, 💰 Income) and a strict Zero Estimations Policy. Evaluates funds via Outperformance Ratios vs Category Benchmarks and enforces fiduciary track record seasoning caps (<1Y and <3Y schemes).

## Operating Context

Used on desktop and mobile web browsers during portfolio review and investment decision-making. Operating environment requires real-time client-side dynamic filtering, instant weight recalibration, distraction-free scorecards, interactive financial charts (Chart.js), and zero lag when querying SQLite-driven fund datasets.

## Capabilities and Constraints

- **Capabilities**:
  - Universe of ~620 verified Equity Direct-Growth schemes from AMFI/MFAPI.
  - 4-pillar SmartScore™ calculation (Return Ratios vs Benchmarks, Track Record & Stability, Risk & Downside Volatility, Direct TER Expense Ratio).
  - 3 Investor Mood presets with instant client-side score re-ranking.
  - Fiduciary seasoning penalties (<1Y capped at 5.8/10, <3Y capped at 7.0/10) and Sector Concentration Risk penalties (-1.5 in Risk pillar).
  - Zero Estimations Policy (displays `N/A` for missing audited history).
  - SimSim AI Wizard for interactive goal-based fund recommendations.
  - Minimalist Accordion Scorecard Drawer and dockable Comparison Bar.
- **Constraints**:
  - Zero Node.js runtime/build dependencies (pure web standard static setup).
  - No manufactured or estimated financial metrics allowed.
  - SQLite database (`data/bickerbape.db`) serves as the single source of truth for NAV history and quant metrics.

## Brand Commitments

- **Name**: BickerBape
- **Visual Identity**: "Fiscal Clarity" design system. Primary brand colors: Royal Blue (`#0052cc` / `#003d9b`), Light Background (`#f8f9fb`), material-style surface hierarchy.
- **Voice**: Authoritative, transparent, quantitative, distraction-free, and institutional yet accessible.

## Evidence on Hand

- `README.md` with complete architectural and mathematical specifications.
- `index.html` containing full UI shell and Fiscal Clarity Tailwind configuration.
- `data/bickerbape.db` containing ~1.05M+ audited NAV records across 620 schemes.
- Verified daily data from AMFI master (`NAVAll.txt`) and MFAPI (`api.mfapi.in`).

## Product Principles

1. **Mathematical Rigor Over Hype**: Evaluate performance strictly using Outperformance Ratios relative to category benchmarks, not misleading raw CAGR.
2. **Absolute Transparency & Zero Estimations**: Never invent or estimate missing financial metrics; unproven metrics remain `N/A`.
3. **Fiduciary Risk Discipline**: Enforce strict seasoning caps on unproven schemes and penalize single-sector concentration risk.
4. **Dynamic Personalization**: Adapt scoring weights seamlessly to match investor intent (Growth, Safety, Income) without breaking core risk caps.
5. **Instant, Zero-Distraction UX**: Deliver institutional-grade speed, quiet UI accordions, and persistent comparison tools without unnecessary clutter.

## Accessibility & Inclusion

Responsive web interface supporting mobile, tablet, and desktop viewports, with high-contrast text ratios, clear financial typography (Hanken Grotesk), and intuitive touch/keyboard interactive controls.
