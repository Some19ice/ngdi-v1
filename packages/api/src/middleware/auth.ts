import { Next } from "hono"
import { verifyToken } from "../utils/jwt"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { UserRole } from "@prisma/client"
import { Context } from "../types/hono.types"
import * as jose from "jose"
import { redisService } from "../services/redis.service"
import { HTTPException } from "hono/http-exception"
import { quickValidateToken } from "../utils/token-validation"

const AUTH_COOKIE_NAME = "auth_token"

// Cache validated tokens to reduce repeated verification
const tokenCache = new Map<
  string,
  {
    userId: string
    email: string
    role: UserRole
    expiry: number
    timestamp: number
  }
>()

// Clean the token cache periodically
setInterval(() => {
  const now = Date.now()

  // Remove entries older than 5 minutes
  tokenCache.forEach((value, key) => {
    if (now - value.timestamp > 5 * 60 * 1000) {
      tokenCache.delete(key)
    }
  })
}, 60 * 1000) // Run cleanup every minute

/**
 * Authenticate middleware - verifies JWT token from Authorization header or cookies
 * and attaches user information to context
 */
async function authenticate(c: Context, next: Next) {
  // First try to get token from Authorization header
  const authHeader = c.req.header("Authorization")
  let token: string | undefined

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]
  } else {
    // If not in header, try to get from cookies
    const cookieHeader = c.req.raw.headers.get("cookie")
    if (cookieHeader) {
      const cookies = cookieHeader.split(";")
      const authCookie = cookies.find((c) =>
        c.trim().startsWith(`${AUTH_COOKIE_NAME}=`)
      )
      if (authCookie) {
        token = authCookie.split("=")[1]
      }
    }
  }

  if (!token) {
    throw new AuthError(
      AuthErrorCode.INVALID_TOKEN,
      "No valid token provided",
      401
    )
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await redisService.isTokenBlacklisted(token)
    if (isBlacklisted) {
      throw new AuthError(
        AuthErrorCode.TOKEN_BLACKLISTED,
        "Token has been revoked",
        401
      )
    }

    // Perform quick validation first (faster)
    const quickResult = quickValidateToken(token)
    
    // If quick validation fails, don't bother with cryptographic verification
    if (!quickResult.isValid) {
      if (quickResult.error?.includes("expired")) {
        throw new AuthError(
          AuthErrorCode.TOKEN_EXPIRED, 
          "Token has expired", 
          401
        )
      } else {
        throw new AuthError(
          AuthErrorCode.INVALID_TOKEN,
          quickResult.error || "Invalid token format",
          401
        )
      }
    }

    // If quick validation passes, perform full cryptographic verification
    const decoded = await verifyToken(token)

    // Cache the result
    try {
      // Get expiry from token
      const decodedToken = jose.decodeJwt(token)
      const expiry = decodedToken.exp as number

      // Only cache if the token has an expiry
      if (expiry) {
        tokenCache.set(token, {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role as UserRole,
          expiry,
          timestamp: Date.now(),
        })
      }
    } catch (cacheError) {
      // If caching fails, just continue (non-critical)
      console.warn("Failed to cache token:", cacheError)
    }

    // Set user info in context
    c.set("userId", decoded.userId)
    c.set("userEmail", decoded.email)
    c.set("userRole", decoded.role)

    await next()
  } catch (error) {
    console.error("Authentication error:", error)

    if (error instanceof AuthError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        throw new AuthError(
          AuthErrorCode.TOKEN_EXPIRED,
          "Token has expired",
          401
        )
      } else if (error.name === "JsonWebTokenError") {
        throw new AuthError(
          AuthErrorCode.INVALID_TOKEN,
          "Invalid token format",
          401
        )
      }
    }

    throw new AuthError(AuthErrorCode.INVALID_TOKEN, "Invalid token", 401)
  }
}

/**
 * Authorize middleware - checks if user has required roles
 */
function authorize(roles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const userRoleString = c.get("userRole")

    // Validate userRole and convert to enum
    if (!userRoleString) {
      throw new AuthError(
        AuthErrorCode.FORBIDDEN,
        "No role assigned to user",
        403
      )
    }

    // Type assertion after validation
    const userRole = userRoleString as UserRole

    if (!roles.includes(userRole)) {
      throw new AuthError(
        AuthErrorCode.FORBIDDEN,
        "Insufficient permissions",
        403
      )
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
      throw new AuthError(
        AuthErrorCode.FORBIDDEN,
        "You can only access your own resources",
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

const userRoles = Object.values(UserRole)

function isValidUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && userRoles.includes(role as UserRole)
}

const requireRoles = (roles: UserRole[]) => async (c: Context, next: Next) => {
  const maybeRole = c.var.userRole

  if (!maybeRole || typeof maybeRole !== "string") {
    throw new HTTPException(401, { message: "Unauthorized - No role found" })
  }

  // Convert string to UserRole enum
  let userRole: UserRole
  try {
    userRole = UserRole[maybeRole as keyof typeof UserRole]
    if (!userRole) {
      throw new Error("Invalid role")
    }
  } catch {
    throw new HTTPException(403, { message: "Forbidden - Invalid role" })
  }

  if (!roles.includes(userRole)) {
    throw new HTTPException(403, {
      message: "Forbidden - Insufficient permissions",
    })
  }

  await next()
}
