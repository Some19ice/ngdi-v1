"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const redis_service_1 = require("./redis.service");
// Default options
const DEFAULT_OPTIONS = {
    ttl: 300, // 5 minutes
    useRedis: true,
    useMemory: true,
    prefix: 'cache:'
};
// In-memory cache storage
const memoryCache = new Map();
// Cleanup timer for memory cache
setInterval(() => {
    const now = Date.now();
    // Clean expired entries
    for (const [key, entry] of memoryCache.entries()) {
        if (entry.expiresAt < now) {
            memoryCache.delete(key);
        }
    }
}, 60 * 1000); // Run every minute
/**
 * Generate a cache key with prefix
 */
function generateKey(key, options) {
    return `${options.prefix}${key}`;
}
/**
 * Check if a cache entry is valid
 */
function isValid(entry) {
    if (!entry)
        return false;
    return entry.expiresAt > Date.now();
}
/**
 * Cache Service with methods for get, set, delete operations
 */
exports.cacheService = {
    /**
     * Get a value from cache
     * @param key Cache key
     * @param options Cache options
     * @returns The cached value or null if not found
     */
    async get(key, options = {}) {
        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        const fullKey = generateKey(key, mergedOptions);
        // Try memory cache first
        if (mergedOptions.useMemory) {
            const memoryEntry = memoryCache.get(fullKey);
            if (memoryEntry && isValid(memoryEntry)) {
                return memoryEntry.value;
            }
        }
        // Try Redis cache
        if (mergedOptions.useRedis) {
            try {
                const redisEntry = await redis_service_1.redisService.get(fullKey);
                if (redisEntry) {
                    // Parse the cached data
                    const entry = JSON.parse(redisEntry);
                    // Check if entry is still valid
                    if (isValid(entry)) {
                        // Store in memory cache for faster access next time
                        if (mergedOptions.useMemory) {
                            memoryCache.set(fullKey, entry);
                        }
                        return entry.value;
                    }
                }
            }
            catch (error) {
                console.error('Redis cache error:', error);
                // Continue execution even if Redis fails
            }
        }
        return null;
    },
    /**
     * Set a value in cache
     * @param key Cache key
     * @param value Value to cache
     * @param options Cache options or ttl in seconds
     */
    async set(key, value, optionsOrTtl = {}) {
        // Handle case where ttl is passed as a number
        const options = typeof optionsOrTtl === 'number'
            ? { ttl: optionsOrTtl }
            : optionsOrTtl;
        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        const fullKey = generateKey(key, mergedOptions);
        const now = Date.now();
        const ttlMs = mergedOptions.ttl * 1000;
        const entry = {
            value,
            timestamp: now,
            expiresAt: now + ttlMs
        };
        // Set in memory cache
        if (mergedOptions.useMemory) {
            memoryCache.set(fullKey, entry);
        }
        // Set in Redis cache
        if (mergedOptions.useRedis) {
            try {
                await redis_service_1.redisService.set(fullKey, JSON.stringify(entry), mergedOptions.ttl);
            }
            catch (error) {
                console.error('Redis cache set error:', error);
                // Continue execution even if Redis fails
            }
        }
    },
    /**
     * Delete a value from cache
     * @param key Cache key
     * @param options Cache options
     */
    async delete(key, options = {}) {
        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        const fullKey = generateKey(key, mergedOptions);
        // Delete from memory cache
        if (mergedOptions.useMemory) {
            memoryCache.delete(fullKey);
        }
        // Delete from Redis cache
        if (mergedOptions.useRedis) {
            try {
                await redis_service_1.redisService.delete(fullKey);
            }
            catch (error) {
                console.error('Redis cache delete error:', error);
            }
        }
    },
    /**
     * Clear all cache entries with a specific prefix
     * @param prefix Prefix to match cache keys
     */
    async clearByPrefix(prefix) {
        // Clear from memory cache
        for (const key of memoryCache.keys()) {
            if (key.startsWith(prefix)) {
                memoryCache.delete(key);
            }
        }
        // Clear from Redis cache
        try {
            await redis_service_1.redisService.deleteByPattern(`${prefix}*`);
        }
        catch (error) {
            console.error('Redis cache clear error:', error);
        }
    }
};
