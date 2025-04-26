import { type ProfileFormValues } from "@/components/profile/types"
import { updateProfile } from "@/lib/api/profile"

/**
 * Updates the user's profile data
 * @param values The profile values to update
 * @returns Promise with the update result
 */
export async function updateUserProfileData(
  values: Partial<ProfileFormValues>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Call the API to update the profile
    const result = await updateProfile(values)
    return result
  } catch (error) {
    console.error("Failed to update profile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    }
  }
} 