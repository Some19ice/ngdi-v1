/**
 * Authentication constants
 */

/**
 * User roles enum
 * IMPORTANT: Always use uppercase for role values for consistency across the application.
 * This is the single source of truth for role definitions.
 */
export enum UserRole {
  USER = "USER",
  NODE_OFFICER = "NODE_OFFICER",
  ADMIN = "ADMIN",
}

/**
 * Role display names for UI presentation
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.USER]: "User",
  [UserRole.NODE_OFFICER]: "Node Officer",
  [UserRole.ADMIN]: "Administrator",
}

/**
 * Helper function to normalize role strings
 * @param role Role string to normalize
 * @returns Normalized role or null if invalid
 */
export function normalizeRole(
  role: string | null | undefined
): UserRole | null {
  if (!role) return null

  // Convert to uppercase for consistent comparison
  const normalizedRole = role.toUpperCase()

  console.log("[normalizeRole] Processing role:", {
    input: role,
    normalized: normalizedRole,
    adminRole: UserRole.ADMIN,
    isAdmin: normalizedRole === UserRole.ADMIN,
  })

  // Check if the normalized role matches any of the UserRole enum values
  switch (normalizedRole) {
    case UserRole.ADMIN:
      return UserRole.ADMIN
    case UserRole.NODE_OFFICER:
      return UserRole.NODE_OFFICER
    case UserRole.USER:
      return UserRole.USER
    default:
      console.warn(`Invalid role: ${role}, normalized to: ${normalizedRole}`)
      return null
  }
}

/**
 * Check if a role is valid
 * @param role Role to validate
 * @returns Boolean indicating if role is valid
 */
export function isValidRole(role: string | null | undefined): boolean {
  if (!role) return false
  return Object.values(UserRole).includes(role.toUpperCase() as UserRole)
}

/**
 * Get display name for a role
 * @param role Role to get display name for
 * @returns User-friendly display name
 */
export function getRoleDisplayName(role: string | null | undefined): string {
  const normalizedRole = normalizeRole(role)
  if (!normalizedRole) return "Unknown Role"
  return ROLE_DISPLAY_NAMES[normalizedRole]
}
