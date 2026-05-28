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
                await page.goto("http://localhost:5173/")
                break
            except Exception:
                if i == max_retries - 1:
                    raise
                await asyncio.sleep(2)

        os.makedirs("verification", exist_ok=True)

        # Initial load
        await page.screenshot(path="verification/initial_load.png")
        print("Captured initial_load.png")

        # Select a shop
        await page.click("text=Coffee Central")
        await page.wait_for_selector("text=Reviews")
        await page.screenshot(path="verification/selected_shop.png")
        print("Captured selected_shop.png")

        # Add a rating
        await page.fill('input[placeholder="Your Username"]', 'testuser')
        await page.select_option('select', '5')
        await page.click("text=Submit Review")

        # Check if the new rating is there (username "by testuser")
        await page.wait_for_selector("text=by testuser")
        await page.screenshot(path="verification/added_rating.png")
        print("Captured added_rating.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
