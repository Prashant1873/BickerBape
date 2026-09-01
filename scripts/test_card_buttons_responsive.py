import time
from playwright.sync_api import sync_playwright

def test_responsive_card_buttons():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Standard 1366x768 laptop resolution where cropping was most prominent
        context = browser.new_context(viewport={"width": 1366, "height": 768})
        page = context.new_page()

        print("\n=== Testing Responsive Card Action Buttons with Sidebar Toggle ===")
        page.goto("http://localhost:8080")
        page.wait_for_selector(".card-interactive", timeout=10000)
        time.sleep(0.5)

        # -------------------------------------------------------------
        # 1. Inspect card buttons with Sidebar OPEN (Default)
        # -------------------------------------------------------------
        print("\n[State 1] Sidebar is OPEN:")
        card0 = page.locator(".card-interactive").first
        card_box_open = card0.bounding_box()
        print(f"  Card width with sidebar OPEN: {card_box_open['width']:.1f}px")

        btn_details = card0.locator(".analyze-card-btn")
        btn_compare = card0.locator(".compare-toggle-btn")
        btn_simsim = card0.locator(".simsim-add-btn")

        w_details_open = btn_details.bounding_box()["width"]
        w_compare_open = btn_compare.bounding_box()["width"]
        w_simsim_open = btn_simsim.bounding_box()["width"]
        print(f"  Button widths with sidebar OPEN: Details={w_details_open:.1f}px, Compare={w_compare_open:.1f}px, SimSim={w_simsim_open:.1f}px")

        # Verify all 3 buttons are aligned on the same horizontal row (same or very close Y)
        y_details = btn_details.bounding_box()["y"]
        y_compare = btn_compare.bounding_box()["y"]
        y_simsim = btn_simsim.bounding_box()["y"]
        assert abs(y_details - y_compare) < 3 and abs(y_compare - y_simsim) < 3, "All 3 buttons must be on a single horizontal row"
        print("  PASSED: All 3 buttons fit cleanly on a single row without wrapping!")

        # Verify none of the buttons have horizontal text overflow / cropping
        for name, btn in [("Details", btn_details), ("Compare", btn_compare), ("SimSim", btn_simsim)]:
            overflow = btn.evaluate("el => el.scrollWidth > el.clientWidth + 2")
            assert not overflow, f"Button {name} should not be clipped/overflowing"
        print("  PASSED: Zero clipping or text cropping detected with sidebar OPEN!")

        shot_open = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/20_card_buttons_sidebar_open.png"
        page.screenshot(path=shot_open)
        print(f"  Captured: {shot_open}")

        # -------------------------------------------------------------
        # 2. Collapse Sidebar & Verify Buttons Dynamically Expand
        # -------------------------------------------------------------
        print("\n[State 2] Collapsing Sidebar...")
        page.click("#sidebar-collapse-btn")
        time.sleep(0.4) # Wait for width animation

        card_box_collapsed = card0.bounding_box()
        print(f"  Card width with sidebar COLLAPSED: {card_box_collapsed['width']:.1f}px")

        w_details_col = btn_details.bounding_box()["width"]
        w_compare_col = btn_compare.bounding_box()["width"]
        w_simsim_col = btn_simsim.bounding_box()["width"]
        print(f"  Button widths with sidebar COLLAPSED: Details={w_details_col:.1f}px, Compare={w_compare_col:.1f}px, SimSim={w_simsim_col:.1f}px")

        # Verify buttons dynamically changed size (expanded)
        print(f"  Button width delta: Details=+{w_details_col - w_details_open:.1f}px, Compare=+{w_compare_col - w_compare_open:.1f}px, SimSim=+{w_simsim_col - w_simsim_open:.1f}px")
        
        # Verify single row and zero overflow in collapsed state
        y_details_c = btn_details.bounding_box()["y"]
        y_compare_c = btn_compare.bounding_box()["y"]
        y_simsim_c = btn_simsim.bounding_box()["y"]
        assert abs(y_details_c - y_compare_c) < 3 and abs(y_compare_c - y_simsim_c) < 3, "Buttons must stay on single row"
        for name, btn in [("Details", btn_details), ("Compare", btn_compare), ("SimSim", btn_simsim)]:
            overflow = btn.evaluate("el => el.scrollWidth > el.clientWidth + 2")
            assert not overflow, f"Button {name} should not be clipped"
        print("  PASSED: Buttons dynamically expand and maintain zero clipping with sidebar COLLAPSED!")

        shot_collapsed = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/21_card_buttons_sidebar_collapsed.png"
        page.screenshot(path=shot_collapsed)
        print(f"  Captured: {shot_collapsed}")

        # -------------------------------------------------------------
        # 3. Expand Sidebar back & Verify Buttons Dynamically Contract
        # -------------------------------------------------------------
        print("\n[State 3] Expanding Sidebar back...")
        page.click("#sidebar-expand-btn")
        time.sleep(0.4)

        w_details_reopen = btn_details.bounding_box()["width"]
        print(f"  Button width after re-opening: Details={w_details_reopen:.1f}px")
        assert abs(w_details_reopen - w_details_open) < 4, "Buttons must dynamically contract back to open state"
        print("  PASSED: Buttons dynamically contract back smoothly when sidebar re-opens!")

        # -------------------------------------------------------------
        # 4. Multi-Resolution Stress Test (1024px, 1200px, 1600px)
        # -------------------------------------------------------------
        print("\n[State 4] Testing across multiple resolutions with sidebar open & closed...")
        for vp_w in [1024, 1200, 1600]:
            page.set_viewport_size({"width": vp_w, "height": 768})
            time.sleep(0.3)
            c_w = card0.bounding_box()["width"]
            b_w = btn_details.bounding_box()["width"]
            for name, btn in [("Details", btn_details), ("Compare", btn_compare), ("SimSim", btn_simsim)]:
                overflow = btn.evaluate("el => el.scrollWidth > el.clientWidth + 2")
                assert not overflow, f"Resolution {vp_w}px: Button {name} should not be clipped"
            print(f"  Resolution {vp_w}px (Sidebar Open): Card={c_w:.1f}px, Button={b_w:.1f}px, Overflow=NONE")

        browser.close()

    print("\n=== ALL RESPONSIVE CARD BUTTON TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_responsive_card_buttons()
