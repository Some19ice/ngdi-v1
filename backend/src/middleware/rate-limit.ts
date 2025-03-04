import { Context, Next } from "hono"
import { ApiError, ErrorCode } from "./error-handler"
import { config } from "../config/env"

// Simple in-memory store for rate limiting
// In production, use Redis or another distributed store
interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

/**
 * Clean up expired rate limit entries
 */
const cleanupStore = () => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt <= now) {
      delete store[key]
    }
  })
}

// Run cleanup every minute
setInterval(cleanupStore, 60000)

/**
 * Rate limiting middleware
 * @param window Time window in milliseconds
 * @param max Maximum number of requests in the window
 * @param keyGenerator Function to generate a unique key for the request
 */
export const rateLimit = (
  window = config.rateLimit.window,
  max = config.rateLimit.max,
  keyGenerator?: (c: Context) => string
) => {
  return async (c: Context, next: Next) => {
    // Generate a key for the request
    const key = keyGenerator
      ? keyGenerator(c)
      : `${
          c.req.header("x-forwarded-for") ||
          c.req.header("x-real-ip") ||
          "unknown"
        }_${c.req.path}`

    const now = Date.now()

    // Initialize or get the rate limit entry
    if (!store[key] || store[key].resetAt <= now) {
      store[key] = {
        count: 0,
        resetAt: now + window,
      }
    }

    // Increment the counter
    store[key].count += 1

    // Check if the limit is exceeded
    if (store[key].count > max) {
      // Set rate limit headers
      c.header("X-RateLimit-Limit", max.toString())
      c.header("X-RateLimit-Remaining", "0")
      c.header(
        "X-RateLimit-Reset",
        Math.ceil(store[key].resetAt / 1000).toString()
      )
      c.header(
        "Retry-After",
        Math.ceil((store[key].resetAt - now) / 1000).toString()
      )

      throw new ApiError(
        "Rate limit exceeded",
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        { retryAfter: Math.ceil((store[key].resetAt - now) / 1000) }
      )
    }

    // Set rate limit headers
    c.header("X-RateLimit-Limit", max.toString())
    c.header("X-RateLimit-Remaining", (max - store[key].count).toString())
    c.header(
      "X-RateLimit-Reset",
      Math.ceil(store[key].resetAt / 1000).toString()
    )

    await next()
  }
}

/**
 * Stricter rate limiting for authentication endpoints
 */
export const authRateLimit = rateLimit(
  config.rateLimit.auth.window,
  config.rateLimit.auth.max,
  (c) =>
    `auth_${
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"
    }`
)
