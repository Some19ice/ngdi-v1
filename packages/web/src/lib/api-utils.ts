/**
 * Utility functions for API routes
 */

// Generic cache for JSON request bodies
const jsonCache = new WeakMap<Request, Promise<any>>()

// Specific cache for CSRF token requests
const csrfCache = new WeakMap<Request, Promise<any>>()

// Optional in-memory session cache with expiration
interface SessionCacheEntry {
  data: any
  expiresAt: number
}

// Configure the cache duration (in milliseconds)
const SESSION_CACHE_DURATION = 5 * 1000 // Reduced to 5 seconds for more frequent validation
const sessionCache = new Map<string, SessionCacheEntry>()

/**
 * Parse a request body as JSON, safely handling the case
 * where the body might be read multiple times.
 */
export async function safeParseJson<T = any>(req: Request): Promise<T> {
  if (!req.body) {
    return {} as T
  }

  try {
    // Check if we've already parsed this request body
    if (jsonCache.has(req)) {
      return jsonCache.get(req) as Promise<T>
    }

    // Clone the request to avoid body already read errors
    const clonedReq = req.clone()
    const jsonPromise = clonedReq.json().catch((error) => {
      console.error("Error parsing JSON request:", error)
      return {} as T
    })

    jsonCache.set(req, jsonPromise)
    return await jsonPromise
  } catch (error) {
    console.error("Error parsing request JSON:", error)
    return {} as T
  }
}

/**
 * Handle CSRF token verification safely
 */
export async function handleCsrf(
  req: Request
): Promise<{ csrfToken: string | null }> {
  if (!req.body) {
    return { csrfToken: null }
  }

  try {
    // Check if we've already handled this request
    if (csrfCache.has(req)) {
      return csrfCache.get(req) as Promise<{ csrfToken: string | null }>
    }

    // Clone the request to avoid body already read errors
    const clonedReq = req.clone()
    const csrfPromise = clonedReq.json().catch((error) => {
      console.error("Error parsing CSRF request:", error)
      return { csrfToken: null }
    })

    csrfCache.set(req, csrfPromise)
    return await csrfPromise
  } catch (error) {
    console.error("Error handling CSRF request:", error)
    return { csrfToken: null }
  }
}

/**
 * Cache session data with proper validation and error handling
 */
export async function getCachedSession<T>(
  userId: string,
  fetchSessionFn: () => Promise<T>
): Promise<T> {
  if (!userId) {
    console.warn("Attempted to cache session with no userId")
    return fetchSessionFn()
  }

  try {
    // Clean up expired entries
    const now = Date.now()
    Array.from(sessionCache.entries()).forEach(([key, entry]) => {
      if (entry.expiresAt < now) {
        sessionCache.delete(key)
      }
    })

    // Check for valid cached session
    const cached = sessionCache.get(userId)
    if (cached && cached.expiresAt > now && cached.data !== null) {
      // Validate cached data structure
      if (typeof cached.data === "object") {
        return cached.data as T
      }
    }

    // Fetch fresh data
    const freshData = await fetchSessionFn()

    // Validate fresh data before caching
    if (freshData === null || freshData === undefined) {
      console.warn("Received null/undefined session data for userId:", userId)
      return freshData
    }

    // Cache the validated result
    sessionCache.set(userId, {
      data: freshData,
      expiresAt: now + SESSION_CACHE_DURATION,
    })

    return freshData
  } catch (error) {
    console.error("Session cache error:", error)
    // On error, bypass cache and return fresh data
    return fetchSessionFn()
  }
}

// Helper to clear session cache for a user
export function clearSessionCache(userId: string): void {
  if (userId) {
    sessionCache.delete(userId)
  }
}

// Helper to validate session data structure
export function isValidSessionData(data: any): boolean {
  if (!data || typeof data !== "object") return false

  // Basic session structure validation
  const hasRequiredFields = "expires" in data
  const hasValidUser =
    !data.user || (typeof data.user === "object" && "id" in data.user)

  return hasRequiredFields && hasValidUser
}
