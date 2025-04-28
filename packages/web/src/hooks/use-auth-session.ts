"use client"

import { useSupabaseAuth } from "./use-supabase-auth"
import { UserRole } from "@/lib/auth/constants"
import { useRouter } from "next/navigation"

/**
 * Hook to access authentication session
 * This is a compatibility layer for the old useAuthSession hook
 * It uses the Supabase authentication under the hood
 */
export function useAuthSession() {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    logout: supabaseLogout,
  } = useSupabaseAuth()

  const router = useRouter()

  // Check if user has a specific role
  const hasRole = (role: string) => {
    if (!user) return false
    return user.user_metadata?.role === role
  }

  // Check if user is an admin
  const isAdmin = hasRole(UserRole.ADMIN)

  // Check if user is a node officer
  const isNodeOfficer = hasRole(UserRole.NODE_OFFICER)

  // Refresh session function (compatibility with old API)
  const refreshSession = async () => {
    // This is a no-op function since Supabase handles session refresh automatically
    // But we keep it for compatibility with existing code
    console.log("Session refresh requested (handled by Supabase middleware)")
    return { user, session }
  }

  // Logout function
  const logout = async () => {
    await supabaseLogout()
    router.refresh()
  }

  // Navigation helper
  const navigate = (path: string) => {
    router.push(path)
  }

  // Create a login function that matches the expected format in auth-form.tsx
  const loginWrapper = async ({
    email,
    password,
    rememberMe = false,
  }: {
    email: string
    password: string
    rememberMe?: boolean
  }) => {
    console.log("Login wrapper called with:", {
      email,
      password: "***REDACTED***",
      rememberMe,
    })
    try {
      // Make sure we're passing the parameters in the correct format
      return await login(email, password, rememberMe)
    } catch (error) {
      console.error("Login error in wrapper:", error)
      throw error
    }
  }

  return {
    user,
    session,
    status: isAuthenticated
      ? "authenticated"
      : isLoading
        ? "loading"
        : "unauthenticated",
    isLoading,
    hasRole,
    isAdmin,
    isNodeOfficer,
    refreshSession,
    logout,
    navigate,
    login: loginWrapper,
    isLoggingIn: false, // Add this for compatibility
    isAuthenticated, // Add this for compatibility
  }
}

export default useAuthSession
