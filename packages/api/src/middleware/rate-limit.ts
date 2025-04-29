import { Context, Next } from "hono"
import { logger } from "../lib/logger"

/**
 * Simplified rate limiting middleware for general API endpoints
 * This version doesn't actually limit requests but maintains the same interface
 */
export const rateLimit = async (c: Context, next: Next) => {
  // Log the request for debugging purposes
  const clientIp =
    c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"

  logger.debug({
    message: "Rate limit check (simplified)",
    ip: clientIp,
    path: c.req.path,
  })

  // Always allow the request
  await next()
}

/**
 * Simplified rate limiting middleware for authentication endpoints
 * This version doesn't actually limit requests but maintains the same interface
 */
export const authRateLimit = async (c: Context, next: Next) => {
  // Log the request for debugging purposes
  const clientIp =
    c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"

  logger.debug({
    message: "Auth rate limit check (simplified)",
    ip: clientIp,
    path: c.req.path,
  })

  // Always allow the request
  await next()
}

// Re-export both rate limiting middlewares
export { rateLimit as standardRateLimit }
