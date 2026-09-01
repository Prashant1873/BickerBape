#!/usr/bin/env python3
"""
BickerBape SmartScore (TM) Proprietary Analytics Engine:
Delegates to enrich_and_audit_database for verified AMFI/MFAPI database management and Absolute Scoring.
"""

from enrich_and_audit_database import run_full_enrichment

if __name__ == "__main__":
    run_full_enrichment()
