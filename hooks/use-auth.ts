"use client"

import { useAuth as useAuthContext } from "@/lib/auth-context"
import { type Permission, RolePermissions } from "@/lib/auth/types"
import { UserRole } from "@/lib/auth/constants"
import { User } from "@/lib/auth-client"

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

// Helper function to normalize role case
const normalizeRole = (role: string | null | undefined): string | null => {
  if (!role) return null

  // Handle various formats of ADMIN role
  if (
    role.toUpperCase() === UserRole.ADMIN ||
    role === "0" || // Some systems use numeric role codes
    role === "admin" ||
    role === "Admin"
  ) {
    return UserRole.ADMIN
  }

  // Handle NODE_OFFICER role
  if (
    role.toUpperCase() === UserRole.NODE_OFFICER ||
    role === "1" || // Some systems use numeric role codes
    role === "node_officer" ||
    role === "NodeOfficer"
  ) {
    return UserRole.NODE_OFFICER
  }

  // Handle USER role
  if (
    role.toUpperCase() === UserRole.USER ||
    role === "2" || // Some systems use numeric role codes
    role === "user" ||
    role === "User"
  ) {
    return UserRole.USER
  }

  // Default to null for unrecognized roles
  return null
}

export function useAuth() {
  const auth = useAuthContext()

  // Define the can function outside to avoid self-reference issues
  const checkPermission = (permission: Permission): boolean => {
    const roleRaw = auth.session?.user?.role
    if (!roleRaw) return false

    // Normalize role case
    const role = normalizeRole(roleRaw)
    console.log(
      "Checking permission:",
      permission,
      "for role:",
      roleRaw,
      "normalized:",
      role
    )

    // Check if the user's role has the required permission
    if (role === UserRole.ADMIN) return true // Admin has all permissions

    const roleEnum =
      role === UserRole.NODE_OFFICER ? UserRole.NODE_OFFICER : UserRole.USER
    return RolePermissions[roleEnum].includes(permission)
  }

  const authUtils = {
    ...auth,
    // Expose properties from the auth context
    session: auth.session,
    user: auth.session?.user || null,
    isLoading: auth.status === "loading",
    isAuthenticated: auth.status === "authenticated",

    // Role-based helpers
    get userRole() {
      const role = auth.session?.user?.role
      const normalized = normalizeRole(role)
      console.log("[useAuth] userRole getter:", {
        original: role,
        normalized,
        isAdmin: normalized === UserRole.ADMIN,
      })
      return normalized
    },
    get isAdmin() {
      const role = auth.session?.user?.role
      const normalizedRole = normalizeRole(role)
      console.log("[useAuth] isAdmin getter:", {
        original: role,
        normalized: normalizedRole,
        isAdmin: normalizedRole === UserRole.ADMIN,
        adminRole: UserRole.ADMIN,
        comparison: `${normalizedRole} === ${UserRole.ADMIN}`,
      })
      return normalizedRole === UserRole.ADMIN
    },
    get isNodeOfficer() {
      const role = auth.session?.user?.role
      const normalizedRole = normalizeRole(role)
      return (
        normalizedRole === UserRole.NODE_OFFICER ||
        normalizedRole === UserRole.ADMIN
      )
    },
    get isUser() {
      const role = auth.session?.user?.role
      const normalizedRole = normalizeRole(role)
      return (
        normalizedRole === UserRole.USER ||
        normalizedRole === UserRole.NODE_OFFICER ||
        normalizedRole === UserRole.ADMIN
      )
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
    canAll: (permissions: Permission[]) => {
      if (!auth.session?.user?.role) return false
      return permissions.every((permission) => checkPermission(permission))
    },
    canAny: (permissions: Permission[]) => {
      if (!auth.session?.user?.role) return false
      return permissions.some((permission) => checkPermission(permission))
    },
  }

  return authUtils
}
