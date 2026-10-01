import { defineConfig } from "@playwright/test";
const preview = process.env.PLAYWRIGHT_PREVIEW === "1";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${preview ? 4173 : 5173}/`;
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  outputDir: "test-results/artifacts",
  workers: 3,
  timeout: 90000,
  expect: { timeout: 10000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "test-results/report" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    baseURL,
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
  webServer: process.env.PLAYWRIGHT_SKIP_SERVER ? undefined : {
    command: preview ? "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort" : "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
