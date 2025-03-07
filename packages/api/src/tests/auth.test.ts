import app from "../index"
import { prisma } from "../db/prisma"
import {
  clearDatabase,
  createTestUser,
  generateTestToken,
  createTestVerificationToken,
} from "./setup"
import { UserRole } from "../types/auth.types"
import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals"
import { hashPassword } from "../utils/password"

describe("Auth Routes", () => {
  beforeAll(async () => {
    await clearDatabase()
  }, 30000)

  afterAll(async () => {
    await clearDatabase()
    await prisma.$disconnect()

    // Close any open server connections
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  }, 30000)

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "newuser@example.com",
          password: "password123",
          name: "New User",
        }),
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toHaveProperty("message", "User registered successfully")
    })

    it("should return 400 for invalid registration data", async () => {
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "invalid-email",
          password: "short",
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty("message")
    })
  })

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await clearDatabase()
      await prisma.user.create({
        data: {
          email: "test@example.com",
          password: await hashPassword("password123"),
          name: "Test User",
          role: UserRole.USER,
          emailVerified: new Date(), // Set email as verified
        },
      })
    }, 30000)

    it("should login successfully with valid credentials", async () => {
      const response = await app.request("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty("token")
    })

    it("should return 401 for invalid credentials", async () => {
      const response = await app.request("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toHaveProperty("message", "Invalid credentials")
    })
  })

  describe("GET /api/auth/verify-email", () => {
    let user: any

    beforeEach(async () => {
      await clearDatabase()
      user = await createTestUser()
      await createTestVerificationToken(user.email)
    }, 30000)

    it("should return 200 for valid token", async () => {
      const response = await app.request(
        "/api/auth/verify-email?token=valid_token",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty("message", "Email verified successfully")
    })

    it("should return 400 for invalid token", async () => {
      const response = await app.request(
        "/api/auth/verify-email?token=invalid_token",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty("message", "Invalid token")
    })
  })
})
