import { getCookie, setCookie } from "./cookie-utils"
import { getApiUrl } from "../api-config"

// Cache the CSRF token to avoid unnecessary requests
let cachedCsrfToken: string | null = null
let tokenExpiryTime: number | null = null

/**
 * Ensure a CSRF token is available
 * Attempts to retrieve existing token or fetch a new one
 */
export async function ensureCsrfToken(): Promise<string | null> {
  try {
    // Check if we have a cached token that's still valid
    if (cachedCsrfToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
      console.log("Using cached CSRF token")
      return cachedCsrfToken
    }

    // Check if token already exists in cookies
    let csrfToken = getCookie("csrf_token")
    if (csrfToken) {
      // Cache the token with a 10-minute expiry
      cachedCsrfToken = csrfToken
      tokenExpiryTime = Date.now() + 10 * 60 * 1000 // 10 minutes
      return csrfToken
    }

    // If no token exists, fetch a new one with better error handling
    console.log("Fetching new CSRF token...")

    // Use a timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(getApiUrl("/auth/csrf-token"), {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error("CSRF token fetch failed:", response.statusText)
        return null
      }

      // Parse the response to get the token
      const data = await response.json()

      if (data.success && data.csrfToken) {
        // Store the token in a variable to return
        csrfToken = data.csrfToken

        // Cache the token with a 10-minute expiry
        cachedCsrfToken = csrfToken
        tokenExpiryTime = Date.now() + 10 * 60 * 1000 // 10 minutes

        return csrfToken
      }
    } catch (fetchError) {
      if (fetchError.name === "AbortError") {
        console.error("CSRF token fetch timed out")
      } else {
        console.error("CSRF token fetch error:", fetchError)
      }

      // Continue to fallback
    }

    // Check again for the token in cookies as a fallback
    csrfToken = getCookie("csrf_token")
    if (csrfToken) {
      // Cache the token with a 10-minute expiry
      cachedCsrfToken = csrfToken
      tokenExpiryTime = Date.now() + 10 * 60 * 1000 // 10 minutes
    }

    return csrfToken || null
  } catch (error) {
    console.error("Failed to get CSRF token:", error)
    return null
  }
}

/**
 * Get the CSRF token from a cookie or cache
 * This is a synchronous function that returns the cached token or cookie value
 */
export function getCsrfToken(): string | null {
  // First check the cache
  if (cachedCsrfToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedCsrfToken
  }

  // Then check cookies
  const cookieToken = getCookie("csrf_token")

  // Update cache if token found in cookie
  if (cookieToken) {
    cachedCsrfToken = cookieToken
    tokenExpiryTime = Date.now() + 10 * 60 * 1000 // 10 minutes
  }

  return cookieToken || null
}

/**
 * Force refresh the CSRF token
 */
export async function refreshCsrfToken(): Promise<string | null> {
  // Clear the cache
  cachedCsrfToken = null
  tokenExpiryTime = null

  // Fetch a new token
  return ensureCsrfToken()
}
