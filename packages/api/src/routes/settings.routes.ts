import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { settingsService } from "../services/settings.service"
import { authMiddleware, adminMiddleware } from "../middleware"
import { Context } from "../types/hono.types"
import { logger } from "../lib/logger"

/**
 * Settings routes
 */
const settingsRouter = new Hono()

// Apply authentication middleware to all routes
settingsRouter.use("*", authMiddleware)

// Get system settings (admin only)
settingsRouter.get("/", adminMiddleware, async (c: Context) => {
  try {
    const settings = await settingsService.getSettings()
    return c.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    logger.error("Error getting settings:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    return c.json({
      success: false,
      message: "Failed to get system settings",
    }, 500)
  }
})

// Update system settings (admin only)
settingsRouter.put("/", adminMiddleware, async (c: Context) => {
  try {
    const data = await c.req.json()
    const settings = await settingsService.updateSettings(data)
    
    return c.json({
      success: true,
      data: settings,
      message: "Settings updated successfully",
    })
  } catch (error) {
    logger.error("Error updating settings:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    return c.json({
      success: false,
      message: "Failed to update system settings",
    }, 500)
  }
})

// Get email verification settings (public)
settingsRouter.get("/email-verification", async (c: Context) => {
  try {
    const isRequired = await settingsService.isEmailVerificationRequired()
    
    return c.json({
      success: true,
      data: {
        requireEmailVerification: isRequired,
      },
    })
  } catch (error) {
    logger.error("Error getting email verification settings:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    return c.json({
      success: false,
      message: "Failed to get email verification settings",
    }, 500)
  }
})

export default settingsRouter
