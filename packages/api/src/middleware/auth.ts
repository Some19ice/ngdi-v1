import { Next } from "hono"
import { verifyToken } from "../utils/jwt"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { UserRole } from "../types/auth.types"
import { Context } from "../types/hono.types"
import * as jose from "jose"
import { redisService } from "../services/redis.service"

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

    // Check cache first
    const cacheEntry = tokenCache.get(token)
    const now = Math.floor(Date.now() / 1000)

    // If we have a valid cache entry that hasn't expired
    if (cacheEntry && cacheEntry.expiry > now) {
      // Set user info in context from cache
      c.set("userId", cacheEntry.userId)
      c.set("userEmail", cacheEntry.email)
      c.set("userRole", cacheEntry.role)

      // Continue with request
      await next()
      return
    }

    // If not in cache or expired, perform full verification
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
    const userRole = c.get("userRole")

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
