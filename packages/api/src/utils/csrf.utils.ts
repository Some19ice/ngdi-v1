import { randomBytes } from "crypto"
import { Context } from "hono"
import { setCookieWithOptions } from "./cookie.utils"

// Constants
const CSRF_COOKIE_NAME = "csrf_token"
const CSRF_HEADER_NAME = "X-CSRF-Token"

/**
 * Generate a secure random CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Set a CSRF token cookie and return the token
 */
export function setCsrfToken(c: Context): string {
  const token = generateCsrfToken()
  
  // Set the CSRF token as a cookie
  setCookieWithOptions(c, CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours
  })
  
  return token
}

/**
 * Validate the CSRF token from the request
 */
export function validateCsrfToken(c: Context): boolean {
  // Get the token from the request header
  const headerToken = c.req.header(CSRF_HEADER_NAME)
  
  // Get the token from the cookie
  const cookieHeader = c.req.raw.headers.get("cookie")
  if (!cookieHeader) return false
  
  const cookies = cookieHeader.split(";")
  const csrfCookie = cookies.find((cookie) => 
    cookie.trim().startsWith(`${CSRF_COOKIE_NAME}=`)
  )
  
  if (!csrfCookie) return false
  
  const cookieToken = csrfCookie.split("=")[1]
  
  // Compare the tokens
  return headerToken === cookieToken
}

/**
 * CSRF protection middleware
 */
export function csrfProtection() {
  return async (c: Context, next: () => Promise<void>) => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    const method = c.req.method
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      // For GET requests, set a new CSRF token
      if (method === "GET") {
        setCsrfToken(c)
      }
      return next()
    }
    
    // For other methods (POST, PUT, DELETE, etc.), validate the token
    if (!validateCsrfToken(c)) {
      return c.json(
        { 
          success: false, 
          message: "Invalid or missing CSRF token" 
        }, 
        403
      )
    }
    
    // If validation passes, continue
    await next()
    
    // Set a new CSRF token after the request is processed
    setCsrfToken(c)
  }
}
