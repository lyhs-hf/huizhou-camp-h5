import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: 3,
  timeout: 90000,
  expect: { timeout: 10000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "docs/playwright-report" }],
    ["json", { outputFile: "docs/test-results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
    hasTouch: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-mobile",
      use: { browserName: "chromium", viewport: { width: 390, height: 844 } },
    },
    {
      name: "webkit-mobile",
      use: { browserName: "webkit", viewport: { width: 375, height: 812 } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
  },
});
