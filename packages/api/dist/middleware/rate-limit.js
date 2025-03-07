"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardRateLimit = exports.authRateLimit = exports.rateLimit = void 0;
const config_1 = require("../config");
const logger_1 = require("../lib/logger");
const redis_1 = __importDefault(require("../lib/redis"));
/**
 * Check if a request is rate limited
 */
async function isRateLimited(key, limit, window) {
    const now = Date.now();
    const windowKey = Math.floor(now / window);
    const finalKey = `rate_limit:${key}:${windowKey}`;
    try {
        const multi = redis_1.default.multi();
        multi.incr(finalKey);
        multi.pexpire(finalKey, window);
        const [count] = (await multi.exec());
        return count > limit;
    }
    catch (error) {
        logger_1.logger.error({
            message: "Rate limit check error",
            error: error instanceof Error ? error.message : "Unknown error",
            key,
        });
        return false; // Allow request on Redis error
    }
}
/**
 * Standard rate limiting middleware for general API endpoints
 */
const rateLimit = async (c, next) => {
    try {
        const clientIp = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
        const isLimited = await isRateLimited(`${clientIp}:standard`, config_1.config.rateLimit.standard.max, config_1.config.rateLimit.standard.window);
        if (isLimited) {
            logger_1.logger.warn({
                message: "Rate limit exceeded",
                ip: clientIp,
                path: c.req.path,
            });
            return c.json({ error: "Too many requests. Please try again later." }, 429);
        }
        await next();
    }
    catch (error) {
        logger_1.logger.error({
            message: "Rate limit error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
        await next();
    }
};
exports.rateLimit = rateLimit;
exports.standardRateLimit = exports.rateLimit;
/**
 * Stricter rate limiting middleware for authentication endpoints
 */
const authRateLimit = async (c, next) => {
    try {
        const clientIp = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
        const isLimited = await isRateLimited(`${clientIp}:auth`, config_1.config.rateLimit.auth.max, config_1.config.rateLimit.auth.window);
        if (isLimited) {
            logger_1.logger.warn({
                message: "Auth rate limit exceeded",
                ip: clientIp,
                path: c.req.path,
            });
            return c.json({ error: "Too many authentication attempts. Please try again later." }, 429);
        }
        await next();
    }
    catch (error) {
        logger_1.logger.error({
            message: "Auth rate limit error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
        await next();
    }
};
exports.authRateLimit = authRateLimit;
