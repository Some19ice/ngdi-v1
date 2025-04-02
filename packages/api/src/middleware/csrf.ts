import { MiddlewareHandler } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import crypto from "crypto"
import { config } from "../config"

/**
 * CSRF protection middleware for Hono
 * Validates CSRF tokens to protect against CSRF attacks
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
    maxAge: 60 * 60 * 24, // 24 hours
    httpOnly: false, // Allow JavaScript access to CSRF token
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  },
  ignoreMethods: ["GET", "HEAD", "OPTIONS"], // Methods that don't need CSRF protection
  ignorePaths: [
    "/health",
    "/api/auth/login",
    "/auth/login",
    "/api/auth/register",
    "/auth/register",
  ], // Paths that don't need CSRF protection
  tokenHeader: "X-CSRF-Token",
}

// Helper function to generate a CSRF token
const generateToken = (): string => {
  return crypto.randomBytes(16).toString("hex")
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

    // For debugging
    console.log(`CSRF Middleware - Method: ${method}, Path: ${path}`)

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
      "Content-Type, X-CSRF-Token"
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
      console.log(`CSRF Middleware - Skipping validation for ${path}`)

      // For GET requests, always ensure the token exists
      if (method === "GET") {
        let token = getCookie(c, opts.cookie.name)
        if (!token) {
          token = generateToken()
          setCookie(c, opts.cookie.name, token, opts.cookie)
          console.log(`CSRF Middleware - Generated new token for GET request`)
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
      console.log(`CSRF Middleware - No token in cookie, generated new one`)
      return c.json({ error: "CSRF token is missing" }, 403)
    }

    // Get the token from the header
    const headerToken = c.req.header(opts.tokenHeader || "X-CSRF-Token")

    // Validate the token
    if (!headerToken || headerToken !== cookieToken) {
      console.log(
        `CSRF Middleware - Invalid token: ${headerToken} vs ${cookieToken}`
      )
      return c.json({ error: "Invalid CSRF token" }, 403)
    }

    console.log(`CSRF Middleware - Token valid, proceeding with request`)

    // Continue with the request
    await next()

    // Refresh the token if it's about to expire
    // This is optional but recommended for enhanced security
    const newToken = generateToken()
    setCookie(c, opts.cookie.name, newToken, opts.cookie)
  }
}

export default csrf
