import { MiddlewareHandler } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import crypto from "crypto"
import { config } from "../config"
import { logger } from "../lib/logger"

/**
 * CSRF protection middleware for Hono
 * Validates CSRF tokens to protect against CSRF attacks
 *
 * This implementation uses the double-submit cookie pattern:
 * 1. A CSRF token is stored in a cookie
 * 2. The same token must be included in the request header
 * 3. The server validates that the cookie token and header token match
 */

// Options for CSRF protection
interface CSRFOptions {
  cookie: {
    name: string
    path?: string
    domain?: string
    maxAge?: number
    httpOnly?: boolean
    secure?: boolean
    sameSite?: "Strict" | "Lax" | "None"
  }
  ignoreMethods?: string[]
  ignorePaths?: string[]
  tokenHeader?: string
}

// Default options
const defaultOptions: CSRFOptions = {
  cookie: {
    name: "csrf_token",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours (reduced from 24 hours for security)
    httpOnly: false, // Allow JavaScript access to CSRF token
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict", // Changed from Lax to Strict for better security
  },
  ignoreMethods: ["GET", "HEAD", "OPTIONS"], // Methods that don't need CSRF protection
  ignorePaths: [
    "/health",
    "/api/health",
    "/api/auth/login",
    "/auth/login",
    "/api/auth/register",
    "/auth/register",
    "/api/auth/refresh-token",
    "/auth/refresh-token",
    "/api/auth/csrf-token", // Endpoint to get a CSRF token
    "/auth/csrf-token",
    "/api/auth/check", // Auth check endpoint
    "/auth/check",
  ], // Paths that don't need CSRF protection
  tokenHeader: "X-CSRF-Token",
}

// Helper function to generate a secure CSRF token
const generateToken = (): string => {
  return crypto.randomBytes(32).toString("hex") // Increased from 16 to 32 bytes for stronger security
}

// CSRF middleware factory
export const csrf = (options: Partial<CSRFOptions> = {}): MiddlewareHandler => {
  // Merge options with defaults
  const opts: CSRFOptions = {
    ...defaultOptions,
    ...options,
    cookie: {
      ...defaultOptions.cookie,
      ...options.cookie,
    },
  }

  // CSRF middleware handler
  return async (c, next) => {
    const method = c.req.method
    const path = c.req.path
    const requestId = crypto.randomBytes(4).toString("hex") // For tracking requests in logs

    // Get client information for logging
    const clientInfo = {
      ip:
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        c.req.header("cf-connecting-ip") ||
        "unknown",
      userAgent: c.req.header("user-agent") || "unknown",
    }

    logger.debug(
      `CSRF Middleware [${requestId}] - Processing ${method} ${path}`,
      {
        method,
        path,
        clientInfo,
      }
    )

    // Get origin from request or fallback to config
    const origin = c.req.header("Origin") || config.corsOrigins[0]

    // For all requests, set CORS headers
    c.res.headers.set("Access-Control-Allow-Origin", origin)
    c.res.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    )
    c.res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, X-CSRF-Token, Authorization"
    )
    c.res.headers.set("Access-Control-Allow-Credentials", "true")

    // Handle preflight requests
    if (method === "OPTIONS") {
      return c.text("OK", 200)
    }

    // Skip CSRF validation for ignored methods and paths
    if (
      opts.ignoreMethods?.includes(method) ||
      opts.ignorePaths?.some((p) => path.startsWith(p))
    ) {
      logger.debug(
        `CSRF Middleware [${requestId}] - Skipping validation for ${path}`,
        {
          method,
          path,
        }
      )

      // For GET requests, always ensure the token exists
      if (method === "GET") {
        let token = getCookie(c, opts.cookie.name)
        if (!token) {
          token = generateToken()
          setCookie(c, opts.cookie.name, token, opts.cookie)
          logger.debug(
            `CSRF Middleware [${requestId}] - Generated new token for GET request`
          )
        }
      }

      await next()
      return
    }

    // Get the token from the cookie
    const cookieToken = getCookie(c, opts.cookie.name)

    // If there's no token in the cookie, generate one and return an error
    if (!cookieToken) {
      const newToken = generateToken()
      setCookie(c, opts.cookie.name, newToken, opts.cookie)

      logger.warn(
        `CSRF Middleware [${requestId}] - CSRF token missing in cookie`,
        {
          method,
          path,
          clientInfo,
        }
      )

      return c.json(
        {
          success: false,
          error: "CSRF token is missing",
          message:
            "CSRF protection error. Please refresh the page and try again.",
        },
        403
      )
    }

    // Get the token from the header
    const headerToken = c.req.header(opts.tokenHeader || "X-CSRF-Token")

    // Validate the token
    if (!headerToken || headerToken !== cookieToken) {
      logger.warn(`CSRF Middleware [${requestId}] - Invalid CSRF token`, {
        method,
        path,
        clientInfo,
        headerTokenExists: !!headerToken,
        cookieTokenExists: !!cookieToken,
        // Don't log the actual tokens for security reasons
      })

      return c.json(
        {
          success: false,
          error: "Invalid CSRF token",
          message:
            "CSRF protection error. Please refresh the page and try again.",
        },
        403
      )
    }

    logger.debug(
      `CSRF Middleware [${requestId}] - Token valid, proceeding with request`,
      {
        method,
        path,
      }
    )

    // Continue with the request
    await next()

    // Refresh the token if it's about to expire
    // This is optional but recommended for enhanced security
    const newToken = generateToken()
    setCookie(c, opts.cookie.name, newToken, opts.cookie)

    logger.debug(
      `CSRF Middleware [${requestId}] - Token refreshed after request`,
      {
        method,
        path,
      }
    )
  }
}

export default csrf
