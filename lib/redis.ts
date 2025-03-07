import { Redis } from '@upstash/redis'

// Debug logging helper
function debugLog(message: string, ...args: any[]) {
  if (process.env.DEBUG) {
    console.log(`[Redis Debug] ${message}`, ...args)
  }
}

// Define minimal Redis interface for our needs
interface MinimalRedis {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<"OK">
  setex(key: string, seconds: number, value: any): Promise<"OK">
  incr(key: string): Promise<number>
  expire(
    key: string,
    seconds: number,
    option?: "NX" | "nx" | "XX" | "xx" | "GT" | "gt" | "LT" | "lt"
  ): Promise<0 | 1>
  del(key: string): Promise<number>
  hset(
    key: string,
    field: string | Record<string, any>,
    value?: any
  ): Promise<number>
  lpush(key: string, ...values: any[]): Promise<number>
  ttl(key: string): Promise<number>
  pexpire(key: string, milliseconds: number): Promise<0 | 1>
  keys(pattern: string): Promise<string[]>
  ping(): Promise<"PONG">
  sadd(key: string, ...members: any[]): Promise<number>
  eval(script: string, keys: string[], args: any[]): Promise<any>
  evalsha(sha: string, keys: string[], args: any[]): Promise<any>
  scriptLoad(script: string): Promise<string>
  zadd(key: string, score: number, member: string): Promise<number>
  zrange(key: string, start: number, stop: number): Promise<string[]>
  smismember(key: string, ...members: string[]): Promise<number[]>
  multi(): Promise<any>
}

// Mock Redis implementation for test mode
export class MockRedis implements MinimalRedis {
  private store: Map<string, any>

  constructor() {
    debugLog("Initializing MockRedis")
    this.store = new Map()
  }

  async get(key: string): Promise<any> {
    debugLog("Mock Redis get", { key })
    return this.store.get(key)
  }

  async set(key: string, value: any): Promise<"OK"> {
    debugLog("Mock Redis set", { key, value })
    this.store.set(key, value)
    return "OK"
  }

  async setex(key: string, seconds: number, value: any): Promise<"OK"> {
    debugLog("Mock Redis setex", { key, seconds, value })
    this.store.set(key, value)
    setTimeout(() => {
      this.store.delete(key)
    }, seconds * 1000)
    return "OK"
  }

  async incr(key: string): Promise<number> {
    debugLog("Mock Redis incr", { key })
    const value = (this.store.get(key) || 0) + 1
    this.store.set(key, value)
    return value
  }

  async expire(
    key: string,
    seconds: number,
    option?: "NX" | "nx" | "XX" | "xx" | "GT" | "gt" | "LT" | "lt"
  ): Promise<0 | 1> {
    debugLog("Mock Redis expire", { key, seconds, option })
    if (!this.store.has(key)) return 0
    setTimeout(() => {
      this.store.delete(key)
    }, seconds * 1000)
    return 1
  }

  async del(key: string): Promise<number> {
    debugLog("Mock Redis del", { key })
    return this.store.delete(key) ? 1 : 0
  }

  async hset(
    key: string,
    field: string | Record<string, any>,
    value?: any
  ): Promise<number> {
    debugLog("Mock Redis hset", { key, field, value })
    const hash = this.store.get(key) || {}
    if (typeof field === "string") {
      hash[field] = value
      this.store.set(key, hash)
      return 1
    } else {
      Object.assign(hash, field)
      this.store.set(key, hash)
      return Object.keys(field).length
    }
  }

  async lpush(key: string, ...values: any[]): Promise<number> {
    debugLog("Mock Redis lpush", { key, values })
    const list = this.store.get(key) || []
    list.unshift(...values)
    this.store.set(key, list)
    return list.length
  }

  async ttl(key: string): Promise<number> {
    debugLog("Mock Redis ttl", { key })
    return this.store.has(key) ? 300 : -2 // Default 5 minutes TTL for testing
  }

  async pexpire(key: string, milliseconds: number): Promise<0 | 1> {
    debugLog("Mock Redis pexpire", { key, milliseconds })
    if (!this.store.has(key)) return 0
    setTimeout(() => {
      this.store.delete(key)
    }, milliseconds)
    return 1
  }

  async keys(pattern: string): Promise<string[]> {
    debugLog("Getting keys matching pattern", { pattern })
    const regex = new RegExp(pattern.replace("*", ".*"))
    return Array.from(this.store.keys()).filter((key) => regex.test(key))
  }

  async ping(): Promise<"PONG"> {
    debugLog("Mock Redis ping")
    return "PONG"
  }

  async sadd(key: string, ...members: any[]): Promise<number> {
    debugLog("Mock Redis sadd", { key, members })
    const set = new Set(this.store.get(key) || [])
    let added = 0
    for (const member of members) {
      if (!set.has(member)) {
        set.add(member)
        added++
      }
    }
    this.store.set(key, Array.from(set))
    return added
  }

  async eval(script: string, keys: string[], args: any[]): Promise<any> {
    debugLog("Mock Redis eval", { script, keys, args })
    return null // Mock implementation
  }

  async evalsha(sha: string, keys: string[], args: any[]): Promise<any> {
    debugLog("Mock Redis evalsha", { sha, keys, args })
    return null // Mock implementation
  }

  async scriptLoad(script: string): Promise<string> {
    debugLog("Mock Redis scriptLoad", { script })
    return "mock-sha" // Mock implementation
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    debugLog("Mock Redis zadd", { key, score, member })
    const sorted = this.store.get(key) || []
    const index = sorted.findIndex((item: any) => item.member === member)
    if (index !== -1) {
      sorted[index].score = score
      return 0
    }
    sorted.push({ score, member })
    sorted.sort((a: any, b: any) => a.score - b.score)
    this.store.set(key, sorted)
    return 1
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    debugLog("Mock Redis zrange", { key, start, stop })
    const sorted = this.store.get(key) || []
    return sorted.slice(start, stop + 1).map((item: any) => item.member)
  }

  async smismember(key: string, ...members: string[]): Promise<number[]> {
    debugLog("Mock Redis smismember", { key, members })
    const set = new Set(this.store.get(key) || [])
    return members.map((member) => (set.has(member) ? 1 : 0))
  }

  async multi(): Promise<any> {
    debugLog("Mock Redis multi")
    return {
      exec: async () => [],
      discard: async () => "OK",
      // Add other transaction methods as needed
    }
  }
}

function validateRedisConfig() {
  const url = process.env.UPSTASH_REDIS_URL
  const token = process.env.UPSTASH_REDIS_TOKEN

  debugLog('Validating Redis config', { 
    hasUrl: !!url, 
    hasToken: !!token,
    nodeEnv: process.env.NODE_ENV 
  })

  if (!url || !token) {
    throw new Error(
      "Redis configuration is missing. Please set UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN environment variables."
    )
  }

  return { url, token }
}

// Initialize Redis client based on environment
const getRedisClient = () => {
  const isTestMode = process.env.NODE_ENV === "test"
  debugLog('Getting Redis client', { isTestMode })
  
  if (isTestMode) {
    debugLog('Using MockRedis for test mode')
    return new MockRedis() as unknown as Redis
  }

  debugLog('Using real Redis client')
  const { url, token } = validateRedisConfig()
  return new Redis({
    url,
    token,
  })
}

let redisClient: Redis | null = null

export const redis = new Proxy({} as Redis, {
  get: (target, prop: keyof Redis) => {
    if (!redisClient) {
      debugLog('Initializing Redis client on first access')
      redisClient = getRedisClient()
    }
    return redisClient[prop]
  }
})

// Helper functions for rate limiting
export async function checkAuthRateLimit(identifier: string): Promise<boolean> {
  try {
    debugLog("Checking auth rate limit", { identifier })
    const attempts = await redis.incr(`auth:${identifier}:attempts`)
    if (attempts === 1) {
      await redis.expire(`auth:${identifier}:attempts`, 60 * 15) // 15 minutes
    }
    return attempts <= 5 // Allow 5 attempts per 15 minutes
  } catch (error) {
    console.error("Rate limit check failed:", error)
    return true // Fail open in case of Redis errors
  }
}

export async function resetRateLimit(identifier: string): Promise<void> {
  try {
    debugLog("Resetting rate limit", { identifier })
    await redis.del(`auth:${identifier}:attempts`)
  } catch (error) {
    console.error("Reset rate limit failed:", error)
  }
}