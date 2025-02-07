export enum UserRole {
  ADMIN = "admin",
  NODE_OFFICER = "node_officer",
  USER = "user",
}

export interface Permission {
  action: string
  subject: string
}

export const Permissions = {
  // Metadata permissions
  CREATE_METADATA: { action: "create", subject: "metadata" },
  READ_METADATA: { action: "read", subject: "metadata" },
  UPDATE_METADATA: { action: "update", subject: "metadata" },
  DELETE_METADATA: { action: "delete", subject: "metadata" },
  VALIDATE_METADATA: { action: "validate", subject: "metadata" },

  // User management permissions
  CREATE_USER: { action: "create", subject: "user" },
  READ_USER: { action: "read", subject: "user" },
  UPDATE_USER: { action: "update", subject: "user" },
  DELETE_USER: { action: "delete", subject: "user" },
  ASSIGN_ROLE: { action: "assign", subject: "role" },

  // Organization permissions
  MANAGE_ORGANIZATION: { action: "manage", subject: "organization" },
  READ_ORGANIZATION: { action: "read", subject: "organization" },

  // System permissions
  VIEW_ANALYTICS: { action: "view", subject: "analytics" },
  MANAGE_SETTINGS: { action: "manage", subject: "settings" },
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
