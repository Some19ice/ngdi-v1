import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { prisma } from "../lib/prisma"
import { ApiError, ErrorCode } from "../middleware/error-handler"
import * as crypto from "crypto"
import {
  generateToken,
  generateRefreshToken,
  generateJwtId,
  revokeToken,
  storeTokenFamily,
  revokeAllUserTokens,
} from "../utils/jwt"
import { tokenValidationService } from "../services/token-validation.service"
import { z } from "zod"
import { UserRole } from "../types/auth.types"
import { emailService } from "../services/email.service"
import { AuthService } from "../services/auth.service"
import { HTTPException } from "hono/http-exception"
import { authMiddleware } from "../middleware/auth.middleware"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { setCookieWithOptions, clearCookie } from "../utils/cookie.utils"
import { rateLimit } from "../middleware/rate-limit.middleware"
import { redisService } from "../services/redis.service"
import csrf from "../middleware/csrf"
import {
  securityLogService,
  SecurityEventType,
} from "../services/security-log.service"
import { errorHandler } from "../services/error-handling.service"
import { logger } from "../lib/logger"

import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  resendVerificationSchema,
  passwordSchema,
  changePasswordSchema,
} from "../types/auth.types"
import { passwordPolicyService } from "../services/password-policy.service"

import * as jose from "jose"
import { Variables, Context } from "../types/hono.types"
import { ErrorHandler } from "hono"
import { config } from "../config"
import { rateLimitConfig } from "../config/rate-limit.config"

// Token types for JWT
enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  VERIFICATION = "verification",
  RESET = "reset",
}

// Create CSRF protection middleware
const csrfProtection = csrf()

// Create auth router
const auth = new Hono<{ Variables: Variables }>()

// Create an error handler that conforms to Hono's expected type
const honoErrorHandler: ErrorHandler<{ Variables: Variables }> = (err, c) => {
  return errorHandler(err, c)
}

// Helper function to handle auth errors
function handleAuthError(c: Context, error: any) {
  logger.error("Auth error:", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  })

  if (error instanceof AuthError) {
    return c.json(
      {
        success: false,
        code: error.code,
        message: error.message,
        details: error.details,
      },
      error.status
    )
  }

  if (error instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: error.message,
      },
      error.status
    )
  }

  return c.json(
    {
      success: false,
      message: "An unexpected error occurred",
    },
    500
  )
}

// Apply error handler
auth.onError(honoErrorHandler)

// Apply rate limiting to auth routes
// Apply rate limiting to auth routes with enhanced security using standardized config
auth.use("/login", rateLimit(rateLimitConfig.auth.login))

auth.use("/register", rateLimit(rateLimitConfig.auth.register))

auth.use("/forgot-password", rateLimit(rateLimitConfig.auth.forgotPassword))

auth.use("/reset-password", rateLimit(rateLimitConfig.auth.resetPassword))

auth.use("/refresh-token", rateLimit(rateLimitConfig.auth.refreshToken))

auth.use("/verify-email", rateLimit(rateLimitConfig.auth.verifyEmail))

auth.use(
  "/resend-verification",
  rateLimit(rateLimitConfig.auth.resendVerification)
)

// Apply a general rate limit to all auth endpoints
auth.use("*", rateLimit(rateLimitConfig.auth.global))

// Login route with real authentication
auth.post(
  "/login",
  csrfProtection,
  zValidator("json", loginSchema),
  async (c) => {
    try {
      const data = await c.req.json()
      logger.info(`Login attempt for email: ${data.email}`)

      // Add client information for security tracking
      data.ipAddress =
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        c.req.header("cf-connecting-ip") ||
        "unknown"
      data.userAgent = c.req.header("user-agent") || "unknown"
      data.deviceId = c.req.header("x-device-id") || "unknown"

      logger.info(`Login attempt details`, {
        email: data.email,
        ipAddress: data.ipAddress,
        deviceId: data.deviceId,
      })

      const result = await AuthService.login(data)

      // Set auth cookies with improved settings
      // Set the primary auth_token cookie
      setCookieWithOptions(c, "auth_token", result.accessToken, {
        sameSite: "lax",
        secure: false, // Set to false for local development
        httpOnly: true,
        path: "/",
      })

      // Set additional cookies for compatibility
      setCookieWithOptions(c, "accessToken", result.accessToken, {
        sameSite: "lax",
        secure: false, // Set to false for local development
        httpOnly: true,
        path: "/",
      })

      setCookieWithOptions(c, "token", result.accessToken, {
        sameSite: "lax",
        secure: false, // Set to false for local development
        httpOnly: true,
        path: "/",
      })

      // Set refresh token
      setCookieWithOptions(c, "refresh_token", result.refreshToken, {
        sameSite: "lax",
        secure: false, // Set to false for local development
        httpOnly: true,
        path: "/",
      })

      // Set authenticated flag for client-side checks
      setCookieWithOptions(c, "authenticated", "true", {
        httpOnly: false,
        sameSite: "lax",
        secure: false, // Set to false for local development
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      })

      // Log cookie setting
      logger.info("Set auth cookies for user", { email: result.user.email })

      return c.json(result)
    } catch (error) {
      logger.error("Login error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })

      if (error instanceof AuthError) {
        throw error
      }

      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        "Authentication failed",
        401
      )
    }
  }
)

// Register route with real implementation
auth.post(
  "/register",
  csrfProtection,
  zValidator("json", registerSchema),
  async (c) => {
    try {
      const data = await c.req.json()
      logger.info(`Registration attempt for email: ${data.email}`)

      // Add client information for security tracking
      data.ipAddress =
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        c.req.header("cf-connecting-ip") ||
        "unknown"
      data.userAgent = c.req.header("user-agent") || "unknown"
      data.deviceId = c.req.header("x-device-id") || "unknown"

      logger.info(`Registration attempt details`, {
        email: data.email,
        ipAddress: data.ipAddress,
        deviceId: data.deviceId,
      })

      const result = await AuthService.register(data)

      // Set auth cookies with improved settings
      // Set the primary auth_token cookie
      setCookieWithOptions(c, "auth_token", result.accessToken, {
        sameSite: "lax",
        secure: false, // Set to false for local development
        httpOnly: true,
        path: "/",
      })

      // Set additional cookies for compatibility
      setCookieWithOptions(c, "accessToken", result.accessToken, {
        sameSite: "lax",
        secure: false, // Set to false for local development
        httpOnly: true,
        path: "/",
      })

      setCookieWithOptions(c, "token", result.accessToken, {
        sameSite: "lax",
        secure: false, // Set to false for local development
        httpOnly: true,
        path: "/",
      })

      // Set refresh token
      setCookieWithOptions(c, "refresh_token", result.refreshToken, {
        sameSite: "lax",
        secure: false, // Set to false for local development
        httpOnly: true,
        path: "/",
      })

      // Set authenticated flag for client-side checks
      setCookieWithOptions(c, "authenticated", "true", {
        httpOnly: false,
        sameSite: "lax",
        secure: false, // Set to false for local development
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      })

      // Log cookie setting
      logger.info("Set auth cookies for new user", { email: result.user.email })

      return c.json(result)
    } catch (error) {
      logger.error("Registration error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })

      if (error instanceof AuthError) {
        throw error
      }

      if (error instanceof HTTPException) {
        throw error
      }

      throw new AuthError(
        AuthErrorCode.REGISTRATION_FAILED,
        "Registration failed",
        400
      )
    }
  }
)

// Verify email route with real implementation
auth.get("/verify-email", zValidator("query", verifyEmailSchema), async (c) => {
  try {
    const { token } = c.req.valid("query")

    logger.info("Email verification attempt", {
      token: token.substring(0, 8) + "...",
    })

    await AuthService.verifyEmail(token)

    return c.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    logger.error("Email verification error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof AuthError) {
      throw error
    }

    throw new AuthError(
      AuthErrorCode.VERIFICATION_FAILED,
      "Email verification failed",
      400
    )
  }
})

// Refresh token route with real implementation
auth.post("/refresh-token", async (c) => {
  try {
    const data = await c.req.json()
    const { refreshToken } = data

    if (!refreshToken) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "Refresh token is required",
        400
      )
    }

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

    // Verify the refresh token with enhanced security checks
    const validationResult = await tokenValidationService.validateRefreshToken(
      refreshToken,
      {
        checkBlacklist: true,
        checkFamily: true,
        logFailures: true,
        clientInfo,
      }
    )

    if (!validationResult.isValid) {
      throw new AuthError(
        AuthErrorCode.INVALID_REFRESH_TOKEN,
        validationResult.error || "Invalid refresh token",
        401
      )
    }

    // Extract the payload from the validation result
    const jwtPayload = {
      userId: validationResult.userId!,
      email: validationResult.email!,
      role: validationResult.role!,
      family: validationResult.details?.family,
      jti: validationResult.details?.jti,
    }

    // Extract the token family or create a new one
    const tokenFamily = jwtPayload.family || generateJwtId()

    // Create a new token ID for the refresh token
    const newTokenId = generateJwtId()

    // Create token payload with enhanced security
    const tokenPayload = {
      userId: jwtPayload.userId,
      email: jwtPayload.email,
      role: jwtPayload.role,
      // Add device info if available
      deviceId: jwtPayload.deviceId || c.req.header("x-device-id"),
      ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
      userAgent: c.req.header("user-agent"),
    }

    // Generate new access token with enhanced security
    const accessToken = await generateToken(tokenPayload, "15m", {
      includeJti: true,
      type: TokenType.ACCESS,
      sessionId: jwtPayload.sessionId || crypto.randomUUID(),
      deviceId: clientInfo.deviceId,
      fingerprint: c.req.header("x-fingerprint"), // Optional browser fingerprint
      scope: ["api:access", "user:read"], // Basic scopes for regular access
    })

    // Generate new refresh token with the same family but new ID
    const newRefreshToken = await generateRefreshToken(
      tokenPayload,
      config.jwt.refreshExpiresIn,
      {
        includeJti: true,
        family: tokenFamily,
        sessionId: jwtPayload.sessionId || crypto.randomUUID(),
        previousTokenId: jwtPayload.jti, // Track the previous token for audit trail
        deviceId: clientInfo.deviceId,
        fingerprint: c.req.header("x-fingerprint"), // Optional browser fingerprint
      }
    )

    // Token family is now stored automatically in the generateRefreshToken function

    // Revoke the old refresh token with reason
    await revokeToken(
      refreshToken,
      "Token rotation during refresh",
      jwtPayload.userId
    )

    // Log the token rotation for security auditing
    await securityLogService.logEvent({
      userId: jwtPayload.userId,
      email: jwtPayload.email,
      eventType: SecurityEventType.TOKEN_REFRESHED,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      deviceId: clientInfo.deviceId,
      details: {
        oldTokenId: jwtPayload.jti,
        newTokenId: newTokenId,
        tokenFamily: tokenFamily,
      },
    })

    // Set new cookies with improved settings
    // Set the primary auth_token cookie
    setCookieWithOptions(c, "auth_token", accessToken, {
      sameSite: "lax",
      secure: false, // Set to false for local development
      httpOnly: true,
      path: "/",
    })

    // Set additional cookies for compatibility
    setCookieWithOptions(c, "accessToken", accessToken, {
      sameSite: "lax",
      secure: false, // Set to false for local development
      httpOnly: true,
      path: "/",
    })

    setCookieWithOptions(c, "token", accessToken, {
      sameSite: "lax",
      secure: false, // Set to false for local development
      httpOnly: true,
      path: "/",
    })

    // Set refresh token
    setCookieWithOptions(c, "refresh_token", newRefreshToken, {
      sameSite: "lax",
      secure: false, // Set to false for local development
      httpOnly: true,
      path: "/",
    })

    // Set authenticated flag for client-side checks
    setCookieWithOptions(c, "authenticated", "true", {
      httpOnly: false,
      sameSite: "lax",
      secure: false, // Set to false for local development
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })

    // Log cookie setting
    logger.info("Refreshed auth cookies", {
      userId: jwtPayload.userId,
      tokenFamily,
    })

    return c.json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    })
  } catch (error) {
    logger.error("Token refresh error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof AuthError) {
      throw error
    }

    throw new AuthError(
      AuthErrorCode.INVALID_TOKEN,
      "Failed to refresh token",
      401
    )
  }
})

// Request password reset with real implementation
auth.post(
  "/forgot-password",
  csrfProtection,
  zValidator("json", forgotPasswordSchema),
  async (c) => {
    try {
      const { email } = await c.req.json()
      logger.info(`Password reset requested`, { email })

      await AuthService.forgotPassword(email)

      return c.json({
        success: true,
        message: "Password reset email sent",
      })
    } catch (error) {
      logger.error("Forgot password error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })

      // Don't expose whether the email exists or not for security
      return c.json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      })
    }
  }
)

// Reset password with real implementation
auth.post(
  "/reset-password",
  csrfProtection,
  zValidator("json", resetPasswordSchema),
  async (c) => {
    try {
      const { token, password } = await c.req.json()

      logger.info("Password reset attempt", {
        token: token.substring(0, 8) + "...",
      })

      await AuthService.resetPassword(token, password)

      return c.json({
        success: true,
        message: "Password reset successfully",
      })
    } catch (error) {
      logger.error("Reset password error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })

      if (error instanceof AuthError) {
        throw error
      }

      throw new AuthError(
        AuthErrorCode.RESET_PASSWORD_FAILED,
        "Failed to reset password",
        400
      )
    }
  }
)

// Logout route with real implementation
auth.post("/logout", csrfProtection, async (c) => {
  try {
    // Get the token from cookies or Authorization header
    const authHeader = c.req.header("Authorization")
    let token: string | undefined

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    } else {
      // If not in header, try to get from cookies
      const cookieHeader = c.req.raw.headers.get("cookie")
      if (cookieHeader) {
        const cookies = cookieHeader.split(";")
        const authCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("auth_token=")
        )
        if (authCookie) {
          token = authCookie.split("=")[1]
        }
      }
    }

    // If we have a token, revoke it
    if (token) {
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

        // Verify the token to get the payload
        const validationResult =
          await tokenValidationService.validateAccessToken(token, {
            checkBlacklist: false,
            clientInfo,
          })

        if (!validationResult.isValid) {
          console.log(
            "Token validation failed during logout:",
            validationResult.error
          )
          // Continue with logout even if token is invalid
        }

        // Use validation result as payload
        const payload = {
          userId: validationResult.userId || "unknown",
          email: validationResult.email || "unknown",
        }

        // Revoke the access token
        await revokeToken(token)

        // Get refresh token from cookies
        const cookieHeader = c.req.raw.headers.get("cookie")
        if (cookieHeader) {
          const cookies = cookieHeader.split(";")
          const refreshCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("refresh_token=")
          )

          if (refreshCookie) {
            const refreshToken = refreshCookie.split("=")[1]
            // Revoke the refresh token
            await revokeToken(refreshToken)
          }
        }

        // Log the logout
        logger.info(`User logged out successfully`, { userId: payload.userId })

        // Log security event
        await securityLogService.logLogout(
          payload.userId,
          payload.email,
          c.req.header("x-forwarded-for") ||
            c.req.header("x-real-ip") ||
            "unknown",
          c.req.header("user-agent") || "unknown"
        )
      } catch (error) {
        logger.error("Error during token revocation", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })
      }
    }

    // Clear all possible auth cookies
    clearCookie(c, "auth_token")
    clearCookie(c, "accessToken")
    clearCookie(c, "token")
    clearCookie(c, "refresh_token")
    clearCookie(c, "authenticated")

    logger.info("Cleared all auth cookies")

    return c.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    logger.error("Logout error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Still clear all possible auth cookies even if there's an error
    clearCookie(c, "auth_token")
    clearCookie(c, "accessToken")
    clearCookie(c, "token")
    clearCookie(c, "refresh_token")
    clearCookie(c, "authenticated")

    logger.info("Cleared all auth cookies (error case)")

    return c.json({ success: true, message: "Logged out successfully" })
  }
})

// Get current user (me) endpoint
auth.use("/me", authMiddleware)
auth.get("/me", async (c) => {
  const userId = c.var.userId
  if (!userId) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }
  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        "User not found",
        404
      )
    }

    return c.json({
      success: true,
      data: user,
    })
  } catch (error) {
    logger.error("Get current user error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof AuthError) {
      throw error
    }

    throw new AuthError(
      AuthErrorCode.INVALID_CREDENTIALS,
      "Authentication failed",
      401
    )
  }
})

// Auth check endpoint - lightweight status check for client-side apps
auth.get("/check", async (c) => {
  try {
    // First try to get token from Authorization header
    const authHeader = c.req.header("Authorization")
    let token: string | undefined

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    } else {
      // If not in header, try to get from cookies
      const cookieHeader = c.req.raw.headers.get("cookie")
      logger.debug("Auth check - Cookie header", { cookieHeader })

      if (cookieHeader) {
        const cookies = cookieHeader.split(";")

        // Try multiple possible cookie names
        const possibleCookieNames = ["auth_token", "accessToken", "token"]

        for (const cookieName of possibleCookieNames) {
          const authCookie = cookies.find((cookie) =>
            cookie.trim().startsWith(`${cookieName}=`)
          )

          if (authCookie) {
            token = authCookie.split("=")[1]
            logger.debug(`Auth check - Found token in cookie`, { cookieName })
            break
          }
        }
      }
    }

    // Check if we have a token
    if (!token) {
      return c.json(
        {
          authenticated: false,
          message: "No authentication token found",
        },
        200
      ) // Return 200 even for unauthenticated to avoid CORS issues
    }

    // Check if token is blacklisted (only if Redis is available)
    if (redisService.isAvailable()) {
      const isBlacklisted = await redisService.isTokenBlacklisted(token)
      if (isBlacklisted) {
        return c.json(
          {
            authenticated: false,
            message: "Token has been invalidated",
          },
          200
        )
      }
    }

    // Verify the token using the unified token validation service
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

      // Validate the token
      const validationResult = await tokenValidationService.validateAccessToken(
        token,
        {
          checkBlacklist: true,
          clientInfo,
        }
      )

      if (!validationResult.isValid) {
        return c.json(
          {
            authenticated: false,
            message: validationResult.error || "Invalid token",
          },
          200
        )
      }

      // Return user info without sensitive data
      return c.json(
        {
          authenticated: true,
          user: {
            id: validationResult.userId,
            email: validationResult.email,
            role: validationResult.role,
          },
        },
        200
      )
    } catch (tokenError) {
      logger.warn("Token verification failed", {
        error:
          tokenError instanceof Error ? tokenError.message : String(tokenError),
      })

      // Return clear unauthenticated state
      return c.json(
        {
          authenticated: false,
          message: "Invalid or expired token",
        },
        200
      ) // Return 200 to avoid CORS issues
    }
  } catch (error) {
    logger.error("Auth check error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Return generic error but still 200 to avoid disrupting client
    return c.json(
      {
        authenticated: false,
        message: "Authentication check failed",
      },
      200
    )
  }
})

// CSRF token endpoint for secure form submission
auth.get("/csrf", async (c) => {
  try {
    // Generate a random CSRF token
    const csrfToken = crypto.randomUUID()

    // Set as a cookie with appropriate security settings
    setCookieWithOptions(c, "csrfToken", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
    })

    return c.json({ success: true, csrfToken })
  } catch (error) {
    logger.error("CSRF token generation error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    throw new AuthError(
      AuthErrorCode.INVALID_CREDENTIALS,
      "Could not generate security token",
      500
    )
  }
})

// Token validation endpoint
auth.post("/validate-token", csrfProtection, async (c) => {
  try {
    const { token } = await c.req.json()

    if (!token) {
      return c.json({
        isValid: false,
        message: "No token provided",
      })
    }

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

      // Validate the token using the unified token validation service
      const validationResult = await tokenValidationService.validateAccessToken(
        token,
        {
          checkBlacklist: true,
          logFailures: true,
          clientInfo,
        }
      )

      // Return validation result
      if (validationResult.isValid) {
        return c.json({
          isValid: true,
          userId: validationResult.userId,
          email: validationResult.email,
          role: validationResult.role,
          exp: validationResult.exp,
        })
      } else {
        return c.json({
          isValid: false,
          message: validationResult.error || "Invalid token",
        })
      }
    } catch (tokenError) {
      logger.warn("Token validation failed", {
        error:
          tokenError instanceof Error ? tokenError.message : String(tokenError),
      })

      return c.json({
        isValid: false,
        message: "Invalid or expired token",
      })
    }
  } catch (error) {
    logger.error("Token validation error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return c.json({
      isValid: false,
      message: "Token validation failed",
    })
  }
})

// CSRF token endpoint - provides a CSRF token for client-side forms
auth.get("/csrf-token", async (c) => {
  try {
    // Generate a new CSRF token with enhanced security
    const token = crypto.randomBytes(32).toString("hex")

    // Get client information for logging
    const clientInfo = {
      ip:
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        c.req.header("cf-connecting-ip") ||
        "unknown",
      userAgent: c.req.header("user-agent") || "unknown",
    }

    // Set the token as a cookie with enhanced security settings
    setCookieWithOptions(c, "csrf_token", token, {
      httpOnly: false, // Allow JavaScript access (required for the double-submit pattern)
      sameSite: "Strict", // Enhanced from Lax to Strict
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 hours (reduced from 24 hours for security)
    })

    logger.info("Generated new CSRF token", {
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
    })

    // Return the token to the client
    return c.json({
      success: true,
      csrfToken: token,
    })
  } catch (error) {
    logger.error("CSRF token generation error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    throw new AuthError(
      AuthErrorCode.SERVER_ERROR,
      "Failed to generate CSRF token",
      500
    )
  }
})

// CSRF token validation middleware is now imported from middleware/csrf.ts

// Resend verification email route
auth.post(
  "/resend-verification",
  csrfProtection,
  zValidator("json", resendVerificationSchema),
  async (c) => {
    try {
      const { email } = c.req.valid("json")

      // Get client info for security logging
      const clientInfo = {
        ipAddress:
          c.req.header("x-forwarded-for") ||
          c.req.header("x-real-ip") ||
          "unknown",
        userAgent: c.req.header("user-agent") || "unknown",
        deviceId: c.req.header("x-device-id"),
      }

      // Log the resend verification attempt
      logger.info(`Resend verification email requested for: ${email}`, {
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      })

      await AuthService.resendVerificationEmail(email)

      return c.json({
        success: true,
        message: "Verification email sent successfully",
      })
    } catch (error) {
      return handleAuthError(c, error)
    }
  }
)

// Change password route
auth.post(
  "/change-password",
  authMiddleware,
  csrfProtection,
  zValidator("json", changePasswordSchema),
  async (c) => {
    try {
      const { currentPassword, newPassword } = c.req.valid("json")
      const user = c.get("user")

      if (!user) {
        throw new AuthError(
          AuthErrorCode.UNAUTHORIZED,
          "Authentication required",
          401
        )
      }

      // Get client info for security logging
      const clientInfo = {
        ipAddress:
          c.req.header("x-forwarded-for") ||
          c.req.header("x-real-ip") ||
          "unknown",
        userAgent: c.req.header("user-agent") || "unknown",
        deviceId: c.req.header("x-device-id"),
      }

      logger.info(`Password change attempt for user: ${user.id}`, {
        userId: user.id,
        ipAddress: clientInfo.ipAddress,
      })

      // Verify current password
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      })

      if (!currentUser) {
        throw new AuthError(AuthErrorCode.USER_NOT_FOUND, "User not found", 404)
      }

      const isCurrentPasswordValid = await compare(
        currentPassword,
        currentUser.password
      )

      if (!isCurrentPasswordValid) {
        // Log security event for failed password change
        await securityLogService.logEvent({
          userId: user.id,
          email: user.email,
          eventType: SecurityEventType.PASSWORD_POLICY_VIOLATION,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
          details: {
            reason: "Current password invalid",
            timestamp: new Date().toISOString(),
          },
        })

        throw new AuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          "Current password is incorrect",
          400
        )
      }

      // Change password using password policy service
      await passwordPolicyService.changePassword(user.id, newPassword, {
        email: user.email,
        name: user.name,
      })

      // Revoke all refresh tokens for this user for security
      await revokeAllUserTokens(
        user.id,
        "Password changed",
        clientInfo.ipAddress
      )

      // Log successful password change
      await securityLogService.logEvent({
        userId: user.id,
        email: user.email,
        eventType: SecurityEventType.PASSWORD_CHANGED,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        details: {
          changedAt: new Date().toISOString(),
        },
      })

      return c.json({
        success: true,
        message: "Password changed successfully",
      })
    } catch (error) {
      return handleAuthError(c, error)
    }
  }
)

// Check password status route
auth.get("/password-status", authMiddleware, async (c) => {
  try {
    const user = c.get("user")

    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "Authentication required",
        401
      )
    }

    // Get password expiration status
    const expirationStatus =
      await passwordPolicyService.getPasswordExpirationStatus(user.id)

    return c.json({
      success: true,
      status: {
        ...expirationStatus,
        email: user.email,
      },
    })
  } catch (error) {
    return handleAuthError(c, error)
  }
})

export default auth
