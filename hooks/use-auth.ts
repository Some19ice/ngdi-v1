"use client"

import { useCallback } from "react"
import { type Permission } from "@/lib/auth/types"
import { can, canAll, canAny, type User } from "@/lib/auth/rbac"

interface UseAuthProps {
  user: User | null
}

export function useAuth({ user }: UseAuthProps) {
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
