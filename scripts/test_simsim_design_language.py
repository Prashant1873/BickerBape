import time
from playwright.sync_api import sync_playwright

def test_simsim_design_language():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("\n=== Testing SimSim Design Language Harmony (Radii, Fonts, Blurs) ===")
        page.goto("http://localhost:8080")
        page.wait_for_selector(".card-interactive", timeout=10000)

        # 1. Enter SimSim mode
        print("\n[Step 1] Switching to SimSim Portal...")
        page.click("#sidebar-logo-switch")
        page.wait_for_selector("#simsim-container", timeout=10000)
        time.sleep(0.5)

        # -------------------------------------------------------------
        # 2. Verify Fonts (Hanken Grotesk Everywhere)
        # -------------------------------------------------------------
        print("\n[Step 2] Verifying Typography (Hanken Grotesk across all SimSim elements)...")
        elements_to_check_font = [
            ("Body SimSim Mode", "body.simsim-mode"),
            ("KPI Card 1", ".simsim-kpi-card:nth-child(1)"),
            ("KPI Card Value", ".simsim-kpi-card:nth-child(1) p"),
            ("Model Preset Button", ".model-preset-btn:nth-child(1)"),
            ("Capital Chip", ".capital-chip:nth-child(1)"),
            ("Top Action Equal Weight", "#simsim-equal-weight-btn"),
            ("Constituent Table Cell", ".simsim-table td:nth-child(1)"),
            ("Constituent Table Number", ".simsim-table td:nth-child(2)")
        ]

        for label, selector in elements_to_check_font:
            ff = page.locator(selector).first.evaluate("el => getComputedStyle(el).fontFamily")
            print(f"  {label} font-family: {ff}")
            assert "Hanken Grotesk" in ff, f"{label} should use Hanken Grotesk font, got {ff}"
        print("  PASSED: 100% typography unification with Screener (Hanken Grotesk)! ")

        # -------------------------------------------------------------
        # 3. Verify Radii Hierarchy (20px Major, 16px Panels, 12px Buttons, 9999px Pills)
        # -------------------------------------------------------------
        print("\n[Step 3] Verifying Radii Hierarchy...")
        
        # Major surfaces: 20px (matches Screener .card-interactive)
        r_kpi = page.locator(".simsim-kpi-card").first.evaluate("el => getComputedStyle(el).borderRadius")
        print(f"  KPI Card border-radius: {r_kpi}")
        assert r_kpi == "20px", f"KPI card should be 20px, got {r_kpi}"

        r_card = page.locator(".simsim-card").first.evaluate("el => getComputedStyle(el).borderRadius")
        print(f"  SimSim Surface Card border-radius: {r_card}")
        assert r_card == "20px", f"SimSim card should be 20px, got {r_card}"

        r_chart = page.locator(".simsim-chart-wrap").first.evaluate("el => getComputedStyle(el).borderRadius")
        print(f"  Chart Container border-radius: {r_chart}")
        assert r_chart == "20px", f"Chart container should be 20px, got {r_chart}"

        # Sub-panels / Tiles: 16px
        r_preset = page.locator(".model-preset-btn").first.evaluate("el => getComputedStyle(el).borderRadius")
        print(f"  Model Preset Tile border-radius: {r_preset}")
        assert r_preset == "16px", f"Model preset tile should be 16px, got {r_preset}"

        r_fund_card = page.locator("[data-fund-card]").first.evaluate("el => getComputedStyle(el).borderRadius")
        print(f"  Holdings Fund Card border-radius: {r_fund_card}")
        assert r_fund_card == "16px", f"Holdings card should be 16px, got {r_fund_card}"

        # Squircle Action Buttons: 12px (matches Screener .compare-toggle-btn)
        r_btn_eq = page.locator("#simsim-equal-weight-btn").evaluate("el => getComputedStyle(el).borderRadius")
        print(f"  Equal Weight Action Button border-radius: {r_btn_eq}")
        assert r_btn_eq == "12px", f"Action button should be 12px, got {r_btn_eq}"

        # Pills: 9999px (full pill)
        r_pill = page.locator("#simsim-mode-lumpsum").evaluate("el => getComputedStyle(el).borderRadius")
        print(f"  Mode Pill border-radius: {r_pill}")
        assert r_pill == "9999px", f"Mode pill should be 9999px, got {r_pill}"

        print("  PASSED: 100% Radii hierarchy matches Screener (20px / 16px / 12px / 9999px)!")

        # -------------------------------------------------------------
        # 4. Verify Translucent Materials & Blurs (Glassmorphism)
        # -------------------------------------------------------------
        print("\n[Step 4] Verifying Translucent Frosted Glass Materials & Blurs...")
        
        b_kpi = page.locator(".simsim-kpi-card").first.evaluate("el => getComputedStyle(el).backdropFilter")
        print(f"  KPI Card backdrop-filter: {b_kpi}")
        assert "blur" in b_kpi, f"KPI Card should have backdrop-filter blur, got {b_kpi}"

        b_card = page.locator(".simsim-card").first.evaluate("el => getComputedStyle(el).backdropFilter")
        print(f"  SimSim Surface Card backdrop-filter: {b_card}")
        assert "blur" in b_card, f"SimSim card should have backdrop-filter blur, got {b_card}"

        b_header = page.locator("header.sticky").evaluate("el => getComputedStyle(el).backdropFilter")
        print(f"  Header sticky backdrop-filter: {b_header}")
        assert "blur" in b_header, f"Header should have backdrop-filter blur, got {b_header}"

        b_fund = page.locator("[data-fund-card]").first.evaluate("el => getComputedStyle(el).backdropFilter")
        print(f"  Holdings Fund Card backdrop-filter: {b_fund}")
        assert "blur" in b_fund, f"Holdings fund card should have backdrop-filter blur, got {b_fund}"

        print("  PASSED: Frosted glass materials with backdrop blur active across SimSim!")

        # Capture high-res visual verification screenshots
        page.evaluate("document.getElementById('main-content').scrollTop = 0")
        time.sleep(0.3)
        shot1 = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/22_simsim_design_language_harmony_top.png"
        page.screenshot(path=shot1)
        print(f"  Captured: {shot1}")

        page.evaluate("document.getElementById('main-content').scrollTop = 650")
        time.sleep(0.3)
        shot2 = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/23_simsim_design_language_harmony_bottom.png"
        page.screenshot(path=shot2)
        print(f"  Captured: {shot2}")

        # Open Model Basket Modal and verify its blur and radii
        page.click(".model-preset-btn:nth-child(1)")
        time.sleep(0.3)
        modal_blur = page.locator("#simsim-basket-modal > div").evaluate("el => getComputedStyle(el).backdropFilter")
        modal_radius = page.locator("#simsim-basket-modal > div").evaluate("el => getComputedStyle(el).borderRadius")
        print(f"  Modal box backdrop-filter: {modal_blur}, border-radius: {modal_radius}")
        assert "blur" in modal_blur and modal_radius == "20px", "Modal should have blur and 20px radius"
        
        shot3 = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/24_simsim_modal_design_language.png"
        page.screenshot(path=shot3)
        print(f"  Captured: {shot3}")

        browser.close()

    print("\n=== ALL SIMSIM DESIGN LANGUAGE HARMONY TESTS PASSED! ===")

if __name__ == "__main__":
    test_simsim_design_language()
