import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase-admin"
import { AuthError, AuthErrorCode } from "../types/error.types"
import {
  securityLogService,
  SecurityEventType,
} from "../services/security-log.service"
import { logger } from "../lib/logger"
import { setCookieWithOptions, clearCookie } from "../utils/cookie.utils"
import { rateLimit } from "../middleware/rate-limit"
import { rateLimitConfig } from "../config/rate-limit.config"
import csrf from "../middleware/csrf"
import { errorHandler } from "../services/error-handling.service"
import { Variables, Context } from "../types/hono.types"
import { ErrorHandler } from "hono"
import { prisma } from "../lib/prisma"
import { UserRole } from "../types/auth.types"

// Create CSRF protection middleware
const csrfProtection = csrf()

// Create auth router using OpenAPIHono for compatibility with the main API router
const auth = new OpenAPIHono<{ Variables: Variables }>()

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

  return c.json(
    {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    },
    500
  )
}

// Apply error handler
auth.onError(honoErrorHandler)

// Apply rate limiting to auth routes
auth.use("/login", rateLimit(rateLimitConfig.auth.login))
auth.use("/register", rateLimit(rateLimitConfig.auth.register))
auth.use("/forgot-password", rateLimit(rateLimitConfig.auth.forgotPassword))
auth.use("/reset-password", rateLimit(rateLimitConfig.auth.resetPassword))
auth.use("/verify-email", rateLimit(rateLimitConfig.auth.verifyEmail))
auth.use(
  "/resend-verification",
  rateLimit(rateLimitConfig.auth.resendVerification)
)

// Apply a general rate limit to all auth endpoints
auth.use("*", rateLimit(rateLimitConfig.auth.global))

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

// Login route
auth.post(
  "/login",
  csrfProtection,
  zValidator("json", loginSchema),
  async (c) => {
    try {
      const data = await c.req.json()
      logger.info(`Login attempt for email: ${data.email}`)

      // Add client information for security tracking
      const clientInfo = {
        ipAddress:
          c.req.header("x-forwarded-for") ||
          c.req.header("x-real-ip") ||
          c.req.header("cf-connecting-ip") ||
          "unknown",
        userAgent: c.req.header("user-agent") || "unknown",
        deviceId: c.req.header("x-device-id") || "unknown",
      }

      logger.info(`Login attempt details`, {
        email: data.email,
        ipAddress: clientInfo.ipAddress,
        deviceId: clientInfo.deviceId,
      })

      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        logger.warn("Supabase not configured, authentication not available")
        throw new AuthError(
          AuthErrorCode.SERVER_ERROR,
          "Authentication service not available",
          503
        )
      }

      // Sign in with Supabase
      const { data: authData, error } =
        await supabaseAdmin.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })

      if (error) {
        // Log failed login attempt
        await securityLogService.logEvent({
          email: data.email,
          eventType: SecurityEventType.LOGIN_FAILURE,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
          deviceId: clientInfo.deviceId,
          details: {
            reason: error.message,
          },
        })

        throw new AuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          error.message,
          401
        )
      }

      if (!authData.session) {
        throw new AuthError(
          AuthErrorCode.SERVER_ERROR,
          "No session returned from authentication",
          500
        )
      }

      // Get user data from database if needed
      let additionalData = {}
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: authData.user.id },
          select: {
            organization: true,
            department: true,
            phone: true,
            // Add any other fields you need
          },
        })

        if (dbUser) {
          additionalData = dbUser
        }
      } catch (dbError) {
        logger.warn("Error getting additional user data from database:", {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          userId: authData.user.id,
        })
        // Continue without additional data
      }

      // Get user role from metadata
      const role = authData.user.user_metadata?.role || UserRole.USER

      // Log successful login
      await securityLogService.logEvent({
        userId: authData.user.id,
        email: authData.user.email || "",
        eventType: SecurityEventType.LOGIN_SUCCESS,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        deviceId: clientInfo.deviceId,
      })

      // Set cookies for client-side access with enhanced security
      setCookieWithOptions(
        c,
        "sb-access-token",
        authData.session.access_token,
        {
          sameSite: "strict", // Enhanced from lax to strict
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          path: "/",
          maxAge: 60 * 60, // 1 hour
        }
      )

      setCookieWithOptions(
        c,
        "sb-refresh-token",
        authData.session.refresh_token,
        {
          sameSite: "strict", // Enhanced from lax to strict
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          path: "/",
          maxAge: 60 * 60 * 24 * 3, // Reduced from 7 days to 3 days
        }
      )

      // Set authenticated flag for client-side checks
      setCookieWithOptions(c, "authenticated", "true", {
        httpOnly: false,
        sameSite: "strict", // Enhanced from lax to strict
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 3, // Reduced from 7 days to 3 days
      })

      // Return user data and session
      return c.json({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || null,
          role,
          emailVerified: authData.user.email_confirmed_at
            ? new Date(authData.user.email_confirmed_at)
            : null,
          ...additionalData,
        },
        session: {
          accessToken: authData.session.access_token,
          refreshToken: authData.session.refresh_token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        },
      })
    } catch (error) {
      return handleAuthError(c, error)
    }
  }
)

// Registration schema
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
})

// Register route
auth.post(
  "/register",
  csrfProtection,
  zValidator("json", registerSchema),
  async (c) => {
    try {
      const data = await c.req.json()
      logger.info(`Registration attempt for email: ${data.email}`)

      // Add client information for security tracking
      const clientInfo = {
        ipAddress:
          c.req.header("x-forwarded-for") ||
          c.req.header("x-real-ip") ||
          c.req.header("cf-connecting-ip") ||
          "unknown",
        userAgent: c.req.header("user-agent") || "unknown",
        deviceId: c.req.header("x-device-id") || "unknown",
      }

      logger.info(`Registration attempt details`, {
        email: data.email,
        ipAddress: clientInfo.ipAddress,
        deviceId: clientInfo.deviceId,
      })

      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        logger.warn("Supabase not configured, registration not available")
        throw new AuthError(
          AuthErrorCode.SERVER_ERROR,
          "Registration service not available",
          503
        )
      }

      // Register with Supabase
      const { data: authData, error } =
        await supabaseAdmin.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: false, // Require email verification
          user_metadata: {
            name: data.name,
            role: UserRole.USER,
            organization: data.organization,
            department: data.department,
            phone: data.phone,
          },
        })

      if (error) {
        // Log failed registration attempt
        await securityLogService.logEvent({
          email: data.email,
          eventType: SecurityEventType.REGISTRATION_FAILURE,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
          deviceId: clientInfo.deviceId,
          details: {
            reason: error.message,
          },
        })

        throw new AuthError(
          AuthErrorCode.REGISTRATION_FAILED,
          error.message,
          400
        )
      }

      if (!authData.user) {
        throw new AuthError(
          AuthErrorCode.SERVER_ERROR,
          "No user returned from registration",
          500
        )
      }

      // Create user in database if needed
      try {
        await prisma.user.create({
          data: {
            id: authData.user.id,
            email: authData.user.email || "",
            name: data.name,
            role: UserRole.USER,
            organization: data.organization,
            department: data.department,
            phone: data.phone,
            emailVerified: null, // Will be set when email is verified
          },
        })
      } catch (dbError) {
        logger.error("Error creating user in database:", {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          userId: authData.user.id,
        })
        // Continue without database entry
      }

      // Send verification email
      const { error: emailError } = await supabaseAdmin.auth.admin.generateLink(
        {
          type: "signup",
          email: data.email,
        }
      )

      if (emailError) {
        logger.error("Error sending verification email:", {
          error: emailError.message,
          email: data.email,
        })
      }

      // Log successful registration
      await securityLogService.logEvent({
        userId: authData.user.id,
        email: authData.user.email || "",
        eventType: SecurityEventType.REGISTRATION_SUCCESS,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        deviceId: clientInfo.deviceId,
      })

      // Return user data
      return c.json({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: data.name || null,
          role: UserRole.USER,
          emailVerified: null,
          organization: data.organization || null,
          department: data.department || null,
          phone: data.phone || null,
        },
        message:
          "Registration successful. Please check your email to verify your account.",
      })
    } catch (error) {
      return handleAuthError(c, error)
    }
  }
)

// Logout route
auth.post("/logout", csrfProtection, async (c) => {
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

    // Get token from cookie
    const token = c.req.cookie("sb-access-token")

    // If token exists, get user info for logging
    let userId = null
    let email = null

    if (token) {
      try {
        const { data } = await supabaseAdmin.auth.getUser(token)
        if (data.user) {
          userId = data.user.id
          email = data.user.email
        }
      } catch (error) {
        // Ignore errors, just log them
        logger.warn("Error getting user info during logout:", {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Sign out from Supabase
    if (token) {
      await supabaseAdmin.auth.admin.signOut(token)
    }

    // Clear cookies
    clearCookie(c, "sb-access-token")
    clearCookie(c, "sb-refresh-token")
    clearCookie(c, "authenticated")

    // Log logout event if we have user info
    if (userId) {
      await securityLogService.logEvent({
        userId,
        email: email || "",
        eventType: SecurityEventType.LOGOUT,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        deviceId: clientInfo.deviceId,
      })
    }

    return c.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    return handleAuthError(c, error)
  }
})

// Get current user route (alias for /check)
auth.get("/me", async (c) => {
  console.log("GET /auth/me endpoint called")

  // No demo mode - always use real authentication

  try {
    // Get token from cookie or header
    const token =
      c.req.cookie("sb-access-token") ||
      (c.req.header("Authorization")?.startsWith("Bearer ")
        ? c.req.header("Authorization")?.replace("Bearer ", "")
        : null)

    if (!token) {
      return c.json({
        authenticated: false,
        message: "No authentication token found",
      })
    }

    // No demo mode - always use real authentication

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      logger.warn("Supabase not configured, authentication check not available")
      return c.json({
        authenticated: false,
        message: "Authentication service not available",
      })
    }

    // Verify token with Supabase
    let data, error
    try {
      const result = await supabaseAdmin.auth.getUser(token)
      data = result.data
      error = result.error
    } catch (supabaseError) {
      console.error("Supabase getUser error:", supabaseError)
      return c.json({
        authenticated: false,
        message: "Error verifying token",
      })
    }

    if (error || !data.user) {
      return c.json({
        authenticated: false,
        message: error?.message || "Invalid token",
      })
    }

    // Get user role from metadata
    const role = data.user.user_metadata?.role || UserRole.USER

    // Get additional user data from database if needed
    let additionalData = {}
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: {
          organization: true,
          department: true,
          phone: true,
          // Add any other fields you need
        },
      })

      if (dbUser) {
        additionalData = dbUser
      }
    } catch (dbError) {
      logger.warn("Error getting additional user data from database:", {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        userId: data.user.id,
      })
      // Continue without additional data
    }

    return c.json({
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || null,
        role,
        emailVerified: data.user.email_confirmed_at
          ? new Date(data.user.email_confirmed_at)
          : null,
        ...additionalData,
      },
    })
  } catch (error) {
    return handleAuthError(c, error)
  }
})

// Check auth status route
auth.get("/check", async (c) => {
  console.log("GET /auth/check endpoint called")
  try {
    // Get token from cookie or header
    const token =
      c.req.cookie("sb-access-token") ||
      (c.req.header("Authorization")?.startsWith("Bearer ")
        ? c.req.header("Authorization")?.replace("Bearer ", "")
        : null)

    if (!token) {
      return c.json({
        authenticated: false,
        message: "No authentication token found",
      })
    }

    // No demo mode - always use real authentication

    // Verify token with Supabase
    let data, error
    try {
      const result = await supabaseAdmin.auth.getUser(token)
      data = result.data
      error = result.error
    } catch (supabaseError) {
      console.error("Supabase getUser error:", supabaseError)
      return c.json({
        authenticated: false,
        message: "Error verifying token",
      })
    }

    if (error || !data.user) {
      return c.json({
        authenticated: false,
        message: error?.message || "Invalid token",
      })
    }

    // Get user role from metadata
    const role = data.user.user_metadata?.role || UserRole.USER

    // Get additional user data from database if needed
    let additionalData = {}
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: {
          organization: true,
          department: true,
          phone: true,
          // Add any other fields you need
        },
      })

      if (dbUser) {
        additionalData = dbUser
      }
    } catch (dbError) {
      logger.warn("Error getting additional user data from database:", {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        userId: data.user.id,
      })
      // Continue without additional data
    }

    return c.json({
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || null,
        role,
        emailVerified: data.user.email_confirmed_at
          ? new Date(data.user.email_confirmed_at)
          : null,
        ...additionalData,
      },
    })
  } catch (error) {
    return handleAuthError(c, error)
  }
})

// Export the auth router
export default auth
