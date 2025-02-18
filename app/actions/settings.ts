"use server"

import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth-options"
import { redis } from "@/lib/redis"
import { storageFactory } from "@/lib/storage"
import { revalidatePath } from "next/cache"

const settingsSchema = z.object({
  siteName: z.string().min(2),
  siteDescription: z.string().min(10),
  supportEmail: z.string().email(),
  maxUploadSize: z.string(),
  defaultLanguage: z.string(),
  maintenanceMode: z.boolean(),
  enableRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  metadataValidation: z.boolean(),
  autoBackup: z.boolean(),
  backupFrequency: z.string(),
  storageProvider: z.enum(["local", "supabase", "s3", "azure", "gcs"]),
  apiRateLimit: z.string(),
})

export type SystemSettings = z.infer<typeof settingsSchema>

export async function updateSettings(data: SystemSettings) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate the data
    const validatedData = settingsSchema.parse(data)

    // Store settings in Redis
    await redis.set("system:settings", JSON.stringify(validatedData))

    // Update storage provider
    storageFactory.setActiveProvider(validatedData.storageProvider)

    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors,
      }
    }
    console.error("Failed to update settings:", error)
    return { success: false, error: "Failed to update settings" }
  }
}

export async function getSettings(): Promise<SystemSettings | null> {
  try {
    const settingsStr = await redis.get("system:settings")
    if (!settingsStr) return null

    const settings = JSON.parse(settingsStr as string)
    return settingsSchema.parse(settings)
  } catch (error) {
    console.error("Failed to get settings:", error)
    return null
  }
}
