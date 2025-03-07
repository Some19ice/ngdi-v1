import { describe, expect, it, jest } from "@jest/globals"
import { Context, Next } from "hono"
import { UserRole } from "../../../types/auth.types"
import { verifyToken, extractTokenFromHeader } from "../../../utils/auth.utils"
import { createMockRequest } from "../../utils/test.utils"
import {
  authMiddleware,
  requireRole,
} from "../../../middleware/auth.middleware"

// Mock auth utils
jest.mock("../../../utils/auth.utils", () => ({
  verifyToken: jest.fn(),
  extractTokenFromHeader: jest.fn(),
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
      const mockUser = { id: "1", role: UserRole.USER }

      mockHeader.mockReturnValue(`Bearer ${mockToken}`)
      ;(extractTokenFromHeader as jest.Mock).mockReturnValue(mockToken)
      ;(verifyToken as jest.Mock).mockImplementation(() =>
        Promise.resolve(mockUser)
      )

      await authMiddleware(ctx, next)

      expect(mockSet).toHaveBeenCalledWith("user", mockUser)
      expect(next).toHaveBeenCalled()
    })

    it("should return 401 without token", async () => {
      mockHeader.mockReturnValue(undefined)

      await authMiddleware(ctx, next)

      expect(mockJson).toHaveBeenCalledWith(
        { error: "Unauthorized - No token provided" },
        401
      )
      expect(next).not.toHaveBeenCalled()
    })

    it("should return 401 with invalid token", async () => {
      mockHeader.mockReturnValue("Bearer invalid.token")
      ;(extractTokenFromHeader as jest.Mock).mockReturnValue("invalid.token")
      ;(verifyToken as jest.Mock).mockImplementation(() =>
        Promise.reject(new Error("Invalid token"))
      )

      await authMiddleware(ctx, next)

      expect(mockJson).toHaveBeenCalledWith(
        { error: "Unauthorized - Invalid token" },
        401
      )
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
