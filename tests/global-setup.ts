import { FullConfig } from "@playwright/test"
import { redis } from "../lib/redis"
import { clearRedisTestData } from "./helpers/redis"

async function globalSetup(config: FullConfig) {
  // Environment variables are set in playwright.config.ts

  // Initialize Redis by accessing it
  await redis.ping().catch((error) => {
    console.log("Redis ping failed (expected in test mode):", error)
  })

  // Clear any existing test data
  await clearRedisTestData().catch((error) => {
    console.log("Failed to clear Redis test data:", error)
  })

  // Log test configuration
  console.log("Test setup complete:", {
    nodeEnv: process.env.NODE_ENV,
    debug: process.env.DEBUG,
    testMode: process.env.NODE_ENV === "test",
  })
}

export default globalSetup
