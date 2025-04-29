/**
 * Role-based type guards for authentication
 * This file provides strongly-typed role checking functions
 */

import { UserRole } from "./constants"
import { AuthUser, PermissionEnum } from "./auth-types"

/**
 * Type guard to check if a user has admin role
 * @param user The user to check
 * @returns True if the user has admin role
 */
export function isAdmin(user: AuthUser | null): user is AuthUser & { role: UserRole.ADMIN } {
  return !!user && user.role === UserRole.ADMIN
}

/**
 * Type guard to check if a user has node officer role
 * @param user The user to check
 * @returns True if the user has node officer role
 */
export function isNodeOfficer(user: AuthUser | null): user is AuthUser & { role: UserRole.NODE_OFFICER } {
  return !!user && user.role === UserRole.NODE_OFFICER
}

/**
 * Type guard to check if a user has regular user role
 * @param user The user to check
 * @returns True if the user has regular user role
 */
export function isRegularUser(user: AuthUser | null): user is AuthUser & { role: UserRole.USER } {
  return !!user && user.role === UserRole.USER
}

/**
 * Type guard to check if a user has any of the specified roles
 * @param user The user to check
 * @param roles The roles to check against
 * @returns True if the user has any of the specified roles
 */
export function hasAnyRole(user: AuthUser | null, roles: UserRole[]): user is AuthUser {
  return !!user && roles.includes(user.role)
}

/**
 * Type guard to check if a user has all of the specified roles
 * This is primarily useful when checking for a single role with type narrowing
 * @param user The user to check
 * @param roles The roles to check against
 * @returns True if the user has all of the specified roles
 */
export function hasAllRoles(user: AuthUser | null, roles: UserRole[]): user is AuthUser {
  return !!user && roles.every(role => user.role === role)
}

/**
 * Role permissions mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, PermissionEnum[]> = {
  [UserRole.ADMIN]: [
    // Admins have all permissions
    PermissionEnum.CREATE_METADATA,
    PermissionEnum.READ_METADATA,
    PermissionEnum.UPDATE_METADATA,
    PermissionEnum.DELETE_METADATA,
    PermissionEnum.READ_USER,
    PermissionEnum.UPDATE_USER,
    PermissionEnum.DELETE_USER,
    PermissionEnum.VIEW_ANALYTICS,
    PermissionEnum.MANAGE_ORGANIZATION,
    PermissionEnum.MANAGE_SETTINGS,
  ],
  [UserRole.NODE_OFFICER]: [
    // Node officers can manage metadata and view their organization
    PermissionEnum.CREATE_METADATA,
    PermissionEnum.READ_METADATA,
    PermissionEnum.UPDATE_METADATA,
    PermissionEnum.READ_USER,
  ],
  [UserRole.USER]: [
    // Regular users can only read metadata
    PermissionEnum.READ_METADATA,
  ],
}

/**
 * Check if a user has a specific permission
 * @param user The user to check
 * @param permission The permission to check
 * @returns True if the user has the permission
 */
export function hasPermission(user: AuthUser | null, permission: PermissionEnum): boolean {
  if (!user) return false
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  return userPermissions.includes(permission)
}

/**
 * Check if a user has all of the specified permissions
 * @param user The user to check
 * @param permissions The permissions to check
 * @returns True if the user has all of the specified permissions
 */
export function hasAllPermissions(user: AuthUser | null, permissions: PermissionEnum[]): boolean {
  if (!user) return false
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  return permissions.every(permission => userPermissions.includes(permission))
}

/**
 * Check if a user has any of the specified permissions
 * @param user The user to check
 * @param permissions The permissions to check
 * @returns True if the user has any of the specified permissions
 */
export function hasAnyPermission(user: AuthUser | null, permissions: PermissionEnum[]): boolean {
  if (!user) return false
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  return permissions.some(permission => userPermissions.includes(permission))
}

/**
 * Get all permissions for a user
 * @param user The user to get permissions for
 * @returns Array of permissions the user has
 */
export function getUserPermissions(user: AuthUser | null): PermissionEnum[] {
  if (!user) return []
  
  return ROLE_PERMISSIONS[user.role] || []
}
