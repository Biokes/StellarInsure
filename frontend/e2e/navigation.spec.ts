import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = ["/", "/legal/privacy", "/legal/terms"];

for (const route of PUBLIC_ROUTES) {
  test(`${route} loads without JS errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    expect(errors).toHaveLength(0);
  });
}

test("404 page renders gracefully", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist-xyz");
  // Next.js returns 404 for unknown routes
  expect(response?.status()).toBe(404);
});
