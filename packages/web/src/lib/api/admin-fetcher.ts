/**
 * Utility for making admin API requests with proper authentication
 */
export async function adminFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Get the API base URL from environment
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

  // Ensure URL has the correct format
  let apiUrl = url

  // If URL doesn't start with http, add the API base URL
  if (!url.startsWith("http")) {
    // Remove leading /api/ if present (to avoid duplication)
    const path = url.startsWith("/api/") ? url.substring(4) : url

    // Ensure path starts with /
    const normalizedPath = path.startsWith("/") ? path : `/${path}`

    // Combine base URL with path
    apiUrl = `${apiBaseUrl}${normalizedPath}`
  }

  // Get the access token from localStorage or cookies
  let accessToken = null

  // Try localStorage first
  if (typeof localStorage !== "undefined") {
    accessToken = localStorage.getItem("accessToken")
  }

  // If no token in localStorage, try to get from cookies
  if (!accessToken && typeof document !== "undefined") {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
    if (cookieValue) {
      accessToken = cookieValue.split("=")[1]
    }
  }

  // Log token status for debugging (without revealing the token)
  if (!accessToken) {
    console.warn("No authentication token found in localStorage or cookies")
  }

  // Add authorization headers for admin endpoints
  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  }

  // Make the request with auth headers
  try {
    console.log(`Making admin API request to: ${apiUrl}`)
    const response = await fetch(apiUrl, {
      ...options,
      headers,
      cache: "no-store",
    })

    // Handle API errors
    if (!response.ok) {
      console.error(`Admin API error (${response.status}):`, apiUrl)

      try {
        const errorData = await response.json()
        throw new Error(
          errorData.message || `API error: ${response.statusText}`
        )
      } catch (e) {
        // If JSON parsing fails, throw with status text
        throw new Error(`API error: ${response.statusText}`)
      }
    }

    // Return the data
    return response.json()
  } catch (error) {
    console.error(`Failed to fetch from ${apiUrl}:`, error)

    // Provide more detailed error message
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Network error: Could not connect to ${apiUrl}. Please check your connection and API server.`
      )
    }

    // Re-throw the original error
    throw error
  }
}

/**
 * Hook for use with SWR or React Query
 */
export const adminFetcher = async (url: string) => {
  return adminFetch(url)
}

/**
 * Utility for making admin API GET requests
 */
export function adminGet<T = any>(url: string, options: RequestInit = {}) {
  return adminFetch<T>(url, { method: "GET", ...options })
}

/**
 * Utility for making admin API POST requests
 */
export function adminPost<T = any>(
  url: string,
  data: any,
  options: RequestInit = {}
) {
  return adminFetch<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  })
}

/**
 * Utility for making admin API PUT requests
 */
export function adminPut<T = any>(
  url: string,
  data: any,
  options: RequestInit = {}
) {
  return adminFetch<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  })
}

/**
 * Utility for making admin API DELETE requests
 */
export function adminDelete<T = any>(url: string, options: RequestInit = {}) {
  return adminFetch<T>(url, { method: "DELETE", ...options })
}
