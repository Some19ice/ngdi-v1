import Redis from "ioredis"
import { config } from "../config"
import { logger } from "./logger"

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

redis.on("error", (error) => {
  logger.error({
    message: "Redis connection error",
    error: error.message,
  })
})

redis.on("connect", () => {
  logger.info("Redis connected successfully")
})

export default redis
