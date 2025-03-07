"use client"

import { useCallback } from "react"
import { useSession } from "next-auth/react"
import { type Permission, UserRole } from "@/lib/auth/types"
import { can, canAll, canAny, type User } from "@/lib/auth/rbac"
import { useAuth as useSupabaseAuth } from "@/lib/auth/auth-context"

export function useAuth() {
  const { data: session, status, update } = useSession()
  const auth = useSupabaseAuth()
  const isLoading = status === "loading" || auth.isLoading

  // Use the userRole directly from the auth context
  const userRole = auth.userRole

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("Auth Status:", status)
    console.log("Session:", session)
    console.log("Supabase user:", auth.user)
    console.log("User role from context:", userRole)
    console.log("Valid roles:", Object.values(UserRole))
    console.log(
      "Role is valid:",
      userRole && Object.values(UserRole).includes(userRole)
    )
  }

  const user =
    !isLoading &&
    userRole &&
    auth.user &&
    Object.values(UserRole).includes(userRole)
      ? {
          id: auth.user.id,
          email: auth.user.email || "",
          name: auth.user.user_metadata?.name || "",
          role: userRole,
          organization: auth.user.user_metadata?.organization || null,
          department: auth.user.user_metadata?.department || null,
          phone: auth.user.user_metadata?.phone || null,
          createdAt: auth.user.user_metadata?.createdAt || null,
          image: auth.user.user_metadata?.avatar_url || null,
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
        createdAt: user.createdAt?.toString() || null,
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
        createdAt: user.createdAt?.toString() || null,
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
        createdAt: user.createdAt?.toString() || null,
        image: user.image,
      }

      return canAny(rbacUser, permissions)
    },
    [user, isLoading]
  )

  return {
    ...auth,
    user,
    userRole,
    isAdmin: userRole === UserRole.ADMIN,
    isNodeOfficer: userRole === UserRole.NODE_OFFICER,
    isUser: userRole === UserRole.USER,
    can: checkPermission,
    canAll: checkAllPermissions,
    canAny: checkAnyPermission,
    update,
  }
}
