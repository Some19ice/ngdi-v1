"use client"

import { ReactNode } from "react"
import { useSession } from "next-auth/react"
import { hasPermission, hasAllPermissions, hasAnyPermission, canAccessOwnResource } from "@/lib/permissions"

interface PermissionGateProps {
  /**
   * The children to render if the user has the required permissions
   */
  children: ReactNode

  /**
   * The action part of the permission (e.g., "create", "read", "update", "delete")
   */
  action?: string

  /**
   * The subject part of the permission (e.g., "metadata", "user", "dashboard")
   */
  subject?: string

  /**
   * Multiple permissions to check (all must be granted)
   */
  permissions?: { action: string; subject: string }[]

  /**
   * Multiple permissions to check (any can be granted)
   */
  anyPermission?: { action: string; subject: string }[]

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
  action,
  subject,
  permissions,
  anyPermission,
  resourceUserId,
  fallback = null
}: PermissionGateProps) {
  const { data: session } = useSession()

  // Check for a single permission
  if (action && subject) {
    if (!hasPermission(session, action, subject)) {
      return <>{fallback}</>
    }
  }

  // Check for all permissions
  if (permissions && permissions.length > 0) {
    if (!hasAllPermissions(session, permissions)) {
      return <>{fallback}</>
    }
  }

  // Check for any permission
  if (anyPermission && anyPermission.length > 0) {
    if (!hasAnyPermission(session, anyPermission)) {
      return <>{fallback}</>
    }
  }

  // Check for resource ownership
  if (resourceUserId) {
    if (!canAccessOwnResource(session, resourceUserId)) {
      return <>{fallback}</>
    }
  }

  // If all checks pass, render the children
  return <>{children}</>
}

/**
 * A component that only renders its children if the user is an admin
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { data: session } = useSession()

  if (!session?.user || session.user.role !== "ADMIN") {
    return <>{fallback}</>
  }

  return <>{children}</>
}
