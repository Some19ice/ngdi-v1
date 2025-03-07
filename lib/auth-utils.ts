import { supabase } from "./supabase"

/**
 * Check if the current session token is about to expire and refresh it if needed
 * @param expiryThreshold Time in milliseconds before expiry to trigger a refresh (default: 5 minutes)
 * @returns The current or refreshed session, or null if no session exists or refresh failed
 */
export async function refreshTokenIfNeeded(expiryThreshold = 5 * 60 * 1000) {
  try {
    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return null

    // Check if token is about to expire
    // If expires_at is not available, refresh the token to be safe
    if (!session.expires_at) {
      console.log("Token expiry time not available, refreshing to be safe")
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Failed to refresh token:", error)
        return null
      }

      return data.session
    }

    const expiresAt = session.expires_at * 1000 // Convert to milliseconds
    const isExpiringSoon = expiresAt - Date.now() < expiryThreshold

    if (isExpiringSoon) {
      console.log("Token is expiring soon, refreshing...")
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Failed to refresh token:", error)
        return null
      }

      console.log("Token refreshed successfully")
      return data.session
    }

    return session
  } catch (error) {
    console.error("Error in refreshTokenIfNeeded:", error)
    return null
  }
}

/**
 * Fetch data from an API with automatic token refresh and authentication
 * @param url The API endpoint URL
 * @param options Fetch options
 * @returns The fetch response
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    // Ensure token is fresh
    const session = await refreshTokenIfNeeded()

    if (!session) {
      throw new Error("No authenticated session")
    }

    // Add authorization header
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
    }

    // Make the API request
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 Unauthorized errors (token might be invalid despite being fresh)
    if (response.status === 401) {
      // Try to refresh the token one more time
      const refreshedSession = await supabase.auth.refreshSession()

      if (refreshedSession.error || !refreshedSession.data.session) {
        throw new Error("Session refresh failed after 401")
      }

      // Retry the request with the new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${refreshedSession.data.session.access_token}`,
        },
      })
    }

    return response
  } catch (error) {
    console.error("Error in fetchWithAuth:", error)
    throw error
  }
}

/**
 * Check if the user has the required role
 * @param requiredRoles Array of roles that are allowed
 * @returns Boolean indicating if the user has one of the required roles
 */
export async function hasRequiredRole(requiredRoles: string[]) {
  try {
    // Get the current user's role
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return false

    // Fetch the user's role from the database
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (error || !data) return false

    // Check if the user's role is in the required roles
    return requiredRoles.includes(data.role)
  } catch (error) {
    console.error("Error in hasRequiredRole:", error)
    return false
  }
}
