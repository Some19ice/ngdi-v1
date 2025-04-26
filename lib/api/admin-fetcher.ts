import { withMockAdminAuth } from "../auth/mock"

/**
 * Utility for making admin API requests with proper authentication
 */
export async function adminFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Ensure URL has leading /api/ if it doesn't start with http
  const apiUrl = url.startsWith("http")
    ? url
    : url.startsWith("/api/")
      ? url
      : `/api${url.startsWith("/") ? url : `/${url}`}`

  // Add authorization headers for admin endpoints
  const headers = withMockAdminAuth({
    "Content-Type": "application/json",
    ...options.headers,
  })

  // Make the request with auth headers
  const response = await fetch(apiUrl, {
    ...options,
    headers,
  })

  // Handle API errors
  if (!response.ok) {
    console.error(`Admin API error (${response.status}):`, apiUrl)

    try {
      const errorData = await response.json()
      throw new Error(errorData.message || `API error: ${response.statusText}`)
    } catch (e) {
      // If JSON parsing fails, throw with status text
      throw new Error(`API error: ${response.statusText}`)
    }
  }

  // Return the data
  return response.json()
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
