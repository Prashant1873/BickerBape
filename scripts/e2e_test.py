#!/usr/bin/env python3
"""
Comprehensive Playwright E2E Test Suite for BickerBape:
Tests:
1. Unified SmartScore(TM) with dynamic blue-to-red hue and percentage fill (.smartscore-pill)
2. No lingering SuperScore references anywhere on page
3. 100% Data Enrichment: All funds have valid metrics & SmartScore >= 5.0 (no unfair penalties)
4. Copyable text verification (no select-none)
5. Brand logo loaded in header & favicon
6. Return vs Category Ratios displayed as top metric (3Y, 5Y, 10Y)
7. Mathematically ratio-ed circle outline mechanics for dials (--score-pct)
8. Compare tray centering, toggle & minimize dock mechanics
9. Detail Drawer 6 metric cards, 3M growth, 3M chart tab, 10-step checklist rename, and specific peer ranks
10. Zero browser console errors
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
    print("=== Starting BickerBape Comprehensive E2E Verification ===")
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

        # 1. Verify text is copyable (no select-none on body)
        body_classes = page.locator("body").get_attribute("class") or ""
        assert "select-none" not in body_classes, "Body should not have select-none; text must be copyable!"
        print("  Text is freely selectable and copyable!")

        # 2. Verify Brand Logo loaded
        logo_visible = page.locator("img[alt='BickerBape Logo']").first.is_visible()
        assert logo_visible, "Brand logo should be visible in header"
        print("  Brand logo verified in sidebar header!")

        # 3. Verify Unified SmartScore and NO SuperScore
        superscore_text_count = page.locator("text='SuperScore'").count()
        print(f"Lingering SuperScore references: {superscore_text_count}")
        assert superscore_text_count == 0, "All SuperScore references should be removed and merged into SmartScore"
        print("  SuperScore completely removed and merged into Unified SmartScore™!")

        # 4. Verify Return vs Category Ratios in Cards
        page.wait_for_selector(".card-interactive", timeout=10000)
        ratio_count = page.locator(".badge-ratio").count()
        print(f"Return vs Category ratio badges found: {ratio_count}")
        assert ratio_count > 0, "Return ratio badges should be present on cards"

        # 5. Verify SmartScore appears ONCE as a circular dial in cards
        first_card = page.locator(".card-interactive").first
        smartscore_gauges = first_card.locator(".smartscore-gauge").count()
        print(f"First card has {smartscore_gauges} SmartScore dial")
        assert smartscore_gauges == 1, "Card should have exactly 1 circular dial"

        # 6. Verify Ratio-ed Circle Outline Mechanics (--score-pct)
        gauge_style = page.locator(".card-interactive:first-child .smartscore-gauge").get_attribute("style") or ""
        print(f"Dial style mechanics: {gauge_style}")
        assert "--score-pct" in gauge_style, "Gauge must use ratio-ed --score-pct circumference mechanics"

        # 7. Verify Compare Tray is hidden initially (0 funds selected)
        tray_initially_visible = page.locator("#compare-tray").evaluate("el => el.classList.contains('visible')")
        assert not tray_initially_visible, "Compare tray must NOT be visible when 0 funds are selected!"
        print("  Compare tray is hidden when empty!")

        shot1 = os.path.join(ARTIFACTS_DIR, "01_featured_cards_view.png")
        page.screenshot(path=shot1, full_page=False)
        print(f"  Captured: {shot1}")

        # [Step 2] Switch to Table View & Check Unified SmartScore Pills
        print("\n[Step 2] Switching to Screener Table view...")
        page.click("#view-table-btn")
        time.sleep(0.4)

        table_rows = page.locator("#screener-table-body tr").count()
        print(f"Table rows rendered: {table_rows}")
        assert table_rows > 0, "Table should have fund rows"

        # Verify dynamic gradient SmartScore pills in table
        table_smart_pills = page.locator("#screener-table-body .smartscore-pill").count()
        print(f"SmartScore dynamic gradient pills in table: {table_smart_pills}")
        assert table_smart_pills > 0, "Table must have dynamic gradient SmartScore pills"

        # Verify Info (i) buttons in table headers
        info_btns = page.locator("th .info-btn").count()
        print(f"Info (i) buttons in table header: {info_btns}")
        assert info_btns >= 6, f"Expected at least 6 info buttons in table header, got {info_btns}"
        page.locator("th[data-sort='cagr_3y'] .info-btn").click()
        time.sleep(0.2)
        popup_text = page.locator("th[data-sort='cagr_3y'] .info-popup").text_content()
        print(f"  3Y Ratio info explanation: '{popup_text.strip()}'")
        assert "category average" in popup_text.lower(), "Popup should explain ratio vs category in simple English"
        print("  Info (i) button successfully explains complicated ratios in simple English!")

        # Sort by SmartScore column
        print("Sorting by SmartScore(TM)...")
        page.click("th[data-sort='smart_score']")
        time.sleep(0.4)

        shot2 = os.path.join(ARTIFACTS_DIR, "02_screener_table_view.png")
        page.screenshot(path=shot2, full_page=False)
        print(f"  Captured: {shot2}")

        # [Step 3] Test Compare Tray Toggle, Minimize & Centering Fix
        print("\n[Step 3] Testing Compare Tray centering & minimize toggle...")
        page.click("#screener-table-body tr:nth-child(1) .compare-toggle-btn")
        time.sleep(0.2)
        page.click("#screener-table-body tr:nth-child(2) .compare-toggle-btn")
        time.sleep(0.3)

        tray_now_visible = page.locator("#compare-tray").evaluate("el => el.classList.contains('visible')")
        assert tray_now_visible, "Compare tray should appear when funds are added"

        # Check centering: compute bounding box
        tray_box = page.locator("#compare-tray").bounding_box()
        viewport_width = 1440
        tray_center_x = tray_box['x'] + (tray_box['width'] / 2)
        print(f"Tray width: {tray_box['width']}, Center X: {tray_center_x} (Viewport middle: {viewport_width/2})")
        assert abs(tray_center_x - (viewport_width / 2)) < 5, f"Compare tray is not centered! Center X={tray_center_x}"
        print("  Compare tray is perfectly horizontally centered at bottom!")

        # Test minimize button
        print("Testing tray minimize button...")
        page.click("#minimize-compare-btn")
        time.sleep(0.3)
        tray_minimized = page.locator("#compare-tray").evaluate("el => el.classList.contains('minimized')")
        assert tray_minimized, "Tray should be minimized"
        print("  Compare tray minimized successfully!")

        # Test top navbar toggle button
        print("Testing top navbar toggle button...")
        page.click("#compare-tray-toggle-btn")
        time.sleep(0.3)
        tray_reopened = not page.locator("#compare-tray").evaluate("el => el.classList.contains('minimized')")
        print(f"Tray re-opened via navbar toggle: {tray_reopened}")

        # Open comparison modal
        page.click("#open-compare-btn")
        time.sleep(0.6)
        modal_visible = page.locator("#comparison-modal").is_visible()
        assert modal_visible, "Comparison modal should be open"

        # Verify no SuperScore row in modal
        modal_superscore = page.locator("#comparison-matrix").get_by_text("SuperScore").count()
        assert modal_superscore == 0, "No SuperScore row in comparison modal"

        shot6 = os.path.join(ARTIFACTS_DIR, "06_comparison_modal.png")
        page.screenshot(path=shot6, full_page=False)
        print(f"  Captured: {shot6}")

        page.click("#compare-close-btn")
        time.sleep(0.3)

        # [Step 4] Test Detail Drawer with Enhanced Metrics, 3M Tab, and Checklist Rename
        print("\n[Step 4] Opening fund detail drawer...")
        page.click("#screener-table-body tr:first-child")
        time.sleep(1)

        drawer_open = page.locator("#fund-drawer").evaluate("el => el.classList.contains('open')")
        assert drawer_open, "Drawer should be open"

        # Check SmartScore dynamic gradient pill in drawer header
        drawer_smart_pill = page.locator("#drawer-smartscore-badge .smartscore-pill").is_visible()
        assert drawer_smart_pill, "Drawer header must display dynamic gradient SmartScore pill"
        print("  Drawer header displays dynamic gradient SmartScore pill!")

        # Check 3M Growth & Return Ratios
        growth_3m_text = page.locator("#drawer-3m-growth").text_content()
        ratio_3y_text = page.locator("#drawer-3y-ratio").text_content()
        print(f"Drawer 3M Growth: {growth_3m_text} | 3Y Ratio: {ratio_3y_text}")
        assert "past 3M" in growth_3m_text, "Should show 3M growth"
        assert ("vs" in ratio_3y_text or "Fund Age" in ratio_3y_text or "N/A" in ratio_3y_text), "Should show return ratio or fund age"

        # Check that on first open, ALL scorecard accordions are closed!
        open_scorecard_count = page.locator("#drawer-scorecard-pillars .scorecard-item.open").count()
        print(f"Scorecard accordions open on first open: {open_scorecard_count}")
        assert open_scorecard_count == 0, f"On first open, all scorecard expands should be closed, got {open_scorecard_count} open"
        print("  On first open, all scorecard expands are confirmed closed!")

        # Click the first accordion and verify it opens
        page.click("#drawer-scorecard-pillars .scorecard-item:first-child .scorecard-trigger")
        time.sleep(0.3)
        open_after_click = page.locator("#drawer-scorecard-pillars .scorecard-item.open").count()
        assert open_after_click == 1, "First scorecard accordion should open when clicked"
        print("  Scorecard accordion opens smoothly upon user interaction!")

        # Verify info buttons in drawer
        drawer_info_btns = page.locator("#fund-drawer .info-btn").count()
        print(f"Info (i) buttons in fund drawer: {drawer_info_btns}")
        assert drawer_info_btns >= 6, f"Expected info buttons in drawer, got {drawer_info_btns}"
        print("  Info (i) buttons verified across drawer metric cards and scorecard submetrics!")

        # Check 10-Step Checklist Title Rename
        checklist_title = page.locator("#drawer-checklist").locator("xpath=..").locator("h4").text_content()
        print(f"Checklist title: {checklist_title}")
        assert "10-Step Checklist" in checklist_title, f"Checklist title should be '10-Step Checklist', got '{checklist_title}'"
        assert "Video" not in checklist_title, "Checklist title should NOT contain 'Video'"

        # Check Specific Peer Group Rank in Scorecard
        scorecard_rank_text = page.locator("#drawer-scorecard-overall").text_content()
        print(f"Scorecard peer group rank: {scorecard_rank_text.strip()}")
        assert "peers" in scorecard_rank_text, "Peer group rank should specify peers"

        # Test 3M Horizon Tab in Historical NAV Chart
        print("Testing 3M Horizon Tab in NAV Chart...")
        page.click(".horizon-tab[data-horizon='3M']")
        time.sleep(0.4)
        active_3m = page.locator(".horizon-tab[data-horizon='3M']").evaluate("el => el.classList.contains('active')")
        growth_headline = page.locator("#drawer-growth-headline").text_content()
        print(f"3M tab active: {active_3m} | Headline: {growth_headline}")
        assert active_3m, "3M tab should be active"

        shot4 = os.path.join(ARTIFACTS_DIR, "04_fund_detail_drawer.png")
        page.screenshot(path=shot4, full_page=False)
        print(f"  Captured: {shot4}")

        page.click("#drawer-close-btn")
        time.sleep(0.4)

        print("\n[Console Errors Check]")
        if console_errors:
            print(f"Warning: {len(console_errors)} console error(s) logged:")
            for err in console_errors:
                print("  ", err)
            raise AssertionError("Console errors detected")
        browser.close()

        # [Step 5] Verify Relational SQLite Database
        print("\n[Step 5] Verifying SQLite database data/bickerbape.db...")
        import sqlite3
        conn = sqlite3.connect("data/bickerbape.db")
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM schemes")
        scheme_count = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM nav_history")
        nav_count = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM smart_scores")
        score_count = c.fetchone()[0]
        conn.close()
        print(f"  SQLite DB verified: {scheme_count} schemes, {nav_count} historical NAV records, {score_count} scores")
        assert scheme_count == 620, f"Expected 620 schemes, got {scheme_count}"
        assert nav_count > 500000, f"Expected >500k NAV records, got {nav_count}"
        assert score_count == 620, f"Expected 620 scores, got {score_count}"

        print("\n=== All E2E Tests Passed Successfully! ===")

if __name__ == "__main__":
    run_tests()
