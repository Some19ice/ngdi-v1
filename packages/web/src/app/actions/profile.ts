"use server"

import { type ProfileFormValues } from "@/components/profile/types"
import { cookies } from "next/headers"

/**
 * Updates the user's profile data using server action
 * @param values The profile values to update
 * @returns Promise with the update result
 */
export async function updateUserProfile(
  values: Partial<ProfileFormValues>
): Promise<{ success: boolean; error?: string }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")?.value

    if (!authToken) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${apiUrl}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please sign in to update your profile")
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || `Failed to update profile: ${response.statusText}`
      )
    }

    const data = await response.json()
    return { success: true }
  } catch (error) {
    console.error("Profile update error:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    }
  }
}
