"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
class RedisService {
    constructor() {
        this.blacklistPrefix = "token:blacklist:";
        this.rateLimitPrefix = "rate:limit:";
        this.client = new ioredis_1.default(config_1.config.redis.url, {
            enableReadyCheck: true,
            maxRetriesPerRequest: 3,
        });
        this.client.on("error", (err) => {
            console.error("Redis error:", err);
        });
    }
    // Token blacklisting
    async blacklistToken(token, expirySeconds) {
        await this.client.setex(`${this.blacklistPrefix}${token}`, expirySeconds, "1");
    }
    async isTokenBlacklisted(token) {
        const result = await this.client.exists(`${this.blacklistPrefix}${token}`);
        return result === 1;
    }
    // Rate limiting
    async incrementRateLimit(key, windowSeconds) {
        const rateKey = `${this.rateLimitPrefix}${key}`;
        const multi = this.client.multi();
        multi.incr(rateKey);
        multi.expire(rateKey, windowSeconds);
        const results = await multi.exec();
        return results ? results[0][1] : 0;
    }
    async getRateLimit(key) {
        const count = await this.client.get(`${this.rateLimitPrefix}${key}`);
        return count ? parseInt(count, 10) : 0;
    }
    // Cleanup
    async disconnect() {
        await this.client.quit();
    }
}
exports.redisService = new RedisService();
