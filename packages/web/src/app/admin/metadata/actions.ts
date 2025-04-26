"use client"

// Client-side actions

/**
 * Validates a metadata item
 * @param id The ID of the metadata item to validate
 */
export async function validateMetadata(id: string) {
  try {
    const authToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1]

    if (!authToken) {
      throw new Error("Authentication required")
    }

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

    // We'll need to manually refresh the page or use client-side state management

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
 * Deletes a metadata item
 * @param id The ID of the metadata item to delete
 */
export async function deleteMetadata(id: string) {
  try {
    const authToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1]

    if (!authToken) {
      throw new Error("Authentication required")
    }

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

    // We'll need to manually refresh the page or use client-side state management

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
 * Exports metadata to CSV
 */
export async function exportMetadata() {
  try {
    const authToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1]

    if (!authToken) {
      throw new Error("Authentication required")
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
    const response = await fetch(`${apiUrl}/api/admin/metadata/export`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to export metadata: ${response.statusText}`)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "metadata-export.csv"
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return { success: true }
  } catch (error) {
    console.error("Failed to export metadata:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to export metadata",
    }
  }
}

/**
 * Imports metadata from CSV
 * @param file The CSV file to import
 */
export async function importMetadata(file: File) {
  try {
    const authToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1]

    if (!authToken) {
      throw new Error("Authentication required")
    }

    const formData = new FormData()
    formData.append("file", file)

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

    // We'll need to manually refresh the page or use client-side state management

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
