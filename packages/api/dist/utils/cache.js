"use strict";
/**
 * Simple in-memory cache utility with TTL
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryCache = void 0;
class MemoryCache {
    constructor() {
        this.cache = new Map();
    }
    /**
     * Set a value in the cache with a TTL (time-to-live)
     * @param key Cache key
     * @param value Value to store
     * @param ttlMs Time to live in milliseconds
     */
    set(key, value, ttlMs) {
        const expiresAt = Date.now() + ttlMs;
        this.cache.set(key, { value, expiresAt });
    }
    /**
     * Get a value from the cache
     * @param key Cache key
     * @returns The cached value or undefined if not found or expired
     */
    get(key) {
        const item = this.cache.get(key);
        // Return undefined if item doesn't exist
        if (!item)
            return undefined;
        // Return undefined if item is expired and remove it from cache
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }
        return item.value;
    }
    /**
     * Check if a key exists in the cache and is not expired
     * @param key Cache key
     * @returns Whether the key exists in the cache
     */
    has(key) {
        const item = this.cache.get(key);
        if (!item)
            return false;
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Remove a key from the cache
     * @param key Cache key
     */
    delete(key) {
        this.cache.delete(key);
    }
    /**
     * Clear all items from the cache
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get cache stats
     * @returns Object with cache statistics
     */
    getStats() {
        let validItems = 0;
        let expiredItems = 0;
        this.cache.forEach((item) => {
            if (Date.now() > item.expiresAt) {
                expiredItems++;
            }
            else {
                validItems++;
            }
        });
        return {
            totalItems: this.cache.size,
            validItems,
            expiredItems,
        };
    }
}
// Export a singleton instance
exports.memoryCache = new MemoryCache();
