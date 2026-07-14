import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Wait for dev server to be ready
        max_retries = 10
        for i in range(max_retries):
            try:
                await page.goto("http://localhost:3001/")
                break
            except Exception:
                if i == max_retries - 1:
                    raise
                await asyncio.sleep(2)

        os.makedirs("verification", exist_ok=True)

        # Initial load
        await page.screenshot(path="verification/initial_load.png")
        print("Captured initial_load.png")

        # Select a shop: "Merlo Coffee Cafe - George St"
        await page.click("text=Merlo Coffee Cafe - George St")
        await page.wait_for_selector("text=Performance Stats")
        await page.screenshot(path="verification/selected_shop.png")
        print("Captured selected_shop.png")

        # Submit a rating: Select Coffee 4
        await page.locator('.symbol-selector-btn-coffee').nth(3).click()
        # Select Price 2
        await page.locator('.symbol-selector-btn-price').nth(1).click()

        # Click "Submit Visit Rating"
        await page.click("text=Submit Visit Rating")

        # Check if the total visits rated increments to 3 visits
        await page.wait_for_selector("text=3 visits")
        await page.screenshot(path="verification/added_rating.png")
        print("Captured added_rating.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
