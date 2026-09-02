from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:8080")
    page.wait_for_selector(".simsim-add-btn")

    # Initial state
    badge_el = page.locator("#simsim-tray-badge-pill")
    count_el = page.locator("#simsim-tray-count")
    tray = page.locator("#simsim-floating-tray")
    
    print("Initial badge text:", badge_el.inner_text())
    print("Initial count text:", count_el.inner_text())
    print("Tray classes:", tray.get_attribute("class"))

    # Click first + SimSim button
    btns = page.locator(".simsim-add-btn")
    print("Number of simsim-add-btn found:", btns.count())
    btns.nth(0).click()
    page.wait_for_timeout(400)

    print("After 1st add:")
    print("  Badge text:", badge_el.inner_text())
    print("  Count text:", count_el.inner_text())
    print("  Tray classes:", tray.get_attribute("class"))
    print("  Badge box:", badge_el.bounding_box())
    print("  Tray box:", tray.bounding_box())

    # Click 2nd + SimSim button
    btns.nth(1).click()
    page.wait_for_timeout(400)
    print("After 2nd add:")
    print("  Badge text:", badge_el.inner_text())
    print("  Count text:", count_el.inner_text())

    # Click 3rd + SimSim button
    btns.nth(2).click()
    page.wait_for_timeout(400)
    print("After 3rd add:")
    print("  Badge text:", badge_el.inner_text())
    print("  Count text:", count_el.inner_text())

    browser.close()
