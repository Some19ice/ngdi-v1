import { Context, Next } from "hono"
import { redisService } from "../services/redis.service"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { config } from "../config"
import { securityLogService } from "../services/security-log.service"

interface RateLimitOptions {
  windowSeconds: number
  maxRequests: number
  keyPrefix?: string
  message?: string
  statusCode?: number
  skipSuccessfulRequests?: boolean
  identifyClient?: (c: Context) => string
}

const defaultOptions: RateLimitOptions = {
  windowSeconds: config.rateLimit.auth.window,
  maxRequests: config.rateLimit.auth.max,
  keyPrefix: "rate:auth:",
  message: "Too many requests, please try again later",
  statusCode: 429,
  skipSuccessfulRequests: false,
  identifyClient: (c: Context) => {
    // Get client IP with fallbacks
    return (
      c.req.header("x-forwarded-for") ||
      c.req.header("x-real-ip") ||
      c.req.header("cf-connecting-ip") ||
      c.req.raw.headers.get("x-forwarded-for") ||
      "unknown"
    )
  },
}

export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options }

  return async (c: Context, next: Next) => {
    // Get client identifier (usually IP)
    const clientId = opts.identifyClient(c)

    // Include the path in the rate limit key for more granular control
    const path = c.req.path
    const method = c.req.method

    // Create a unique key for this client and endpoint
    const key = `${opts.keyPrefix}${clientId}:${method}:${path}`

    try {
      // Check if Redis is available
      if (!redisService.isAvailable()) {
        console.warn("Rate limiting skipped: Redis not available")
        await next()
        return
      }

      // Increment the counter
      const attempts = await redisService.incrementRateLimit(
        key,
        opts.windowSeconds
      )

      // Get time to reset
      const ttl =
        (await redisService.getRateLimitTTL(key)) || opts.windowSeconds
      const resetTime = new Date(Date.now() + ttl * 1000).toUTCString()

      // Add rate limit headers
      c.header("X-RateLimit-Limit", opts.maxRequests.toString())
      c.header(
        "X-RateLimit-Remaining",
        Math.max(0, opts.maxRequests - attempts).toString()
      )
      c.header("X-RateLimit-Reset", resetTime)

      // Check if rate limit exceeded
      if (attempts > opts.maxRequests) {
        // Log rate limit event
        console.warn(`Rate limit exceeded for ${clientId} on ${path}`)

        // Set Retry-After header
        c.header("Retry-After", ttl.toString())

        // Log security event
        await securityLogService.logRateLimitExceeded(clientId, path, method)

        throw new AuthError(
          AuthErrorCode.RATE_LIMITED,
          opts.message || "Too many requests, please try again later",
          opts.statusCode || 429,
          {
            windowSeconds: opts.windowSeconds,
            retryAfter: ttl,
          }
        )
      }

      // Store the current attempts for potential rollback
      c.set("rateLimitAttempts", attempts)
      c.set("rateLimitKey", key)

      // Continue to the next middleware
      await next()

      // If configured to skip successful requests and response is successful
      if (
        opts.skipSuccessfulRequests &&
        c.res.status >= 200 &&
        c.res.status < 400
      ) {
        // Decrement the counter to not count successful requests
        await redisService.decrementRateLimit(key)
      }
    } catch (error) {
      // Re-throw rate limit errors
      if (
        error instanceof AuthError &&
        error.code === AuthErrorCode.RATE_LIMITED
      ) {
        throw error
      }

      // If Redis is down or other error, allow the request but log the error
      console.error("Rate limiting error:", error)
      await next()
    }
  }
}
