import { Context, Next } from "hono";
/**
 * Rate limiting middleware
 * @param windowMs Time window in milliseconds
 * @param maxRequests Maximum number of requests allowed in the time window
 * @param keyGenerator Function to generate a unique key for rate limiting (defaults to IP address)
 */
export declare function rateLimit(windowMs: number, maxRequests: number, keyGenerator?: (c: Context) => string): (c: Context, next: Next) => Promise<void>;
/**
 * Standard rate limiter for API endpoints
 */
export declare const apiLimiter: (c: Context, next: Next) => Promise<void>;
/**
 * Stricter rate limiter for authentication endpoints
 */
export declare const authLimiter: (c: Context, next: Next) => Promise<void>;
/**
 * Alias for authLimiter to maintain compatibility
 */
export declare const authRateLimit: (c: Context, next: Next) => Promise<void>;
