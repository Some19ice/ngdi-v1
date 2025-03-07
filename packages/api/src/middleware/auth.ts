import { Next } from "hono"
import { verifyToken } from "../utils/jwt"
import { ApiError } from "./error-handler"
import { UserRole } from "../types/auth.types"
import { Context } from "../types/hono.types"

/**
 * Authenticate middleware - verifies JWT token and attaches user to context
 */
async function authenticate(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError("Unauthorized - No token provided", 401)
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = await verifyToken(token)

    // Set user info in context
    c.set("userId", decoded.userId)
    c.set("userEmail", decoded.email)
    c.set("userRole", decoded.role)

    await next()
  } catch (error) {
    throw new ApiError("Unauthorized - Invalid token", 401)
  }
}

/**
 * Authorize middleware - checks if user has required roles
 */
function authorize(roles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const userRole = c.get("userRole")

    if (!roles.includes(userRole)) {
      throw new ApiError("Forbidden - Insufficient permissions", 403)
    }

    await next()
  }
}

/**
 * Authorize owner or admin middleware - checks if user is accessing their own resource or has admin privileges
 */
function authorizeOwnerOrAdmin(resourceUserId: string) {
  return async (c: Context, next: Next) => {
    const userId = c.get("userId")
    const userRole = c.get("userRole")

    if (userId !== resourceUserId && userRole !== UserRole.ADMIN) {
      throw new ApiError(
        "Forbidden - You can only access your own resources",
        403
      )
    }

    await next()
  }
}

/**
 * Auth middleware function - can be used directly with Hono
 */
export function authMiddleware(c: Context, next: Next) {
  return authenticate(c, next)
}

/**
 * Combined auth middleware helpers
 */
export const auth = {
  authenticate,
  requireRoles: (roles: UserRole[]) => [authenticate, authorize(roles)],
  requireAdmin: [authenticate, authorize([UserRole.ADMIN])],
  requireNodeOfficer: [authenticate, authorize([UserRole.NODE_OFFICER])],
  requireAdminOrNodeOfficer: [
    authenticate,
    authorize([UserRole.ADMIN, UserRole.NODE_OFFICER]),
  ],
  requireOwnerOrAdmin: (resourceUserId: string) => [
    authenticate,
    authorizeOwnerOrAdmin(resourceUserId),
  ],
}
