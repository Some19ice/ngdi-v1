"use client"

import { useCallback } from "react"
import { useSession } from "next-auth/react"
import { type Permission, UserRole } from "@/lib/auth/types"
import { can, canAll, canAny, type User } from "@/lib/auth/rbac"

export function useAuth() {
  const { data: session } = useSession()
  const user = session?.user?.role
    ? ({
        id: session.user.id,
        email: session.user.email || "",
        role: session.user.role as UserRole,
        organizationId: session.user.organization || null,
      } as User)
    : null

  const checkPermission = useCallback(
    (permission: Permission) => {
      if (!user) return false
      return can(user, permission)
    },
    [user]
  )

  const checkAllPermissions = useCallback(
    (permissions: Permission[]) => {
      if (!user) return false
      return canAll(user, permissions)
    },
    [user]
  )

  const checkAnyPermission = useCallback(
    (permissions: Permission[]) => {
      if (!user) return false
      return canAny(user, permissions)
    },
    [user]
  )

  return {
    user,
    isAuthenticated: !!user,
    can: checkPermission,
    canAll: checkAllPermissions,
    canAny: checkAnyPermission,
  }
}
