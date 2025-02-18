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

    // Wait for the auth cookie to be set
    await page.waitForURL("**/dashboard", { timeout: 30000 })

    // Ensure the auth directory exists
    const authDir = path.dirname(authFile)
    fs.mkdirSync(authDir, { recursive: true })

    // Save signed-in state
    await context.storageState({ path: authFile })
  } catch (error) {
    console.error("Auth setup failed:", error)
    throw error
  } finally {
    // Always close the context
    await context.close()
  }
})
