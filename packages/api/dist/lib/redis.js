"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("./logger");
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});
redis.on("error", (error) => {
    logger_1.logger.error({
        message: "Redis connection error",
        error: error.message,
    });
});
redis.on("connect", () => {
    logger_1.logger.info("Redis connected successfully");
});
exports.default = redis;
