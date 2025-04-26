import { test, expect, type Page } from "@playwright/test"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { UserRole } from "@prisma/client"
import { hash } from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import {
  enhancedSignIn as signIn,
  signInWithGoogle,
  signOut,
  mockGoogleAuth,
  mockSession,
  enhancedClearSession as clearSession,
  completeOnboarding,
  waitForRedirect,
  getTestUser,
  enhancedSetupTestUser as setupTestUser,
} from "./helpers/auth"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"
const prisma = new PrismaClient()

test.describe("Authentication Flow", () => {
  let testStartTime: number

  test.beforeEach(async ({ page }: { page: Page }) => {
    testStartTime = Date.now()
    await clearSession(page)
    await page.goto(BASE_URL)
  })

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== "passed") {
      const timestamp = Date.now()
      await page.screenshot({
        path: `test-results/failure-${testInfo.title}-${timestamp}.png`,
        fullPage: true,
      })
    }

    // Log test metrics
    console.log(`Test metrics - ${testInfo.title}:`, {
      duration: Date.now() - testStartTime,
      status: testInfo.status,
      retries: testInfo.retry,
    })
  })

  test("should show sign in page", async ({ page }: { page: Page }) => {
    await page.goto(`${BASE_URL}/auth/signin`)
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Sign in with Google" })
    ).toBeVisible()
  })

  test("should handle invalid credentials", async ({
    page,
  }: {
    page: Page
  }) => {
    await signIn(page, "test@example.com", "wrongpassword")
    await expect(page.getByText("Invalid credentials")).toBeVisible()
  })

  test("should enforce password requirements", async ({
    page,
  }: {
    page: Page
  }) => {
    await signIn(page, "test@example.com", "weak")
    await expect(
      page.getByText("Password does not meet security requirements")
    ).toBeVisible()
  })

  test("should handle rate limiting", async ({ page }: { page: Page }) => {
    const user = getTestUser()

    // Attempt multiple sign-ins to trigger rate limit
    for (let i = 0; i < AUTH_CONFIG.security.maxLoginAttempts + 1; i++) {
      await signIn(page, user.email, "wrongpassword")
    }

    await expect(page.getByText("Too many attempts")).toBeVisible()
  })

  test("should redirect to onboarding for new users", async ({
    page,
  }: {
    page: Page
  }) => {
    const user = getTestUser()
    // Create user but don't verify email
    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: await hash(user.password, 12),
        role: UserRole.USER,
        organization: user.organization,
      },
    })

    await signIn(page, user.email, user.password)
    await expect(page.getByText("Please verify your email first")).toBeVisible()
  })

  test("should complete onboarding flow", async ({ page }: { page: Page }) => {
    const user = getTestUser()
    await completeOnboarding(page, {
      name: user.name,
      organization: user.organization,
      department: "IT",
      phone: "+2341234567890",
    })

    await waitForRedirect(page, /.*\/metadata/)
    await expect(page.getByText("Profile Updated")).toBeVisible()
  })

  test("should handle session expiry", async ({ page }: { page: Page }) => {
    const user = getTestUser()
    await mockSession(page, {
      email: user.email,
      name: user.name,
    })

    // Set expired session
    await page.evaluate(() => {
      window.localStorage.setItem(
        "sessionExpiry",
        new Date(Date.now() - 1000).toISOString()
      )
    })

    await page.goto(`${BASE_URL}/metadata`)
    await waitForRedirect(page, /.*\/auth\/signin/)
  })

  test("should persist session with remember me", async ({
    page,
  }: {
    page: Page
  }) => {
    const user = getTestUser()
    await signIn(page, user.email, user.password, true)

    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(
      (c) => c.name === AUTH_CONFIG.cookies.prefix + ".session-token"
    )
    expect(sessionCookie?.expires).toBeGreaterThan(
      Date.now() + 29 * 24 * 60 * 60 * 1000
    ) // ~30 days
  })

  test("should handle sign out", async ({ page }: { page: Page }) => {
    const user = await setupTestUser(page)
    await page.goto(`${BASE_URL}/profile`)
    await signOut(page)

    await waitForRedirect(page, BASE_URL)
    const sessionUser = await page.evaluate(() =>
      window.localStorage.getItem("user")
    )
    expect(sessionUser).toBeNull()
  })

  test.describe("Role-based Access", () => {
    test("should restrict admin routes for regular users", async ({
      page,
    }: {
      page: Page
    }) => {
      await setupTestUser(page, UserRole.USER)
      await page.goto(`${BASE_URL}/admin`)
      await waitForRedirect(page, /.*\/unauthorized/)
    })

    test("should allow admin routes for admin users", async ({
      page,
    }: {
      page: Page
    }) => {
      await setupTestUser(page, UserRole.ADMIN)
      await page.goto(`${BASE_URL}/admin`)
      await expect(page.getByText("Admin Dashboard")).toBeVisible()
    })

    test("should allow node officer routes for node officers", async ({
      page,
    }: {
      page: Page
    }) => {
      await setupTestUser(page, UserRole.NODE_OFFICER)
      await page.goto(`${BASE_URL}/metadata/add`)
      await expect(page.getByText("Add Metadata")).toBeVisible()
    })
  })
})

test.describe("Admin Authentication", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await clearSession(page)
  })

  test("should allow admin login with correct credentials", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto(`${BASE_URL}/auth/signin`)
    await signIn(page, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!)
    await waitForRedirect(page, /.*\/admin/)
    await expect(page.getByText("Admin Dashboard")).toBeVisible()
  })

  test("should deny access with incorrect admin credentials", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto(`${BASE_URL}/auth/signin`)
    await signIn(page, process.env.ADMIN_EMAIL!, "wrongpassword")
    await expect(page.getByText("Invalid credentials")).toBeVisible()
  })

  test("should maintain admin session with remember me", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto(`${BASE_URL}/auth/signin`)
    await signIn(page, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!, true)
    
    // Verify session cookie has extended expiry
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(
      (c) => c.name === AUTH_CONFIG.cookies.prefix + ".session-token"
    )
    expect(sessionCookie?.expires).toBeGreaterThan(
      Date.now() + 29 * 24 * 60 * 60 * 1000
    ) // ~30 days

    // Verify admin access persists after page reload
    await page.reload()
    await expect(page.getByText("Admin Dashboard")).toBeVisible()
  })

  test("should allow access to admin-only routes", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto(`${BASE_URL}/auth/signin`)
    await signIn(page, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!)

    // Test access to various admin routes
    const adminRoutes = [
      { path: "/admin/users", text: "Users" },
      { path: "/admin/organizations", text: "Organizations" },
      { path: "/admin/settings", text: "System Settings" },
      { path: "/admin/metadata", text: "All Metadata" },
    ]

    for (const route of adminRoutes) {
      await page.goto(`${BASE_URL}${route.path}`)
      await expect(page.getByText(route.text)).toBeVisible()
    }
  })

  test("should handle admin session expiry correctly", async ({
    page,
  }: {
    page: Page
  }) => {
    await page.goto(`${BASE_URL}/auth/signin`)
    await signIn(page, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!)

    // Simulate session expiry
    await page.evaluate(() => {
      window.localStorage.setItem(
        "sessionExpiry",
        new Date(Date.now() - 1000).toISOString()
      )
    })

    // Attempt to access admin route
    await page.goto(`${BASE_URL}/admin/settings`)
    await waitForRedirect(page, /.*\/auth\/signin/)
  })
})
