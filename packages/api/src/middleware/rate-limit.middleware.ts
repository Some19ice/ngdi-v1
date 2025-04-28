import { Context, Next } from "hono"
import { redisService } from "../services/redis.service"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { config } from "../config"
import { securityLogService } from "../services/security-log.service"
import { ipBanService } from "../services/ip-ban.service"
import { logger } from "../lib/logger"

/**
 * Enhanced rate limiting options
 */
interface RateLimitOptions {
  // Basic rate limiting settings
  windowSeconds: number
  maxRequests: number
  keyPrefix?: string
  message?: string
  statusCode?: number
  skipSuccessfulRequests?: boolean

  // Advanced settings
  identifyClient?: (c: Context) => string
  progressive?: boolean // Whether to use progressive rate limiting
  progressiveMultiplier?: number // Multiplier for progressive rate limiting
  maxProgressiveSteps?: number // Maximum number of progressive steps
  includeUserIdentifier?: boolean // Whether to include user identifier in rate limit key
  blockBannedIPs?: boolean // Whether to block known banned IPs
  trackFailedAttempts?: boolean // Whether to track failed attempts for account lockout
}

/**
 * Default rate limiting options
 */
const defaultOptions: RateLimitOptions = {
  // Basic settings
  windowSeconds: config.rateLimit.auth.window,
  maxRequests: config.rateLimit.auth.max,
  keyPrefix: "rate:auth:",
  message: "Too many requests, please try again later",
  statusCode: 429,
  skipSuccessfulRequests: false,

  // Advanced settings
  progressive: false,
  progressiveMultiplier: 2,
  maxProgressiveSteps: 3,
  includeUserIdentifier: false,
  blockBannedIPs: true,
  trackFailedAttempts: false,

  // Client identification function
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

/**
 * Check if an IP is in the banned list
 */
async function isIPBanned(ip: string): Promise<boolean> {
  try {
    const banStatus = await ipBanService.checkIpBan(ip)
    return banStatus.banned
  } catch (error) {
    logger.error("Error checking banned IP:", {
      error: error instanceof Error ? error.message : String(error),
      ip,
    })
    return false
  }
}

/**
 * Get the progressive window for a client based on violation history
 */
async function getProgressiveWindow(
  clientId: string,
  baseWindow: number,
  multiplier: number,
  maxSteps: number
): Promise<number> {
  try {
    if (!redisService.isAvailable()) {
      return baseWindow
    }

    // Get violation count
    const violationsKey = `violations:${clientId}`
    const violations = await redisService.get(violationsKey)
    const violationCount = violations ? parseInt(violations, 10) : 0

    // Calculate progressive window (capped at maxSteps)
    const step = Math.min(violationCount, maxSteps)
    const progressiveWindow = baseWindow * Math.pow(multiplier, step)

    return progressiveWindow
  } catch (error) {
    logger.error("Error calculating progressive window:", {
      error: error instanceof Error ? error.message : String(error),
      clientId,
    })
    return baseWindow
  }
}

/**
 * Record a rate limit violation for progressive rate limiting
 */
async function recordViolation(
  clientId: string,
  expirySeconds: number = 86400 * 7
): Promise<void> {
  try {
    // Record violation in IP ban service for potential auto-ban
    await ipBanService.recordViolation(clientId, "RATE_LIMIT_EXCEEDED", {
      timestamp: Date.now(),
    })

    if (!redisService.isAvailable()) {
      return
    }

    const violationsKey = `violations:${clientId}`

    // Increment violation count
    const violations = await redisService.get(violationsKey)
    const violationCount = violations ? parseInt(violations, 10) : 0

    // Store updated count with expiry
    await redisService.set(
      violationsKey,
      (violationCount + 1).toString(),
      expirySeconds
    )
  } catch (error) {
    logger.error("Error recording violation:", {
      error: error instanceof Error ? error.message : String(error),
      clientId,
    })
  }
}

/**
 * Enhanced rate limiting middleware
 */
export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options }

  return async (c: Context, next: Next) => {
    // Get client identifier (usually IP)
    const clientId = opts.identifyClient(c)

    // Get user identifier if available and configured
    let userId: string | undefined
    if (opts.includeUserIdentifier) {
      userId = c.var.userId || c.req.header("x-user-id")
    }

    // Include the path in the rate limit key for more granular control
    const path = c.req.path
    const method = c.req.method

    // Create a unique key for this client and endpoint
    let key = `${opts.keyPrefix}${clientId}:${method}:${path}`

    // Add user identifier if available
    if (userId) {
      key += `:${userId}`
    }

    // Add request details for logging
    const requestDetails = {
      ip: clientId,
      path,
      method,
      userId,
    }

    try {
      // Check if Redis is available
      if (!redisService.isAvailable()) {
        logger.warn(
          "Rate limiting skipped: Redis not available",
          requestDetails
        )
        await next()
        return
      }

      // Check if IP is banned (if enabled)
      if (opts.blockBannedIPs && (await isIPBanned(clientId))) {
        logger.warn("Request blocked from banned IP", requestDetails)

        // Log security event
        await securityLogService.logRateLimitExceeded(clientId, path, method)

        throw new AuthError(AuthErrorCode.BANNED, "Access denied", 403, {
          reason: "IP address is banned",
        })
      }

      // Calculate window duration (progressive or fixed)
      let windowSeconds = opts.windowSeconds
      if (opts.progressive) {
        windowSeconds = await getProgressiveWindow(
          clientId,
          opts.windowSeconds,
          opts.progressiveMultiplier || 2,
          opts.maxProgressiveSteps || 3
        )
      }

      // Increment the counter
      const attempts = await redisService.incrementRateLimit(key, windowSeconds)

      // Get time to reset
      const ttl = (await redisService.getRateLimitTTL(key)) || windowSeconds
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
        // Record violation for progressive rate limiting
        if (opts.progressive) {
          await recordViolation(clientId)
        }

        // Log rate limit event
        logger.warn("Rate limit exceeded", {
          ...requestDetails,
          attempts,
          limit: opts.maxRequests,
          window: windowSeconds,
          resetTime,
        })

        // Set Retry-After header
        c.header("Retry-After", ttl.toString())

        // Log security event
        await securityLogService.logRateLimitExceeded(clientId, path, method)

        throw new AuthError(
          AuthErrorCode.RATE_LIMITED,
          opts.message || "Too many requests, please try again later",
          opts.statusCode || 429,
          {
            windowSeconds,
            retryAfter: ttl,
            resetTime,
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

        logger.debug("Rate limit counter decremented for successful request", {
          ...requestDetails,
          attempts,
        })
      }
    } catch (error) {
      // Re-throw rate limit errors
      if (
        error instanceof AuthError &&
        (error.code === AuthErrorCode.RATE_LIMITED ||
          error.code === AuthErrorCode.BANNED)
      ) {
        throw error
      }

      // If Redis is down or other error, allow the request but log the error
      logger.error("Rate limiting error:", {
        error: error instanceof Error ? error.message : String(error),
        ...requestDetails,
      })

      await next()
    }
  }
}
