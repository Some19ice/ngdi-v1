import { test, expect } from "@playwright/test"
import { testDataFactory } from "../helpers/test-data-factory"
import AxeBuilder from "@axe-core/playwright"
import { UserRole } from "@prisma/client"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

test.describe("Component Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test.afterEach(async () => {
    await testDataFactory.cleanupTestData()
  })

  test("login form should be accessible", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`)

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include("#login-form")
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test("navigation menu should be keyboard navigable", async ({ page }) => {
    const user = await testDataFactory.createUser()

    // Login
    await page.goto(`${BASE_URL}/auth/signin`)
    await page.fill('input[name="email"]', user.email || "")
    await page.fill('input[name="password"]', "Test@123456")
    await page.click('button[type="submit"]')

    // Test keyboard navigation
    await page.keyboard.press("Tab")
    const activeElement = await page.evaluate(
      () => document.activeElement?.tagName || ""
    )
    expect(activeElement.toLowerCase()).toBe("a")

    // Check ARIA attributes
    const menuButton = await page.locator('[aria-label="Open menu"]')
    const expandedState = await menuButton.getAttribute("aria-expanded")
    expect(expandedState).toBe("false")

    await menuButton.click()
    const newExpandedState = await menuButton.getAttribute("aria-expanded")
    expect(newExpandedState).toBe("true")
  })

  test("metadata form should have proper labels and descriptions", async ({
    page,
  }) => {
    const user = await testDataFactory.createUser({
      role: UserRole.NODE_OFFICER,
    })

    // Login and navigate to metadata form
    await page.goto(`${BASE_URL}/auth/signin`)
    await page.fill('input[name="email"]', user.email || "")
    await page.fill('input[name="password"]', "Test@123456")
    await page.click('button[type="submit"]')
    await page.goto(`${BASE_URL}/metadata/add`)

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include("#metadata-form")
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    // Check form field associations
    const formFields = await page.locator('label:has-text("Title") + input')
    const ariaRequired = await formFields.getAttribute("aria-required")
    const ariaDescribedby = await formFields.getAttribute("aria-describedby")

    expect(ariaRequired).toBe("true")
    expect(ariaDescribedby).toBeTruthy()
  })

  test("error messages should be announced by screen readers", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/auth/signin`)

    // Submit empty form to trigger errors
    await page.click('button[type="submit"]')

    // Check error message accessibility
    const errorMessage = await page.locator('[role="alert"]')
    const ariaLive = await errorMessage.getAttribute("aria-live")
    expect(ariaLive).toBe("polite")

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="alert"]')
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test("modals should trap focus and have proper ARIA attributes", async ({
    page,
  }) => {
    const user = await testDataFactory.createUser()

    // Login and open a modal
    await page.goto(`${BASE_URL}/auth/signin`)
    await page.fill('input[name="email"]', user.email || "")
    await page.fill('input[name="password"]', "Test@123456")
    await page.click('button[type="submit"]')

    // Open settings modal
    await page.click('[aria-label="Open settings"]')

    const modal = await page.locator('[role="dialog"]')
    const ariaModal = await modal.getAttribute("aria-modal")
    const ariaLabelledby = await modal.getAttribute("aria-labelledby")

    expect(ariaModal).toBe("true")
    expect(ariaLabelledby).toBeTruthy()

    // Check focus trap
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    const focusedElement = await page.evaluate(
      () => document.activeElement?.getAttribute("aria-label") || ""
    )
    expect(focusedElement).toBe("Close settings")
  })

  test("color contrast should meet WCAG standards", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`)

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
