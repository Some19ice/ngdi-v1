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

// IP-based rate limiter for auth endpoints
export const ipRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 h"),
  analytics: true,
  prefix: "ratelimit:ip",
})

// Account lockout settings
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 // 15 minutes in seconds

export async function checkAuthRateLimit(identifier: string) {
  const { success, reset, remaining } = await authRateLimiter.limit(identifier)
  return { success, reset, remaining }
}

export async function checkApiRateLimit(identifier: string) {
  const { success, reset, remaining } = await apiRateLimiter.limit(identifier)
  return { success, reset, remaining }
}

export async function checkIpRateLimit(ip: string) {
  const { success, reset, remaining } = await ipRateLimiter.limit(ip)
  return { success, reset, remaining }
}

export async function handleLoginAttempt(email: string, success: boolean) {
  const key = `login:attempts:${email}`
  const lockoutKey = `login:lockout:${email}`

  // Check if account is locked
  const isLocked = await redis.get(lockoutKey)
  if (isLocked) {
    const ttl = await redis.ttl(lockoutKey)
    throw new Error(
      `Account is locked. Try again in ${Math.ceil(ttl / 60)} minutes.`
    )
  }

  if (success) {
    // Reset attempts on successful login
    await redis.del(key)
    return
  }

  // Increment failed attempts
  const attempts = await redis.incr(key)

  // Set expiry on first attempt
  if (attempts === 1) {
    await redis.expire(key, LOCKOUT_DURATION)
  }

  // Lock account if max attempts reached
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    await redis.setex(lockoutKey, LOCKOUT_DURATION, "locked")
    await redis.del(key) // Reset attempts counter
    throw new Error(
      `Account locked for ${
        LOCKOUT_DURATION / 60
      } minutes due to too many failed attempts.`
    )
  }

  return {
    remainingAttempts: MAX_LOGIN_ATTEMPTS - attempts,
    attemptsRemaining: true,
  }
}

export async function isAccountLocked(email: string): Promise<boolean> {
  const isLocked = await redis.get(`login:lockout:${email}`)
  return !!isLocked
}

export async function getLockoutStatus(email: string) {
  const isLocked = await redis.get(`login:lockout:${email}`)
  if (!isLocked) return null

  const ttl = await redis.ttl(`login:lockout:${email}`)
  return {
    locked: true,
    remainingTime: ttl,
  }
}
