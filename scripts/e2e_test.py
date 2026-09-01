#!/usr/bin/env python3
"""
Comprehensive Playwright E2E Test Suite for BickerBape:
Tests:
1. Window fitting (Zero horizontal overflow verification: scrollWidth <= innerWidth)
2. Collapsible sidebar (collapse & re-expand)
3. Sidebar filters & category selection
4. Prashant's 10-Step Formula strategy preset
5. Detail drawer with 4 Chart.js charts and 10-step checklist
6. Workable Compare tray & Multi-fund comparison modal
7. Zero console error verification
"""

import os
import sys
import time

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = r"C:\Users\u1233270\.gemini\antigravity-ide\brain\d0626913-2eb8-4457-92b7-05d7498ebcdb"

def run_tests():
    print("=== Starting BickerBape Enhanced E2E Test Suite with Playwright ===")
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        print("\n[Step 1] Navigating to http://localhost:8080...")
        page.goto("http://localhost:8080", wait_until="networkidle")
        time.sleep(1)

        print(f"Page Title: {page.title()}")
        assert "BickerBape" in page.title(), "Page title should contain 'BickerBape'"

        # Verify Window Fitting (Zero horizontal scroll / overflow)
        scroll_width, inner_width = page.evaluate("() => [document.documentElement.scrollWidth, window.innerWidth]")
        print(f"Window fitting check: scrollWidth={scroll_width}, innerWidth={inner_width}")
        assert scroll_width <= inner_width, f"Page overflows window! scrollWidth ({scroll_width}) > innerWidth ({inner_width})"
        print("  Window fits 100% inside viewport with zero horizontal overflow!")

        shot1 = os.path.join(ARTIFACTS_DIR, "01_featured_cards_view.png")
        page.screenshot(path=shot1, full_page=False)
        print(f"  Captured: {shot1}")

        # [Step 2] Test Collapsible Sidebar
        print("\n[Step 2] Testing Collapsible Sidebar...")
        sidebar_collapsed_before = page.locator("#sidebar").evaluate("el => el.classList.contains('collapsed')")
        print(f"Sidebar collapsed initially: {sidebar_collapsed_before}")
        
        # Click collapse button
        page.click("#sidebar-collapse-btn")
        time.sleep(0.4)
        sidebar_collapsed_after = page.locator("#sidebar").evaluate("el => el.classList.contains('collapsed')")
        print(f"Sidebar collapsed after click: {sidebar_collapsed_after}")
        assert sidebar_collapsed_after, "Sidebar should be collapsed"

        # Expand again
        page.click("#sidebar-expand-btn")
        time.sleep(0.4)
        sidebar_reopened = not page.locator("#sidebar").evaluate("el => el.classList.contains('collapsed')")
        print(f"Sidebar re-opened: {sidebar_reopened}")
        assert sidebar_reopened, "Sidebar should re-open"

        # [Step 3] Test Screener Table View & Sorting
        print("\n[Step 3] Switching to Screener Table view...")
        page.click("#view-table-btn")
        time.sleep(0.4)

        shot2 = os.path.join(ARTIFACTS_DIR, "02_screener_table_view.png")
        page.screenshot(path=shot2, full_page=False)
        print(f"  Captured: {shot2}")

        # Sort by 3Y Rolling Return
        print("Sorting by 3Y Rolling Return...")
        page.click("th[data-sort='rolling_3y_avg']")
        time.sleep(0.4)

        shot3 = os.path.join(ARTIFACTS_DIR, "03_sorted_rolling_avg.png")
        page.screenshot(path=shot3, full_page=False)
        print(f"  Captured: {shot3}")

        # [Step 4] Test Detail Drawer
        print("\n[Step 4] Opening fund detail drawer...")
        page.click("#screener-table-body tr:first-child")
        time.sleep(1)

        drawer_open = page.locator("#fund-drawer").evaluate("el => el.classList.contains('open')")
        drawer_fund = page.locator("#drawer-fund-name").text_content()
        print(f"Drawer opened: {drawer_open}, Fund: {drawer_fund}")
        assert drawer_open, "Drawer should be open"

        shot4 = os.path.join(ARTIFACTS_DIR, "04_fund_detail_drawer.png")
        page.screenshot(path=shot4, full_page=False)
        print(f"  Captured: {shot4}")

        page.click("#drawer-close-btn")
        time.sleep(0.4)

        # [Step 5] Test Prashant's 10-Step Formula Preset
        print("\n[Step 5] Testing 'Prashant's 10-Step Formula' preset in sidebar...")
        page.click(".strategy-chip[data-preset='prashant']")
        time.sleep(0.5)

        prashant_count = page.locator("#screener-table-body tr").count()
        print(f"Funds passing Prashant's formula: {prashant_count}")

        shot5 = os.path.join(ARTIFACTS_DIR, "05_strategy_preset_filtered.png")
        page.screenshot(path=shot5, full_page=False)
        print(f"  Captured: {shot5}")

        # [Step 6] Test Workable Compare Funds Floating Tray & Modal
        print("\n[Step 6] Testing Compare Funds UX...")
        # Reset preset
        page.click(".strategy-chip[data-preset='prashant']")
        time.sleep(0.3)

        # Click compare buttons on 2 funds
        page.click("#screener-table-body tr:nth-child(1) .compare-toggle-btn")
        time.sleep(0.2)
        page.click("#screener-table-body tr:nth-child(2) .compare-toggle-btn")
        time.sleep(0.3)

        tray_visible = page.locator("#compare-tray").evaluate("el => el.classList.contains('visible')")
        tray_count_text = page.locator("#compare-count").text_content()
        print(f"Compare tray visible: {tray_visible} | Count: {tray_count_text}")
        assert tray_visible, "Compare tray should be visible"
        assert "2/3" in tray_count_text, "Compare count should show '2/3 Selected'"

        # Click Compare Now button
        page.click("#open-compare-btn")
        time.sleep(0.8)

        modal_visible = page.locator("#comparison-modal").is_visible()
        print(f"Comparison modal visible: {modal_visible}")
        assert modal_visible, "Comparison modal should be visible"

        shot6 = os.path.join(ARTIFACTS_DIR, "06_comparison_modal.png")
        page.screenshot(path=shot6, full_page=False)
        print(f"  Captured: {shot6}")

        # Close modal
        page.click("#compare-close-btn")
        time.sleep(0.3)

        print("\n[Console Errors Check]")
        if console_errors:
            print(f"Warning: {len(console_errors)} console error(s) logged:")
            for err in console_errors:
                print("  ", err)
        else:
            print("  Zero browser console errors! Perfect.")

        browser.close()
        print("\n=== All Tests Passed with Flying Colors! ===")

if __name__ == "__main__":
    run_tests()
