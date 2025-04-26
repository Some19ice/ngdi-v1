"use server"

import { revalidatePath } from "next/cache"

/**
 * Revalidates the metadata path
 */
export async function revalidateMetadataPath() {
  revalidatePath("/admin/metadata")
  return { success: true }
}

/**
 * Validates a metadata item on the server
 * @param id The ID of the metadata item to validate
 * @param authToken The authentication token
 */
export async function validateMetadataServer(id: string, authToken: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
    const response = await fetch(
      `${apiUrl}/api/admin/metadata/${id}/validate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to validate metadata: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || "Failed to validate metadata")
    }

    // Revalidate the paths to show the updated list
    revalidatePath("/admin/metadata")

    return { success: true }
  } catch (error) {
    console.error("Failed to validate metadata:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to validate metadata",
    }
  }
}

/**
 * Deletes a metadata item on the server
 * @param id The ID of the metadata item to delete
 * @param authToken The authentication token
 */
export async function deleteMetadataServer(id: string, authToken: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
    const response = await fetch(`${apiUrl}/api/admin/metadata/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete metadata: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || "Failed to delete metadata")
    }

    // Revalidate the paths to show the updated list
    revalidatePath("/admin/metadata")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete metadata:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete metadata",
    }
  }
}

/**
 * Imports metadata from CSV on the server
 * @param formData The form data containing the CSV file
 * @param authToken The authentication token
 */
export async function importMetadataServer(
  formData: FormData,
  authToken: string
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
    const response = await fetch(`${apiUrl}/api/admin/metadata/import`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to import metadata: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || "Failed to import metadata")
    }

    // Revalidate the paths to show the updated list
    revalidatePath("/admin/metadata")

    return { success: true }
  } catch (error) {
    console.error("Failed to import metadata:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to import metadata",
    }
  }
}
