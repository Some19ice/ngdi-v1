"use client"

import { useCallback } from "react"
import { useSession } from "next-auth/react"
import { type Permission, UserRole } from "@/lib/auth/types"
import { can, canAll, canAny, type User } from "@/lib/auth/rbac"

export function useAuth() {
  const { data: session, status, update } = useSession()
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
      ? {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.name || "",
          role: userRole,
          organization: session.user.organization || null,
          department: session.user.department || null,
          phone: session.user.phone || null,
          createdAt: session.user.createdAt || null,
          image: session.user.image || null,
        }
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

      // Create a User object that matches the RBAC User interface for permission checks
      const rbacUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        department: user.department,
        phone: user.phone,
        createdAt: user.createdAt?.toISOString() || null,
        image: user.image,
      }

      const hasPermission = can(rbacUser, permission)
      if (process.env.NODE_ENV === "development") {
        console.log("Permission check:", {
          user: rbacUser,
          permission,
          hasPermission,
        })
      }
      return hasPermission
    },
    [user, isLoading]
  )

  const checkAllPermissions = useCallback(
    (permissions: Permission[]) => {
      if (isLoading || !user) return false

      // Create a User object that matches the RBAC User interface for permission checks
      const rbacUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        department: user.department,
        phone: user.phone,
        createdAt: user.createdAt?.toISOString() || null,
        image: user.image,
      }

      return canAll(rbacUser, permissions)
    },
    [user, isLoading]
  )

  const checkAnyPermission = useCallback(
    (permissions: Permission[]) => {
      if (isLoading || !user) return false

      // Create a User object that matches the RBAC User interface for permission checks
      const rbacUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        department: user.department,
        phone: user.phone,
        createdAt: user.createdAt?.toISOString() || null,
        image: user.image,
      }

      return canAny(rbacUser, permissions)
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
    update,
  }
}
