import { redis } from "../../lib/redis"

/**
 * Helper to clear all Redis test data between tests
 */
export async function clearRedisTestData() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("clearRedisTestData can only be used in test environment")
  }

  // Clear all rate limiting data
  const keys = await redis.keys("auth:*")
  if (keys.length > 0) {
    await Promise.all(keys.map((key) => redis.del(key)))
  }
}

/**
 * Helper to simulate rate limit exceeded
 */
export async function simulateRateLimitExceeded(identifier: string) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      "simulateRateLimitExceeded can only be used in test environment"
    )
  }

  // Set attempts to exceed limit
  await redis.set(`auth:${identifier}:attempts`, 6)
  await redis.expire(`auth:${identifier}:attempts`, 60 * 15) // 15 minutes
}

/**
 * Helper to check current rate limit count
 */
export async function getRateLimitCount(identifier: string): Promise<number> {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("getRateLimitCount can only be used in test environment")
  }

  const count = await redis.get(`auth:${identifier}:attempts`)
  return count ? parseInt(count as string, 10) : 0
}
