import time
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={'width': 375, 'height': 812}, is_mobile=True)
        page = ctx.new_page()
        page.goto('http://127.0.0.1:8080', wait_until='domcontentloaded')
        page.wait_for_selector('.card-interactive', timeout=10000)

        print("\n========================================================")
        print("  1. VERIFYING INFO (i) BUTTONS (MOBILE 375x812)")
        print("========================================================")
        info_btns = page.locator('.info-btn')
        count = info_btns.count()
        print(f"Total info buttons found: {count}")
        all_circular = True
        for i in range(min(10, count)):
            btn = info_btns.nth(i)
            box = btn.bounding_box()
            if box:
                ratio = box['width'] / box['height'] if box['height'] > 0 else 0
                is_circle = abs(ratio - 1.0) < 0.1 and abs(box['width'] - 15) <= 2
                print(f"  Btn {i}: w={box['width']:.1f}px, h={box['height']:.1f}px (ratio={ratio:.2f}) -> {'PASS (Circle)' if is_circle else 'FAIL (Ellipse)'}")
                if not is_circle:
                    all_circular = False
        assert all_circular, "All tested info buttons MUST be circular (15x15px), not ellipses!"
        print("  --> PASSED: All info buttons are perfectly circular on mobile!")

        print("\n========================================================")
        print("  2. VERIFYING SCREENER TABLE VIEW (MOBILE 375x812)")
        print("========================================================")
        page.click('#view-table-btn')
        time.sleep(0.5)

        table_data = page.evaluate('''() => {
            const thFirst = document.querySelector('.screener-table th:first-child');
            const tdFirst = document.querySelector('.screener-table td:first-child');
            const thSecond = document.querySelector('.screener-table th:nth-child(2)');
            const tdSecond = document.querySelector('.screener-table td:nth-child(2)');
            const container = document.querySelector('#screener-table-container');
            const scrollWrap = container.querySelector('.overflow-x-auto');
            const table = document.querySelector('.screener-table');

            return {
                window_width: window.innerWidth,
                th_first_width: thFirst.getBoundingClientRect().width,
                td_first_width: tdFirst.getBoundingClientRect().width,
                th_second_width: thSecond.getBoundingClientRect().width,
                th_second_x: thSecond.getBoundingClientRect().x,
                th_second_right: thSecond.getBoundingClientRect().right,
                table_scroll_width: table.scrollWidth,
                scroll_wrap_client_width: scrollWrap.clientWidth,
                first_col_ratio: thFirst.getBoundingClientRect().width / window.innerWidth
            };
        }''')
        print(f"  Window width: {table_data['window_width']}px")
        print(f"  First column width: {table_data['th_first_width']:.1f}px ({table_data['first_col_ratio']*100:.1f}% of screen)")
        print(f"  Second column X position: {table_data['th_second_x']:.1f}px (width={table_data['th_second_width']:.1f}px)")
        print(f"  Total table scroll width: {table_data['table_scroll_width']}px")

        # Verify first column is compact (~135px, under 45% of screen width)
        assert 120 <= table_data['th_first_width'] <= 150, f"First column width ({table_data['th_first_width']}) should be ~135px!"
        assert table_data['first_col_ratio'] < 0.45, f"First column ({table_data['first_col_ratio']*100:.1f}%) should leave >55% room for data columns!"
        # Verify second column is visible
        assert table_data['th_second_right'] <= table_data['window_width'], "Second column should be visible within screen viewport!"
        print("  --> PASSED: Table first column is compact and data columns are visible!")

        # Test horizontal scrolling
        page.evaluate('() => document.querySelector("#screener-table-container .overflow-x-auto").scrollLeft = 200')
        time.sleep(0.3)
        scroll_pos = page.evaluate('() => document.querySelector("#screener-table-container .overflow-x-auto").scrollLeft')
        print(f"  Scroll Left after drag: {scroll_pos}px")
        assert scroll_pos > 0, "Table should scroll horizontally!"

        page.screenshot(path=r'C:\Users\u1233270\.gemini\antigravity-ide\brain\c9850326-9480-453b-bebd-5e2a83fba971\scratch\after_mobile_table.png')
        print("  Screenshot saved: after_mobile_table.png")

        print("\n========================================================")
        print("  3. VERIFYING FUND DETAILS DRAWER TOP METRIC CARDS")
        print("========================================================")
        # Open fund drawer by clicking first row
        first_row = page.locator('#screener-table-body tr').first
        first_row.click()
        time.sleep(0.6)

        metrics_alignment = page.evaluate('''() => {
            const drawer = document.getElementById('fund-drawer');
            const cards = Array.from(drawer.querySelectorAll('.drawer-metric-card'));
            return cards.map((card, idx) => {
                const cRect = card.getBoundingClientRect();
                const header = card.querySelector('.drawer-metric-header');
                const hRect = header ? header.getBoundingClientRect() : null;
                const body = card.querySelector('.drawer-metric-body');
                const bRect = body ? body.getBoundingClientRect() : null;
                const value = card.querySelector('.drawer-metric-value');
                const vRect = value ? value.getBoundingClientRect() : null;
                const info = card.querySelector('.info-btn');
                const iRect = info ? info.getBoundingClientRect() : null;

                return {
                    idx,
                    card: { top: cRect.top, height: cRect.height, width: cRect.width },
                    header_height: hRect ? hRect.height : null,
                    value_top: vRect ? vRect.top : null,
                    value_height: vRect ? vRect.height : null,
                    info_box: iRect ? { w: iRect.width, h: iRect.height } : null
                };
            });
        }''')

        assert len(metrics_alignment) == 6, f"Expected 6 metric cards, got {len(metrics_alignment)}"

        for i in range(0, 6, 2):
            c1 = metrics_alignment[i]
            c2 = metrics_alignment[i+1]
            row_num = (i // 2) + 1
            print(f"  Row {row_num} (Cards {i} & {i+1}):")
            print(f"    Card {i}: top={c1['card']['top']:.1f}, h={c1['card']['height']:.1f}, value_top={c1['value_top']:.1f}")
            print(f"    Card {i+1}: top={c2['card']['top']:.1f}, h={c2['card']['height']:.1f}, value_top={c2['value_top']:.1f}")

            # Top Y of sibling cards must match
            assert abs(c1['card']['top'] - c2['card']['top']) <= 2.0, f"Row {row_num} cards top misalignment!"
            # Height of sibling cards must match
            assert abs(c1['card']['height'] - c2['card']['height']) <= 2.0, f"Row {row_num} cards height misalignment!"
            # Value baseline alignment
            assert abs(c1['value_top'] - c2['value_top']) <= 4.0, f"Row {row_num} values top misalignment: {c1['value_top']} vs {c2['value_top']}!"

        # Check info buttons inside drawer
        for c in metrics_alignment:
            if c['info_box']:
                assert abs(c['info_box']['w'] - c['info_box']['h']) <= 1.5, f"Card {c['idx']} info button must be circular!"

        page.screenshot(path=r'C:\Users\u1233270\.gemini\antigravity-ide\brain\c9850326-9480-453b-bebd-5e2a83fba971\scratch\after_mobile_drawer.png')
        print("  Screenshot saved: after_mobile_drawer.png")
        print("  --> PASSED: All 6 metric cards in fund drawer are perfectly aligned!")

        print("\n========================================================")
        print("  ALL VERIFICATIONS PASSED SUCCESSFULLY!")
        print("========================================================")
        browser.close()

if __name__ == '__main__':
    verify()
