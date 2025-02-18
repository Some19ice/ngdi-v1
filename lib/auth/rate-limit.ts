import { redis } from "@/lib/redis"
import { Ratelimit } from "@upstash/ratelimit"

// Create a new ratelimiter that allows 10 requests per 10 seconds
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "ratelimit:auth",
})

// Create a new ratelimiter for API endpoints
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:api",
})

export async function checkAuthRateLimit(identifier: string) {
  const { success, reset, remaining } = await authRateLimiter.limit(identifier)
  return { success, reset, remaining }
}

export async function checkApiRateLimit(identifier: string) {
  const { success, reset, remaining } = await apiRateLimiter.limit(identifier)
  return { success, reset, remaining }
}
