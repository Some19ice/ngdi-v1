import {
  type Profile,
  type ProfileFormValues,
} from "@/components/profile/types"

// Use absolute URL with origin for server components
function getApiUrl(path: string): string {
  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    return path // Use relative path in browser
  }

  // In server environment, use absolute URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}${path}`
}

/**
 * Fetches the user's profile data
 * @returns Promise with the user's profile data
 * @throws Error if the profile cannot be fetched
 */
export async function getProfile(): Promise<Profile> {
  try {
    const apiUrl = getApiUrl("/api/user/profile")

    const res = await fetch(apiUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      // Use Next.js cache control
      next: {
        // Revalidate every 60 seconds
        revalidate: 60,
        // Allow manual revalidation with tags
        tags: ["profile"],
      },
    })

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Please sign in to access your profile")
      }
      const errorData = await res.json().catch(() => ({}))
      throw new Error(
        errorData.error || `Failed to fetch profile: ${res.statusText}`
      )
    }

    const data = await res.json()
    return data.user
  } catch (error) {
    console.error("Profile fetch error:", error)
    throw error
  }
}

/**
 * Updates the user's profile data
 * @param values The profile values to update
 * @returns Promise with the updated profile data
 * @throws Error if the profile cannot be updated
 */
export async function updateProfile(
  values: Partial<ProfileFormValues>
): Promise<Profile> {
  try {
    const apiUrl = getApiUrl("/api/user/profile")

    const res = await fetch(apiUrl, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Please sign in to update your profile")
      }
      const errorData = await res.json().catch(() => ({}))
      throw new Error(
        errorData.error || `Failed to update profile: ${res.statusText}`
      )
    }

    const data = await res.json()
    return data.user
  } catch (error) {
    console.error("Profile update error:", error)
    throw error
  }
}

/**
 * Uploads a profile image
 * @param file The image file to upload
 * @returns Promise with the URL of the uploaded image
 * @throws Error if the image cannot be uploaded
 */
export async function uploadProfileImage(file: File): Promise<{ url: string }> {
  try {
    const apiUrl = getApiUrl("/api/user/profile/image")
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(apiUrl, {
      method: "POST",
      credentials: "include",
      body: formData,
    })

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Please sign in to upload an image")
      }
      const errorData = await res.json().catch(() => ({}))
      throw new Error(
        errorData.error || `Failed to upload image: ${res.statusText}`
      )
    }

    return res.json()
  } catch (error) {
    console.error("Image upload error:", error)
    throw error
  }
}
