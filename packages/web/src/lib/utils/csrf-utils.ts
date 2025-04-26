import { getCookie, setCookie } from "./cookie-utils"

/**
 * Ensure a CSRF token is available
 * Attempts to retrieve existing token or fetch a new one
 */
export async function ensureCsrfToken(): Promise<string | null> {
  try {
    // Check if token already exists
    let csrfToken = getCookie("csrf_token")
    if (csrfToken) {
      return csrfToken
    }

    // If no token exists, fetch a new one
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/csrf-token`,
      {
        method: "GET",
        credentials: "include",
      }
    )

    if (!response.ok) {
      console.error("CSRF token fetch failed:", response.statusText)
      return null
    }

    // Parse the response to get the token
    const data = await response.json()

    if (data.success && data.csrfToken) {
      // Store the token in a variable to return
      csrfToken = data.csrfToken
      return csrfToken
    }

    // Check again for the token in cookies as a fallback
    csrfToken = getCookie("csrf_token")
    return csrfToken || null
  } catch (error) {
    console.error("Failed to get CSRF token:", error)
    return null
  }
}

/**
 * Get the CSRF token from a cookie
 */
export function getCsrfToken(): string | null {
  return getCookie("csrf_token") || null
}
