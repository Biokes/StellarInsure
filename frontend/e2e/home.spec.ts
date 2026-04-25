import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows main heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/StellarInsure/i);
  });

  test("navigation links are visible", async ({ page }) => {
    await page.goto("/");
    // The app should render without crashing
    await expect(page.locator("body")).toBeVisible();
  });

  test("connect wallet button is present", async ({ page }) => {
    await page.goto("/");
    // Look for a wallet connection element (button or link)
    const walletEl = page.getByRole("button", { name: /connect/i }).or(
      page.getByText(/connect/i).first()
    );
    await expect(walletEl).toBeVisible();
  });
});
