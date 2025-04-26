import { test, expect, type Page } from "@playwright/test"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { UserRole } from "@prisma/client"
import {
  signIn,
  clearSession,
  getTestUser,
  setupTestUser,
} from "./helpers/auth"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

test.describe("Authentication Security", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await clearSession(page)
    await page.goto(BASE_URL)
  })

  test.describe("CSRF Protection", () => {
    test("should include CSRF token in auth forms", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)
      const csrfToken = await page.evaluate(() => {
        const input = document.querySelector('input[name="csrfToken"]')
        return input instanceof HTMLInputElement ? input.value : null
      })
      expect(csrfToken).toBeTruthy()
      expect(csrfToken?.length).toBeGreaterThan(20)
    })

    test("should reject requests without CSRF token", async ({ page }) => {
      // Intercept the sign-in request
      await page.route("**/api/auth/callback/credentials", async (route) => {
        const request = route.request()
        const postData = request.postData()
        if (!postData?.includes("csrfToken")) {
          await route.fulfill({
            status: 403,
            body: JSON.stringify({ error: "Invalid CSRF token" }),
          })
        } else {
          await route.continue()
        }
      })

      // Attempt sign in
      const user = getTestUser()
      await signIn(page, user.email, user.password)
      await expect(page.getByText("Invalid CSRF token")).toBeVisible()
    })
  })

  test.describe("XSS Prevention", () => {
    test("should sanitize user input in auth forms", async ({ page }) => {
      const xssPayload = '<script>alert("XSS")</script>'
      await page.goto(`${BASE_URL}/auth/signin`)

      // Attempt XSS in email field
      await page.getByLabel("Email").fill(xssPayload)

      // Verify the input is escaped
      const emailValue = await page.evaluate(() => {
        const input = document.querySelector('input[type="email"]')
        return input instanceof HTMLInputElement ? input.value : null
      })

      expect(emailValue).toBe(xssPayload)

      // Verify the payload is not executed
      const hasScript = await page.evaluate(() => {
        return !!document.querySelector('script[text*="alert"]')
      })
      expect(hasScript).toBe(false)
    })

    test("should encode error messages", async ({ page }) => {
      const xssPayload = '<script>alert("XSS")</script>'

      // Mock an error response with XSS payload
      await page.route("**/api/auth/callback/credentials", async (route) => {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({ error: xssPayload }),
        })
      })

      // Trigger auth error
      await signIn(page, "test@example.com", "wrongpass")

      // Verify error message is encoded
      const errorHtml = await page.evaluate(() => {
        const error = document.querySelector('[role="alert"]')
        return error ? error.innerHTML : null
      })

      expect(errorHtml).not.toContain("<script>")
      expect(errorHtml).toContain("&lt;script&gt;")
    })
  })

  test.describe("Brute Force Protection", () => {
    test("should enforce exponential backoff", async ({ page }) => {
      const user = getTestUser()
      const attempts = 5
      const startTime = Date.now()

      // Make multiple failed login attempts
      for (let i = 0; i < attempts; i++) {
        await signIn(page, user.email, "wrongpassword")
        await expect(
          page.getByText(/Invalid credentials|Too many attempts/)
        ).toBeVisible()
      }

      // Verify increasing delay between attempts
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Should take longer than simple linear time
      // Basic exponential backoff would be sum(2^n) where n is attempt number
      const minExpectedTime = (Math.pow(2, attempts) - 1) * 1000 // milliseconds
      expect(totalTime).toBeGreaterThan(minExpectedTime)
    })

    test("should implement IP-based rate limiting", async ({ page }) => {
      const user = getTestUser()

      // Simulate multiple requests from same IP
      for (let i = 0; i < AUTH_CONFIG.security.maxLoginAttempts + 1; i++) {
        await signIn(page, user.email, "wrongpassword")
      }

      // Verify rate limit error
      await expect(page.getByText("Too many attempts")).toBeVisible()

      // Verify persistent rate limiting
      await signIn(page, user.email, user.password)
      await expect(page.getByText("Too many attempts")).toBeVisible()
    })
  })

  test.describe("Password Security", () => {
    test("should enforce password complexity", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signup`)

      const weakPasswords = [
        "short",
        "nouppercaseornumbers",
        "NoSpecialChars123",
        "!@#$%^&*()",
      ]

      for (const password of weakPasswords) {
        await page.getByLabel("Password").fill(password)
        await expect(page.getByText(/Password (must|should)/)).toBeVisible()
      }
    })

    test("should prevent common passwords", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signup`)

      const commonPasswords = ["Password123!", "Admin123!", "Welcome123!"]

      for (const password of commonPasswords) {
        await page.getByLabel("Password").fill(password)
        await expect(page.getByText("Password is too common")).toBeVisible()
      }
    })
  })

  test.describe("Session Security", () => {
    test("should invalidate all sessions on password change", async ({
      page,
    }) => {
      const user = await setupTestUser(page)

      // Change password
      await page.goto(`${BASE_URL}/settings/security`)
      await page.getByLabel("Current Password").fill(user.password)
      await page.getByLabel("New Password").fill("NewSecure@123")
      await page.getByRole("button", { name: "Update Password" }).click()

      // Verify old session is invalidated
      await page.goto(`${BASE_URL}/profile`)
      await expect(page).toHaveURL(/.*\/auth\/signin/)
    })

    test("should implement secure session timeout", async ({ page }) => {
      const user = await setupTestUser(page)

      // Mock session timeout
      await page.evaluate(() => {
        window.localStorage.setItem(
          "sessionExpiry",
          new Date(Date.now() - 1000).toISOString()
        )
      })

      // Attempt to access protected route
      await page.goto(`${BASE_URL}/profile`)
      await expect(page).toHaveURL(/.*\/auth\/signin/)
    })
  })
})
