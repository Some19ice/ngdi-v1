import { PrismaClient } from "@prisma/client"
import { config } from "../config"
import { SignJWT } from "jose"
import { UserRole } from "../types/auth.types"
import { prisma } from "../db/prisma"
import {
  TestApp,
  TestMethod,
  TestUser,
  TestEnvironment,
  TestRequestOptions,
  TestMetadata,
} from "../types/test.types"
import { Context } from "hono"
import { hashPassword } from "../utils/password"
import jwt from "jsonwebtoken"
import { createMockContext } from "./utils/test.utils"
import "@jest/globals"

// Re-export prisma for tests
export { prisma }

// Create a test Prisma client
export const prismaClient = new PrismaClient()

// Convert string to Uint8Array for jose
const textEncoder = new TextEncoder()
const jwtSecret = textEncoder.encode(config.jwt.secret)

// Clean up database before tests
export async function clearDatabase(): Promise<void> {
  // Delete all records in reverse order of dependencies
  await prisma.metadata.deleteMany({})
  await prisma.verificationToken.deleteMany({})
  await prisma.user.deleteMany({})
}

// Create a test user
export async function createTestUser(
  role: UserRole = UserRole.USER
): Promise<TestUser> {
  const user = await prisma.user.create({
    data: {
      email: role === UserRole.ADMIN ? "admin@example.com" : "test@example.com",
      password: await hashPassword("password123"),
      name: "Test User",
      role: role,
      emailVerified: new Date(),
    },
  })

  return {
    id: user.id,
    email: user.email,
    password: user.password,
    role: role,
    name: user.name || undefined,
    emailVerified: user.emailVerified || undefined,
    image: user.image || undefined,
    organization: user.organization || undefined,
    department: user.department || undefined,
    phone: user.phone || undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

// Create a test admin user
export async function createTestAdmin(): Promise<TestUser> {
  return createTestUser(UserRole.ADMIN)
}

// Generate a test JWT token
export async function generateTestToken(user: TestUser): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(jwtSecret)

  return token
}

// Create a test verification token
export async function createTestVerificationToken(
  email: string,
  token: string = "valid_token"
): Promise<void> {
  await prisma.verificationToken.create({
    data: {
      token,
      identifier: email,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  })
}

// Create test metadata
export async function createTestMetadata(
  userId: string
): Promise<TestMetadata> {
  const metadata = await prismaClient.metadata.create({
    data: {
      userId,
      title: "Test Metadata",
      author: "Test Author",
      organization: "Test Organization",
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
      abstract: "Test abstract",
      purpose: "Test purpose",
      thumbnailUrl: "https://example.com/thumbnail.jpg",
      imageName: "thumbnail.jpg",
      frameworkType: "Test Framework",
      categories: ["Test Category"],
      coordinateSystem: "WGS84",
      projection: "UTM",
      scale: 1000,
      accuracyLevel: "High",
      email: "test@example.com",
      fileFormat: "GeoJSON",
      distributionFormat: "Digital",
      accessMethod: "Download",
      licenseType: "CC BY 4.0",
      usageTerms: "Attribution required",
      attributionRequirements: "Cite source",
      contactPerson: "Test Contact",
    },
  })
  return metadata as TestMetadata
}

// Global setup
export async function setupTestEnvironment(): Promise<TestEnvironment> {
  // Clear database
  await clearDatabase()

  // Create test users
  const user = await createTestUser()
  const admin = await createTestAdmin()

  // Create test metadata
  await createTestMetadata(user.id)

  return {
    user,
    admin,
    userToken: await generateTestToken(user),
    adminToken: await generateTestToken(admin),
  }
}

// Global teardown
export async function teardownTestEnvironment(): Promise<void> {
  await clearDatabase()
  await prismaClient.$disconnect()
}

// Helper to create a test request
export async function createTestRequest(
  options: TestRequestOptions
): Promise<Context> {
  const { method, path, body, headers = {} } = options
  const req = new Request(`http://localhost${path}`, {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  })
  const ctx = createMockContext(req)
  if (body) {
    ctx.req.json = () => Promise.resolve(body as any)
  }
  return ctx
}

// Set environment variables for testing
if (typeof process.env.NODE_ENV !== "undefined") {
  process.env.NODE_ENV = "test"
}
process.env.JWT_SECRET = "test-jwt-secret"
process.env.REFRESH_TOKEN_SECRET = "test-refresh-token-secret"

// Global setup before all tests
beforeAll(async () => {
  await prisma.$connect()
})

// Global teardown after all tests
afterAll(async () => {
  await prisma.$disconnect()
}, 30000)

// Global setup before each test
beforeEach(async () => {
  await clearDatabase()
}, 30000)

// Global teardown after each test
afterEach(async () => {
  await prisma.$disconnect()
})

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error
console.error = (...args: unknown[]): void => {
  // Filter out expected errors during tests
  if (
    typeof args[0] === "string" &&
    (args[0].includes("test error") ||
      args[0] === "Error:" ||
      args[0] === "Login error:" ||
      args[0] === "Registration error:" ||
      args[0] === "Token refresh error:" ||
      args[0] === "Password reset error:" ||
      args[0] === "Email verification error:")
  ) {
    return
  }
  originalConsoleError(...args)
}
