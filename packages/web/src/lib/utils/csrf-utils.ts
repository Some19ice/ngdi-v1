import { getCookie, setCookie } from "./cookie-utils"
import { getApiUrl } from "../api-config"

// Cache the CSRF token to avoid unnecessary requests
let cachedCsrfToken: string | null = null
let tokenExpiryTime: number | null = null
let fetchPromise: Promise<string | null> | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const FETCH_TIMEOUT = 8000 // 8 seconds timeout for fetch

/**
 * Ensure a CSRF token is available
 * Attempts to retrieve existing token or fetch a new one
 * Uses a singleton promise to prevent multiple simultaneous requests
 */
export async function ensureCsrfToken(): Promise<string | null> {
  try {
    // Check if we have a cached token that's still valid
    if (cachedCsrfToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
      return cachedCsrfToken
    }

    // Check if token already exists in cookies
    let csrfToken = getCookie("csrf_token")
    if (csrfToken) {
      // Cache the token
      cachedCsrfToken = csrfToken
      tokenExpiryTime = Date.now() + CACHE_DURATION
      return csrfToken
    }

    // If a fetch is already in progress, return that promise
    if (fetchPromise) {
      return fetchPromise
    }

    // If no token exists, fetch a new one with better error handling
    console.log("Fetching new CSRF token...")

    // In development mode, use a mock token to avoid API calls
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock CSRF token in development mode")
      const mockToken = "mock-csrf-token-" + Date.now()
      cachedCsrfToken = mockToken
      tokenExpiryTime = Date.now() + CACHE_DURATION
      setCookie("csrf_token", mockToken, {
        path: "/",
        maxAge: CACHE_DURATION / 1000,
      })
      fetchPromise = Promise.resolve(mockToken)
      return fetchPromise
    }

    // Create a new fetch promise and store it
    fetchPromise = (async () => {
      try {
        // Use a timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

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

          // Cache the token
          cachedCsrfToken = csrfToken
          tokenExpiryTime = Date.now() + CACHE_DURATION

          return csrfToken
        }

        return null
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          console.error("CSRF token fetch timed out")
        } else {
          console.error("CSRF token fetch error:", fetchError)
        }

        // Check again for the token in cookies as a fallback
        const fallbackToken = getCookie("csrf_token")
        if (fallbackToken) {
          // Cache the token
          cachedCsrfToken = fallbackToken
          tokenExpiryTime = Date.now() + CACHE_DURATION
          return fallbackToken
        }

        return null
      } finally {
        // Clear the fetch promise so future calls will try again
        fetchPromise = null
      }
    })()

    return fetchPromise
  } catch (error) {
    console.error("Failed to get CSRF token:", error)
    fetchPromise = null
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
    tokenExpiryTime = Date.now() + CACHE_DURATION
  }

  return cookieToken || null
}

/**
 * Force refresh the CSRF token
 * This is useful when a token might have been invalidated on the server
 */
export async function refreshCsrfToken(): Promise<string | null> {
  // Clear the cache and any pending fetch
  cachedCsrfToken = null
  tokenExpiryTime = null
  fetchPromise = null

  // Fetch a new token
  return ensureCsrfToken()
}

/**
 * Add CSRF token to request headers
 * @param headers Existing headers object
 * @returns Headers with CSRF token added
 */
export function addCsrfHeader(
  headers: Record<string, string> = {}
): Record<string, string> {
  const token = getCsrfToken()
  if (token) {
    return {
      ...headers,
      "X-CSRF-Token": token,
    }
  }
  return headers
}

/**
 * Check if a CSRF token is available
 * This is useful for determining if a form can be submitted
 */
export function hasCsrfToken(): boolean {
  return getCsrfToken() !== null
}
