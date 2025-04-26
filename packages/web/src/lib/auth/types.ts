import { UserRole } from "./constants"

export interface UserMetadata {
  name?: string
  role?: UserRole
  avatar_url?: string
  organization?: string | null
  department?: string | null
  phone?: string | null
  createdAt?: string | null
  emailVerified?: string | null
}

export interface AuthError {
  message: string
  code?: string
  status?: number
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

export enum Permission {
  READ_METADATA = "READ_METADATA",
  CREATE_METADATA = "CREATE_METADATA",
  UPDATE_METADATA = "UPDATE_METADATA",
  DELETE_METADATA = "DELETE_METADATA",
  READ_USER = "READ_USER",
  UPDATE_USER = "UPDATE_USER",
  DELETE_USER = "DELETE_USER",
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  MANAGE_ORGANIZATION = "MANAGE_ORGANIZATION",
  MANAGE_SETTINGS = "MANAGE_SETTINGS",
}

export const Permissions = {
  READ_METADATA: Permission.READ_METADATA,
  CREATE_METADATA: Permission.CREATE_METADATA,
  UPDATE_METADATA: Permission.UPDATE_METADATA,
  DELETE_METADATA: Permission.DELETE_METADATA,
  READ_USER: Permission.READ_USER,
  UPDATE_USER: Permission.UPDATE_USER,
  DELETE_USER: Permission.DELETE_USER,
  VIEW_ANALYTICS: Permission.VIEW_ANALYTICS,
  MANAGE_ORGANIZATION: Permission.MANAGE_ORGANIZATION,
  MANAGE_SETTINGS: Permission.MANAGE_SETTINGS,
} as const

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admins have all permissions
    Permissions.CREATE_METADATA,
    Permissions.READ_METADATA,
    Permissions.UPDATE_METADATA,
    Permissions.DELETE_METADATA,
    Permissions.READ_USER,
    Permissions.UPDATE_USER,
    Permissions.DELETE_USER,
    Permissions.VIEW_ANALYTICS,
    Permissions.MANAGE_ORGANIZATION,
    Permissions.MANAGE_SETTINGS,
  ],
  [UserRole.NODE_OFFICER]: [
    // Node officers can manage metadata and view their organization
    Permissions.CREATE_METADATA,
    Permissions.READ_METADATA,
    Permissions.UPDATE_METADATA,
    Permissions.READ_USER,
  ],
  [UserRole.USER]: [
    // Regular users can only read metadata
    Permissions.READ_METADATA,
  ],
}

export interface BaseUserData {
  id: string
  email: string
  name: string | null
  role: UserRole
  organization: string | null
  department: string | null
  phone: string | null
  createdAt: Date | null
  emailVerified: Date | null
  image: string | null
}

export interface AuthUser extends BaseUserData {
  password?: string | null
}

export interface UserSession {
  id: string
  user_id: string
  created_at: string
  last_sign_in_at: string
  device_info?: {
    browser: string
    os: string
    device: string
  }
  is_current?: boolean
}
