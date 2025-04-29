"use client"

import { ReactNode } from "react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { PermissionEnum } from "@/lib/auth/auth-types"
import { UserRole } from "@/lib/auth/constants"

interface PermissionGateProps {
  /**
   * The children to render if the user has the required permissions
   */
  children: ReactNode

  /**
   * The permission to check
   */
  permission?: PermissionEnum

  /**
   * Multiple permissions to check (all must be granted)
   */
  permissions?: PermissionEnum[]

  /**
   * Multiple permissions to check (any can be granted)
   */
  anyPermission?: PermissionEnum[]

  /**
   * User ID of the resource owner (for ownership checks)
   */
  resourceUserId?: string

  /**
   * Render this content if the user doesn't have permission
   */
  fallback?: ReactNode
}

/**
 * A component that conditionally renders its children based on user permissions
 */
export function PermissionGate({
  children,
  permission,
  permissions,
  anyPermission,
  resourceUserId,
  fallback = null,
}: PermissionGateProps) {
  const { user, hasPermission, getUserPermissions } = useAuthSession()

  // Check for a single permission
  if (permission) {
    if (!hasPermission(permission)) {
      return <>{fallback}</>
    }
  }

  // Check for all permissions
  if (permissions && permissions.length > 0) {
    const hasAll = permissions.every((perm) => hasPermission(perm))
    if (!hasAll) {
      return <>{fallback}</>
    }
  }

  // Check for any permission
  if (anyPermission && anyPermission.length > 0) {
    const hasAny = anyPermission.some((perm) => hasPermission(perm))
    if (!hasAny) {
      return <>{fallback}</>
    }
  }

  // Check for resource ownership
  if (resourceUserId) {
    const isOwner = user?.id === resourceUserId
    const isAdmin = user?.role === UserRole.ADMIN
    if (!isOwner && !isAdmin) {
      return <>{fallback}</>
    }
  }

  // If all checks pass, render the children
  return <>{children}</>
}

/**
 * A component that only renders its children if the user is an admin
 */
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const { isAdmin } = useAuthSession()

  if (!isAdmin()) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * A component that only renders its children if the user is a node officer
 */
export function NodeOfficerOnly({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const { isNodeOfficer } = useAuthSession()

  if (!isNodeOfficer()) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
