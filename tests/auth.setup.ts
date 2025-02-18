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

    // Wait for the sign-in process to complete
    await Promise.race([
      // Wait for successful redirect to profile
      page.waitForURL("**/profile", { timeout: 30000 }),
      // Wait for error message to appear
      page.waitForSelector('[class*="bg-red-50"]', { timeout: 30000 }),
    ])

    // Check if we got an error
    const errorElement = await page.$('[class*="bg-red-50"]')
    if (errorElement) {
      const errorText = await errorElement.textContent()
      throw new Error(`Sign in failed: ${errorText}`)
    }

    // Additional check to ensure we're authenticated
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 })

    // Ensure the auth directory exists
    const authDir = path.dirname(authFile)
    fs.mkdirSync(authDir, { recursive: true })

    // Save signed-in state
    await context.storageState({ path: authFile })
  } catch (error) {
    console.error("Auth setup failed:", error)

    // Take a screenshot on failure to help with debugging
    if (page) {
      await page.screenshot({ path: "auth-failure.png" })
      console.log("Current URL:", page.url())

      // Log the page content for debugging
      console.log("Page content:", await page.content())

      // Log any console errors
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          console.log("Browser console error:", msg.text())
        }
      })
    }

    throw error
  } finally {
    // Always close the context
    await context.close()
  }
})
