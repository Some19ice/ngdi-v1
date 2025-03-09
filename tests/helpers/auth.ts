import { test as setup, expect, Page } from "@playwright/test"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { UserRole } from "../../lib/auth/constants"
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
  role: UserRole
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
): Promise<void> {
  await page.goto(`${process.env.APP_URL}/auth/signin`)
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)

  if (rememberMe) {
    await page.getByLabel("Remember me").check()
  }

  await page.getByRole("button", { name: /Sign in/i }).click()
  await page.waitForURL("**/*", { waitUntil: "networkidle" })
}

export async function signOut(page: Page): Promise<void> {
  await page.getByTestId("user-menu").click()
  await page.getByRole("menuitem", { name: /Sign out/i }).click()
  await page.waitForURL("**/*", { waitUntil: "networkidle" })
}

export async function createTestUser(
  page: Page,
  user: TestUser
): Promise<TestUser> {
  await page.goto(`${process.env.APP_URL}/auth/signup`)
  await page.getByLabel("Email").fill(user.email)
  await page.getByLabel("Password").fill(user.password)
  await page.getByLabel("Confirm Password").fill(user.password)
  await page.getByRole("button", { name: /Sign up/i }).click()
  await page.waitForURL("**/*", { waitUntil: "networkidle" })
  return user
}

export async function deleteTestUser(page: Page, user: TestUser) {
  // TODO: Implement user deletion through Supabase admin API
}

export async function signInWithGoogle(page: Page): Promise<void> {
  await page.goto(`${process.env.APP_URL}/auth/signin`)
  await page.getByRole("button", { name: "Sign in with Google" }).click()
}

export async function mockGoogleAuth(
  page: Page,
  userData: { email: string; name: string }
): Promise<void> {
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
): Promise<void> {
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
    window.localStorage.setItem("user", JSON.stringify(data))
    window.localStorage.setItem(
      "sessionExpiry",
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    )
  }, userData)
}

export async function clearSession(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.localStorage.clear()
  })
}

export async function enhancedSignIn(
  page: Page,
  email: string,
  password: string,
  rememberMe = false
): Promise<void> {
  await signIn(page, email, password, rememberMe)
  await page.waitForTimeout(1000)
}

export function getTestUser(role: UserRole = UserRole.USER): TestUser {
  return {
    email: `test-${role.toLowerCase()}@example.com`,
    password: "Test123!@#",
    name: `Test ${role}`,
    organization: "Test Organization",
    role,
  }
}

export async function setupTestUser(
  page: Page,
  role: UserRole = UserRole.USER
): Promise<TestUser> {
  const user = getTestUser(role)
  await createTestUser(page, user)
  await enhancedSignIn(page, user.email, user.password)
  return user
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
