"use client"

import { redirect } from "next/navigation"
import { authClient } from "@/lib/auth-client"

/**
 * Checks if the user is authenticated and redirects to signin if not
 * @param redirectTo - The path to redirect to after successful authentication
 */
export async function requireAuth(redirectTo?: string): Promise<void> {
  const isAuthenticated = await authClient.isAuthenticated()

  if (!isAuthenticated) {
    const redirectPath = redirectTo ? `/auth/signin?from=${encodeURIComponent(redirectTo)}` : '/auth/signin'
    redirect(redirectPath)
  }
}

/**
 * Checks if the user is authenticated and returns the result
 */
export async function isAuthenticated(): Promise<boolean> {
  return await authClient.isAuthenticated()
}

/**
 * Gets the current user if authenticated
 */
export async function getCurrentUser() {
  const session = await authClient.getSession()
  return session?.user || null
}

/**
 * Redirects authenticated users away from auth pages
 * @param redirectTo - The path to redirect to if authenticated
 */
export async function redirectIfAuthenticated(redirectTo: string = '/'): Promise<void> {
  const isAuthenticated = await authClient.isAuthenticated()

  if (isAuthenticated) {
    redirect(redirectTo)
  }
}

/**
 * Checks the authentication status and returns diagnostic information
 */
export async function checkAuthStatus() {
  try {
    const session = await authClient.getSession()
    const isAuthenticated = await authClient.isAuthenticated()
    
    return {
      isAuthenticated,
      hasSession: !!session,
      hasUser: !!session?.user,
      hasValidRole: !!session?.user?.role,
      email: session?.user?.email,
      role: session?.user?.role,
      sessionExpiry: session?.expires,
      rememberMeEnabled: false, // Implement based on your auth system
      timestamp: new Date()
    }
  } catch (error) {
    console.error("Error checking auth status:", error)
    return {
      isAuthenticated: false,
      hasSession: false,
      hasUser: false,
      hasValidRole: false,
      rememberMeEnabled: false,
      timestamp: new Date()
    }
  }
}

/**
 * Resets the authentication state by logging out
 */
export async function resetAuthState() {
  try {
    await authClient.logout()
    return { success: true }
  } catch (error) {
    console.error("Error resetting auth state:", error)
    return { success: false, error }
  }
}

/**
 * Refreshes the authentication session
 */
export async function refreshAuthSession() {
  try {
    const tokens = await authClient.refreshToken()
    return { success: !!tokens }
  } catch (error) {
    console.error("Error refreshing auth session:", error)
    return { success: false, error }
  }
} 