import {
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
  beforeAll,
  jest,
} from "@jest/globals"
import request from "supertest"
import { Hono } from "hono"
import { prisma } from "../../../src/db/prisma"
import authRoutes from "../../../src/routes/auth.routes"
import { hashPassword } from "../../../src/utils/password"

// Mock dependencies
jest.mock("../../../src/services/email.service", () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(),
    sendWelcomeEmail: jest.fn().mockResolvedValue(),
  },
}))

describe("Auth Routes Integration Tests", () => {
  let app: Hono
  let testUser: any

  beforeAll(async () => {
    // Create a test app with auth routes
    app = new Hono()
    app.route("/api/auth", authRoutes)

    // Create a test user for login tests
    const hashedPassword = await hashPassword("password123")
    testUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: "testuser@example.com",
        password: hashedPassword,
        emailVerified: new Date(),
        role: "USER",
      },
    })
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.user.delete({
      where: { id: testUser.id },
    })
    await prisma.$disconnect()
  })

  describe("POST /api/auth/login", () => {
    it("should login a user with valid credentials", async () => {
      const response = await request(app.fetch)
        .post("/api/auth/login")
        .send({
          email: "testuser@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json")

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe("Login successful")
      expect(response.body.data).toHaveProperty("token")
      expect(response.body.data).toHaveProperty("refreshToken")
      expect(response.body.data.user).toHaveProperty("id")
      expect(response.body.data.user.email).toBe("testuser@example.com")
    })

    it("should return 401 with invalid credentials", async () => {
      const response = await request(app.fetch)
        .post("/api/auth/login")
        .send({
          email: "testuser@example.com",
          password: "wrongpassword",
        })
        .set("Content-Type", "application/json")

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it("should return 400 with invalid input", async () => {
      const response = await request(app.fetch)
        .post("/api/auth/login")
        .send({
          email: "invalid-email",
          password: "123",
        })
        .set("Content-Type", "application/json")

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const newUser = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        organization: "Test Org",
        department: "Test Dept",
      }

      const response = await request(app.fetch)
        .post("/api/auth/register")
        .send(newUser)
        .set("Content-Type", "application/json")

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain("Registration successful")
      expect(response.body.data.user).toHaveProperty("id")
      expect(response.body.data.user.email).toBe(newUser.email)

      // Clean up - delete the created user
      await prisma.user.deleteMany({
        where: { email: newUser.email },
      })
    })

    it("should return 400 with invalid input", async () => {
      const response = await request(app.fetch)
        .post("/api/auth/register")
        .send({
          name: "A", // Too short
          email: "invalid-email",
          password: "123", // Too short
        })
        .set("Content-Type", "application/json")

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it("should return 400 if email already exists", async () => {
      const response = await request(app.fetch)
        .post("/api/auth/register")
        .send({
          name: "Duplicate User",
          email: "testuser@example.com", // Already exists
          password: "password123",
        })
        .set("Content-Type", "application/json")

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain("already exists")
    })
  })

  describe("POST /api/auth/refresh-token", () => {
    let refreshToken: string

    beforeEach(async () => {
      // Login to get a refresh token
      const loginResponse = await request(app.fetch)
        .post("/api/auth/login")
        .send({
          email: "testuser@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json")

      refreshToken = loginResponse.body.data.refreshToken
    })

    it("should refresh the access token with a valid refresh token", async () => {
      const response = await request(app.fetch)
        .post("/api/auth/refresh-token")
        .set("Authorization", `Bearer ${refreshToken}`)
        .set("Content-Type", "application/json")

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty("token")
    })

    it("should return 401 with an invalid refresh token", async () => {
      const response = await request(app.fetch)
        .post("/api/auth/refresh-token")
        .set("Authorization", "Bearer invalid-token")
        .set("Content-Type", "application/json")

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it("should return 400 if no token is provided", async () => {
      const response = await request(app.fetch)
        .post("/api/auth/refresh-token")
        .set("Content-Type", "application/json")

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })
})
