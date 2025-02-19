export enum UserRole {
  ADMIN = "ADMIN",
  NODE_OFFICER = "NODE_OFFICER",
  USER = "USER",
}

export type Subject =
  | "metadata"
  | "user"
  | "role"
  | "organization"
  | "analytics"
  | "settings"

export type Action =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "validate"
  | "manage"
  | "view"
  | "assign"

export interface Permission {
  action: Action
  subject: Subject
  conditions?: {
    organizationId?: string
    userId?: string
    isOwner?: boolean
  }
}

export const Permissions = {
  // Metadata permissions
  CREATE_METADATA: { action: "create", subject: "metadata" } as const,
  READ_METADATA: { action: "read", subject: "metadata" } as const,
  UPDATE_METADATA: { action: "update", subject: "metadata" } as const,
  DELETE_METADATA: { action: "delete", subject: "metadata" } as const,
  VALIDATE_METADATA: { action: "validate", subject: "metadata" } as const,

  // User management permissions
  CREATE_USER: { action: "create", subject: "user" } as const,
  READ_USER: { action: "read", subject: "user" } as const,
  UPDATE_USER: { action: "update", subject: "user" } as const,
  DELETE_USER: { action: "delete", subject: "user" } as const,
  ASSIGN_ROLE: { action: "assign", subject: "role" } as const,

  // Organization permissions
  MANAGE_ORGANIZATION: { action: "manage", subject: "organization" } as const,
  READ_ORGANIZATION: { action: "read", subject: "organization" } as const,

  // System permissions
  VIEW_ANALYTICS: { action: "view", subject: "analytics" } as const,
  MANAGE_SETTINGS: { action: "manage", subject: "settings" } as const,
} as const

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admins have all permissions
    Permissions.CREATE_METADATA,
    Permissions.READ_METADATA,
    Permissions.UPDATE_METADATA,
    Permissions.DELETE_METADATA,
    Permissions.VALIDATE_METADATA,
    Permissions.CREATE_USER,
    Permissions.READ_USER,
    Permissions.UPDATE_USER,
    Permissions.DELETE_USER,
    Permissions.ASSIGN_ROLE,
    Permissions.MANAGE_ORGANIZATION,
    Permissions.READ_ORGANIZATION,
    Permissions.VIEW_ANALYTICS,
    Permissions.MANAGE_SETTINGS,
  ],
  [UserRole.NODE_OFFICER]: [
    // Node officers can manage metadata and view their organization
    Permissions.CREATE_METADATA,
    Permissions.READ_METADATA,
    Permissions.UPDATE_METADATA,
    Permissions.READ_USER,
    Permissions.READ_ORGANIZATION,
  ],
  [UserRole.USER]: [
    // Regular users can only read metadata
    Permissions.READ_METADATA,
    Permissions.READ_ORGANIZATION,
  ],
}
