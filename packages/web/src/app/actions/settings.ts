"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"

export interface SystemSettings {
  siteName: string
  siteDescription: string
  supportEmail: string
  maxUploadSize: string
  defaultLanguage: string
  maintenanceMode: boolean
  enableRegistration: boolean
  requireEmailVerification: boolean
  metadataValidation: boolean
  autoBackup: boolean
  backupFrequency: string
  storageProvider: string
  apiRateLimit: string
}

const settingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().min(1, "Site description is required"),
  supportEmail: z.string().email("Invalid email address"),
  maxUploadSize: z.string().min(1, "Max upload size is required"),
  defaultLanguage: z.string().min(1, "Default language is required"),
  maintenanceMode: z.boolean(),
  enableRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  metadataValidation: z.boolean(),
  autoBackup: z.boolean(),
  backupFrequency: z.string().min(1, "Backup frequency is required"),
  storageProvider: z.string().min(1, "Storage provider is required"),
  apiRateLimit: z.string().min(1, "API rate limit is required"),
})

export type SettingsFormData = z.infer<typeof settingsSchema>

// Default settings if none are found in the database
const defaultSettings: SystemSettings = {
  siteName: "NGDI Portal",
  siteDescription:
    "Nigeria's central platform for geospatial data management and sharing",
  supportEmail: "support@ngdi.gov.ng",
  maxUploadSize: "100",
  defaultLanguage: "en",
  maintenanceMode: false,
  enableRegistration: true,
  requireEmailVerification: true,
  metadataValidation: true,
  autoBackup: true,
  backupFrequency: "daily",
  storageProvider: "local",
  apiRateLimit: "1000",
}

/**
 * Get system settings from the database
 */
export async function getSettings(): Promise<SystemSettings> {
  // During build time, always return default settings to avoid database connection issues
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    console.log("Build time detected, using default settings")
    return defaultSettings
  }

  try {
    // Assuming you have a settings table in your database
    // If not, you'll need to create one or use a different storage method
    const settings = await prisma.settings.findFirst()

    if (!settings) {
      return defaultSettings
    }

    return {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      supportEmail: settings.supportEmail,
      maxUploadSize: settings.maxUploadSize.toString(),
      defaultLanguage: settings.defaultLanguage,
      maintenanceMode: settings.maintenanceMode,
      enableRegistration: settings.enableRegistration,
      requireEmailVerification: settings.requireEmailVerification,
      metadataValidation: settings.metadataValidation,
      autoBackup: settings.autoBackup,
      backupFrequency: settings.backupFrequency,
      storageProvider: settings.storageProvider,
      apiRateLimit: settings.apiRateLimit.toString(),
    }
  } catch (error) {
    console.error("Error fetching settings:", error)
    return defaultSettings
  }
}

/**
 * Update system settings
 */
export async function updateSettings(data: SettingsFormData) {
  // During build time, always return success to avoid database connection issues
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    console.log("Build time detected, skipping settings update")
    return { success: true, data: { ...defaultSettings, ...data } }
  }

  try {
    const validatedData = settingsSchema.parse(data)

    // Assuming you have a settings table in your database
    // If not, you'll need to create one or use a different storage method
    const settings = await prisma.settings.upsert({
      where: { id: "1" }, // Assuming a single settings record with ID "1"
      update: {
        ...validatedData,
        maxUploadSize: parseInt(validatedData.maxUploadSize),
        apiRateLimit: parseInt(validatedData.apiRateLimit),
      },
      create: {
        id: "1",
        ...validatedData,
        maxUploadSize: parseInt(validatedData.maxUploadSize),
        apiRateLimit: parseInt(validatedData.apiRateLimit),
      },
    })

    return { success: true, data: settings }
  } catch (error) {
    console.error("Error updating settings:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors,
      }
    }

    // For database connection errors during development, return a mock success
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Development mode, returning mock success for settings update"
      )
      return { success: true, data: { ...defaultSettings, ...data } }
    }

    return { success: false, error: "Failed to update settings" }
  }
}
