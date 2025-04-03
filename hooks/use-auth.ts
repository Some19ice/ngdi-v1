"use client"

/**
 * @deprecated Please use useAuthSession from @/hooks/use-auth-session instead.
 * This hook is maintained for backward compatibility.
 * 
 * MIGRATION NOTICE:
 * This hook will be removed in a future version.
 * Please update your imports to use useAuthSession from @/hooks/use-auth-session.
 */

import { useAuthSession } from "./use-auth-session"
import { UserRole } from "@/lib/auth/constants"

// Define the session type
export interface UserSession {
  id: string
  user_id: string
  created_at: string
  updated_at?: string
  last_sign_in_at: string
  ip_address?: string
  user_agent?: string
  location?: string
  device_info?: {
    browser: string
    os: string
    device: string
  }
  is_current?: boolean
}

// Define the getSessions result type
export interface GetSessionsResult {
  sessions: UserSession[]
  error: Error | null
}

export function useAuth() {
  console.warn(
    "useAuth is deprecated and will be removed in a future version. " +
    "Please use useAuthSession from @/hooks/use-auth-session instead."
  )
  
  // Use the new hook directly
  const auth = useAuthSession()

  // Define the can function outside to avoid self-reference issues
  const checkPermission = (permission: string): boolean => {
    const role = auth.session?.user?.role
    if (!role) return false

    // Admin has all permissions
    if (role === UserRole.ADMIN) return true

    // For simplicity, we're not implementing a full permission system here
    // In a real app, you would check if the user's role has the required permission
    return false
  }

  const authUtils = {
    ...auth,
    // Expose properties from the auth context
    session: auth.session,
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,

    // Role-based helpers
    get userRole() {
      return auth.user?.role || null
    },
    get isAdmin() {
      return auth.isAdmin
    },
    get isNodeOfficer() {
      return auth.isNodeOfficer
    },
    get isUser() {
      return !!auth.user
    },

    // Re-expose methods with renamed aliases for compatibility
    signOut: auth.logout,
    signOutFromDevice: auth.logout,
    signOutFromAllDevices: auth.logout,
    getSessions: async (): Promise<GetSessionsResult> => {
      // This is a placeholder implementation
      return {
        sessions: [],
        error: null,
      }
    },
    refreshSession: auth.refreshSession,

    // Permission checking methods
    can: checkPermission,
    canAll: (permissions: string[]) => {
      if (!auth.user?.role) return false
      return permissions.every((permission) => checkPermission(permission))
    },
    canAny: (permissions: string[]) => {
      if (!auth.user?.role) return false
      return permissions.some((permission) => checkPermission(permission))
    },
  }

  return authUtils
}
