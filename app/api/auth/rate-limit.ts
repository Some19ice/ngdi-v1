import { redis } from "@/lib/redis"

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function checkAuthRateLimit(identifier: string): Promise<boolean> {
  const key = `ratelimit:auth:${identifier}`
  const attempts = await redis.incr(key)

  if (attempts === 1) {
    await redis.pexpire(key, WINDOW_MS)
  }

  return attempts <= MAX_ATTEMPTS
}

export async function resetRateLimit(identifier: string): Promise<void> {
  const key = `ratelimit:auth:${identifier}`
  await redis.del(key)
}

export async function getRemainingAttempts(
  identifier: string
): Promise<number> {
  const key = `ratelimit:auth:${identifier}`
  const attempts = await redis.get<string>(key)
  return Math.max(0, MAX_ATTEMPTS - (attempts ? parseInt(attempts) : 0))
}
