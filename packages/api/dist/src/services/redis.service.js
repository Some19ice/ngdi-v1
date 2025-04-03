"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const redis_1 = require("@upstash/redis");
const config_1 = require("../config");
// Create Redis client
let redis = null;
// Try to initialize Redis if configuration is available
try {
    if (config_1.config.redis?.url && config_1.config.redis?.token) {
        redis = new redis_1.Redis({
            url: config_1.config.redis.url,
            token: config_1.config.redis.token,
        });
        console.log('Redis client initialized');
    }
    else {
        console.warn('Redis configuration missing, some features will be disabled');
    }
}
catch (error) {
    console.error('Failed to initialize Redis client:', error);
}
/**
 * Redis service for caching and rate limiting
 */
exports.redisService = {
    /**
     * Check if Redis is available
     */
    isAvailable() {
        return redis !== null;
    },
    /**
     * Get a value from Redis
     */
    async get(key) {
        if (!redis)
            return null;
        try {
            return await redis.get(key);
        }
        catch (error) {
            console.error(`Redis get error for key "${key}":`, error);
            return null;
        }
    },
    /**
     * Set a value in Redis with optional expiration
     */
    async set(key, value, expireSeconds) {
        if (!redis)
            return;
        try {
            if (expireSeconds) {
                await redis.set(key, value, { ex: expireSeconds });
            }
            else {
                await redis.set(key, value);
            }
        }
        catch (error) {
            console.error(`Redis set error for key "${key}":`, error);
        }
    },
    /**
     * Delete a key from Redis
     */
    async delete(key) {
        if (!redis)
            return;
        try {
            await redis.del(key);
        }
        catch (error) {
            console.error(`Redis delete error for key "${key}":`, error);
        }
    },
    /**
     * Delete keys matching a pattern
     */
    async deleteByPattern(pattern) {
        if (!redis)
            return;
        try {
            // Scan for keys matching pattern
            const keys = await redis.keys(pattern);
            if (keys && keys.length > 0) {
                // Delete all matching keys
                await redis.del(...keys);
            }
        }
        catch (error) {
            console.error(`Redis delete by pattern error for "${pattern}":`, error);
        }
    },
    /**
     * Check if a token is blacklisted
     */
    async isTokenBlacklisted(token) {
        if (!redis)
            return false;
        try {
            const key = `blacklist:${token}`;
            const blacklisted = await redis.get(key);
            return !!blacklisted;
        }
        catch (error) {
            console.error('Redis token blacklist check error:', error);
            return false;
        }
    },
    /**
     * Add a token to the blacklist with expiration
     */
    async blacklistToken(token, expireSeconds) {
        if (!redis)
            return;
        try {
            const key = `blacklist:${token}`;
            await redis.set(key, '1', { ex: expireSeconds });
        }
        catch (error) {
            console.error('Redis token blacklist error:', error);
        }
    },
    /**
     * Increment a rate limit counter
     */
    async incrementRateLimit(key, expireSeconds) {
        if (!redis)
            return 0;
        try {
            // Increment counter and set expiration if it's a new key
            const count = await redis.incr(key);
            if (count === 1) {
                await redis.expire(key, expireSeconds);
            }
            return count;
        }
        catch (error) {
            console.error(`Redis rate limit error for key "${key}":`, error);
            return 0;
        }
    },
    /**
     * Get rate limit counter
     */
    async getRateLimit(key) {
        if (!redis)
            return 0;
        try {
            const count = await redis.get(key);
            return count ? Number(count) : 0;
        }
        catch (error) {
            console.error(`Redis get rate limit error for key "${key}":`, error);
            return 0;
        }
    },
    /**
     * Get time-to-live (TTL) for a key
     */
    async getTTL(key) {
        if (!redis)
            return 0;
        try {
            return await redis.ttl(key);
        }
        catch (error) {
            console.error(`Redis TTL error for key "${key}":`, error);
            return 0;
        }
    }
};
