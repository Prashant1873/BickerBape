import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:8080')
    page.wait_for_selector('.card-interactive')
    
    # Check sidebar scroll container
    info = page.evaluate('''() => {
        const sidebar = document.getElementById('sidebar');
        const scrollContainer = sidebar ? sidebar.querySelector('.overflow-y-auto') : null;
        const screenerContent = document.getElementById('screener-sidebar-content');
        return {
            sidebar_height: sidebar ? sidebar.clientHeight : null,
            sidebar_overflow: sidebar ? getComputedStyle(sidebar).overflow : null,
            sc_clientHeight: scrollContainer ? scrollContainer.clientHeight : null,
            sc_scrollHeight: scrollContainer ? scrollContainer.scrollHeight : null,
            sc_overflowY: scrollContainer ? getComputedStyle(scrollContainer).overflowY : null,
            sc_height: scrollContainer ? getComputedStyle(scrollContainer).height : null,
            screener_height: screenerContent ? screenerContent.offsetHeight : null
        };
    }''')
    print('Desktop screener sidebar info:', info)
    
    # Try wheel scrolling over the sidebar
    page.mouse.move(160, 300)
    scrollTop_before = page.evaluate('() => document.querySelector("#sidebar .overflow-y-auto").scrollTop')
    page.mouse.wheel(0, 300)
    time.sleep(0.4)
    scrollTop_after = page.evaluate('() => document.querySelector("#sidebar .overflow-y-auto").scrollTop')
    print(f'Screener ScrollTop before: {scrollTop_before}, after wheel: {scrollTop_after}')
    
    # Check in SimSim mode
    page.click('#sidebar-logo-switch')
    time.sleep(0.5)
    page.click('[data-welcome-basket="titan"]')
    time.sleep(0.6)
    
    simsim_info = page.evaluate('''() => {
        const sidebar = document.getElementById('sidebar');
        const scrollContainer = sidebar ? sidebar.querySelector('.overflow-y-auto') : null;
        const simsimContent = document.getElementById('simsim-sidebar-content');
        return {
            sc_clientHeight: scrollContainer ? scrollContainer.clientHeight : null,
            sc_scrollHeight: scrollContainer ? scrollContainer.scrollHeight : null,
            sc_overflowY: scrollContainer ? getComputedStyle(scrollContainer).overflowY : null,
            simsim_height: simsimContent ? simsimContent.offsetHeight : null
        };
    }''')
    print('SimSim sidebar info:', simsim_info)
    
    page.mouse.move(160, 300)
    s_before = page.evaluate('() => document.querySelector("#sidebar .overflow-y-auto").scrollTop')
    page.mouse.wheel(0, 300)
    time.sleep(0.4)
    s_after = page.evaluate('() => document.querySelector("#sidebar .overflow-y-auto").scrollTop')
    print(f'SimSim ScrollTop before: {s_before}, after wheel: {s_after}')

    # Check Mobile Viewport as well!
    page_m = browser.new_page(viewport={'width': 375, 'height': 812}, is_mobile=True)
    page_m.goto('http://localhost:8080')
    page_m.wait_for_selector('.card-interactive')
    page_m.click('#sidebar-expand-btn')
    time.sleep(0.5)
    
    mobile_sb_info = page_m.evaluate('''() => {
        const sidebar = document.getElementById('sidebar');
        const scrollContainer = sidebar ? sidebar.querySelector('.overflow-y-auto') : null;
        return {
            sidebar_height: sidebar ? sidebar.clientHeight : null,
            sc_clientHeight: scrollContainer ? scrollContainer.clientHeight : null,
            sc_scrollHeight: scrollContainer ? scrollContainer.scrollHeight : null,
            sc_overflowY: scrollContainer ? getComputedStyle(scrollContainer).overflowY : null
        };
    }''')
    print('Mobile sidebar info:', mobile_sb_info)
    
    page_m.mouse.move(150, 300)
    m_before = page_m.evaluate('() => document.querySelector("#sidebar .overflow-y-auto").scrollTop')
    page_m.mouse.wheel(0, 300)
    time.sleep(0.4)
    m_after = page_m.evaluate('() => document.querySelector("#sidebar .overflow-y-auto").scrollTop')
    print(f'Mobile ScrollTop before: {m_before}, after wheel: {m_after}')

    browser.close()
