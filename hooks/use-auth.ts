"use client"

import { useAuth as useAuthContext } from "@/lib/auth-context"
import { type Permission } from "@/lib/auth/types"
import { User } from "@/lib/auth-client"

export function useAuth() {
  const auth = useAuthContext()

  return {
    ...auth,
    // Expose properties from the auth context
    session: auth.session,
    user: auth.session?.user || null,
    isLoading: auth.status === "loading",
    isAuthenticated: auth.status === "authenticated",
    
    // Role-based helpers
    get userRole() {
      return auth.session?.user?.role || null
    },
    get isAdmin() {
      return auth.session?.user?.role === "admin"
    },
    get isNodeOfficer() {
      return auth.session?.user?.role === "node_officer"
    },
    get isUser() {
      return auth.session?.user?.role === "user"
    },

    // Re-expose methods with renamed aliases for compatibility
    signOut: auth.logout,
    signOutFromDevice: auth.logout,
    signOutFromAllDevices: auth.logout,
    getSessions: async () => [],
    refreshSession: auth.refreshSession,

    // Permission checking methods (stub implementations)
    can: (permission: Permission) => false,
    canAll: (permissions: Permission[]) => false,
    canAny: (permissions: Permission[]) => false,
  }
}
