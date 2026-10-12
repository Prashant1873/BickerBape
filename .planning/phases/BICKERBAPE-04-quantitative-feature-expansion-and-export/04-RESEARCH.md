# Phase 4: Quantitative Feature Expansion & Export - Research

**Phase:** Phase 4
**Date:** 2026-10-11
**Status:** Complete

## Technical Architecture & Findings

### 1. Benchmark Outperformance Ratio Visualizer (FEAT-01)
- **Data availability in `FundSummary`:**
  - `fund.ratio_3y`: 3-year outperformance ratio vs category median (e.g. `1.38`).
  - `fund.ratio_5y`: 5-year outperformance ratio vs category median (e.g. `1.42`).
  - `fund.ratio_10y`: 10-year outperformance ratio vs category median.
  - `fund.alpha_estimate`: Alpha over category/Nifty 50.
- **Visual Design:**
  - Dedicated "Category Benchmark Outperformance" visual card in `DrawerScorecardTab.tsx`.
  - Progress gauge / ratio bar showing ratio value with benchmark parity line at 1.00x:
    - Values >= 1.25x: Institutional alpha compounder (Green #00A86B / #00F090).
    - Values 1.00 - 1.24x: Moderate peer outperformance (Blue / Primary).
    - Values < 1.00x: Underperforming category median (Amber / Red).

### 2. SimSim Portfolio Simulation Export Engine (FEAT-02)
- **CSV Export Format:**
  - Section 1: Portfolio Summary (Total Invested, Present Value, Absolute Gain, CAGR/XIRR %, Alpha %, Max Drawdown %, Horizon).
  - Section 2: Constituent Allocations (Scheme Name, Fund House, Category, Weight %, Capital Allocated, Units, Current Value, Return %).
  - Section 3: Time Series Trajectory (Date, Portfolio Value, Benchmark Value, Invested Capital).
- **Client-Side Trigger:**
  - Generate CSV string with proper quotes, construct `Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })`, create transient `<a>` download element.
- **Print / PDF Trigger:**
  - `window.print()` with `@media print` CSS utility hiding navigation bars, sticky buttons, and sidebar while showing printable portfolio summary sheet.

## Plan Breakdown Recommendation
- **04-01-PLAN.md**: Benchmark outperformance ratio visualizer and category alpha comparison cards in `DrawerScorecardTab.tsx` (`FEAT-01`).
- **04-02-PLAN.md**: SimSim portfolio CSV export utility and printable summary document (`FEAT-02`).
