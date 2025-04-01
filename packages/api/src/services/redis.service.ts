import Redis from "ioredis"
import { config } from "../config"

class RedisService {
  private client: Redis
  private readonly blacklistPrefix = "token:blacklist:"
  private readonly rateLimitPrefix = "rate:limit:"

  constructor() {
    this.client = new Redis(config.redis.url, {
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
    })

    this.client.on("error", (err) => {
      console.error("Redis error:", err)
    })
  }

  // Token blacklisting
  async blacklistToken(token: string, expirySeconds: number): Promise<void> {
    await this.client.setex(
      `${this.blacklistPrefix}${token}`,
      expirySeconds,
      "1"
    )
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.client.exists(`${this.blacklistPrefix}${token}`)
    return result === 1
  }

  // Rate limiting
  async incrementRateLimit(
    key: string,
    windowSeconds: number
  ): Promise<number> {
    const rateKey = `${this.rateLimitPrefix}${key}`

    const multi = this.client.multi()
    multi.incr(rateKey)
    multi.expire(rateKey, windowSeconds)

    const results = await multi.exec()
    return results ? (results[0][1] as number) : 0
  }

  async getRateLimit(key: string): Promise<number> {
    const count = await this.client.get(`${this.rateLimitPrefix}${key}`)
    return count ? parseInt(count, 10) : 0
  }

  // Cleanup
  async disconnect(): Promise<void> {
    await this.client.quit()
  }
}

export const redisService = new RedisService()
