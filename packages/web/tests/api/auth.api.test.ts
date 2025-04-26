import { test, expect } from "@playwright/test"
import { testDataFactory } from "../helpers/test-data-factory"
import { UserRole } from "@prisma/client"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

test.describe("Authentication API", () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies before each test
    await context.clearCookies()
  })

  test.afterEach(async () => {
    await testDataFactory.cleanupTestData()
  })

  test("should handle JWT authentication", async ({ request }) => {
    // Create a test user
    const user = await testDataFactory.createUser()

    // Get CSRF token
    const csrfResponse = await request.get(`${BASE_URL}/api/auth/csrf`)
    const { csrfToken } = await csrfResponse.json()

    // Attempt login
    const loginResponse = await request.post(
      `${BASE_URL}/api/auth/callback/credentials`,
      {
        data: {
          email: user.email,
          password: "Test@123456",
          csrfToken,
        },
      }
    )

    expect(loginResponse.ok()).toBeTruthy()

    // Get session
    const sessionResponse = await request.get(`${BASE_URL}/api/auth/session`)
    const session = await sessionResponse.json()

    expect(session.user.email).toBe(user.email)
    expect(session.user.role).toBe(UserRole.USER)
  })

  test("should handle invalid credentials", async ({ request }) => {
    // Get CSRF token
    const csrfResponse = await request.get(`${BASE_URL}/api/auth/csrf`)
    const { csrfToken } = await csrfResponse.json()

    const loginResponse = await request.post(
      `${BASE_URL}/api/auth/callback/credentials`,
      {
        data: {
          email: "nonexistent@example.com",
          password: "wrongpassword",
          csrfToken,
        },
      }
    )

    expect(loginResponse.status()).toBe(401)
  })

  test("should enforce rate limiting", async ({ request }) => {
    const user = await testDataFactory.createUser()

    // Get CSRF token
    const csrfResponse = await request.get(`${BASE_URL}/api/auth/csrf`)
    const { csrfToken } = await csrfResponse.json()

    // Attempt multiple logins
    for (let i = 0; i < 5; i++) {
      await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
        data: {
          email: user.email,
          password: "wrongpassword",
          csrfToken,
        },
      })
    }

    const finalResponse = await request.post(
      `${BASE_URL}/api/auth/callback/credentials`,
      {
        data: {
          email: user.email,
          password: "wrongpassword",
          csrfToken,
        },
      }
    )

    expect(finalResponse.status()).toBe(429)
  })

  test("should handle session expiry", async ({ request }) => {
    const user = await testDataFactory.createUser()

    // Get CSRF token
    const csrfResponse = await request.get(`${BASE_URL}/api/auth/csrf`)
    const { csrfToken } = await csrfResponse.json()

    // Login
    await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
      data: {
        email: user.email,
        password: "Test@123456",
        csrfToken,
      },
    })

    // Wait for session to expire (mock expiry)
    await request.post(`${BASE_URL}/api/auth/signout`)

    // Try to access protected endpoint
    const protectedResponse = await request.get(`${BASE_URL}/api/protected`)
    expect(protectedResponse.status()).toBe(401)
  })

  test("should handle role-based access control", async ({ request }) => {
    // Create admin user
    const adminUser = await testDataFactory.createUser({
      role: UserRole.ADMIN,
      email: "admin@test.com",
    })

    // Get CSRF token
    const csrfResponse = await request.get(`${BASE_URL}/api/auth/csrf`)
    const { csrfToken } = await csrfResponse.json()

    // Login as admin
    await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
      data: {
        email: adminUser.email,
        password: "Test@123456",
        csrfToken,
      },
    })

    // Access admin endpoint
    const adminResponse = await request.get(`${BASE_URL}/api/admin/users`)
    expect(adminResponse.ok()).toBeTruthy()

    // Create regular user
    const regularUser = await testDataFactory.createUser({
      email: "user@test.com",
    })

    // Get new CSRF token
    const newCsrfResponse = await request.get(`${BASE_URL}/api/auth/csrf`)
    const { csrfToken: newCsrfToken } = await newCsrfResponse.json()

    // Login as regular user
    await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
      data: {
        email: regularUser.email,
        password: "Test@123456",
        csrfToken: newCsrfToken,
      },
    })

    // Try to access admin endpoint
    const unauthorizedResponse = await request.get(
      `${BASE_URL}/api/admin/users`
    )
    expect(unauthorizedResponse.status()).toBe(403)
  })
})
