import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { prisma } from "../lib/prisma"
import { errorHandler, ApiError, ErrorCode } from "../middleware/error-handler"
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
import { authMiddleware } from "../middleware/auth"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { setCookieWithOptions, clearCookie } from "../utils/cookie.utils"
import { rateLimit } from "../middleware/rate-limit.middleware"
import { redisService } from "../services/redis.service"
import {
  securityLogService,
  SecurityEventType,
} from "../services/security-log.service"
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from "../types/auth.types"
import * as jose from "jose"
import { Variables } from "../types/hono.types"
import { ErrorHandler } from "hono"

// Create auth router
const auth = new Hono<{ Variables: Variables }>()

// Create an error handler that conforms to Hono's expected type
const honoErrorHandler: ErrorHandler<{ Variables: Variables }> = (err, c) => {
  const result = errorHandler(err, c)

  // If the result contains a status and body, convert it to a Response
  if ("status" in result && "body" in result) {
    return c.json(result.body, result.status as any)
  }

  // Otherwise, return the result directly (should already be a Response)
  return result
}

// Apply error handler
auth.onError(honoErrorHandler)

// Apply rate limiting to auth routes
auth.use(
  "/login",
  rateLimit({
    windowSeconds: 300, // 5 minutes
    maxRequests: 5, // 5 attempts
    keyPrefix: "rate:login:",
    message: "Too many login attempts. Please try again later.",
    skipSuccessfulRequests: true, // Don't count successful logins against the limit
  })
)

auth.use(
  "/register",
  rateLimit({
    windowSeconds: 3600, // 1 hour
    maxRequests: 3, // 3 attempts
    keyPrefix: "rate:register:",
    message: "Too many registration attempts. Please try again later.",
  })
)

auth.use(
  "/forgot-password",
  rateLimit({
    windowSeconds: 3600, // 1 hour
    maxRequests: 3, // 3 attempts
    keyPrefix: "rate:forgot:",
    message: "Too many password reset requests. Please try again later.",
  })
)

auth.use(
  "/reset-password",
  rateLimit({
    windowSeconds: 3600, // 1 hour
    maxRequests: 5, // 5 attempts
    keyPrefix: "rate:reset:",
    message: "Too many password reset attempts. Please try again later.",
  })
)

// Login route with real authentication
auth.post(
  "/login",
  csrfProtection,
  zValidator("json", loginSchema),
  async (c) => {
    try {
      const data = await c.req.json()
      console.log(`Login attempt for email: ${data.email}`)

      // Add client information for security tracking
      data.ipAddress =
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        c.req.header("cf-connecting-ip") ||
        "unknown"
      data.userAgent = c.req.header("user-agent") || "unknown"
      data.deviceId = c.req.header("x-device-id") || "unknown"

      console.log(
        `Login attempt from IP: ${data.ipAddress}, Device: ${data.deviceId}`
      )

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
      console.log("Set auth cookies for user:", result.user.email)

      return c.json(result)
    } catch (error) {
      console.error("Login error:", error)
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
      console.log(`Registration attempt for email: ${data.email}`)

      // Add client information for security tracking
      data.ipAddress =
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        c.req.header("cf-connecting-ip") ||
        "unknown"
      data.userAgent = c.req.header("user-agent") || "unknown"
      data.deviceId = c.req.header("x-device-id") || "unknown"

      console.log(`Registration attempt from IP: ${data.ipAddress}`)

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
      console.log("Set auth cookies for new user:", result.user.email)

      return c.json(result)
    } catch (error) {
      console.error("Registration error:", error)
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

    await AuthService.verifyEmail(token)

    return c.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Email verification error:", error)
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

    // Generate new access token with shorter expiration (15 minutes)
    const accessToken = await generateToken(tokenPayload, "15m", {
      includeJti: true,
    })

    // Generate new refresh token with the same family but new ID
    const newRefreshToken = await generateRefreshToken(
      tokenPayload,
      config.jwt.refreshExpiresIn,
      {
        includeJti: true,
        family: tokenFamily,
      }
    )

    // Store the new token ID in the family for future validation
    await storeTokenFamily(tokenFamily, newTokenId)

    // Revoke the old refresh token
    await revokeToken(refreshToken, 60 * 60 * 24) // 24 hours

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
    console.log("Refreshed auth cookies")

    return c.json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    })
  } catch (error) {
    console.error("Token refresh error:", error)
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
      console.log(`Password reset requested for: ${email}`)

      await AuthService.forgotPassword(email)

      return c.json({
        success: true,
        message: "Password reset email sent",
      })
    } catch (error) {
      console.error("Forgot password error:", error)
      // Don't expose whether the email exists or not
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

      await AuthService.resetPassword(token, password)

      return c.json({
        success: true,
        message: "Password reset successfully",
      })
    } catch (error) {
      console.error("Reset password error:", error)
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
        console.log(`User ${payload.userId} logged out successfully`)

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
        console.error("Error during token revocation:", error)
      }
    }

    // Clear all possible auth cookies
    clearCookie(c, "auth_token")
    clearCookie(c, "accessToken")
    clearCookie(c, "token")
    clearCookie(c, "refresh_token")
    clearCookie(c, "authenticated")

    console.log("Cleared all auth cookies")

    return c.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    // Still clear all possible auth cookies even if there's an error
    clearCookie(c, "auth_token")
    clearCookie(c, "accessToken")
    clearCookie(c, "token")
    clearCookie(c, "refresh_token")
    clearCookie(c, "authenticated")

    console.log("Cleared all auth cookies (error case)")

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
    console.error("Get current user error:", error)
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
      console.log("Auth check - Cookie header:", cookieHeader)

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
            console.log(`Auth check - Found token in cookie: ${cookieName}`)
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
      console.log("Token verification failed:", tokenError)

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
    console.error("Auth check error:", error)

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
    console.error("CSRF token generation error:", error)
    throw new AuthError(
      AuthErrorCode.INVALID_CREDENTIALS,
      "Could not generate security token",
      500
    )
  }
})

// Token validation endpoint
auth.post("/validate-token", async (c) => {
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
      return c.json({
        isValid: false,
        message: "Invalid or expired token",
      })
    }
  } catch (error) {
    console.error("Token validation error:", error)
    return c.json({
      isValid: false,
      message: "Token validation failed",
    })
  }
})

// CSRF token endpoint - provides a CSRF token for client-side forms
auth.get("/csrf-token", async (c) => {
  try {
    // Generate a new CSRF token
    const token = crypto.randomBytes(32).toString("hex")

    // Set the token as a cookie
    setCookieWithOptions(c, "csrf_token", token, {
      httpOnly: false, // Allow JavaScript access
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    // Return the token to the client
    return c.json({
      success: true,
      csrfToken: token,
    })
  } catch (error) {
    console.error("CSRF token generation error:", error)
    throw new AuthError(
      AuthErrorCode.SERVER_ERROR,
      "Failed to generate CSRF token",
      500
    )
  }
})

// CSRF token validation middleware
const csrfProtection = async (c: any, next: any) => {
  // Skip for GET, HEAD, OPTIONS requests
  if (["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    return next()
  }

  try {
    // Get the token from the request header
    const csrfToken = c.req.header("X-CSRF-Token")

    // Get the token from the cookie
    const cookieHeader = c.req.raw.headers.get("cookie")
    if (!cookieHeader) {
      throw new AuthError(AuthErrorCode.INVALID_CSRF, "CSRF token missing", 403)
    }

    const cookies = cookieHeader.split(";")
    const csrfCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("csrf_token=")
    )

    if (!csrfCookie) {
      throw new AuthError(
        AuthErrorCode.INVALID_CSRF,
        "CSRF token cookie missing",
        403
      )
    }

    const cookieToken = csrfCookie.split("=")[1]

    // Validate that the tokens match
    if (!csrfToken || csrfToken !== cookieToken) {
      // Log CSRF violation
      await securityLogService.logCsrfViolation(
        c.req.header("x-forwarded-for") ||
          c.req.header("x-real-ip") ||
          "unknown",
        c.req.header("user-agent") || "unknown",
        c.req.path
      )

      throw new AuthError(
        AuthErrorCode.INVALID_CSRF,
        "CSRF token validation failed",
        403
      )
    }

    // Continue to the next middleware/handler
    await next()
  } catch (error) {
    console.error("CSRF validation error:", error)
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(
      AuthErrorCode.INVALID_CSRF,
      "CSRF protection error",
      403
    )
  }
}

export default auth
