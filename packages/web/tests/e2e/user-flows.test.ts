import { test, expect } from "@playwright/test"
import { testDataFactory } from "../helpers/test-data-factory"
import { UserRole } from "@prisma/client"
import {
  loginUser,
  createAndLoginUser,
  fillMetadataForm,
  fillProfileForm,
  changePassword,
  navigateToSection,
  applyMetadataFilters,
  clearMetadataFilters,
} from "../helpers/e2e-helpers"
import { setupTestDatabase, teardownTestDatabase } from "../helpers/test-db"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

test.describe("End-to-end User Flows", () => {
  test.beforeAll(async () => {
    await setupTestDatabase()
  })

  test.afterAll(async () => {
    await teardownTestDatabase()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test.afterEach(async () => {
    await testDataFactory.cleanupTestData()
  })

  test("complete user registration and onboarding flow", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`)

    // Fill registration form
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`)
    await page.fill('input[name="password"]', "Test@123456")
    await page.fill('input[name="confirmPassword"]', "Test@123456")
    await page.fill('input[name="name"]', "Test User")
    await page.click('button[type="submit"]')

    // Verify email verification screen
    await expect(page.getByText("Verify your email")).toBeVisible()

    // Simulate email verification (using test helper)
    const user = await testDataFactory.createUser({
      email: `test-${Date.now()}@example.com`,
      isVerified: false,
    })

    // Complete onboarding
    await loginUser(page, user.email || "")

    // Fill onboarding form
    await fillProfileForm(page)
    await page.click('button[type="submit"]')

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    await expect(page.getByText("Welcome to your dashboard")).toBeVisible()
  })

  test("metadata creation and management workflow", async ({ page }) => {
    // Login as NODE_OFFICER
    const user = await createAndLoginUser(page, UserRole.NODE_OFFICER)

    // Navigate to metadata creation
    await navigateToSection(page, "metadata-add")
    await expect(page).toHaveURL(/.*\/metadata\/add/)

    // Fill and submit metadata form
    await fillMetadataForm(page)
    await page.click('button[type="submit"]')

    // Verify metadata creation
    await expect(page.getByText("Metadata created successfully")).toBeVisible()
    await expect(page.getByText("Test Dataset")).toBeVisible()

    // Edit metadata
    await page.click('a:has-text("Test Dataset")')
    await page.click('[aria-label="Edit metadata"]')
    await fillMetadataForm(page, { title: "Updated Dataset" })
    await page.click('button[type="submit"]')

    // Verify update
    await expect(page.getByText("Metadata updated successfully")).toBeVisible()
    await expect(page.getByText("Updated Dataset")).toBeVisible()

    // Delete metadata
    await page.click('[aria-label="Delete metadata"]')
    await page.click('button:has-text("Confirm")')
    await expect(page.getByText("Metadata deleted successfully")).toBeVisible()
    await expect(page.getByText("Updated Dataset")).not.toBeVisible()
  })

  test("admin user management workflow", async ({ page }) => {
    // Login as admin
    await createAndLoginUser(page, UserRole.ADMIN)

    // Navigate to user management
    await navigateToSection(page, "admin-users")
    await expect(page).toHaveURL(/.*\/admin\/users/)

    // Create new user
    await page.click('button:has-text("Add User")')
    await page.fill('input[name="email"]', "newuser@test.com")
    await page.fill('input[name="name"]', "New User")
    await page.selectOption('select[name="role"]', UserRole.NODE_OFFICER)
    await page.click('button[type="submit"]')

    // Verify user creation
    await expect(page.getByText("User created successfully")).toBeVisible()
    await expect(page.getByText("newuser@test.com")).toBeVisible()

    // Edit user role
    await page.click('button[aria-label="Edit user newuser@test.com"]')
    await page.selectOption('select[name="role"]', UserRole.USER)
    await page.click('button[type="submit"]')

    // Verify role update
    await expect(page.getByText("User updated successfully")).toBeVisible()
    await expect(page.getByText(UserRole.USER)).toBeVisible()

    // Disable user
    await page.click('button[aria-label="Disable user newuser@test.com"]')
    await page.click('button:has-text("Confirm")')
    await expect(page.getByText("User disabled successfully")).toBeVisible()
  })

  test("search and filter metadata workflow", async ({ page }) => {
    // Create test data
    const user = await testDataFactory.createUser()
    await testDataFactory.createMetadata(user.id)
    await testDataFactory.createMetadata(user.id)

    // Login and navigate to search
    await loginUser(page, user.email || "")
    await navigateToSection(page, "metadata-search")

    // Apply various filters
    await applyMetadataFilters(page, {
      search: "Test Dataset",
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
      frameworkType: "Test Framework",
    })
    await expect(page.getByText("Test Dataset")).toBeVisible()

    // Clear filters
    await clearMetadataFilters(page)
    await expect(page.getByText("Test Dataset")).toBeVisible()
  })

  test("profile management workflow", async ({ page }) => {
    // Login and navigate to profile
    const user = await createAndLoginUser(page)
    await navigateToSection(page, "profile")

    // Update profile
    await fillProfileForm(page)
    await page.click('button[type="submit"]')

    // Verify updates
    await expect(page.getByText("Profile updated successfully")).toBeVisible()
    await expect(page.locator('input[name="name"]')).toHaveValue("Updated Name")

    // Change password
    await changePassword(page)
    await expect(page.getByText("Password updated successfully")).toBeVisible()

    // Test new password
    await page.click('[aria-label="Open user menu"]')
    await page.click('button:has-text("Sign out")')
    await loginUser(page, user.email || "", "NewTest@123456")
    await expect(page).toHaveURL(/.*\/dashboard/)
  })
})
