import { User, UserRole } from "@prisma/client"
import { Permission } from "../types/auth.types"

interface Resource {
  userId?: string
  organizationId?: string
}

interface PermissionConditions {
  userId?: string
  organizationId?: string
  isOwner?: boolean
  dynamic?: {
    evaluate: (user: User, resource?: Resource) => boolean
  }
}

interface PermissionWithConditions extends Permission {
  conditions?: PermissionConditions
}

export function getAllPermissionsForRole(
  role: string
): PermissionWithConditions[] {
  // Implementation here
  return []
}

export function can(
  user: User,
  permission: PermissionWithConditions,
  resource?: Resource
): boolean {
  // Check if user has permission
  const userPermissions = getAllPermissionsForRole(user.role)
  const hasPermission = userPermissions.some(
    (p) => p.action === permission.action && p.subject === permission.subject
  )

  if (!hasPermission) {
    return false
  }

  // Check conditions if they exist
  if (permission.conditions || resource) {
    // Check dynamic conditions first
    if (permission.conditions?.dynamic) {
      const dynamicResult = permission.conditions.dynamic.evaluate(
        user,
        resource
      )
      if (!dynamicResult) {
        return false
      }
    }

    // Check organization condition
    if (
      (permission.conditions?.organizationId || resource?.organizationId) &&
      user.organization
    ) {
      const targetOrgId =
        permission.conditions?.organizationId || resource?.organizationId
      if (targetOrgId !== user.organization) {
        return false
      }
    }

    // Check user ID condition
    if (permission.conditions?.userId || resource?.userId) {
      const targetUserId = permission.conditions?.userId || resource?.userId
      if (permission.conditions?.isOwner && targetUserId !== user.id) {
        return false
      }
    }
  }

  return true
}

export class PermissionError extends Error {
  constructor(
    public user: User,
    public permission: Permission,
    message: string
  ) {
    super(message)
    this.name = "PermissionError"
  }
}

// Audit log for permission checks
export function logPermissionCheck(
  user: User,
  permission: Permission,
  resource: any,
  result: boolean
): void {
  if (process.env.NODE_ENV === "development") {
    console.log("Permission check:", {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
      permission,
      resource,
      result,
      timestamp: new Date().toISOString(),
    })
  }
}

export function canAll(
  user: User,
  permissions: Permission[],
  resource?: { userId?: string; organizationId?: string }
): boolean {
  return permissions.every((permission) => can(user, permission, resource))
}

export function canAny(
  user: User,
  permissions: Permission[],
  resource?: { userId?: string; organizationId?: string }
): boolean {
  return permissions.some((permission) => can(user, permission, resource))
}

// Higher-order function to protect API routes
export function withPermission(permission: Permission) {
  return function (user: User | null, handler: Function) {
    return async function (...args: any[]) {
      if (!user) {
        throw new PermissionError(
          { id: "", email: "", role: UserRole.USER } as User,
          permission,
          "Unauthorized - User not authenticated"
        )
      }

      if (!can(user, permission)) {
        throw new PermissionError(
          user,
          permission,
          "Forbidden - Insufficient permissions"
        )
      }

      return handler(...args)
    }
  }
}

// Helper to check if user can access their own resource or has admin rights
export function canAccessResource(
  user: User,
  permission: Permission,
  resourceUserId: string
): boolean {
  return can(user, permission, { userId: resourceUserId })
}

// Helper to check if user can access organization resource
export function canAccessOrganizationResource(
  user: User,
  permission: Permission,
  resourceOrganizationId: string | null
): boolean {
  if (!resourceOrganizationId) return false
  return can(user, permission, { organizationId: resourceOrganizationId })
}
