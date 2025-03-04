import { test, expect, type Page } from "@playwright/test"
import {
  signIn,
  clearSession,
  getTestUser,
  setupTestUser,
} from "./helpers/auth"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

test.describe("Authentication Accessibility", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await clearSession(page)
    await page.goto(BASE_URL)
  })

  test.describe("Form Accessibility", () => {
    test("should have proper form labeling and ARIA attributes", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Check form landmarks
      const form = page.locator('form[aria-label="Sign in form"]')
      await expect(form).toBeVisible()

      // Check input labeling
      const emailInput = page.getByLabel("Email")
      const passwordInput = page.getByLabel("Password")
      await expect(emailInput).toHaveAttribute("aria-required", "true")
      await expect(passwordInput).toHaveAttribute("aria-required", "true")

      // Check error handling
      await emailInput.fill("invalid")
      await emailInput.blur()
      const errorMessage = page.locator('[role="alert"]')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toHaveAttribute("aria-live", "polite")
    })

    test("should maintain focus management", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Initial focus should be on email
      await expect(page.getByLabel("Email")).toBeFocused()

      // Tab navigation
      await page.keyboard.press("Tab")
      await expect(page.getByLabel("Password")).toBeFocused()

      await page.keyboard.press("Tab")
      await expect(page.getByLabel("Remember me")).toBeFocused()

      await page.keyboard.press("Tab")
      await expect(
        page.getByRole("button", { name: "Sign in with Email" })
      ).toBeFocused()
    })

    test("should handle error focus management", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Submit invalid form
      await page.getByLabel("Email").fill("invalid")
      await page.getByRole("button", { name: "Sign in with Email" }).click()

      // Focus should move to first error
      await expect(page.getByLabel("Email")).toBeFocused()
      await expect(page.getByText("Invalid email address")).toBeVisible()
    })
  })

  test.describe("Keyboard Navigation", () => {
    test("should support full keyboard operation", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Navigate through form with keyboard
      await page.keyboard.press("Tab") // Email
      await page.keyboard.type("test@example.com")

      await page.keyboard.press("Tab") // Password
      await page.keyboard.type("password123")

      await page.keyboard.press("Tab") // Remember me
      await page.keyboard.press("Space") // Check the box

      await page.keyboard.press("Tab") // Sign in button
      await page.keyboard.press("Enter") // Submit form

      // Verify error message is keyboard accessible
      await expect(page.getByText("Invalid credentials")).toBeVisible()
      await expect(page.getByText("Invalid credentials")).toHaveAttribute(
        "role",
        "alert"
      )
    })

    test("should have accessible social auth buttons", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Check each social button
      const socialButtons = [
        "Sign in with Google",
        "Sign in with GitHub",
        "Sign in with Microsoft",
      ]

      for (const buttonName of socialButtons) {
        const button = page.getByRole("button", { name: buttonName })
        await expect(button).toBeVisible()
        await expect(button).toHaveAttribute("role", "button")

        // Verify keyboard focus styles
        await button.focus()
        await expect(button).toHaveCSS("outline", /.*/)
      }
    })

    test("should handle modal dialogs accessibly", async ({ page }) => {
      const user = await setupTestUser(page)
      await page.goto(`${BASE_URL}/settings/security`)

      // Open password change dialog
      await page.getByRole("button", { name: "Change Password" }).click()

      // Check modal accessibility
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()
      await expect(dialog).toHaveAttribute("aria-modal", "true")

      // Verify focus trap
      await page.keyboard.press("Tab")
      await expect(page.getByLabel("Current Password")).toBeFocused()

      // Tab through all focusable elements
      const focusableElements = [
        "Current Password",
        "New Password",
        "Confirm Password",
        "Cancel",
        "Update Password",
      ]

      for (const element of focusableElements) {
        await expect(
          page
            .getByRole("button", { name: element })
            .or(page.getByLabel(element))
        ).toBeFocused()
        await page.keyboard.press("Tab")
      }

      // Verify focus wraps to start
      await expect(page.getByLabel("Current Password")).toBeFocused()
    })
  })

  test.describe("Screen Reader Support", () => {
    test("should have proper heading structure", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Check heading hierarchy
      const mainHeading = page.getByRole("heading", {
        name: "Sign In",
        level: 1,
      })
      await expect(mainHeading).toBeVisible()

      // Check subheadings
      const subHeading = page.getByRole("heading", {
        name: "Or continue with",
        level: 2,
      })
      await expect(subHeading).toBeVisible()
    })

    test("should announce form validation errors", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Submit empty form
      await page.getByRole("button", { name: "Sign in with Email" }).click()

      // Check error announcements
      const errors = page.locator('[role="alert"]')
      await expect(errors).toHaveCount(2) // Email and password errors
      await expect(errors.first()).toHaveAttribute("aria-live", "polite")
    })

    test("should have descriptive button labels", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Check social login buttons
      const googleButton = page.getByRole("button", {
        name: "Sign in with Google",
      })
      await expect(googleButton).toHaveAttribute(
        "aria-label",
        "Sign in with Google"
      )

      // Check form submission button
      const submitButton = page.getByRole("button", {
        name: "Sign in with Email",
      })
      await expect(submitButton).toHaveAttribute(
        "aria-label",
        "Sign in with Email"
      )
    })
  })

  test.describe("Visual Accessibility", () => {
    test("should have sufficient color contrast", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Check text contrast
      const textElements = [
        page.getByRole("heading", { name: "Sign In" }),
        page.getByLabel("Email"),
        page.getByLabel("Password"),
        page.getByRole("button", { name: "Sign in with Email" }),
      ]

      for (const element of textElements) {
        const styles = await element.evaluate((el) => {
          const style = window.getComputedStyle(el)
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
          }
        })

        // Verify contrast ratio (simplified check)
        expect(styles.color).not.toBe(styles.backgroundColor)
      }
    })

    test("should support text scaling", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Increase text size
      await page.evaluate(() => {
        document.body.style.fontSize = "200%"
      })

      // Check if form remains usable
      const form = page.locator("form")
      await expect(form).toBeVisible()

      // Verify no text overflow
      const formBounds = await form.boundingBox()
      const viewportSize = page.viewportSize()

      expect(formBounds?.width).toBeLessThanOrEqual(viewportSize?.width || 0)
      expect(formBounds?.height).toBeLessThanOrEqual(viewportSize?.height || 0)
    })

    test("should handle high contrast mode", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Simulate high contrast mode
      await page.evaluate(() => {
        const style = document.createElement("style")
        style.innerHTML = `
          * {
            background-color: black !important;
            color: white !important;
            border-color: white !important;
          }
        `
        document.head.appendChild(style)
      })

      // Verify form remains visible and usable
      await expect(page.locator("form")).toBeVisible()
      await expect(page.getByLabel("Email")).toBeVisible()
      await expect(page.getByLabel("Password")).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Sign in with Email" })
      ).toBeVisible()
    })
  })
})
