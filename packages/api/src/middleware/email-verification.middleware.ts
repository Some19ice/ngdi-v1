import { Next } from "hono"
import { Context } from "../types/hono.types"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { prisma } from "../lib/prisma"
import { logger } from "../lib/logger"
import { config } from "../config"

/**
 * Middleware to enforce email verification
 * 
 * This middleware checks if a user's email is verified and blocks access
 * to protected routes if verification is required but not completed.
 */
export async function requireEmailVerification(c: Context, next: Next) {
  try {
    // Get user from context (set by auth middleware)
    const user = c.get("user")

    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      )
    }

    // Check if email verification is required in system settings
    const settings = await getSystemSettings()
    
    // If email verification is not required, proceed
    if (!settings.requireEmailVerification) {
      await next()
      return
    }

    // Check if user's email is verified
    if (!user.emailVerified) {
      logger.info(`Access blocked - email not verified: ${user.email}`, {
        userId: user.id,
        email: user.email,
      })
      
      throw new AuthError(
        AuthErrorCode.EMAIL_NOT_VERIFIED,
        "Email verification required. Please verify your email before proceeding.",
        403,
        {
          requiresVerification: true,
          email: user.email,
        }
      )
    }

    // Email is verified, proceed
    await next()
  } catch (error) {
    // Pass AuthError instances up the chain
    if (error instanceof AuthError) {
      throw error
    }

    // Handle other errors
    logger.error("Email verification middleware error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    throw new AuthError(
      AuthErrorCode.SERVER_ERROR,
      "Email verification check failed",
      500
    )
  }
}

/**
 * Get system settings with caching
 */
let cachedSettings: any = null
let settingsCacheTime = 0

async function getSystemSettings() {
  const now = Date.now()
  
  // If cache is valid (less than 5 minutes old), use it
  if (cachedSettings && now - settingsCacheTime < 5 * 60 * 1000) {
    return cachedSettings
  }
  
  try {
    // Get settings from database
    const settings = await prisma.settings.findFirst({
      where: { id: "default" },
    })
    
    // If settings exist, cache them
    if (settings) {
      cachedSettings = settings
      settingsCacheTime = now
      return settings
    }
    
    // If no settings exist, create default settings
    const defaultSettings = {
      id: "default",
      siteName: config.appName || "NGDI Portal",
      siteDescription: "Geospatial Data Infrastructure Portal",
      supportEmail: config.email.from || "support@example.com",
      maxUploadSize: 10, // 10 MB
      defaultLanguage: "en",
      maintenanceMode: false,
      enableRegistration: true,
      requireEmailVerification: true, // Default to requiring verification
      metadataValidation: true,
      autoBackup: false,
      backupFrequency: "weekly",
      storageProvider: "local",
      apiRateLimit: 100,
    }
    
    // Create default settings in database
    const newSettings = await prisma.settings.create({
      data: defaultSettings,
    })
    
    // Cache the new settings
    cachedSettings = newSettings
    settingsCacheTime = now
    
    return newSettings
  } catch (error) {
    logger.error("Error getting system settings:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    // Return default settings if database query fails
    return {
      requireEmailVerification: true, // Default to requiring verification
    }
  }
}
