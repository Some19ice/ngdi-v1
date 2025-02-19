import { type Page } from "@playwright/test"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function signIn(
  page: Page,
  email: string,
  password: string,
  rememberMe = false
) {
  await page.goto(
    `${process.env.NEXTAUTH_URL}/auth/signin?callbackUrl=/profile`
  )

  // Wait for the form to be ready
  await page.waitForSelector("form", { state: "visible", timeout: 10000 })

  // Fill in email
  const emailInput = page.getByLabel("Email")
  await emailInput.waitFor({ state: "visible", timeout: 10000 })
  await emailInput.fill(email)

  // Fill in password
  const passwordInput = page.getByLabel("Password")
  await passwordInput.waitFor({ state: "visible", timeout: 10000 })
  await passwordInput.fill(password)

  // Handle remember me checkbox if needed
  if (rememberMe) {
    const rememberMeCheckbox = page.getByLabel("Remember me")
    await rememberMeCheckbox.waitFor({ state: "visible", timeout: 10000 })
    await rememberMeCheckbox.check()
  }

  // Find and click the email sign in button specifically
  const signInButton = page.getByRole("button", { name: "Sign in with Email" })
  await signInButton.waitFor({ state: "visible", timeout: 10000 })
  await signInButton.click()

  // Wait for the sign-in process to complete with increased timeout
  try {
    // Wait for either successful navigation or error
    await Promise.race([
      page.waitForURL("**/profile", { timeout: 30000 }),
      page.waitForSelector('[class*="bg-red-50"]', { timeout: 30000 }),
    ])

    // Check if we got an error
    const errorElement = await page.$('[class*="bg-red-50"]')
    if (errorElement) {
      const errorText = await errorElement.textContent()
      throw new Error(`Sign in failed: ${errorText}`)
    }

    // Wait for authentication to complete and verify localStorage
    await page.waitForFunction(
      () => {
        const user = window.localStorage.getItem("user")
        const expiry = window.localStorage.getItem("sessionExpiry")
        return user && expiry
      },
      { timeout: 10000 }
    )

    // Double check the authentication state
    const isAuthenticated = await page.evaluate(() => {
      const user = window.localStorage.getItem("user")
      const expiry = window.localStorage.getItem("sessionExpiry")
      return { user, expiry }
    })

    if (!isAuthenticated.user || !isAuthenticated.expiry) {
      throw new Error("Authentication failed - session data not properly set")
    }
  } catch (error: any) {
    if (error.message?.includes("Timeout")) {
      throw new Error(
        "Sign in timed out - no redirect or error message received"
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
