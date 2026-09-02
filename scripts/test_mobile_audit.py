import time
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

def run_mobile_audit():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={'width': 375, 'height': 812}, is_mobile=True)
        page = ctx.new_page()
        page.goto('http://localhost:8080')
        page.wait_for_selector('.card-interactive', timeout=10000)

        print("\n============================================================")
        print("  MOBILE AUDIT & VERIFICATION (iPhone 375x812)")
        print("============================================================")

        # ---------------------------------------------------------------
        # TEST 1: SIDEBAR DRAWER - UNBLURRED & CLICKABLE
        # ---------------------------------------------------------------
        print("\n[TEST 1] Testing Sidebar Menu on Mobile...")
        expand_btn = page.locator('#sidebar-expand-btn')
        assert expand_btn.is_visible(), "Sidebar expand button should be visible"
        expand_btn.click()
        time.sleep(0.5)

        sb = page.locator('#sidebar')
        bd = page.locator('#sidebar-mobile-backdrop')
        
        sb_z = int(sb.evaluate('el => getComputedStyle(el).zIndex'))
        bd_z = int(bd.evaluate('el => getComputedStyle(el).zIndex'))
        print(f"  Sidebar z-index: {sb_z}, Backdrop z-index: {bd_z}")
        assert sb_z > bd_z, f"Sidebar (z={sb_z}) MUST be higher than backdrop (z={bd_z})!"

        # Check what element is at (150, 200) - inside the sidebar area
        top_elem = page.evaluate('''() => {
            const el = document.elementFromPoint(150, 200);
            return { tag: el.tagName, id: el.id, className: el.className, closestSidebar: !!el.closest('#sidebar') };
        }''')
        print(f"  Element at (150, 200): {top_elem}")
        assert top_elem['closestSidebar'], f"Element over sidebar must belong to #sidebar, got {top_elem}!"
        print("  PASSED: Sidebar menu is NOT covered by blur/backdrop!")

        # Screenshot unblurred mobile sidebar
        page.screenshot(path='C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/31_mobile_sidebar_unblurred.png')
        print("  Screenshot saved: 31_mobile_sidebar_unblurred.png")

        # Click a category inside sidebar and check it filters & closes drawer
        flexi_pill = page.locator('#sidebar-categories-list .category-pill[data-category="Flexi Cap"]')
        if flexi_pill.count() > 0:
            flexi_pill.click()
            time.sleep(0.5)
            sb_open = sb.evaluate('el => el.classList.contains("mobile-open")')
            print(f"  Sidebar closed after category selection: {not sb_open}")

        # Reset category to All Funds
        expand_btn.click()
        time.sleep(0.4)
        all_pill = page.locator('#sidebar-categories-list .category-pill[data-category="All Funds"]')
        if all_pill.count() > 0:
            all_pill.click()
            time.sleep(0.4)

        # ---------------------------------------------------------------
        # TEST 2: TABLE VIEW ON MOBILE
        # ---------------------------------------------------------------
        print("\n[TEST 2] Testing Table View on Mobile...")
        table_btn = page.locator('#view-table-btn')
        assert table_btn.is_visible(), "Table view button should be visible"
        table_btn.click()
        time.sleep(0.5)

        cards_grid = page.locator('#featured-funds-grid')
        table_container = page.locator('#screener-table-container')

        cards_disp = cards_grid.evaluate('el => getComputedStyle(el).display')
        table_disp = table_container.evaluate('el => getComputedStyle(el).display')
        print(f"  Cards grid display: '{cards_disp}'")
        print(f"  Table container display: '{table_disp}'")
        assert cards_disp == 'none', f"Cards grid MUST be hidden (display: none), got '{cards_disp}'!"
        assert table_disp == 'block', f"Table container MUST be visible (display: block), got '{table_disp}'!"

        # Check table position is near top of screener
        tc_box = table_container.bounding_box()
        print(f"  Table container Y position: {tc_box['y']}px")
        assert tc_box['y'] < 200, f"Table container should be near top of screen (Y < 200), got {tc_box['y']}px!"

        # Check table rows rendered
        rows = page.locator('#screener-table-body tr')
        print(f"  Table rows count: {rows.count()}")
        assert rows.count() > 0, "Table should have rows rendered!"

        # Check horizontal scroll wrapper
        scroll_info = page.evaluate('''() => {
            const tc = document.getElementById('screener-table-container');
            const wrap = tc ? tc.querySelector('.overflow-x-auto') : null;
            const tbl = tc ? tc.querySelector('table') : null;
            return {
                wrap_overflow: wrap ? getComputedStyle(wrap).overflowX : null,
                tbl_width: tbl ? tbl.offsetWidth : null,
                wrap_client_width: wrap ? wrap.clientWidth : null
            };
        }''')
        print(f"  Table scroll info: {scroll_info}")
        assert scroll_info['tbl_width'] > scroll_info['wrap_client_width'], "Table should be wider than viewport to allow horizontal scroll"

        # Screenshot mobile table view
        page.screenshot(path='C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/32_mobile_table_working.png')
        print("  Screenshot saved: 32_mobile_table_working.png")
        print("  PASSED: Table view works smoothly on mobile!")

        # Toggle back to cards view
        cards_btn = page.locator('#view-cards-btn')
        cards_btn.click()
        time.sleep(0.4)
        assert cards_grid.evaluate('el => getComputedStyle(el).display') != 'none', "Cards grid should be restored!"

        # ---------------------------------------------------------------
        # TEST 3: FUND DETAILS DRAWER (BOTTOM SHEET) ON MOBILE
        # ---------------------------------------------------------------
        print("\n[TEST 3] Testing Fund Details Drawer on Mobile...")
        first_details_btn = page.locator('.analyze-card-btn').first
        first_details_btn.click()
        time.sleep(0.6)

        drawer = page.locator('#fund-drawer')
        drawer_bd = page.locator('#drawer-backdrop')
        assert drawer.evaluate('el => el.classList.contains("open")'), "Drawer should have open class"
        assert drawer_bd.evaluate('el => el.classList.contains("active")'), "Drawer backdrop should be active"

        d_box = drawer.bounding_box()
        print(f"  Fund drawer bottom sheet height: {d_box['height']}px, Y: {d_box['y']}px")

        # Screenshot fund details bottom sheet
        page.screenshot(path='C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/33_mobile_fund_drawer.png')
        print("  Screenshot saved: 33_mobile_fund_drawer.png")

        # Close drawer
        page.click('#drawer-close-btn')
        time.sleep(0.4)
        assert not drawer.evaluate('el => el.classList.contains("open")'), "Drawer should be closed"
        print("  PASSED: Fund details bottom sheet works smoothly on mobile!")

        # ---------------------------------------------------------------
        # TEST 4: COLUMN CUSTOMIZER MODAL ON MOBILE
        # ---------------------------------------------------------------
        print("\n[TEST 4] Testing Column Customizer on Mobile...")
        table_btn.click()
        time.sleep(0.3)
        page.click('#open-column-customizer-btn')
        time.sleep(0.4)

        kpi_modal = page.locator('#kpi-picker-modal')
        assert kpi_modal.evaluate('el => el.classList.contains("open")'), "KPI picker modal should be open"
        page.screenshot(path='C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/34_mobile_column_customizer.png')
        print("  Screenshot saved: 34_mobile_column_customizer.png")

        page.click('#kpi-picker-close-btn')
        time.sleep(0.3)
        cards_btn.click()
        time.sleep(0.3)
        print("  PASSED: Column customizer modal works on mobile!")

        # ---------------------------------------------------------------
        # TEST 5: SIMSIM WORKSPACE ON MOBILE
        # ---------------------------------------------------------------
        print("\n[TEST 5] Testing SimSim Mode on Mobile...")
        # Clear bucket to test welcome builder
        page.evaluate("localStorage.removeItem('bickerbape_simsim_bucket')")
        page.reload()
        page.wait_for_selector('.card-interactive', timeout=10000)

        # Open sidebar, click logo to enter SimSim
        page.click('#sidebar-expand-btn')
        time.sleep(0.4)
        page.click('#sidebar-logo-switch')
        time.sleep(0.6)

        welcome = page.locator('.simsim-welcome-builder')
        assert welcome.is_visible(), "Welcome builder should be visible"

        # Load Titan
        page.click('[data-welcome-basket="titan"]')
        time.sleep(0.8)

        holdings = page.locator('#simsim-holdings-grid')
        assert holdings.is_visible(), "Holdings grid should be visible"

        # Check no horizontal overflow in SimSim
        body_overflow = page.evaluate('() => document.body.scrollWidth > window.innerWidth')
        print(f"  SimSim horizontal overflow: {body_overflow}")
        assert not body_overflow, "SimSim mode should have NO horizontal overflow on mobile!"

        page.screenshot(path='C:/Users/u1233270/.gemini/antigravity-ide/brain/d0626913-2eb8-4457-92b7-05d7498ebcdb/35_mobile_simsim_verified.png')
        print("  Screenshot saved: 35_mobile_simsim_verified.png")
        print("  PASSED: SimSim mode works on mobile without overflow!")

        browser.close()

    print("\n============================================================")
    print("  ALL MOBILE AUDIT TESTS PASSED SUCCESSFULLY! ")
    print("============================================================")

if __name__ == '__main__':
    run_mobile_audit()
