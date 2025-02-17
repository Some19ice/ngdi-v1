import { Redis } from '@upstash/redis'

let redis: Redis

try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
} catch (error) {
  console.error('Failed to initialize Redis client:', error)
  // Provide a fallback implementation for rate limiting
  redis = {
    async incr() { return 1 },
    async expire() { return true },
    async get() { return null },
    async set() { return 'OK' },
  } as unknown as Redis
}

export { redis } 