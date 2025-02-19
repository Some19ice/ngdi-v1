"use client"

import { useCallback } from "react"
import { useSession } from "next-auth/react"
import { type Permission, UserRole } from "@/lib/auth/types"
import { can, canAll, canAny, type User } from "@/lib/auth/rbac"

export function useAuth() {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  const userRole = session?.user?.role as UserRole | undefined

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("Auth Status:", status)
    console.log("Session:", session)
    console.log("User role:", userRole)
    console.log("Valid roles:", Object.values(UserRole))
    console.log(
      "Role is valid:",
      userRole && Object.values(UserRole).includes(userRole)
    )
  }

  const user =
    !isLoading &&
    userRole &&
    session?.user &&
    Object.values(UserRole).includes(userRole)
      ? ({
          id: session.user.id,
          email: session.user.email || "",
          role: userRole,
          organizationId: session.user.organization || null,
        } as User)
      : null

  const checkPermission = useCallback(
    (permission: Permission) => {
      if (isLoading || !user) {
        if (process.env.NODE_ENV === "development") {
          console.log("Permission check failed:", {
            isLoading,
            hasUser: !!user,
            permission,
          })
        }
        return false
      }
      const hasPermission = can(user, permission)
      if (process.env.NODE_ENV === "development") {
        console.log("Permission check:", { user, permission, hasPermission })
      }
      return hasPermission
    },
    [user, isLoading]
  )

  const checkAllPermissions = useCallback(
    (permissions: Permission[]) => {
      if (isLoading || !user) return false
      return canAll(user, permissions)
    },
    [user, isLoading]
  )

  const checkAnyPermission = useCallback(
    (permissions: Permission[]) => {
      if (isLoading || !user) return false
      return canAny(user, permissions)
    },
    [user, isLoading]
  )

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    can: checkPermission,
    canAll: checkAllPermissions,
    canAny: checkAnyPermission,
  }
}
