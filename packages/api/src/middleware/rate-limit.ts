import { Context, Next } from "hono"
import { config } from "../config"
import { logger } from "../lib/logger"
import redis from "../lib/redis"

/**
 * Check if a request is rate limited
 */
async function isRateLimited(
  key: string,
  limit: number,
  window: number
): Promise<boolean> {
  const now = Date.now()
  const windowKey = Math.floor(now / window)
  const finalKey = `rate_limit:${key}:${windowKey}`

  try {
    const multi = redis.multi()
    multi.incr(finalKey)
    multi.pexpire(finalKey, window)
    const [count] = (await multi.exec()) as [number, any]

    return count > limit
  } catch (error) {
    logger.error({
      message: "Rate limit check error",
      error: error instanceof Error ? error.message : "Unknown error",
      key,
    })
    return false // Allow request on Redis error
  }
}

/**
 * Standard rate limiting middleware for general API endpoints
 */
export const rateLimit = async (c: Context, next: Next) => {
  try {
    const clientIp =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"

    const isLimited = await isRateLimited(
      `${clientIp}:standard`,
      config.rateLimit.standard.max,
      config.rateLimit.standard.window
    )

    if (isLimited) {
      logger.warn({
        message: "Rate limit exceeded",
        ip: clientIp,
        path: c.req.path,
      })
      return c.json(
        { error: "Too many requests. Please try again later." },
        429
      )
    }

    await next()
  } catch (error) {
    logger.error({
      message: "Rate limit error",
      error: error instanceof Error ? error.message : "Unknown error",
    })
    await next()
  }
}

/**
 * Stricter rate limiting middleware for authentication endpoints
 */
export const authRateLimit = async (c: Context, next: Next) => {
  try {
    const clientIp =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"

    const isLimited = await isRateLimited(
      `${clientIp}:auth`,
      config.rateLimit.auth.max,
      config.rateLimit.auth.window
    )

    if (isLimited) {
      logger.warn({
        message: "Auth rate limit exceeded",
        ip: clientIp,
        path: c.req.path,
      })
      return c.json(
        { error: "Too many authentication attempts. Please try again later." },
        429
      )
    }

    await next()
  } catch (error) {
    logger.error({
      message: "Auth rate limit error",
      error: error instanceof Error ? error.message : "Unknown error",
    })
    await next()
  }
}

// Re-export both rate limiting middlewares
export { rateLimit as standardRateLimit }
