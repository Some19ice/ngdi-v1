import { defineConfig, devices } from "@playwright/test"
import path from "path"

const baseURL = process.env.NEXTAUTH_URL || "http://localhost:3000"
const authFile = path.join(__dirname, ".playwright/.auth/user.json")

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  globalSetup: require.resolve("./tests/setup/global"),
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    javaScriptEnabled: true,
    permissions: ["storage-access"],
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    stdout: "pipe",
  },
})
