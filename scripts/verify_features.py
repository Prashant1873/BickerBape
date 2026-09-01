import os
import time
from playwright.sync_api import sync_playwright

def test_all():
    print("=== Testing SimSim Floating Bar, Slider 100% Mechanism & Card Depth ===")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://localhost:8080", wait_until="networkidle")
        page.wait_for_timeout(1000)

        # -------------------------------------------------------------
        # 1. Verify Card Styling: No generic solid left vertical line
        # -------------------------------------------------------------
        print("\n[Test 1] Verifying Featured Fund Cards have no generic solid left border...")
        left_stripes = page.locator(".card-interactive .absolute.left-0.w-1\\.5")
        print(f"  Solid left color stripes count on cards: {left_stripes.count()}")
        assert left_stripes.count() == 0, "No card should have the generic solid left vertical line"

        # Check depth / shadow on .card-interactive
        card_shadow = page.locator(".card-interactive").first.evaluate("el => window.getComputedStyle(el).boxShadow")
        print(f"  First card box-shadow: {card_shadow}")
        assert card_shadow and card_shadow != "none", "Card should have depth shadow"
        print("  PASSED: Featured cards have multi-layered depth shadow and no generic left lines!")

        # -------------------------------------------------------------
        # 2. Test Floating Tray: Add, Clear, and Dismiss
        # -------------------------------------------------------------
        print("\n[Test 2] Testing Floating Tray Clear and Dismiss buttons...")
        # Add 1st fund to bucket
        page.locator(".card-interactive").nth(0).locator(".simsim-add-btn").click()
        page.wait_for_timeout(300)

        # Check tray is visible
        tray_vis = page.locator("#simsim-floating-tray").evaluate("el => el.classList.contains('visible')")
        assert tray_vis, "Tray should be visible after adding fund"
        print("  Tray is visible with added fund.")

        # Test Dismiss button (small close icon)
        print("  Clicking dismiss button on tray...")
        page.click("#simsim-tray-dismiss-btn")
        page.wait_for_timeout(400)
        tray_after_dismiss = page.locator("#simsim-floating-tray").evaluate("el => el.classList.contains('visible')")
        assert not tray_after_dismiss, "Tray should be hidden after clicking dismiss button"
        print("  PASSED: Floating tray dismiss button successfully hides tray!")

        # Adding another fund brings tray back
        print("  Adding another fund to bring tray back...")
        page.locator(".card-interactive").nth(1).locator(".simsim-add-btn").click()
        page.wait_for_timeout(300)
        tray_reappeared = page.locator("#simsim-floating-tray").evaluate("el => el.classList.contains('visible')")
        assert tray_reappeared, "Tray should reappear when adding a new fund"
        print("  Tray reappeared with 2 funds.")

        # Test Clear Bucket button on tray
        print("  Clicking clear bucket button on tray...")
        page.click("#simsim-tray-clear-btn")
        page.wait_for_timeout(400)
        tray_after_clear = page.locator("#simsim-floating-tray").evaluate("el => el.classList.contains('visible')")
        assert not tray_after_clear, "Tray should be hidden after clearing bucket"
        print("  PASSED: Floating tray clear button emptied bucket and hid tray!")

        # Capture Screener screenshot
        shot_screener = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/15_screener_cards_depth.png"
        page.screenshot(path=shot_screener)
        print(f"  Captured: {shot_screener}")

        # -------------------------------------------------------------
        # 3. Enter SimSim Mode & Test Slider 100% Auto-Rebalance Mechanism
        # -------------------------------------------------------------
        print("\n[Test 3] Entering SimSim and testing Slider 100% Max Auto-Rebalance...")
        page.click("#sidebar-logo-switch")
        page.wait_for_timeout(1000)

        # Curated Titan starts with 3 funds: 40%, 35%, 25% (Sum = 100%)
        sliders = page.locator(".weight-slider")
        print(f"  Holdings sliders count: {sliders.count()}")
        assert sliders.count() == 3, "Titan model should have 3 fund sliders"

        # Check section title
        section_title = page.locator("#simsim-container h3").nth(1).text_content()
        print(f"  Holdings section title: '{section_title}'")
        assert "Portfolio Allocation" in section_title, "Title should be 'Portfolio Allocation (3 Schemes)'"

        # Read initial values
        v0 = int(sliders.nth(0).input_value())
        v1 = int(sliders.nth(1).input_value())
        v2 = int(sliders.nth(2).input_value())
        print(f"  Initial slider values: Fund1={v0}%, Fund2={v1}%, Fund3={v2}% | Sum={v0+v1+v2}%")
        assert v0 + v1 + v2 == 100, "Initial sum must be 100%"

        # Increase Fund 1 slider to 70%
        print("  Dragging Fund 1 slider to 70%...")
        sliders.nth(0).fill("70")
        sliders.nth(0).dispatch_event("input")
        page.wait_for_timeout(300)

        # Read new values of all 3
        nv0 = int(sliders.nth(0).input_value())
        nv1 = int(sliders.nth(1).input_value())
        nv2 = int(sliders.nth(2).input_value())
        print(f"  Updated slider values: Fund1={nv0}%, Fund2={nv1}%, Fund3={nv2}% | Sum={nv0+nv1+nv2}%")
        assert nv0 == 70, f"Fund 1 should be 70%, got {nv0}"
        assert nv0 + nv1 + nv2 == 100, f"Total must be capped at 100%, got {nv0+nv1+nv2}"
        print("  PASSED: Increasing Fund 1 automatically scaled down Fund 2 and Fund 3 to keep sum at 100%!")

        # Drag Fund 1 to 100%
        print("  Dragging Fund 1 slider to 100%...")
        sliders.nth(0).fill("100")
        sliders.nth(0).dispatch_event("input")
        page.wait_for_timeout(300)

        max_v0 = int(sliders.nth(0).input_value())
        max_v1 = int(sliders.nth(1).input_value())
        max_v2 = int(sliders.nth(2).input_value())
        print(f"  Values at 100%: Fund1={max_v0}%, Fund2={max_v1}%, Fund3={max_v2}% | Sum={max_v0+max_v1+max_v2}%")
        assert max_v0 == 100 and max_v1 == 0 and max_v2 == 0, "Others should scale to 0%"
        assert max_v0 + max_v1 + max_v2 == 100

        # Drag Fund 1 down to 50%
        print("  Dragging Fund 1 slider down to 50%...")
        sliders.nth(0).fill("50")
        sliders.nth(0).dispatch_event("input")
        page.wait_for_timeout(300)

        down_v0 = int(sliders.nth(0).input_value())
        down_v1 = int(sliders.nth(1).input_value())
        down_v2 = int(sliders.nth(2).input_value())
        print(f"  Values after reduction: Fund1={down_v0}%, Fund2={down_v1}%, Fund3={down_v2}% | Sum={down_v0+down_v1+down_v2}%")
        assert down_v0 == 50
        assert down_v0 + down_v1 + down_v2 == 100, "Sum must stay exactly 100%"
        print("  PASSED: Reducing Fund 1 distributes remaining budget so total remains 100%!")

        # -------------------------------------------------------------
        # 3.5 Test Multi-Segment Split Bar with Draggable Dividers
        # -------------------------------------------------------------
        print("\n[Test 3.5] Testing Multi-Segment Split Bar & Draggable Dividers...")
        split_bar = page.locator("#simsim-split-bar")
        assert split_bar.is_visible(), "Split bar must be visible in SimSim stage"

        segments = page.locator(".simsim-bar-segment")
        print(f"  Split bar segments count: {segments.count()}")
        assert segments.count() == 3, "Split bar should have 3 segments for 3 funds"

        dividers = page.locator(".simsim-bar-divider")
        print(f"  Movable dividers count: {dividers.count()}")
        assert dividers.count() == 2, "3 funds should have 2 movable dividers"

        # Check divider drag with pointer
        d0 = dividers.nth(0)
        box = d0.bounding_box()
        print(f"  Divider 0 bounding box: {box}")

        # Drag divider 0 by +60px to the right
        page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        page.mouse.down()
        page.mouse.move(box["x"] + 80, box["y"] + box["height"] / 2, steps=5)
        page.mouse.up()
        page.wait_for_timeout(400)

        # Verify new weights after dragging divider
        d_v0 = int(sliders.nth(0).input_value())
        d_v1 = int(sliders.nth(1).input_value())
        d_v2 = int(sliders.nth(2).input_value())
        print(f"  Weights after dragging divider 0: Fund1={d_v0}%, Fund2={d_v1}%, Fund3={d_v2}% | Sum={d_v0+d_v1+d_v2}%")
        assert d_v0 > 50, f"Fund 1 should have increased above 50%, got {d_v0}"
        assert d_v0 + d_v1 + d_v2 == 100, f"Total must stay 100%, got {d_v0+d_v1+d_v2}"
        print("  PASSED: Multi-Segment Split Bar drag reallocated weights seamlessly while keeping sum at 100%!")

        # -------------------------------------------------------------
        # 4. Verify SimSim KPI Cards Depth (No border-l-4)
        # -------------------------------------------------------------
        print("\n[Test 4] Verifying SimSim KPI Cards depth and aura...")
        kpi_solid_borders = page.locator(".simsim-kpi-card.border-l-4")
        print(f"  KPI cards with solid border-l-4: {kpi_solid_borders.count()}")
        assert kpi_solid_borders.count() == 0, "KPI cards should not have border-l-4"

        kpi_depth_cards = page.locator(".simsim-kpi-card")
        print(f"  KPI depth cards count: {kpi_depth_cards.count()}")
        assert kpi_depth_cards.count() == 4, "Should have 4 depth-styled KPI cards"

        # Capture SimSim screenshots
        page.evaluate("document.getElementById('main-content').scrollTop = 0")
        page.wait_for_timeout(300)
        shot_simsim1 = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/16_simsim_kpi_depth.png"
        page.screenshot(path=shot_simsim1)
        print(f"  Captured: {shot_simsim1}")

        page.evaluate("document.getElementById('main-content').scrollTop = 600")
        page.wait_for_timeout(400)
        shot_simsim2 = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/17_simsim_sliders_rebalanced.png"
        page.screenshot(path=shot_simsim2)
        print(f"  Captured: {shot_simsim2}")

        browser.close()

    print("\n=== ALL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_all()
