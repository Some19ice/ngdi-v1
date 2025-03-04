import {
  type Permission,
  RolePermissions,
  UserRole,
  type Action,
  type Subject,
} from "./types"

export interface User {
  id: string
  email: string
  name?: string | null
  role: UserRole
  organization?: string | null
  department?: string | null
  phone?: string | null
  createdAt?: string | null
  image?: string | null
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

export function can(
  user: User,
  permission: Permission,
  resource?: { userId?: string; organizationId?: string }
): boolean {
  try {
    // Check if user has the base permission
    const userPermissions = RolePermissions[user.role]
    if (!userPermissions) {
      console.warn(`No permissions found for role: ${user.role}`)
      return false
    }

    const hasPermission = userPermissions.some(
      (p) => p.action === permission.action && p.subject === permission.subject
    )

    if (!hasPermission) {
      return false
    }

    // Check resource-based conditions if they exist
    if (permission.conditions || resource) {
      // Admin bypass for resource checks
      if (user.role === UserRole.ADMIN) {
        return true
      }

      // Check organization-based access
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

      // Check user-based access
      if (permission.conditions?.userId || resource?.userId) {
        const targetUserId = permission.conditions?.userId || resource?.userId
        if (permission.conditions?.isOwner && targetUserId !== user.id) {
          return false
        }
      }
    }

    return true
  } catch (error) {
    console.error("Permission check failed:", {
      user,
      permission,
      resource,
      error,
    })
    return false
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

export function filterAuthorizedNavItems(
  user: User,
  items: any[],
  requiredPermission: Permission
) {
  return items.filter(() => can(user, requiredPermission))
}

// Higher-order function to protect API routes
export function withPermission(permission: Permission) {
  return function (user: User | null, handler: Function) {
    return async function (...args: any[]) {
      if (!user) {
        throw new PermissionError(
          { id: "", email: "", role: UserRole.USER },
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

// Helper to create a permission with conditions
export function createPermission(
  action: Action,
  subject: Subject,
  conditions?: Permission["conditions"]
): Permission {
  return { action, subject, conditions }
}
