import { defineConfig, devices } from "@playwright/test"
import path from "path"

const baseURL = process.env.NEXTAUTH_URL || "http://localhost:3000"
const authFile = path.join(__dirname, ".playwright/.auth/user.json")

export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: "list",
  globalSetup: require.resolve("./tests/setup/global"),
  use: {
    baseURL,
    trace: "on",
    screenshot: "on",
    video: "on",
    javaScriptEnabled: true,
    permissions: ["storage-access"],
    navigationTimeout: 60000,
    actionTimeout: 30000,
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
