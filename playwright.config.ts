import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    // Dedicated port avoids macOS AirPlay on 5000 and stale manual dev servers on 5001
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5010",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: "PORT=5010 npm run dev",
        url: "http://localhost:5010/health",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
