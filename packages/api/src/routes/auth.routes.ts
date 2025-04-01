import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { prisma } from "../lib/prisma"
import { errorHandler, ApiError, ErrorCode } from "../middleware/error-handler"
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyToken,
} from "../utils/jwt"
import { UserRole } from "../types/auth.types"
import { emailService } from "../services/email.service"
import { AuthService } from "../services/auth.service"
import { HTTPException } from "hono/http-exception"
import { authMiddleware } from "../middleware/auth"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { setCookieWithOptions } from "../utils/cookie.utils"
import { rateLimit } from "../middleware/rate-limit.middleware"
import { redisService } from "../services/redis.service"
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

// Create auth router
const auth = new Hono<{ Variables: Variables }>()

// Apply error handler
auth.onError(errorHandler)

// Apply rate limiting to auth routes
auth.use(
  "/login",
  rateLimit({
    windowSeconds: 300, // 5 minutes
    maxRequests: 5, // 5 attempts
    keyPrefix: "rate:login:",
  })
)

auth.use(
  "/register",
  rateLimit({
    windowSeconds: 3600, // 1 hour
    maxRequests: 3, // 3 attempts
    keyPrefix: "rate:register:",
  })
)

// Helper function to get proper cookie domain based on environment
function getCookieDomain() {
  if (process.env.NODE_ENV === "production") {
    // Use the COOKIE_DOMAIN env var if set, otherwise default to the production domain
    return process.env.COOKIE_DOMAIN || process.env.VERCEL_URL || ".vercel.app"
  }
  // For local development, don't set domain to allow browser to handle it
  return undefined
}

// Login route
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    const data = await c.req.json()
    const result = await AuthService.login(data)

    // Set auth cookies
    setCookieWithOptions(c, "auth_token", result.accessToken)
    setCookieWithOptions(c, "refresh_token", result.refreshToken)

    return c.json(result)
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json(
        {
          success: false,
          code: error.code,
          message: error.message,
          details: error.details,
        },
        error.status as 401 | 403 | 429
      )
    }
    throw new AuthError(
      AuthErrorCode.INVALID_CREDENTIALS,
      "Authentication failed",
      401
    )
  }
})

// Register route
auth.post("/register", zValidator("json", registerSchema), async (c) => {
  try {
    const data = await c.req.json()
    const result = await AuthService.register(data)

    // Set auth cookies
    setCookieWithOptions(c, "auth_token", result.accessToken)
    setCookieWithOptions(c, "refresh_token", result.refreshToken)

    return c.json(result)
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json(
        {
          success: false,
          code: error.code,
          message: error.message,
          details: error.details,
        },
        error.status as 401 | 403 | 429
      )
    }
    throw new AuthError(
      AuthErrorCode.INVALID_CREDENTIALS,
      "Registration failed",
      401
    )
  }
})

// Verify email route
auth.get("/verify-email", zValidator("query", verifyEmailSchema), async (c) => {
  try {
    const { token } = await c.req.valid("query")
    await AuthService.verifyEmail(token)
    return c.json({ success: true, message: "Email verified successfully" })
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json(
        {
          success: false,
          code: error.code,
          message: error.message,
          details: error.details,
        },
        error.status as 401 | 403 | 429
      )
    }
    throw new AuthError(
      AuthErrorCode.INVALID_TOKEN,
      "Email verification failed",
      400
    )
  }
})

// Refresh token route
auth.post("/refresh-token", async (c) => {
  try {
    // Get refresh token from Authorization header or cookies
    let refreshToken = c.req.header("Authorization")?.replace("Bearer ", "")

    // If not in header, try to get from cookies
    if (!refreshToken) {
      const cookieHeader = c.req.raw.headers.get("cookie")
      if (cookieHeader) {
        const cookies = cookieHeader.split(";")
        const refreshTokenCookie = cookies.find((c) =>
          c.trim().startsWith("refresh_token=")
        )
        if (refreshTokenCookie) {
          refreshToken = refreshTokenCookie.split("=")[1]
        }
      }
    }

    // Check if we have a refresh token
    if (!refreshToken) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "Refresh token is required",
        400
      )
    }

    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken)

    // Generate new access token
    const accessToken = await generateToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    })

    // Generate new refresh token
    const newRefreshToken = await generateRefreshToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    })

    // Set auth cookies
    setCookieWithOptions(c, "auth_token", accessToken)
    setCookieWithOptions(c, "refresh_token", newRefreshToken)

    return c.json(
      {
        success: true,
        message: "Token refreshed",
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      },
      200
    )
  } catch (error) {
    console.error("Token refresh error:", error)
    throw new AuthError(
      AuthErrorCode.INVALID_TOKEN,
      "Invalid refresh token",
      401
    )
  }
})

// Request password reset
auth.post(
  "/forgot-password",
  rateLimit({
    windowSeconds: 3600, // 1 hour
    maxRequests: 3, // 3 attempts per hour
    keyPrefix: "rate:forgotpw:",
  }),
  zValidator("json", forgotPasswordSchema),
  async (c) => {
    try {
      const { email } = await c.req.json()
      await AuthService.forgotPassword(email)
      return c.json({ success: true, message: "Password reset email sent" })
    } catch (error) {
      // Always return success to prevent email enumeration
      return c.json({ success: true, message: "Password reset email sent" })
    }
  }
)

// Reset password
auth.post(
  "/reset-password",
  rateLimit({
    windowSeconds: 3600, // 1 hour
    maxRequests: 5, // 5 attempts per hour
    keyPrefix: "rate:resetpw:",
  }),
  zValidator("json", resetPasswordSchema),
  async (c) => {
    try {
      const { token, password } = await c.req.json()
      await AuthService.resetPassword(token, password)
      return c.json({ success: true, message: "Password reset successfully" })
    } catch (error) {
      if (error instanceof AuthError) {
        return c.json(
          {
            success: false,
            code: error.code,
            message: error.message,
            details: error.details,
          },
          error.status as 401 | 403 | 429
        )
      }
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "Password reset failed",
        400
      )
    }
  }
)

// Logout route
auth.post("/logout", async (c) => {
  try {
    // Get token from Authorization header
    let token = c.req.header("Authorization")?.replace("Bearer ", "")

    // If not in header, try to get from cookies
    if (!token) {
      const cookieHeader = c.req.raw.headers.get("cookie")
      if (cookieHeader) {
        const cookies = cookieHeader.split(";")
        const authCookie = cookies.find((c) =>
          c.trim().startsWith("auth_token=")
        )
        if (authCookie) {
          token = authCookie.split("=")[1]
        }
      }
    }

    // If token exists, blacklist it
    if (token) {
      try {
        // Verify the token first to ensure it's valid
        const decoded = await verifyToken(token)

        // Get token expiry
        const decodedToken = jose.decodeJwt(token)
        const expiry =
          (decodedToken.exp as number) - Math.floor(Date.now() / 1000)

        // Blacklist the token for its remaining lifetime
        if (expiry > 0) {
          await redisService.blacklistToken(token, expiry)
        }
      } catch (tokenError) {
        // Token verification failed, but we still want to clear cookies
        console.error("Token verification failed during logout:", tokenError)
      }
    }

    // Clear cookies in all cases
    setCookieWithOptions(c, "auth_token", "", { maxAge: 0 })
    setCookieWithOptions(c, "refresh_token", "", { maxAge: 0 })

    return c.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    // Always return success for logout to prevent revealing system state
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

    // Check if token is blacklisted
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

    // Verify the token
    try {
      const decoded = await verifyToken(token)

      // Return user info without sensitive data
      return c.json(
        {
          authenticated: true,
          user: {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
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

export default auth
