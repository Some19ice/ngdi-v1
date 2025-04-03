"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const redis_service_1 = require("../services/redis.service");
const error_types_1 = require("../types/error.types");
const config_1 = require("../config");
const defaultOptions = {
    windowSeconds: config_1.config.rateLimit.auth.window,
    maxRequests: config_1.config.rateLimit.auth.max,
    keyPrefix: "rate:auth:",
};
function rateLimit(options = {}) {
    const opts = { ...defaultOptions, ...options };
    return async (c, next) => {
        const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
        const key = `${opts.keyPrefix}${ip}`;
        try {
            const attempts = await redis_service_1.redisService.incrementRateLimit(key, opts.windowSeconds);
            // Add rate limit headers
            c.header("X-RateLimit-Limit", opts.maxRequests.toString());
            c.header("X-RateLimit-Remaining", Math.max(0, opts.maxRequests - attempts).toString());
            if (attempts > opts.maxRequests) {
                throw new error_types_1.AuthError(error_types_1.AuthErrorCode.RATE_LIMITED, "Too many requests, please try again later", 429, { windowSeconds: opts.windowSeconds });
            }
            await next();
        }
        catch (error) {
            if (error instanceof error_types_1.AuthError) {
                throw error;
            }
            // If Redis is down, allow the request but log the error
            console.error("Rate limiting error:", error);
            await next();
        }
    };
}
