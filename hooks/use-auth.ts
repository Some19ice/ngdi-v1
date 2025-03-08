"use client"

import { useAuth as useSupabaseAuth } from "@/lib/auth/auth-context"
import { type Permission } from "@/lib/auth/types"

export function useAuth() {
  const auth = useSupabaseAuth()

  return {
    ...auth,
    // Expose all properties from the Supabase auth context
    session: auth.session,
    user: auth.user,
    userRole: auth.userRole,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.userRole === "ADMIN",
    isNodeOfficer: auth.userRole === "NODE_OFFICER",
    isUser: auth.userRole === "USER",

    // Re-expose all methods
    signOut: auth.signOut,
    signOutFromDevice: auth.signOutFromDevice,
    signOutFromAllDevices: auth.signOutFromAllDevices,
    getSessions: auth.getSessions,
    refreshSession: auth.refreshSession,

    // Permission checking methods are already handled in the context
    can: auth.can,
    canAll: auth.canAll,
    canAny: auth.canAny,
  }
}
