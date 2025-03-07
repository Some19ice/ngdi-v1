import { describe, it, expect, beforeAll, afterAll } from "@jest/globals"
import request from "supertest"
import { serve } from "@hono/node-server"
import app from "../../src/index"
import { prisma } from "../../src/db/prisma"

describe("Authentication E2E Tests", () => {
  let server: any
  let testUserEmail: string
  let accessToken: string
  let refreshToken: string

  beforeAll(async () => {
    // Start the server
    const port = 3002 // Use a different port than the main server
    server = serve({
      fetch: app.fetch,
      port,
    })

    // Generate a unique email for the test user
    testUserEmail = `test-${Date.now()}@example.com`
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: testUserEmail },
    })
    await prisma.$disconnect()

    // Close the server
    server.close()
  })

  it("should register a new user", async () => {
    const response = await request(app.fetch)
      .post("/api/auth/register")
      .send({
        name: "E2E Test User",
        email: testUserEmail,
        password: "password123",
        organization: "Test Org",
      })
      .set("Content-Type", "application/json")

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.user.email).toBe(testUserEmail)
  })

  it("should verify email", async () => {
    // Get the verification token from the database
    const verificationRecord = await prisma.verificationToken.findFirst({
      where: { identifier: testUserEmail },
    })

    expect(verificationRecord).not.toBeNull()

    // Verify the email
    const response = await request(app.fetch).get(
      `/api/auth/verify-email?token=${verificationRecord?.token}`
    )

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    // Check that the user's email is now verified
    const user = await prisma.user.findUnique({
      where: { email: testUserEmail },
    })

    expect(user?.emailVerified).not.toBeNull()
  })

  it("should login with verified credentials", async () => {
    const response = await request(app.fetch)
      .post("/api/auth/login")
      .send({
        email: testUserEmail,
        password: "password123",
      })
      .set("Content-Type", "application/json")

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty("token")
    expect(response.body.data).toHaveProperty("refreshToken")
    expect(response.body.data.user.email).toBe(testUserEmail)

    // Save tokens for subsequent tests
    accessToken = response.body.data.token
    refreshToken = response.body.data.refreshToken
  })

  it("should refresh the access token", async () => {
    const response = await request(app.fetch)
      .post("/api/auth/refresh-token")
      .set("Authorization", `Bearer ${refreshToken}`)
      .set("Content-Type", "application/json")

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty("token")

    // Update the access token
    accessToken = response.body.data.token
  })

  it("should request a password reset", async () => {
    const response = await request(app.fetch)
      .post("/api/auth/request-password-reset")
      .send({
        email: testUserEmail,
      })
      .set("Content-Type", "application/json")

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    // Verify that a reset token was created
    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: testUserEmail,
        // Exclude the email verification token
        token: {
          not: {
            equals: await prisma.verificationToken
              .findFirst({
                where: { identifier: testUserEmail },
                select: { token: true },
              })
              .then((record) => record?.token || ""),
          },
        },
      },
    })

    expect(resetToken).not.toBeNull()
  })

  it("should reset the password", async () => {
    // Get the reset token from the database
    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: testUserEmail,
        // Get the most recent token
        expires: {
          gt: new Date(),
        },
      },
      orderBy: {
        expires: "desc",
      },
    })

    expect(resetToken).not.toBeNull()

    // Reset the password
    const response = await request(app.fetch)
      .post("/api/auth/reset-password")
      .send({
        token: resetToken?.token,
        password: "newpassword123",
      })
      .set("Content-Type", "application/json")

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })

  it("should login with the new password", async () => {
    const response = await request(app.fetch)
      .post("/api/auth/login")
      .send({
        email: testUserEmail,
        password: "newpassword123",
      })
      .set("Content-Type", "application/json")

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.user.email).toBe(testUserEmail)
  })

  it("should logout", async () => {
    const response = await request(app.fetch)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Content-Type", "application/json")

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
