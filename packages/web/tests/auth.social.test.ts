import { test, expect, type Page } from "@playwright/test"
import {
  signInWithGoogle,
  mockGoogleAuth,
  clearSession,
  setupTestUser,
} from "./helpers/auth"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

test.describe("Social Authentication", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await clearSession(page)
    await page.goto(BASE_URL)
  })

  test.describe("OAuth Providers", () => {
    test("should display all configured OAuth providers", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      // Verify presence of OAuth provider buttons
      await expect(
        page.getByRole("button", { name: "Sign in with Google" })
      ).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Sign in with GitHub" })
      ).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Sign in with Microsoft" })
      ).toBeVisible()
    })

    test("should handle Google authentication", async ({ page }) => {
      const mockUser = {
        email: "test.google@example.com",
        name: "Test Google User",
        picture: "https://example.com/avatar.jpg",
      }

      await mockGoogleAuth(page, mockUser)
      await signInWithGoogle(page)

      await expect(page).toHaveURL(/.*\/profile/)
      await expect(page.getByText(mockUser.name)).toBeVisible()
    })

    test("should handle GitHub authentication", async ({ page }) => {
      // Mock GitHub OAuth flow
      await page.route("**/api/auth/callback/github", async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            user: {
              email: "test.github@example.com",
              name: "Test GitHub User",
              image: "https://example.com/github-avatar.jpg",
            },
          }),
        })
      })

      await page.goto(`${BASE_URL}/auth/signin`)
      await page.getByRole("button", { name: "Sign in with GitHub" }).click()

      await expect(page).toHaveURL(/.*\/profile/)
      await expect(page.getByText("Test GitHub User")).toBeVisible()
    })
  })

  test.describe("OAuth Error Handling", () => {
    test("should handle OAuth cancellation", async ({ page }) => {
      // Mock cancelled OAuth flow
      await page.route("**/api/auth/callback/google", async (route) => {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({ error: "Access denied" }),
        })
      })

      await signInWithGoogle(page)
      await expect(page.getByText("Authentication cancelled")).toBeVisible()
    })

    test("should handle invalid OAuth state", async ({ page }) => {
      // Mock invalid state error
      await page.route("**/api/auth/callback/google", async (route) => {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({ error: "Invalid state" }),
        })
      })

      await signInWithGoogle(page)
      await expect(page.getByText("Authentication failed")).toBeVisible()
    })

    test("should handle missing OAuth permissions", async ({ page }) => {
      // Mock missing permissions error
      await page.route("**/api/auth/callback/google", async (route) => {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({ error: "Insufficient permissions" }),
        })
      })

      await signInWithGoogle(page)
      await expect(
        page.getByText("Required permissions not granted")
      ).toBeVisible()
    })
  })

  test.describe("Account Linking", () => {
    test("should link social account to existing email account", async ({
      page,
    }) => {
      // Setup existing user
      const user = await setupTestUser(page)

      // Mock Google OAuth with matching email
      await mockGoogleAuth(page, {
        email: user.email,
        name: user.name,
      })

      await page.goto(`${BASE_URL}/settings/connections`)
      await page.getByRole("button", { name: "Link Google Account" }).click()

      await expect(page.getByText("Account successfully linked")).toBeVisible()
    })

    test("should prevent linking to already connected account", async ({
      page,
    }) => {
      const user = await setupTestUser(page)

      // Mock already linked account
      await page.route("**/api/auth/callback/google", async (route) => {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({ error: "Account already linked" }),
        })
      })

      await page.goto(`${BASE_URL}/settings/connections`)
      await page.getByRole("button", { name: "Link Google Account" }).click()

      await expect(
        page.getByText("Account already linked to another user")
      ).toBeVisible()
    })

    test("should allow unlinking social account", async ({ page }) => {
      const user = await setupTestUser(page)

      // Setup mock linked account
      await page.evaluate(() => {
        window.localStorage.setItem(
          "linkedAccounts",
          JSON.stringify(["google"])
        )
      })

      await page.goto(`${BASE_URL}/settings/connections`)
      await page.getByRole("button", { name: "Unlink Google Account" }).click()
      await page.getByRole("button", { name: "Confirm" }).click()

      await expect(
        page.getByText("Account successfully unlinked")
      ).toBeVisible()
    })
  })

  test.describe("Social Profile Sync", () => {
    test("should sync profile data from social provider", async ({ page }) => {
      const mockUser = {
        email: "test.sync@example.com",
        name: "Updated Name",
        picture: "https://example.com/new-avatar.jpg",
      }

      await mockGoogleAuth(page, mockUser)
      await signInWithGoogle(page)

      await page.goto(`${BASE_URL}/profile`)
      await expect(page.getByText(mockUser.name)).toBeVisible()

      // Verify avatar update
      const avatar = page.locator('img[alt="Profile picture"]')
      await expect(avatar).toHaveAttribute("src", mockUser.picture)
    })

    test("should handle conflicting profile data", async ({ page }) => {
      const user = await setupTestUser(page)

      // Mock social login with different name
      await mockGoogleAuth(page, {
        email: user.email,
        name: "Different Name",
      })

      await page.goto(`${BASE_URL}/settings/connections`)
      await page.getByRole("button", { name: "Link Google Account" }).click()

      // Should show profile merge confirmation
      await expect(page.getByText("Update profile information?")).toBeVisible()
      await page.getByRole("button", { name: "Keep existing" }).click()

      // Verify original name is kept
      await expect(page.getByText(user.name)).toBeVisible()
    })
  })
})
