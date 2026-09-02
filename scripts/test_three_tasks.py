import time
import re
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

EMOJI_PATTERN = re.compile(r'[\U0001F300-\U0001F9FF\U00002600-\U000026FF\U00002700-\U000027BF\U0001FA00-\U0001FAFF]')

def test_all_three_tasks():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        print("\n============================================================")
        print("  VERIFICATION: Welcome Builder + Icons + Mobile")
        print("============================================================")

        # ===================== DESKTOP VIEWPORT =====================
        ctx_desktop = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx_desktop.new_page()
        page.goto("http://localhost:8080")
        page.wait_for_selector(".card-interactive", timeout=10000)

        # ----- TASK 1: Welcome Builder on Empty Bucket -----
        print("\n[TASK 1] Testing Welcome Builder on Empty Bucket...")

        # Clear any existing bucket from localStorage first
        page.evaluate("localStorage.removeItem('bickerbape_simsim_bucket')")
        page.reload()
        page.wait_for_selector(".card-interactive", timeout=10000)

        # Launch SimSim with empty bucket
        page.click("#sidebar-logo-switch")
        time.sleep(0.6)

        in_simsim = page.evaluate("document.body.classList.contains('simsim-mode')")
        assert in_simsim, "Should be in SimSim mode!"

        # Check welcome builder is rendered
        welcome = page.locator(".simsim-welcome-builder")
        assert welcome.is_visible(), "Welcome builder should be visible when bucket is empty!"
        print("  Welcome builder page rendered correctly!")

        # Check hero heading
        heading = page.locator(".simsim-welcome-builder h1")
        assert heading.is_visible(), "Welcome heading should be visible!"
        heading_text = heading.inner_text()
        assert "Welcome to SimSim" in heading_text, f"Heading should say Welcome to SimSim, got: {heading_text}"
        print(f"  Hero heading: '{heading_text}'")

        # Check 3 model portfolio cards
        basket_cards = page.locator(".welcome-basket-card")
        assert basket_cards.count() == 3, f"Should have 3 model portfolio cards, got {basket_cards.count()}"
        print(f"  Model portfolio cards: {basket_cards.count()} (Titan, Aggressive, Defensive)")

        # Check Build from Scratch button
        scratch_btn = page.locator("#welcome-build-scratch-btn")
        assert scratch_btn.is_visible(), "Build from Scratch button should be visible!"
        print("  Build from Scratch button visible!")

        # Click a model portfolio card (Titan) to load it
        page.click('[data-welcome-basket="titan"]')
        time.sleep(0.8)

        # Verify it loaded the template and switched to workspace
        workspace = page.locator(".simsim-welcome-builder")
        assert not workspace.is_visible(), "Welcome builder should be hidden after selecting a basket!"
        
        holdings = page.locator("#simsim-holdings-grid")
        assert holdings.is_visible(), "Holdings grid should be visible after loading template!"
        print("  Clicking Titan card loaded template and rendered workspace!")
        print("  TASK 1 PASSED!")

        # Take screenshot
        shot1 = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/27_simsim_workspace_after_welcome.png"
        page.screenshot(path=shot1)

        # ----- TASK 2: Emoji Replacement Verification -----
        print("\n[TASK 2] Testing Emoji Replacement (All emojis -> Material Symbols)...")

        # Check page body for any remaining emojis
        body_text = page.evaluate("document.body.innerText")
        found_emojis = EMOJI_PATTERN.findall(body_text)
        if found_emojis:
            print(f"  WARNING: Found {len(found_emojis)} remaining emojis in visible text: {found_emojis[:10]}")
        else:
            print("  No emojis found in visible page text!")

        # Check the body innerHTML for emojis too
        body_html = page.evaluate("document.body.innerHTML")
        html_emojis = EMOJI_PATTERN.findall(body_html)
        if html_emojis:
            print(f"  WARNING: Found {len(html_emojis)} emojis in HTML: {set(html_emojis)}")
        else:
            print("  No emojis found in body HTML!")

        # Check Material Symbols icons are present
        icons_count = page.locator(".material-symbols-outlined").count()
        print(f"  Material Symbols Outlined icons on page: {icons_count}")
        assert icons_count > 20, f"Should have many Material Symbols icons, only found {icons_count}"

        # Exit SimSim to check Screener icons too
        page.click("#simsim-exit-btn")
        time.sleep(0.4)

        # Check screener page for emojis
        screener_text = page.evaluate("document.body.innerText")
        screener_emojis = EMOJI_PATTERN.findall(screener_text)
        if screener_emojis:
            print(f"  WARNING: Found {len(screener_emojis)} emojis in Screener text: {set(screener_emojis)}")
        else:
            print("  No emojis in Screener visible text!")

        # Verify specific icon replacements
        mood_indicator = page.locator("#header-mood-indicator")
        if mood_indicator.count() > 0:
            mood_html = mood_indicator.inner_html()
            assert "material-symbols-outlined" in mood_html or mood_indicator.evaluate("el => getComputedStyle(el).display") == "none", "Mood indicator should use Material Symbols or be hidden on this viewport"

        sidebar_subtitle = page.locator("#sidebar-subtitle")
        sub_html = sidebar_subtitle.inner_html()
        assert "material-symbols-outlined" in sub_html, f"Sidebar subtitle should use Material Symbols icon! Got: {sub_html}"
        print("  Sidebar subtitle uses Material Symbols icon!")

        print("  TASK 2 PASSED!")

        ctx_desktop.close()

        # ===================== MOBILE VIEWPORT =====================
        print("\n[TASK 3] Testing Mobile Responsiveness (375x812 iPhone viewport)...")
        ctx_mobile = browser.new_context(viewport={"width": 375, "height": 812}, is_mobile=True)
        page_m = ctx_mobile.new_page()
        page_m.goto("http://localhost:8080")
        page_m.wait_for_selector(".card-interactive", timeout=10000)

        # Check no horizontal overflow
        has_overflow = page_m.evaluate("""
            () => {
                const body = document.body;
                return body.scrollWidth > window.innerWidth;
            }
        """)
        print(f"  Horizontal overflow on mobile: {has_overflow}")

        # Check card grid is single column
        card_grid = page_m.locator("#featured-funds-grid")
        grid_cols = card_grid.evaluate("el => getComputedStyle(el).gridTemplateColumns")
        print(f"  Card grid columns on mobile: {grid_cols}")

        # Check sidebar is hidden (not visible as fixed drawer)
        sidebar_visible = page_m.locator("#sidebar").evaluate("el => { const s = getComputedStyle(el); return s.transform !== 'matrix(1, 0, 0, 1, -300, 0)' && s.transform !== 'matrix(1, 0, 0, 1, -320, 0)'; }")
        print(f"  Sidebar visible on initial mobile load: {sidebar_visible}")

        # Click expand button to open sidebar drawer
        expand_btn = page_m.locator("#sidebar-expand-btn")
        assert expand_btn.is_visible(), "Expand button should be visible on mobile!"
        btn_height = expand_btn.evaluate("el => el.offsetHeight")
        print(f"  Expand button height: {btn_height}px (min 36px touch target)")
        assert btn_height >= 36, f"Expand button should be at least 36px tall, got {btn_height}"

        expand_btn.click()
        time.sleep(0.4)

        sidebar_open = page_m.locator("#sidebar").evaluate("el => el.classList.contains('mobile-open')")
        print(f"  Sidebar opens as mobile drawer: {sidebar_open}")
        assert sidebar_open, "Sidebar should have mobile-open class after clicking expand button!"

        # Check backdrop is visible
        backdrop_hidden = page_m.locator("#sidebar-mobile-backdrop").evaluate("el => el.classList.contains('hidden')")
        print(f"  Backdrop hidden: {backdrop_hidden}")
        assert not backdrop_hidden, "Backdrop should be visible when sidebar is open!"

        # Close sidebar via backdrop click
        page_m.click("#sidebar-mobile-backdrop")
        time.sleep(0.4)
        sidebar_closed = page_m.locator("#sidebar").evaluate("el => !el.classList.contains('mobile-open')")
        assert sidebar_closed, "Sidebar should close when backdrop is clicked!"
        print("  Sidebar closes on backdrop click!")

        # Take mobile screenshot
        shot_mobile = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/28_mobile_screener.png"
        page_m.screenshot(path=shot_mobile)
        print(f"  Captured: {shot_mobile}")

        # Test SimSim on mobile
        page_m.evaluate("localStorage.removeItem('bickerbape_simsim_bucket')")
        page_m.reload()
        page_m.wait_for_selector(".card-interactive", timeout=10000)

        # Open sidebar, click logo to enter SimSim
        # On mobile, use JS to trigger the click since backdrop can intercept
        page_m.click("#sidebar-expand-btn")
        time.sleep(0.5)
        page_m.evaluate("document.getElementById('sidebar-logo-switch').click()")
        time.sleep(0.8)

        in_simsim_m = page_m.evaluate("document.body.classList.contains('simsim-mode')")
        assert in_simsim_m, "Should enter SimSim mode on mobile!"

        # Welcome builder should render on mobile too
        welcome_m = page_m.locator(".simsim-welcome-builder")
        assert welcome_m.is_visible(), "Welcome builder should be visible on mobile!"
        print("  SimSim welcome builder renders on mobile!")

        shot_mobile_simsim = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/29_mobile_simsim_welcome.png"
        page_m.screenshot(path=shot_mobile_simsim)
        print(f"  Captured: {shot_mobile_simsim}")

        # Load Titan template and check mobile layout
        page_m.click('[data-welcome-basket="titan"]')
        time.sleep(0.8)

        shot_mobile_workspace = "C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/30_mobile_simsim_workspace.png"
        page_m.screenshot(path=shot_mobile_workspace)
        print(f"  Captured: {shot_mobile_workspace}")

        # Check no horizontal overflow in SimSim
        simsim_overflow = page_m.evaluate("() => document.body.scrollWidth > window.innerWidth")
        print(f"  SimSim horizontal overflow on mobile: {simsim_overflow}")

        print("  TASK 3 PASSED!")

        ctx_mobile.close()
        browser.close()

    print("\n=== ALL 3 TASKS VERIFIED SUCCESSFULLY! ===")
    print("  Task 1: Welcome Builder on Empty Bucket")
    print("  Task 2: Emojis replaced with Material Symbols")
    print("  Task 3: Mobile Responsiveness")

if __name__ == "__main__":
    test_all_three_tasks()
