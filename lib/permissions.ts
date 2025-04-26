import { Session } from "next-auth"

/**
 * Check if the user has a specific permission
 */
export function hasPermission(
  session: Session | null | undefined,
  action: string,
  subject: string
): boolean {
  if (!session || !session.user) {
    return false
  }

  // Admin users have all permissions
  if (session.user.role === "ADMIN") {
    return true
  }

  // Check user permissions
  const userPermissions = session.user.permissions || []
  return userPermissions.some(
    (p) => p.action === action && p.subject === subject
  )
}

/**
 * Check if the user has all of the specified permissions
 */
export function hasAllPermissions(
  session: Session | null | undefined,
  permissions: { action: string; subject: string }[]
): boolean {
  if (!session || !session.user) {
    return false
  }

  // Admin users have all permissions
  if (session.user.role === "ADMIN") {
    return true
  }

  // Check each permission
  return permissions.every((permission) =>
    hasPermission(session, permission.action, permission.subject)
  )
}

/**
 * Check if the user has any of the specified permissions
 */
export function hasAnyPermission(
  session: Session | null | undefined,
  permissions: { action: string; subject: string }[]
): boolean {
  if (!session || !session.user) {
    return false
  }

  // Admin users have all permissions
  if (session.user.role === "ADMIN") {
    return true
  }

  // Check each permission
  return permissions.some((permission) =>
    hasPermission(session, permission.action, permission.subject)
  )
}

/**
 * Check if the user can access their own resource
 */
export function canAccessOwnResource(
  session: Session | null | undefined,
  resourceUserId: string
): boolean {
  if (!session || !session.user) {
    return false
  }

  // Admin users can access any resource
  if (session.user.role === "ADMIN") {
    return true
  }

  // Check if the user is the owner
  return session.user.id === resourceUserId
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(
  session: Session | null | undefined
): { action: string; subject: string }[] {
  if (!session || !session.user) {
    return []
  }

  return session.user.permissions || []
}

/**
 * Check if the user has a specific role
 */
export function hasRole(
  session: Session | null | undefined,
  role: string
): boolean {
  if (!session || !session.user) {
    return false
  }

  return session.user.role === role || session.user.customRole === role
}

/**
 * Permission constants for the frontend
 */
export const PERMISSIONS = {
  // Metadata permissions
  METADATA_CREATE: { action: 'create', subject: 'metadata' },
  METADATA_READ: { action: 'read', subject: 'metadata' },
  METADATA_UPDATE: { action: 'update', subject: 'metadata' },
  METADATA_DELETE: { action: 'delete', subject: 'metadata' },
  METADATA_APPROVE: { action: 'approve', subject: 'metadata' },
  METADATA_REJECT: { action: 'reject', subject: 'metadata' },
  METADATA_PUBLISH: { action: 'publish', subject: 'metadata' },
  METADATA_UNPUBLISH: { action: 'unpublish', subject: 'metadata' },
  METADATA_SUBMIT_FOR_REVIEW: { action: 'submit-for-review', subject: 'metadata' },
  METADATA_VALIDATE: { action: 'validate', subject: 'metadata' },

  // User permissions
  USER_CREATE: { action: 'create', subject: 'user' },
  USER_READ: { action: 'read', subject: 'user' },
  USER_UPDATE: { action: 'update', subject: 'user' },
  USER_DELETE: { action: 'delete', subject: 'user' },

  // Dashboard permissions
  DASHBOARD_VIEW: { action: 'view', subject: 'dashboard' },
  DASHBOARD_ANALYTICS: { action: 'view', subject: 'analytics' },
  DASHBOARD_REPORTS: { action: 'view', subject: 'reports' },

  // System permissions
  SYSTEM_SETTINGS: { action: 'manage', subject: 'settings' },
  SYSTEM_LOGS: { action: 'view', subject: 'logs' }
}
