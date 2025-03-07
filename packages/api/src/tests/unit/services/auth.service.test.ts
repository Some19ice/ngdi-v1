import { describe, expect, it, jest } from "@jest/globals"
import { AuthService } from "../../../services/auth.service"
import { PrismaClient } from "@prisma/client"
import { UserRole } from "../../../types/auth.types"
import {
  comparePassword,
  generateToken,
  hashPassword,
} from "../../../utils/auth.utils"
import { mockDate, restoreDate } from "../../utils/test.utils"

// Mock dependencies
jest.mock("@prisma/client")
jest.mock("../../../utils/auth.utils")
jest.mock("../../../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    verificationToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

// Import the mocked prisma
import { prisma } from "../../../lib/prisma"

describe("AuthService", () => {
  const mockUser = {
    id: "1",
    email: "test@example.com",
    password: "hashedPassword",
    name: "Test User",
    role: UserRole.USER,
    emailVerified: new Date(),
    image: null,
    organization: null,
    department: null,
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const registrationData = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  }

  const loginData = {
    email: "test@example.com",
    password: "password123",
  }

  beforeEach(() => {
    // Clear all mocks
    jest
      .clearAllMocks()
      (
        // Mock utility functions
        hashPassword as jest.Mock
      )
      .mockImplementation(() => Promise.resolve("hashedPassword"))
    ;(comparePassword as jest.Mock).mockImplementation(() =>
      Promise.resolve(true)
    )
    ;(generateToken as jest.Mock).mockImplementation(() =>
      Promise.resolve("mockToken")
    )
  })

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser)

      const result = await AuthService.login(loginData)

      expect(result).toEqual({
        success: true,
        token: "mockToken",
      })
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      })
      expect(comparePassword).toHaveBeenCalledWith(
        "password123",
        "hashedPassword"
      )
    })

    it("should fail with invalid email", async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null)

      const result = await AuthService.login({
        email: "wrong@email.com",
        password: "password123",
      })

      expect(result).toEqual({
        success: false,
        error: "Invalid credentials",
      })
    })

    it("should fail with invalid password", async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser)
      ;(comparePassword as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      )

      const result = await AuthService.login({
        email: "test@example.com",
        password: "wrongpassword",
      })

      expect(result).toEqual({
        success: false,
        error: "Invalid credentials",
      })
    })
  })

  describe("register", () => {
    it("should register successfully with valid data", async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValueOnce({
        ...registrationData,
        id: "1",
        role: "USER",
        emailVerified: null,
        image: null,
        organization: null,
        department: null,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await AuthService.register(registrationData)

      expect(result).toEqual({
        success: true,
        token: "mockToken",
      })
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...registrationData,
          password: "hashedPassword",
          role: "USER",
        },
      })
    })

    it("should fail if email already exists", async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser)

      const result = await AuthService.register(registrationData)

      expect(result).toEqual({
        success: false,
        error: "Email already exists",
      })
      expect(prisma.user.create).not.toHaveBeenCalled()
    })
  })

  describe("verifyEmail", () => {
    let authService: AuthService

    beforeEach(() => {
      authService = new AuthService()
    })

    it("should verify email successfully", async () => {
      const mockUser = {
        id: "1",
        email: registrationData.email,
        emailVerified: null,
        name: null,
        image: null,
        password: "hashedPassword",
        role: UserRole.USER,
        organization: null,
        department: null,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser)
      ;(prisma.user.update as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        emailVerified: new Date(),
      })

      const result = await authService.verifyEmail("valid-token")

      expect(result).toEqual({
        success: true,
      })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { emailVerified: expect.any(Date) },
      })
    })

    it("should fail with invalid token", async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null)

      const result = await authService.verifyEmail("invalid-token")

      expect(result).toEqual({
        success: false,
        error: "Invalid verification token",
      })
      expect(prisma.user.update).not.toHaveBeenCalled()
    })
  })
})
