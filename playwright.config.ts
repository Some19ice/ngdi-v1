import { defineConfig, devices } from "@playwright/test"
import path from "path"
import { env } from "./env.mjs"
import dotenv from "dotenv"

dotenv.config()

const PORT = process.env.PORT || 3000
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  timeout: 30000,
  globalSetup: require.resolve("./tests/global-setup.ts"),
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/test-results.json" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.APP_URL || baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    javaScriptEnabled: true,
    navigationTimeout: 30000,
    actionTimeout: 30000,
    colorScheme: "no-preference",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: process.env.CI ? "npm run build && npm run start" : "npm run dev",
    url: process.env.APP_URL || baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 30000,
    env: {
      NODE_ENV: "test",
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/ngdi_test?schema=test",
      DIRECT_URL:
        process.env.DIRECT_URL ||
        "postgresql://postgres:postgres@localhost:5432/ngdi_test?schema=test",
      DEBUG: "true",
    },
  },
  testMatch: "**/?(*.)@(spec|test).[tj]s?(x)",
  testIgnore: ["**/node_modules/**", "**/.next/**"],
  metadata: {
    "auth/security": {
      testDir: "tests/auth.security.test.ts",
      description: "Authentication security tests",
    },
    "auth/social": {
      testDir: "tests/auth.social.test.ts",
      description: "Social authentication tests",
    },
    "auth/performance": {
      testDir: "tests/auth.performance.test.ts",
      description: "Authentication performance tests",
    },
    "auth/accessibility": {
      testDir: "tests/auth.accessibility.test.ts",
      description: "Authentication accessibility tests",
    },
  },
})
