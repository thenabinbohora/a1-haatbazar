import { defineConfig, devices } from "@playwright/test";

const configuredBaseUrl = process.env.PLAYWRIGHT_BASE_URL?.trim().replace(/\/+$/, "");
const baseURL = configuredBaseUrl || "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./node_modules/.cache/playwright-test-results",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Route-transition frame sampling is intentionally serial so concurrent
  // browser projects cannot contend for the single production test server.
  workers: 1,
  reporter: "line",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    contextOptions: {
      reducedMotion: "reduce",
    },
    locale: "en-AU",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: "android-chromium",
      testMatch: /(?:admin-auth-experience|cart-page|mobile-navigation)\.spec\.ts/,
      use: {
        ...devices["Pixel 5"],
      },
    },
    {
      name: "iphone-webkit",
      testMatch: /(?:admin-auth-experience|cart-page|mobile-navigation)\.spec\.ts/,
      use: {
        ...devices["iPhone 13"],
      },
    },
  ],
  webServer: configuredBaseUrl
    ? undefined
    : {
        command: "npm run start -- -H 127.0.0.1 -p 3100",
        reuseExistingServer: true,
        timeout: 120_000,
        url: baseURL,
      },
});
