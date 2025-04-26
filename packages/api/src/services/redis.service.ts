import { Redis } from '@upstash/redis';
import { config } from '../config';

// Create Redis client
let redis: Redis | null = null;

// Try to initialize Redis if configuration is available
try {
  if (config.redis?.url && config.redis?.token) {
    redis = new Redis({
      url: config.redis.url,
      token: config.redis.token,
    });
    console.log('Redis client initialized');
  } else {
    console.warn('Redis configuration missing, some features will be disabled');
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
}

/**
 * Redis service for caching and rate limiting
 */
export const redisService = {
  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return redis !== null
  },

  /**
   * Get a value from Redis
   */
  async get(key: string): Promise<string | null> {
    if (!redis) return null
    try {
      return (await redis.get(key)) as string | null
    } catch (error) {
      console.error(`Redis get error for key "${key}":`, error)
      return null
    }
  },

  /**
   * Set a value in Redis with optional expiration
   */
  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    if (!redis) return
    try {
      if (expireSeconds) {
        await redis.set(key, value, { ex: expireSeconds })
      } else {
        await redis.set(key, value)
      }
    } catch (error) {
      console.error(`Redis set error for key "${key}":`, error)
    }
  },

  /**
   * Delete a key from Redis
   */
  async delete(key: string): Promise<void> {
    if (!redis) return
    try {
      await redis.del(key)
    } catch (error) {
      console.error(`Redis delete error for key "${key}":`, error)
    }
  },

  /**
   * Delete keys matching a pattern
   */
  async deleteByPattern(pattern: string): Promise<void> {
    if (!redis) return
    try {
      // Scan for keys matching pattern
      const keys = await redis.keys(pattern)
      if (keys && keys.length > 0) {
        // Delete all matching keys
        await redis.del(...keys)
      }
    } catch (error) {
      console.error(`Redis delete by pattern error for "${pattern}":`, error)
    }
  },

  /**
   * Check if a token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    if (!redis) return false
    try {
      const key = `blacklist:${token}`
      const blacklisted = await redis.get(key)
      return !!blacklisted
    } catch (error) {
      console.error("Redis token blacklist check error:", error)
      return false
    }
  },

  /**
   * Add a token to the blacklist with expiration
   */
  async blacklistToken(
    token: string,
    expireSeconds: number = 86400
  ): Promise<void> {
    if (!redis) return
    try {
      const key = `blacklist:${token}`
      await redis.set(key, "1", { ex: expireSeconds })
    } catch (error) {
      console.error("Redis token blacklist error:", error)
    }
  },

  /**
   * Increment a rate limit counter
   */
  async incrementRateLimit(
    key: string,
    expireSeconds: number
  ): Promise<number> {
    if (!redis) return 0
    try {
      // Increment counter and set expiration if it's a new key
      const count = await redis.incr(key)
      if (count === 1) {
        await redis.expire(key, expireSeconds)
      }
      return count
    } catch (error) {
      console.error(`Redis rate limit error for key "${key}":`, error)
      return 0
    }
  },

  /**
   * Get rate limit counter
   */
  async getRateLimit(key: string): Promise<number> {
    if (!redis) return 0
    try {
      const count = await redis.get(key)
      return count ? Number(count) : 0
    } catch (error) {
      console.error(`Redis get rate limit error for key "${key}":`, error)
      return 0
    }
  },

  /**
   * Get time-to-live (TTL) for a key
   */
  async getTTL(key: string): Promise<number> {
    if (!redis) return 0
    try {
      return await redis.ttl(key)
    } catch (error) {
      console.error(`Redis TTL error for key "${key}":`, error)
      return 0
    }
  },

  /**
   * Get TTL for a rate limit key
   */
  async getRateLimitTTL(key: string): Promise<number> {
    return this.getTTL(key)
  },

  /**
   * Decrement a rate limit counter (for successful requests)
   */
  async decrementRateLimit(key: string): Promise<number> {
    if (!redis) return 0
    try {
      const count = await redis.decr(key)
      // If count goes below 0, reset to 0
      if (count < 0) {
        await redis.set(key, 0)
        return 0
      }
      return count
    } catch (error) {
      console.error(`Redis decrement rate limit error for key "${key}":`, error)
      return 0
    }
  },

  /**
   * Reset a rate limit counter
   */
  async resetRateLimit(key: string): Promise<void> {
    if (!redis) return
    try {
      await redis.del(key)
    } catch (error) {
      console.error(`Redis reset rate limit error for key "${key}":`, error)
    }
  },
}
