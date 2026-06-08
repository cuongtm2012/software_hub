import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SoftwareHub/i);
  });

  test("courses page loads", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.locator("body")).toBeVisible();
  });

  test("sitemap.xml is valid", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/courses");
  });

  test("blog page loads", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("body")).toBeVisible();
  });

  test("marketplace page loads", async ({ page }) => {
    await page.goto("/marketplace");
    await expect(page.getByText("Digital Marketplace")).toBeVisible();
  });
});
