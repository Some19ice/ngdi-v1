import { describe, expect, it, jest } from "@jest/globals"
import { Context, Next } from "hono"
import { UserRole } from "../../../types/auth.types"
import { tokenValidationService } from "../../../services/token-validation.service"
import { createMockRequest } from "../../utils/test.utils"
import {
  authMiddleware,
  requireRole,
} from "../../../middleware/auth.middleware"

// Mock token validation service
jest.mock("../../../services/token-validation.service", () => ({
  tokenValidationService: {
    getTokenFromRequest: jest.fn(),
    validateAccessToken: jest.fn(),
    validateUser: jest.fn(),
  },
}))

describe("Auth Middleware", () => {
  describe("authMiddleware", () => {
    let ctx: Context
    let next: Next
    let mockJson: jest.Mock
    let mockSet: jest.Mock
    let mockHeader: jest.Mock

    beforeEach(() => {
      mockJson = jest.fn().mockReturnThis()
      mockSet = jest.fn()
      mockHeader = jest.fn()

      ctx = {
        req: {
          header: mockHeader,
        },
        set: mockSet,
        json: mockJson,
      } as unknown as Context

      next = jest.fn().mockImplementation(() => Promise.resolve()) as Next
    })

    it("should pass with valid token", async () => {
      const mockToken = "valid.token.here"
      const mockValidationResult = {
        isValid: true,
        userId: "1",
        email: "user@example.com",
        role: UserRole.USER,
      }

      // Mock getting token from request
      tokenValidationService.getTokenFromRequest.mockReturnValue(mockToken)

      // Mock token validation
      tokenValidationService.validateAccessToken.mockResolvedValue(
        mockValidationResult
      )

      // Mock user validation
      tokenValidationService.validateUser.mockResolvedValue(true)

      await authMiddleware(ctx, next)

      expect(mockSet).toHaveBeenCalledWith(
        "userId",
        mockValidationResult.userId
      )
      expect(mockSet).toHaveBeenCalledWith(
        "userEmail",
        mockValidationResult.email
      )
      expect(mockSet).toHaveBeenCalledWith(
        "userRole",
        mockValidationResult.role
      )
      expect(mockSet).toHaveBeenCalledWith("user", {
        id: mockValidationResult.userId,
        email: mockValidationResult.email,
        role: mockValidationResult.role,
      })
      expect(next).toHaveBeenCalled()
    })

    it("should return 401 without token", async () => {
      // Mock token extraction to throw an error
      tokenValidationService.getTokenFromRequest.mockImplementation(() => {
        throw new Error("No authentication token provided")
      })

      await authMiddleware(ctx, next)

      // The middleware should throw an AuthError which will be caught by the error handler
      expect(next).not.toHaveBeenCalled()
    })

    it("should return 401 with invalid token", async () => {
      const mockToken = "invalid.token"

      // Mock getting token from request
      tokenValidationService.getTokenFromRequest.mockReturnValue(mockToken)

      // Mock token validation to return invalid result
      tokenValidationService.validateAccessToken.mockResolvedValue({
        isValid: false,
        error: "Invalid token",
      })

      await authMiddleware(ctx, next)

      // The middleware should throw an AuthError which will be caught by the error handler
      expect(next).not.toHaveBeenCalled()
    })

    it("should return 401 when user is not valid", async () => {
      const mockToken = "valid.token.here"
      const mockValidationResult = {
        isValid: true,
        userId: "1",
        email: "user@example.com",
        role: UserRole.USER,
      }

      // Mock getting token from request
      tokenValidationService.getTokenFromRequest.mockReturnValue(mockToken)

      // Mock token validation
      tokenValidationService.validateAccessToken.mockResolvedValue(
        mockValidationResult
      )

      // Mock user validation to return false
      tokenValidationService.validateUser.mockResolvedValue(false)

      await authMiddleware(ctx, next)

      // The middleware should throw an AuthError which will be caught by the error handler
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe("requireRole", () => {
    let ctx: Context
    let next: Next
    let mockJson: jest.Mock
    let mockGet: jest.Mock

    beforeEach(() => {
      mockJson = jest.fn().mockReturnThis()
      mockGet = jest.fn()

      ctx = {
        get: mockGet,
        json: mockJson,
      } as unknown as Context

      next = jest.fn().mockImplementation(() => Promise.resolve()) as Next
    })

    it("should pass with sufficient role", async () => {
      const mockUser = { id: "1", role: UserRole.ADMIN }
      mockGet.mockReturnValue(mockUser)

      await requireRole(UserRole.ADMIN)(ctx, next)

      expect(next).toHaveBeenCalled()
    })

    it("should return 401 when user not found in context", async () => {
      mockGet.mockReturnValue(undefined)

      await requireRole(UserRole.ADMIN)(ctx, next)

      expect(mockJson).toHaveBeenCalledWith(
        { error: "Unauthorized - User not found in context" },
        401
      )
      expect(next).not.toHaveBeenCalled()
    })

    it("should return 403 with insufficient role", async () => {
      const mockUser = { id: "1", role: UserRole.USER }
      mockGet.mockReturnValue(mockUser)

      await requireRole(UserRole.ADMIN)(ctx, next)

      expect(mockJson).toHaveBeenCalledWith(
        { error: "Forbidden - Insufficient permissions" },
        403
      )
      expect(next).not.toHaveBeenCalled()
    })
  })
})
