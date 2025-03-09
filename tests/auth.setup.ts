import { test as setup, expect } from "@playwright/test"
import { getTestUser, signIn, initializeTestUser } from "./helpers/auth"
import { UserRole } from "../lib/auth/constants"
import path from "path"
import fs from "fs"
import { AUTH_CONFIG } from "@/lib/auth/config"

const authFile = path.join(__dirname, "../.playwright/.auth/user.json")

// Ensure auth directory exists
const authDir = path.dirname(authFile)
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true })
}

setup("authenticate", async ({ browser }) => {
  // Create a new context with no storage state
  const context = await browser.newContext({
    ignoreHTTPSErrors: process.env.NODE_ENV === "test",
    viewport: { width: 1280, height: 720 },
  })

  const page = await context.newPage()

  try {
    // Get test user credentials and ensure user exists in DB
    const user = getTestUser(UserRole.USER)
    await initializeTestUser(UserRole.USER)

    // Clear any existing sessions
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })
    })

    // Sign in
    await signIn(page, user.email, user.password)

    // Ensure we're on the profile page
    await page.waitForURL("**/profile", { timeout: 30000 })

    // Verify authentication state
    const session = await page.evaluate(() => {
      const user = localStorage.getItem("user")
      const expiry = localStorage.getItem("sessionExpiry")
      const token = localStorage.getItem("token")
      return { user, expiry, token }
    })

    expect(session.user).toBeTruthy()
    expect(session.expiry).toBeTruthy()
    expect(new Date(session.expiry!).getTime()).toBeGreaterThan(Date.now())

    // Verify security headers
    const response = await page.goto("**/api/auth/session")
    expect(response?.headers()["strict-transport-security"]).toBeTruthy()
    expect(response?.headers()["x-content-type-options"]).toBe("nosniff")
    expect(response?.headers()["x-frame-options"]).toBe("DENY")

    // Save storage state to file
    await context.storageState({ path: authFile })
    console.log("Authentication state saved to:", authFile)

    // Add test metadata
    await page.evaluate((config) => {
      localStorage.setItem(
        "testConfig",
        JSON.stringify({
          maxLoginAttempts: config.security.maxLoginAttempts,
          lockoutDuration: config.security.lockoutDuration,
          sessionMaxAge: config.session.maxAge,
        })
      )
    }, AUTH_CONFIG)
  } catch (error: any) {
    console.error("Authentication setup failed:", error.message)
    // Take screenshot on failure
    await page.screenshot({
      path: path.join(__dirname, "../test-results/auth-setup-failure.png"),
      fullPage: true,
    })
    throw error
  } finally {
    await context.close()
  }
})
