"use client"

import { createClient } from "./supabase-client"
import { ProfileFormValues } from "@/components/profile/types"
import { toast } from "sonner"
import { Session } from "@supabase/supabase-js"

/**
 * Updates the user profile in Supabase
 * @param values Form values to update
 * @returns Promise with success status and user data or error
 */
export async function updateSupabaseProfile(
  values: Partial<ProfileFormValues>
) {
  const supabase = createClient()

  try {
    // Retrieve the session
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      return {
        success: false,
        error: "No active session found, please sign in again",
      }
    }

    // Prepare metadata update
    const metadata: Record<string, any> = {}

    // Add fields to metadata that need to be updated
    if (values.name) metadata.name = values.name
    if (values.organization !== undefined)
      metadata.organization = values.organization
    if (values.department !== undefined) metadata.department = values.department
    if (values.phone !== undefined) metadata.phone = values.phone
    if (values.bio !== undefined) metadata.bio = values.bio
    if (values.location !== undefined) metadata.location = values.location
    if (values.socialLinks !== undefined)
      metadata.socialLinks = values.socialLinks
    if (values.preferences !== undefined)
      metadata.preferences = values.preferences

    // Update image only if provided and different than current
    if (values.image !== undefined) metadata.avatar_url = values.image

    // Update user metadata
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    })

    if (error) throw error

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    }
  }
}
