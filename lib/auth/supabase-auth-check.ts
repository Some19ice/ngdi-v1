"use client"

import { createClient } from "@/lib/supabase-client"
import { hasRememberMeFlag } from "./session-utils"

/**
 * Utilities to verify Supabase authentication is working correctly
 */

/**
 * Check the current authentication status and log detailed diagnostics
 */
export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean
  hasSession: boolean
  hasUser: boolean
  hasValidRole: boolean
  email?: string | null
  role?: string | null
  sessionExpiry?: string | null
  rememberMeEnabled: boolean
}> {
  try {
    console.group("🔍 Supabase Auth Diagnostic Check")
    console.log("Running authentication status check...")

    const supabase = createClient()
    const rememberMeEnabled = hasRememberMeFlag()

    // Check for session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      console.groupEnd()
      return {
        isAuthenticated: false,
        hasSession: false,
        hasUser: false,
        hasValidRole: false,
        rememberMeEnabled,
      }
    }

    const hasSession = !!sessionData?.session
    console.log(`Session exists: ${hasSession}`)

    if (hasSession) {
      console.log(
        `Session expires at: ${new Date(
          sessionData.session.expires_at! * 1000
        ).toLocaleString()}`
      )
    }

    // Check for user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("User error:", userError)
      console.groupEnd()
      return {
        isAuthenticated: false,
        hasSession,
        hasUser: false,
        hasValidRole: false,
        rememberMeEnabled,
      }
    }

    const hasUser = !!userData?.user
    console.log(`User exists: ${hasUser}`)

    if (hasUser) {
      console.log(`User email: ${userData.user.email}`)
      console.log(`User metadata:`, userData.user.user_metadata)
    }

    // Check for role
    let role = null
    let hasValidRole = false

    if (hasUser) {
      try {
        const { data: roleData, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", userData.user.id)
          .single()

        if (roleError) {
          console.error("Role fetch error:", roleError)
        } else if (roleData) {
          role = roleData.role
          hasValidRole = !!role
          console.log(`User role: ${role}`)
        }
      } catch (e) {
        console.error("Error fetching role:", e)
      }
    }

    const isAuthenticated = hasSession && hasUser && hasValidRole
    console.log(
      `Overall authentication status: ${
        isAuthenticated ? "Authenticated ✅" : "Not authenticated ❌"
      }`
    )

    if (!isAuthenticated) {
      console.log("Authentication failed because:", {
        missingSession: !hasSession,
        missingUser: !hasUser,
        missingRole: !hasValidRole,
      })
    }

    console.log(`Remember me enabled: ${rememberMeEnabled}`)
    console.groupEnd()

    return {
      isAuthenticated,
      hasSession,
      hasUser,
      hasValidRole,
      email: userData?.user?.email,
      role,
      sessionExpiry: sessionData?.session
        ? new Date(sessionData.session.expires_at! * 1000).toLocaleString()
        : null,
      rememberMeEnabled,
    }
  } catch (e) {
    console.error("Error in checkAuthStatus:", e)
    console.groupEnd()
    return {
      isAuthenticated: false,
      hasSession: false,
      hasUser: false,
      hasValidRole: false,
      rememberMeEnabled: hasRememberMeFlag(),
    }
  }
}

/**
 * Reset the authentication state for testing
 */
export async function resetAuthState(): Promise<void> {
  try {
    console.group("🧹 Auth State Reset")
    console.log("Cleaning up authentication state...")

    const supabase = createClient()

    // Sign out from Supabase
    console.log("Signing out from Supabase...")
    await supabase.auth.signOut()

    // Clear localStorage
    if (typeof window !== "undefined") {
      console.log("Clearing localStorage auth items...")
      const authKeys = [
        "supabase.auth.token",
        "supabase.auth.refreshToken",
        "supabase.auth.user",
        "supabase.auth.expires",
        "supabase.auth.data",
        "sb:token",
        "sb-access-token",
        "sb-refresh-token",
        "manual_signout",
        "remember_me",
      ]

      authKeys.forEach((key) => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.error(`Error removing ${key}:`, e)
        }
      })
    }

    // Clear cookies
    if (typeof document !== "undefined") {
      console.log("Clearing auth cookies...")
      const cookiesToClear = [
        "sb-access-token",
        "sb-refresh-token",
        "supabase-auth-token",
      ]

      cookiesToClear.forEach((name) => {
        document.cookie = `${name}=; Max-Age=-1; path=/;`
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
        }
      }
    }

    console.log("Auth state reset complete")
    console.groupEnd()
  } catch (e) {
    console.error("Error resetting auth state:", e)
    console.groupEnd()
  }
}

/**
 * Attempt to refresh the session
 */
export async function refreshAuthSession(): Promise<boolean> {
  try {
    console.group("🔄 Auth Session Refresh")
    console.log("Attempting to refresh authentication session...")

    const supabase = createClient()

    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error("Session refresh error:", error)
      console.groupEnd()
      return false
    }

    const success = !!data.session

    if (success) {
      console.log("Session refreshed successfully!")
      console.log(
        `New expiry: ${new Date(
          data.session.expires_at! * 1000
        ).toLocaleString()}`
      )
    } else {
      console.log("No session returned after refresh attempt")
    }

    console.groupEnd()
    return success
  } catch (e) {
    console.error("Error refreshing session:", e)
    console.groupEnd()
    return false
  }
}
