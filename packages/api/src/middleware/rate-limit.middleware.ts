import { Context, Next } from "hono"
import { redisService } from "../services/redis.service"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { config } from "../config"

interface RateLimitOptions {
  windowSeconds: number
  maxRequests: number
  keyPrefix?: string
}

const defaultOptions: RateLimitOptions = {
  windowSeconds: config.rateLimit.auth.window,
  maxRequests: config.rateLimit.auth.max,
  keyPrefix: "rate:auth:",
}

export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options }

  return async (c: Context, next: Next) => {
    const ip =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"

    const key = `${opts.keyPrefix}${ip}`

    try {
      const attempts = await redisService.incrementRateLimit(
        key,
        opts.windowSeconds
      )

      // Add rate limit headers
      c.header("X-RateLimit-Limit", opts.maxRequests.toString())
      c.header(
        "X-RateLimit-Remaining",
        Math.max(0, opts.maxRequests - attempts).toString()
      )

      if (attempts > opts.maxRequests) {
        throw new AuthError(
          AuthErrorCode.RATE_LIMITED,
          "Too many requests, please try again later",
          429,
          { windowSeconds: opts.windowSeconds }
        )
      }

      await next()
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      // If Redis is down, allow the request but log the error
      console.error("Rate limiting error:", error)
      await next()
    }
  }
}
