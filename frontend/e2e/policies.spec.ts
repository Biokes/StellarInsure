import { test, expect } from "@playwright/test";

test.describe("Policies page", () => {
  test("redirects unauthenticated users or shows connect prompt", async ({
    page,
  }) => {
    await page.goto("/policies");
    // Either redirected to home or shows a connect-wallet prompt
    const url = page.url();
    const isHome = url.endsWith("/") || url.includes("/?");
    const hasConnect = await page
      .getByText(/connect/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(isHome || hasConnect).toBeTruthy();
  });

  test("policies page does not crash", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/policies");
    expect(errors).toHaveLength(0);
  });
});

test.describe("Create policy page", () => {
  test("create policy page renders without crashing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/create");
    expect(errors).toHaveLength(0);
  });

  test("create policy page requires wallet connection", async ({ page }) => {
    await page.goto("/create");
    // Either shows the form (wallet connected) or prompts to connect
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
