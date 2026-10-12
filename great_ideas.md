# Great Ideas & Design Directions

## Core Value Concepts
- **Institutional SmartScore™**: 4-pillar quantitative scoring model (Return Ratios vs Benchmarks, Track Record & Stability, Risk & Volatility, Expense Ratio) eliminating subjective marketing hype.
- **Strict Fiduciary Seasoning Caps**: Unproven schemes under 1 year history are strictly capped at 5.8/10; schemes under 3 years are capped at 7.0/10.
- **Zero Estimations Policy**: Absolute refusal to manufacture or extrapolate missing track records; incomplete metrics display explicit `N/A`.
- **Dynamic Investor Mood Recalibration**: Instant client-side score re-ranking tailored to investor intent:
  - 🚀 **Growth**: Heavy weight on Alpha & Outperformance (45% perf, 25% track, 20% risk, 10% cost)
  - 🛡️ **Safety**: Heavy weight on Capital Protection & Low Volatility (45% risk, 25% track, 20% perf, 10% cost)
  - 💰 **Income**: Heavy weight on Cost Efficiency & Stability (35% cost, 30% risk, 20% track, 15% perf)
- **SimSim™ Interactive Portfolio Simulation**: Historical multi-asset backtesting engine supporting lumpsum growth and monthly SIP unit accumulation with real-time XIRR convergence.
- **Dockable Comparison & Head-to-Head Matrix**: Persistent bottom tray allowing seamless multi-fund comparison across dozens of quantitative dimensions.
- **Automated Daily Data & Deployment Pipeline**: Hands-free GitHub Actions cron job triggering at midnight IST post-market, executing quant audits, updating SQLite and master bundles, and deploying to GitHub Pages.

## Visual & Interaction Design Directions
- **Fiscal Clarity Design System**: Clean surface container hierarchy, subtle borders, and distraction-free institutional density.
- **Tabular Numeric Typography**: Strict enforcement of `font-variant-numeric: tabular-nums lining-nums` across all financial figures to ensure columnar scannability.
- **Fitts's Law Ergonomics**: Minimum 44px touch target zones on all interactive controls with Apple-style spring animations (`touch-spring`).
- **Apple Fluid Motion & Concentric Radii (/frontend-skill)**: Enforce $r_{inner} = \max(0, r_{outer} - \text{padding})$ across nested containers, sub-pixel optical icon centering (`translateY(-0.5px)`), and viscoelastic sliding tab rails.
- **Fluid Segmented Selection Pin**: Adjacent toggle buttons share a single unified holder with an active indicator pin that elastically stretches to bridge source and target before squishing/settling into place, eliminating individual button distortion.
- **Coordinated Atomic Skeleton Loading**: Full-layout pixel-matched skeleton screens paired with an atomic transition barrier, preventing piecemeal rendering and eliminating layout shift (CLS = 0).
- **Official AMC Brand Recognition System**: High-contrast, high-resolution official fund house emblems with graceful fallback monogram pills, delivering instant visual trust and recognition across all cards, comparison matrices, tables, and simulation reports.

