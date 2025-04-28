import { prisma } from "../lib/prisma"
import { logger } from "../lib/logger"
import { config } from "../config"

/**
 * Settings service for managing system settings
 */
export class SettingsService {
  /**
   * Cache for settings to reduce database queries
   */
  private static settingsCache: any = null
  private static cacheTime: number = 0
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get system settings with caching
   */
  static async getSettings() {
    const now = Date.now()
    
    // If cache is valid (less than 5 minutes old), use it
    if (this.settingsCache && now - this.cacheTime < this.CACHE_TTL) {
      return this.settingsCache
    }
    
    try {
      // Get settings from database
      const settings = await prisma.settings.findFirst({
        where: { id: "default" },
      })
      
      // If settings exist, cache them
      if (settings) {
        this.settingsCache = settings
        this.cacheTime = now
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
      this.settingsCache = newSettings
      this.cacheTime = now
      
      return newSettings
    } catch (error) {
      logger.error("Error getting system settings:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      
      // Return default settings if database query fails
      return {
        id: "default",
        siteName: config.appName || "NGDI Portal",
        siteDescription: "Geospatial Data Infrastructure Portal",
        supportEmail: config.email.from || "support@example.com",
        maxUploadSize: 10,
        defaultLanguage: "en",
        maintenanceMode: false,
        enableRegistration: true,
        requireEmailVerification: true,
        metadataValidation: true,
        autoBackup: false,
        backupFrequency: "weekly",
        storageProvider: "local",
        apiRateLimit: 100,
      }
    }
  }

  /**
   * Update system settings
   */
  static async updateSettings(data: any) {
    try {
      // Update settings in database
      const settings = await prisma.settings.upsert({
        where: { id: "default" },
        update: data,
        create: {
          id: "default",
          ...data,
        },
      })
      
      // Update cache
      this.settingsCache = settings
      this.cacheTime = Date.now()
      
      return settings
    } catch (error) {
      logger.error("Error updating system settings:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      
      throw error
    }
  }

  /**
   * Check if email verification is required
   */
  static async isEmailVerificationRequired() {
    const settings = await this.getSettings()
    return settings.requireEmailVerification
  }

  /**
   * Clear settings cache
   */
  static clearCache() {
    this.settingsCache = null
    this.cacheTime = 0
  }
}

export const settingsService = new SettingsService()
