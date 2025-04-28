import { Next } from "hono"
import { Context } from "../types/hono.types"
import { UserRole } from "@prisma/client"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { tokenValidationService } from "../services/token-validation.service"
import {
  securityLogService,
  SecurityEventType,
} from "../services/security-log.service"
import { prisma } from "../lib/prisma"
import { logger } from "../lib/logger"
import { config } from "../config"
import { settingsService } from "../services/settings.service"

/**
 * Interface for JWT payload
 */
interface JWTPayload {
  userId: string
  email: string
  role: UserRole | string
  [key: string]: any // Allow for additional fields
}

/**
 * Real authentication middleware that validates JWT tokens
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    // Get client information for logging
    const clientInfo = {
      ipAddress:
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        c.req.header("cf-connecting-ip") ||
        "unknown",
      userAgent: c.req.header("user-agent") || "unknown",
      deviceId: c.req.header("x-device-id") || "unknown",
    }

    // Get token from request (header or cookie)
    let token: string
    try {
      token = tokenValidationService.getTokenFromRequest(c)
    } catch (error) {
      // If no token is found, throw an authentication error
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "No authentication token provided",
        401
      )
    }

    // Validate the token with enhanced security
    const validationResult = await tokenValidationService.validateAccessToken(
      token,
      {
        checkRevocation: true,
        logFailures: true,
        clientInfo,
        audience: config.jwt.audience,
        issuer: config.jwt.issuer,
      }
    )

    if (!validationResult.isValid) {
      // Token validation failed
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        validationResult.error || "Invalid token",
        401
      )
    }

    // Check if user exists and is active
    const userIsValid = await tokenValidationService.validateUser(
      validationResult.userId!
    )
    if (!userIsValid) {
      throw new AuthError(
        AuthErrorCode.USER_NOT_FOUND,
        "User not found or account is locked",
        401
      )
    }

    // Get the complete user data from the database
    const user = await prisma.user.findUnique({
      where: { id: validationResult.userId! },
    })

    if (!user) {
      throw new AuthError(AuthErrorCode.USER_NOT_FOUND, "User not found", 401)
    }

    // Set user info in context
    c.set("userId", user.id)
    c.set("userEmail", user.email)
    c.set("userRole", user.role)
    c.set("user", user)

    // Add email verification status to context
    c.set("emailVerified", !!user.emailVerified)

    // Log successful token validation (optional, can be disabled for high-traffic APIs)
    // await securityLogService.logEvent({
    //   userId: validationResult.userId,
    //   email: validationResult.email,
    //   eventType: SecurityEventType.TOKEN_VALIDATION_SUCCESS,
    //   ipAddress: clientInfo.ipAddress,
    //   userAgent: clientInfo.userAgent,
    //   deviceId: clientInfo.deviceId
    // })

    await next()
  } catch (error) {
    // Handle authentication errors
    if (error instanceof AuthError) {
      throw error
    }

    // Handle other errors
    console.error("Authentication middleware error:", error)
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


