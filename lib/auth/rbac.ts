import {
  type Permission,
  RolePermissions,
  UserRole,
  type Action,
  type Subject,
  Permissions,
} from "./types"

// Define the Permission interface for RBAC
export interface PermissionObject {
  action: string
  subject: string
  conditions?: {
    [key: string]: any
  }
}

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
    public permission: Permission | PermissionObject,
    message: string
  ) {
    super(message)
    this.name = "PermissionError"
  }
}

// Convert a Permission enum value to a PermissionObject
function permissionToObject(permission: Permission): PermissionObject {
  const [action, subject] = permission.toString().toLowerCase().split("_")
  return { action, subject }
}

export function can(
  user: User,
  permission: Permission | PermissionObject,
  resource?: { userId?: string; organizationId?: string }
): boolean {
  // Admin role has all permissions
  if (user.role === UserRole.ADMIN) {
    return true
  }

  // Convert Permission enum to PermissionObject if needed
  const permObj = typeof permission === "object" 
    ? permission 
    : permissionToObject(permission)

  // Get permissions for the user's role
  const userPermissions = getRolePermissions(user.role)

  if (!userPermissions) {
    console.warn(`No permissions found for role: ${user.role}`)
    return false
  }

  const hasPermission = userPermissions.some(
    (p) => {
      const pObj = typeof p === "object" ? p : permissionToObject(p)
      return pObj.action === permObj.action && pObj.subject === permObj.subject
    }
  )

  if (!hasPermission) {
    return false
  }

  // Check resource-based permissions
  if (resource) {
    // Owner check - users can always access their own resources
    if (resource.userId && resource.userId === user.id) {
      return true
    }

    // Organization check - users can access resources from their organization
    if (
      resource.organizationId &&
      user.organization &&
      resource.organizationId === user.organization
    ) {
      // For organization resources, NODE_OFFICER can access all resources in their org
      if (user.role === UserRole.NODE_OFFICER) {
        return true
      }

      // Regular users might have additional restrictions based on the permission
      // This can be extended with more specific logic if needed
    }
  }

  return true
}

// Helper function to get permissions for a role
function getRolePermissions(role: UserRole): (Permission | PermissionObject)[] {
  // This could be loaded from a database or config file
  switch (role) {
    case UserRole.ADMIN:
      return [
        Permissions.READ_METADATA,
        Permissions.CREATE_METADATA,
        Permissions.UPDATE_METADATA,
        Permissions.DELETE_METADATA,
        Permissions.READ_USER,
        Permissions.UPDATE_USER,
        Permissions.DELETE_USER,
        Permissions.VIEW_ANALYTICS,
        Permissions.MANAGE_ORGANIZATION,
        Permissions.MANAGE_SETTINGS,
      ]
    case UserRole.NODE_OFFICER:
      return [
        Permissions.READ_METADATA,
        Permissions.CREATE_METADATA,
        Permissions.UPDATE_METADATA,
        Permissions.DELETE_METADATA,
        Permissions.READ_USER,
        Permissions.VIEW_ANALYTICS,
      ]
    case UserRole.USER:
      return [
        Permissions.READ_METADATA,
        Permissions.CREATE_METADATA,
        Permissions.UPDATE_METADATA,
      ]
    default:
      return []
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
  conditions?: PermissionObject["conditions"]
): PermissionObject {
  return { action, subject, conditions }
}
