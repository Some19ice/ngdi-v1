import { test as setup, expect, Page } from "@playwright/test"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import path from "path"
import fs from "fs"

// Add TestUser interface
interface TestUser {
  email: string
  password: string
  name: string
  organization: string
}

// Constants for retry configuration
const RETRY_OPTIONS = {
  retries: 2,
  minTimeout: 1000,
  maxTimeout: 5000,
}

// Ensure test results directory exists
const TEST_RESULTS_DIR = path.join(process.cwd(), "test-results")
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true })
}

export async function signIn(
  page: Page,
  email: string,
  password: string,
  rememberMe = false
) {
  console.log(`Attempting to sign in with email: ${email}`)

  await page.goto(`${process.env.NEXTAUTH_URL}/auth/signin`)

  // Wait for the form to be ready
  console.log("Waiting for form...")
  await page.waitForSelector("form", {
    state: "visible",
    timeout: 30000,
  })

  // Fill in email
  console.log("Filling email...")
  await page.fill('input[name="email"]', email)

  // Fill in password
  console.log("Filling password...")
  await page.fill('input[name="password"]', password)

  // Handle remember me checkbox if needed
  if (rememberMe) {
    console.log("Checking remember me...")
    await page.check('input[name="remember"]')
  }

  // Click the submit button
  console.log("Clicking submit button...")
  await Promise.all([
    page.waitForNavigation({ timeout: 60000 }),
    page.click('button[type="submit"]'),
  ])

  try {
    console.log("Waiting for sign-in completion...")

    // Take a screenshot before checking result
    await page.screenshot({ path: "test-results/post-submission.png" })

    // Check current URL
    const currentUrl = page.url()
    console.log("Current URL:", currentUrl)

    if (currentUrl.includes("/error")) {
      const errorMessage = await page.textContent(
        '[data-testid="error-message"]'
      )
      throw new Error(`Authentication failed: ${errorMessage}`)
    }

    // Wait for profile page
    await page.waitForURL("**/profile", { timeout: 60000 })

    // Verify authentication state
    console.log("Verifying authentication state...")
    await page.waitForFunction(
      () => {
        const user = window.localStorage.getItem("user")
        const expiry = window.localStorage.getItem("sessionExpiry")
        console.log("LocalStorage state:", { user, expiry })
        return user && expiry
      },
      { timeout: 30000 }
    )

    // Double check the authentication state
    const isAuthenticated = await page.evaluate(() => {
      const user = window.localStorage.getItem("user")
      const expiry = window.localStorage.getItem("sessionExpiry")
      return { user, expiry }
    })

    console.log("Authentication state:", isAuthenticated)

    if (!isAuthenticated.user || !isAuthenticated.expiry) {
      throw new Error("Authentication failed - session data not properly set")
    }

    console.log("Sign in completed successfully")
  } catch (error: any) {
    console.error("Sign in error:", error.message)

    // Take error screenshot
    await page.screenshot({ path: "test-results/sign-in-error.png" })

    // Get current URL
    const currentUrl = page.url()
    console.error("Current URL:", currentUrl)

    // Get page content
    const pageContent = await page.content()
    console.error("Page content:", pageContent.substring(0, 500) + "...")

    if (error.message?.includes("Timeout")) {
      throw new Error(
        `Sign in timed out - no redirect or error message received. Current URL: ${currentUrl}`
      )
    }
    throw error
  }
}

export async function signInWithGoogle(page: Page) {
  await page.goto(`${process.env.NEXTAUTH_URL}/auth/signin`)
  await page.getByRole("button", { name: "Sign in with Google" }).click()
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click()
}

export async function mockGoogleAuth(
  page: Page,
  userData: { email: string; name: string }
) {
  await page.route("**/api/auth/callback/google", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ user: userData }),
    })
  })
}

export async function mockSession(
  page: Page,
  userData: { email: string; name: string }
) {
  const storage: { [key: string]: string } = {}

  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: function (key: string) {
          return this.store[key] || null
        },
        setItem: function (key: string, value: string) {
          this.store[key] = value
        },
        removeItem: function (key: string) {
          delete this.store[key]
        },
        clear: function () {
          this.store = {}
        },
        store: {},
      },
      writable: true,
    })
  })

  await page.evaluate((data) => {
    try {
      window.localStorage.setItem("user", JSON.stringify(data))
      window.localStorage.setItem(
        "sessionExpiry",
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      )
    } catch (error) {
      console.error("Failed to set localStorage:", error)
    }
  }, userData)

  // Verify the data was set
  const storedUser = await page.evaluate(() =>
    window.localStorage.getItem("user")
  )
  if (!storedUser) {
    throw new Error("Failed to set user data in localStorage")
  }
}

export async function clearSession(page: Page) {
  await page.evaluate(() => {
    try {
      window.localStorage.removeItem("user")
      window.localStorage.removeItem("sessionExpiry")
    } catch (error) {
      console.error("Failed to clear localStorage:", error)
    }
  })
}

export async function completeOnboarding(
  page: Page,
  data: {
    name: string
    organization: string
    department?: string
    phone?: string
  }
) {
  await page.goto(`${process.env.NEXTAUTH_URL}/auth/new-user`)
  await page.getByLabel("Full Name").fill(data.name)
  await page.getByLabel("Organization").fill(data.organization)

  if (data.department) {
    await page.getByLabel("Department").fill(data.department)
  }

  if (data.phone) {
    await page.getByLabel("Phone Number").fill(data.phone)
  }

  await page.getByRole("button", { name: "Complete Profile" }).click()
}

export async function waitForRedirect(page: Page, urlPattern: RegExp | string) {
  await page.waitForURL(urlPattern)
}

export function getTestUser(role: UserRole = UserRole.USER) {
  return {
    email: `test.${role.toLowerCase()}@example.com`,
    password: "Test@123456",
    name: `Test ${role} User`,
    organization: "Test Organization",
  }
}

// Initialize test users in the database
export async function initializeTestUser(role: UserRole = UserRole.USER) {
  const user = getTestUser(role)
  const hashedPassword = await hash(user.password, 12)

  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      password: hashedPassword,
      emailVerified: new Date(),
      role,
    },
    create: {
      email: user.email,
      name: user.name,
      password: hashedPassword,
      role,
      organization: user.organization,
      emailVerified: new Date(),
    },
  })
}

export async function setupTestUser(
  page: Page,
  role: UserRole = UserRole.USER
) {
  const user = getTestUser(role)
  // Create the test user in the database
  await initializeTestUser(role)
  await mockSession(page, {
    email: user.email,
    name: user.name,
  })
  return user
}

// Enhanced sign in with retries and better error handling
export async function enhancedSignIn(
  page: Page,
  email: string,
  password: string,
  rememberMe = false
) {
  const startTime = Date.now()

  try {
    // Use a simple retry implementation since Playwright doesn't export retry
    let lastError: Error | null = null
    for (let attempt = 0; attempt <= RETRY_OPTIONS.retries; attempt++) {
      try {
        await signIn(page, email, password, rememberMe)

        // Verify authentication state
        const authState = await page.evaluate(() => ({
          user: localStorage.getItem("user"),
          expiry: localStorage.getItem("sessionExpiry"),
          token: localStorage.getItem("token"),
        }))

        if (!authState.user || !authState.expiry) {
          throw new Error("Authentication state verification failed")
        }

        // If successful, break out of retry loop
        break
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
        if (attempt === RETRY_OPTIONS.retries) throw lastError
        await page.waitForTimeout(
          Math.min(
            RETRY_OPTIONS.minTimeout * Math.pow(2, attempt),
            RETRY_OPTIONS.maxTimeout
          )
        )
      }
    }

    // Log successful sign in metrics
    console.log("Sign in metrics:", {
      email,
      duration: Date.now() - startTime,
      url: page.url(),
    })
  } catch (e) {
    // Enhanced error capture
    const error = e instanceof Error ? e : new Error(String(e))
    const timestamp = Date.now()
    const screenshotPath = path.join(
      TEST_RESULTS_DIR,
      `auth-failure-${timestamp}.png`
    )
    const logPath = path.join(
      TEST_RESULTS_DIR,
      `auth-failure-${timestamp}.json`
    )

    await page.screenshot({ path: screenshotPath, fullPage: true })

    const diagnosticInfo = {
      error: error.message,
      url: page.url(),
      timestamp,
      duration: Date.now() - startTime,
      localStorage: await page.evaluate(() => ({ ...localStorage })),
      sessionStorage: await page.evaluate(() => ({ ...sessionStorage })),
      cookies: await page.context().cookies(),
    }

    fs.writeFileSync(logPath, JSON.stringify(diagnosticInfo, null, 2))
    console.error("Authentication failure:", {
      error: error.message,
      screenshotPath,
      logPath,
    })

    throw error
  }
}

// Enhanced session cleanup
export async function enhancedClearSession(page: Page) {
  try {
    await clearSession(page)

    // Verify cleanup
    const storageState = await page.evaluate(() => ({
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
    }))

    if (
      Object.keys(storageState.localStorage).length > 0 ||
      Object.keys(storageState.sessionStorage).length > 0
    ) {
      throw new Error("Session cleanup verification failed")
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Session cleanup failed:", error)
    throw error
  }
}

// Enhanced test user setup with verification
export async function enhancedSetupTestUser(
  page: Page,
  role: UserRole = UserRole.USER
): Promise<TestUser> {
  const startTime = Date.now()

  try {
    const user = await setupTestUser(page, role)

    // Verify user setup
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    })

    if (!dbUser) {
      throw new Error("Test user creation verification failed")
    }

    console.log("Test user setup metrics:", {
      email: user.email,
      role,
      duration: Date.now() - startTime,
    })

    return user
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Test user setup failed:", {
      role,
      error: error.message,
      duration: Date.now() - startTime,
    })
    throw error
  }
}
