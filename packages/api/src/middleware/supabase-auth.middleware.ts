import { Next } from "hono"
import { Context } from "../types/hono.types"
import { UserRole } from "../types/auth.types"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { supabaseAuthService } from "../services/supabase-auth.service"
// import {
//   securityLogService,
//   SecurityEventType,
// } from "../services/security-log.service" // Removed unused imports
import { logger } from "../lib/logger"
import { settingsService } from "../services/settings.service"

/**
 * Simplified Authentication middleware that validates Supabase Auth tokens
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    // Get token from request (header or cookie)
    const authHeader = c.req.header("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "No authentication token provided",
        401
      )
    }

    const token = authHeader.replace("Bearer ", "")
    // Validate the token with Supabase (using simplified signature)
    const validationResult = await supabaseAuthService.validateToken(token)

    if (!validationResult.isValid) {
      // Token validation failed
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        validationResult.error || "Invalid token",
        401
      )
    }

    // Check if user exists and is active
    const userIsValid = await supabaseAuthService.validateUser(
      validationResult.userId!
    )
    if (!userIsValid) {
      throw new AuthError(
        AuthErrorCode.USER_NOT_FOUND,
        "User not found or account is locked",
        401
      )
    }

    // Get the complete user data
    const userData = await supabaseAuthService.getUserData(
      validationResult.userId!
    )

    if (!userData) {
      throw new AuthError(AuthErrorCode.USER_NOT_FOUND, "User not found", 401)
    }

    // Set user info in context
    c.set("userId", userData.id)
    c.set("userEmail", userData.email)
    c.set("userRole", userData.role)
    c.set("user", userData)

    // Add email verification status to context
    c.set("emailVerified", !!userData.emailVerified)

    // Removed custom security logging

    await next()
  } catch (error) {
    // Handle authentication errors
    if (error instanceof AuthError) {
      throw error
    }

    // Handle other errors
    logger.error("Authentication middleware error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw new AuthError(
      AuthErrorCode.SERVER_ERROR,
      "Authentication failed",
      500
    )
  }
}

/**
 * Middleware to require admin role
 */
export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get("user")

  if (!user) {
    throw new AuthError(
      AuthErrorCode.UNAUTHORIZED,
      "User not found in context",
      401
    )
  }

  // Check if user has ADMIN role
  if (user.role !== UserRole.ADMIN) {
    throw new AuthError(AuthErrorCode.FORBIDDEN, "Admin access required", 403)
  }

  await next()
}

/**
 * Middleware to require a specific role
 */
export function requireRole(role: UserRole | string) {
  return async (c: Context, next: Next) => {
    const user = c.get("user")

    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      )
    }

    // Check role
    if (user.role === role) {
      await next()
      return
    }

    // Admin users have access to everything
    if (user.role === UserRole.ADMIN) {
      await next()
      return
    }

    throw new AuthError(
      AuthErrorCode.FORBIDDEN,
      "Insufficient permissions",
      403
    )
  }
}

/**
 * Middleware to require any of the specified roles
 */
export function requireAnyRole(roles: (UserRole | string)[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user")

    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      )
    }

    // Admin users have access to everything
    if (user.role === UserRole.ADMIN) {
      await next()
      return
    }

    // Check role
    if (roles.includes(user.role as UserRole)) {
      await next()
      return
    }

    throw new AuthError(
      AuthErrorCode.FORBIDDEN,
      "Insufficient permissions",
      403
    )
  }
}

/**
 * Middleware to enforce email verification
 *
 * This middleware checks if a user's email is verified and blocks access
 * to protected routes if verification is required but not completed.
 */
export async function requireEmailVerification(c: Context, next: Next) {
  try {
    // Get user from context (set by auth middleware)
    const user = c.get("user")

    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      )
    }

    // Check if email verification is required in system settings
    const isVerificationRequired =
      await settingsService.isEmailVerificationRequired()

    // If email verification is not required, proceed
    if (!isVerificationRequired) {
      await next()
      return
    }

    // Check if user's email is verified
    if (!user.emailVerified) {
      logger.info(`Access blocked - email not verified: ${user.email}`, {
        userId: user.id,
        email: user.email,
      })

      throw new AuthError(
        AuthErrorCode.EMAIL_NOT_VERIFIED,
        "Email verification required. Please verify your email before proceeding.",
        403,
        {
          requiresVerification: true,
          email: user.email,
        }
      )
    }

    // Email is verified, proceed
    await next()
  } catch (error) {
    // Pass AuthError instances up the chain
    if (error instanceof AuthError) {
      throw error
    }

    // Handle other errors
    logger.error("Email verification middleware error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    throw new AuthError(
      AuthErrorCode.SERVER_ERROR,
      "Email verification check failed",
      500
    )
  }
}

/**
 * Helper function to extract token from request
 * @param c Hono context
 * @returns JWT token
 */
export function getTokenFromRequest(c: Context): string {
  // Try to get token from Authorization header
  const authHeader = c.req.header("Authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "")
  }

  // Try to get token from cookie
  const token = c.req.cookie("sb-access-token")
  if (token) {
    return token
  }

  throw new AuthError(
    AuthErrorCode.INVALID_TOKEN,
    "No authentication token provided",
    401
  )
}
