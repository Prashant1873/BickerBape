#!/usr/bin/env python3
"""
SimSim™ Automated End-to-End Test Suite
Tests:
1. Brand logo day/night mode switch
2. SimSim dark mode UI styling & header transformations
3. Real historical NAV backtesting (Lumpsum & Monthly SIP)
4. Chart.js wealth trajectory visualization & constituent breakdown table
5. Curated model portfolio templates (Titan, High-Alpha, Defensive)
6. Screener '+ SimSim' bucket addition and floating tray
7. Exit to screener and console errors audit
"""

import sys
import time

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from playwright.sync_api import sync_playwright

def run_tests():
    print("=" * 60)
    print("  SIMSIM™ AUTOMATED E2E VERIFICATION TEST")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        # [Step 1] Open Web App
        print("\n[Step 1] Navigating to http://localhost:8080...")
        page.goto("http://localhost:8080")
        page.wait_for_selector("#featured-funds-grid .card-interactive")
        print("  BickerBape initial screener loaded!")

        # Verify initial mode is Screener (light mode)
        is_dark = page.locator("body").evaluate("el => el.classList.contains('simsim-mode')")
        assert not is_dark, "Initial mode should be light screener"
        print("  Verified initial light mode Screener state.")

        # [Step 2] Test Logo Mode Switch into SimSim™ Dark Mode
        print("\n[Step 2] Clicking Brand Logo to enter SimSim™ Dark Mode...")
        page.click("#header-logo-switch")
        time.sleep(0.6)

        is_dark_now = page.locator("body").evaluate("el => el.classList.contains('simsim-mode')")
        assert is_dark_now, "Body should have 'simsim-mode' class after clicking logo switch"
        print("  Body successfully transformed to 'simsim-mode' dark theme!")

        simsim_visible = not page.locator("#simsim-container").evaluate("el => el.classList.contains('hidden')")
        assert simsim_visible, "#simsim-container should be visible"
        print("  SimSim™ container is active on main stage!")

        header_title = page.locator("#header-platform-title").text_content()
        print(f"  Header brand title: {header_title.strip()}")
        assert "SimSim" in header_title, "Header brand title should reflect SimSim™"

        # [Step 3] Verify Simulation Calculation Results (Lumpsum Mode)
        print("\n[Step 3] Verifying Real Historical NAV Backtesting Results...")
        page.wait_for_selector("#simsim-results-container .font-display-financial")
        
        # Present value headline
        pres_val_el = page.locator("#simsim-results-container .font-display-financial").first
        pres_val_text = pres_val_el.text_content().strip()
        print(f"  Simulated Present Value: {pres_val_text}")
        assert "₹" in pres_val_text and len(pres_val_text) > 3, "Present value should be calculated with ₹"

        # Check KPI Cards: Annualized CAGR, Alpha, Drawdown, Total Invested
        kpi_cards = page.locator("#simsim-results-container .simsim-card")
        print(f"  Results cards rendered: {kpi_cards.count()}")
        assert kpi_cards.count() >= 5, "Should render headline + 4 KPI stat cards"

        # Check Chart.js Canvas
        chart_rendered = page.locator("#simsim-chart-canvas").is_visible()
        assert chart_rendered, "SimSim Chart.js canvas should be rendered"
        print("  Interactive Chart.js wealth trajectory canvas rendered successfully!")

        # Check Constituent breakdown table
        table_rows = page.locator(".simsim-table tbody tr")
        row_count = table_rows.count()
        print(f"  Constituent schemes in portfolio: {row_count}")
        assert row_count >= 2, "Should display at least 2 constituent funds in starter portfolio"

        # Capture Screenshot: SimSim Overview
        shot1 = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/08_simsim_dark_mode_overview.png"
        page.screenshot(path=shot1, full_page=False)
        print(f"  Captured: {shot1}")

        # [Step 4] Test Investment Mode: Switch to Monthly SIP
        print("\n[Step 4] Testing Monthly SIP Simulation Mode...")
        page.click("#simsim-mode-sip")
        time.sleep(0.5)

        sip_active = page.locator("#simsim-mode-sip").evaluate("el => el.classList.contains('bg-[#00F090]')")
        assert sip_active, "Monthly SIP mode button should be active"

        sip_pres_val = page.locator("#simsim-results-container .font-display-financial").first.text_content().strip()
        print(f"  SIP Accumulated Value: {sip_pres_val}")
        assert "₹" in sip_pres_val, "SIP value should be calculated"

        shot2 = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/09_simsim_sip_simulation.png"
        page.screenshot(path=shot2, full_page=False)
        print(f"  Captured: {shot2}")

        # [Step 5] Test Curated Model Portfolios Dialogue Box
        print("\n[Step 5] Testing Curated Model Portfolios Dialogue Box...")
        # Click High-Alpha Rocket
        page.click(".model-preset-btn[data-preset='aggressive']")
        time.sleep(0.5)
        assert page.locator("#simsim-basket-modal").is_visible(), "Modal should open"
        page.click("#basket-modal-apply-btn")
        time.sleep(0.8)
        new_row_count = page.locator(".simsim-table tbody tr").count()
        print(f"  High-Alpha Rocket constituents: {new_row_count}")
        assert new_row_count >= 2, "High-Alpha preset should load constituents"

        # [Step 6] Test Exit to Screener
        print("\n[Step 6] Testing 'Exit to Screener' button...")
        page.click("#simsim-exit-btn")
        time.sleep(0.5)

        is_dark_exit = page.locator("body").evaluate("el => el.classList.contains('simsim-mode')")
        assert not is_dark_exit, "Body should no longer have 'simsim-mode' class"
        screener_back = not page.locator("#screener-views-wrapper").evaluate("el => el.classList.contains('hidden')")
        assert screener_back, "Screener views should be visible again"
        print("  Smooth exit back to BickerBape Screener verified!")

        # [Step 7] Test '+ SimSim' Add Button on Screener & Floating Tray
        print("\n[Step 7] Testing Screener '+ SimSim' Bucket Add & Floating Tray...")
        target_card_btn = page.locator("#featured-funds-grid .card-interactive").nth(4).locator(".simsim-add-btn")
        # Ensure it starts not in bucket
        if target_card_btn.evaluate("el => el.classList.contains('in-bucket')"):
            target_card_btn.click()
            time.sleep(0.3)

        print("  Clicking '+ SimSim' button on 5th card...")
        target_card_btn.click()
        time.sleep(0.4)

        # Verify button shows 'In SimSim'
        btn_text = target_card_btn.text_content().strip()
        print(f"  Card button text after click: {btn_text}")
        assert "In SimSim" in btn_text, f"Button should update to 'In SimSim', got '{btn_text}'"

        # Verify floating tray is visible
        tray_visible = page.locator("#simsim-floating-tray").evaluate("el => el.classList.contains('visible')")
        assert tray_visible, "Floating SimSim bucket tray should be visible"
        tray_count = page.locator("#simsim-tray-count").text_content()
        print(f"  Floating tray count: {tray_count}")
        assert "Fund" in tray_count, "Tray should display active fund count"

        shot3 = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/10_simsim_screener_bucket_tray.png"
        page.screenshot(path=shot3, full_page=False)
        print(f"  Captured: {shot3}")

        # Hover on docked floating tray to expand it, then click Simulate
        page.hover("#simsim-floating-tray")
        time.sleep(0.3)
        page.click("#simsim-tray-launch-btn")
        time.sleep(0.5)
        re_entered = page.locator("body").evaluate("el => el.classList.contains('simsim-mode')")
        assert re_entered, "Floating tray launch button should enter SimSim mode"
        print("  Re-entered SimSim mode via floating tray launch CTA!")

        # Check console errors
        print("\n[Console Errors Audit]")
        print(f"  Errors recorded: {len(console_errors)}")
        if console_errors:
            print("  Errors:", console_errors)
        assert len(console_errors) == 0, f"Found console errors: {console_errors}"

        browser.close()

    print("\n=== ALL SIMSIM™ E2E TESTS PASSED WITH ZERO CONSOLE ERRORS! ===")

if __name__ == "__main__":
    run_tests()
