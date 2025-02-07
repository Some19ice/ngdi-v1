import { type Permission, RolePermissions, UserRole } from "./types"

export interface User {
  id: string
  email: string
  role: UserRole
  organizationId?: string
}

export function can(user: User, permission: Permission): boolean {
  const userPermissions = RolePermissions[user.role]
  return userPermissions.some(
    (p) => p.action === permission.action && p.subject === permission.subject
  )
}

export function canAll(user: User, permissions: Permission[]): boolean {
  return permissions.every((permission) => can(user, permission))
}

export function canAny(user: User, permissions: Permission[]): boolean {
  return permissions.some((permission) => can(user, permission))
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
        throw new Error("Unauthorized - User not authenticated")
      }

      if (!can(user, permission)) {
        throw new Error("Forbidden - Insufficient permissions")
      }

      return handler(...args)
    }
  }
}

// Helper to check if user can access their own resource or has admin rights
export function canAccessResource(user: User, resourceUserId: string): boolean {
  return user.role === UserRole.ADMIN || user.id === resourceUserId
}

// Helper to check if user can access organization resource
export function canAccessOrganizationResource(
  user: User,
  resourceOrganizationId: string
): boolean {
  return (
    user.role === UserRole.ADMIN ||
    (user.organizationId && user.organizationId === resourceOrganizationId)
  )
}
