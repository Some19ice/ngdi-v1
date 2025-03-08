"use client"

import { createClient } from "@/lib/supabase-client"

/**
 * Check if localStorage is available in the current environment
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "supabase-storage-test"
    localStorage.setItem(testKey, "test")
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    console.error("LocalStorage not available:", e)
    return false
  }
}

/**
 * Set or remove remember me flag in localStorage
 */
export function setRememberMeFlag(value: boolean): void {
  if (!isLocalStorageAvailable()) return

  if (value) {
    localStorage.setItem("remember_me", "true")
  } else {
    localStorage.removeItem("remember_me")
  }
}

/**
 * Check if remember me flag is set
 */
export function hasRememberMeFlag(): boolean {
  if (!isLocalStorageAvailable()) return false
  return localStorage.getItem("remember_me") === "true"
}

/**
 * Set or remove manual sign-out flag in localStorage
 */
export function setManualSignOutFlag(value: boolean): void {
  if (!isLocalStorageAvailable()) return

  if (value) {
    localStorage.setItem("manual_signout", "true")
  } else {
    localStorage.removeItem("manual_signout")
  }
}

/**
 * Check if manual sign-out flag is set
 */
export function hasManualSignOutFlag(): boolean {
  if (!isLocalStorageAvailable()) return false
  return localStorage.getItem("manual_signout") === "true"
}

/**
 * Clear the manual sign-out flag (convenience function)
 */
export function clearManualSignOutFlag(): void {
  setManualSignOutFlag(false)
}

/**
 * Enforce session persistence on an existing session
 */
export async function enforceSessionPersistence(): Promise<boolean> {
  try {
    if (!isLocalStorageAvailable()) return false

    // Only enforce if remember me is set
    if (!hasRememberMeFlag()) return false

    console.log("Enforcing session persistence")
    const supabase = createClient()

    // Get the current session
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session for persistence:", error)
      return false
    }

    if (!data.session) {
      console.log("No session found to enforce persistence")
      return false
    }

    // Update user metadata to enforce persistence
    console.log("Updating user metadata with persistence flags")
    const userResult = await supabase.auth.updateUser({
      data: {
        persistent: true,
        remember_me: true,
      },
    })

    if (userResult.error) {
      console.error("Error updating user for persistence:", userResult.error)
      return false
    }

    // Explicitly refresh the session to ensure token validity
    console.log("Refreshing session after setting persistence")
    try {
      const refreshResult = await supabase.auth.refreshSession()
      if (refreshResult.error) {
        console.error("Error refreshing session:", refreshResult.error)
      } else {
        console.log("Session successfully refreshed")
      }
    } catch (refreshError) {
      console.error("Exception during session refresh:", refreshError)
    }

    // Explicitly set the session to ensure persistence
    console.log("Setting session with tokens")
    const sessionResult = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    if (sessionResult.error) {
      console.error(
        "Error setting session for persistence:",
        sessionResult.error
      )
      return false
    }

    console.log("Session persistence successfully enforced")
    return true
  } catch (error) {
    console.error("Error enforcing session persistence:", error)
    return false
  }
}

/**
 * Ensure all session persistence flags are cleared
 */
export function clearAllSessionFlags(): void {
  if (!isLocalStorageAvailable()) return

  localStorage.removeItem("remember_me")
  localStorage.removeItem("manual_signout")

  // Clear any other auth-related localStorage items
  const authKeys = [
    "supabase.auth.token",
    "supabase.auth.refreshToken",
    "supabase.auth.expires",
    "supabase.auth.data",
  ]

  authKeys.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error(`Error removing ${key} from localStorage:`, e)
    }
  })
}

/**
 * Properly handles cleanup during sign-out
 * Sets the manual sign-out flag if remember me was enabled,
 * and clears any other session-related data for a clean state
 */
export async function handleSignOutCleanup(
  supabaseClient: any
): Promise<{ error: Error | null }> {
  try {
    console.log("Starting sign-out cleanup process")
    const wasRememberMeEnabled = hasRememberMeFlag()

    // If remember me was enabled, we need to set the manual sign-out flag
    // to prevent auto sign-in on future visits
    if (wasRememberMeEnabled) {
      console.log("Setting manual sign-out flag for remember me user")
      setManualSignOutFlag(true)
    } else {
      // If remember me wasn't enabled, just clear the flag to be safe
      clearManualSignOutFlag()
    }

    // Clear any additional session-related data except manual_signout
    // which we might have just set
    try {
      if (isLocalStorageAvailable()) {
        localStorage.removeItem("remember_me")

        // Also clear other potential auth data
        const authKeys = [
          "supabase.auth.token",
          "supabase.auth.refreshToken",
          "supabase.auth.user",
          "supabase.auth.expires",
          "supabase.auth.data",
          "sb:token",
          "sb-access-token",
          "sb-refresh-token",
        ]

        authKeys.forEach((key) => {
          try {
            localStorage.removeItem(key)
            console.log(`SignOut: Removed localStorage item: ${key}`)
          } catch (e) {
            console.error(`Error removing ${key} from localStorage:`, e)
          }
        })
      }

      // Clear sessionStorage for completeness
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.clear()
        console.log("SessionStorage cleared during signout")
      }
    } catch (error) {
      console.error("Error cleaning localStorage:", error)
    }

    // Call sign out on the Supabase client to clear auth state
    // Use a timeout to prevent hanging
    try {
      const signOutPromise = supabaseClient.auth.signOut({ scope: "local" })
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Signout operation timed out")), 5000)
      })

      await Promise.race([signOutPromise, timeoutPromise])
      console.log("Supabase signOut completed")
    } catch (err) {
      console.error("Error or timeout in Supabase signOut:", err)
      // Continue even if there's an error here
    }

    // Clear cookies
    if (typeof document !== "undefined") {
      // Clear specific auth cookies
      const cookiesToClear = [
        "sb-access-token",
        "sb-refresh-token",
        "supabase-auth-token",
      ]

      cookiesToClear.forEach((name) => {
        document.cookie = `${name}=; Max-Age=-1; path=/;`
        console.log(`SignOut: Cleared cookie: ${name}`)
      })

      // Handle Supabase project-specific cookies
      const cookies = document.cookie.split(";")
      for (const cookie of cookies) {
        const [name] = cookie.trim().split("=")
        if (
          name &&
          (name.includes("-auth-token") ||
            name.includes("supabase") ||
            name.includes("sb-"))
        ) {
          document.cookie = `${name}=; Max-Age=-1; path=/;`
          console.log(`SignOut: Cleared cookie: ${name}`)
        }
      }
    }

    console.log("Sign-out cleanup completed successfully")
    return { error: null }
  } catch (error) {
    console.error("Error during sign-out cleanup:", error)
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }
}
