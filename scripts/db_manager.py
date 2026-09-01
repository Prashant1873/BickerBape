#!/usr/bin/env python3
"""
BickerBape Relational Database Manager & Institutional Quant Engine:
Maintains SQLite database data/bickerbape.db with 100% verified daily historical NAVs,
quant metrics (CAGR, Rolling Returns, Sharpe, Sortino, Drawdown, Volatility),
and Absolute Financial Hurdle Scoring.
"""

from enrich_and_audit_database import run_full_enrichment

if __name__ == "__main__":
    run_full_enrichment()
