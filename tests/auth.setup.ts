import { test as setup } from "@playwright/test"
import { getTestUser, signIn, initializeTestUser } from "./helpers/auth"
import { UserRole } from "@prisma/client"
import path from "path"
import fs from "fs"

const authFile = path.join(__dirname, "../.playwright/.auth/user.json")

setup("authenticate", async ({ browser }) => {
  // Create a new context with no storage state
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Get test user credentials and ensure user exists in DB
    const user = getTestUser(UserRole.USER)
    await initializeTestUser(UserRole.USER)

    // Sign in
    await signIn(page, user.email, user.password)

    // Ensure we're on the profile page
    await page.waitForURL("**/profile", { timeout: 30000 })

    // Verify authentication state
    const isAuthenticated = await page.evaluate(() => {
      return !!window.localStorage.getItem("user")
    })

    if (!isAuthenticated) {
      throw new Error("Failed to authenticate - no user data in localStorage")
    }

    // Save storage state to file
    await context.storageState({ path: authFile })
    console.log("Authentication state saved to:", authFile)
  } catch (error: any) {
    console.error("Authentication setup failed:", error.message)
    throw error
  } finally {
    await context.close()
  }
})
