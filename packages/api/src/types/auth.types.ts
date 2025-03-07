import { z } from "@hono/zod-openapi"

/**
 * User roles enum
 */
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  NODE_OFFICER = "NODE_OFFICER",
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

export interface DynamicCondition {
  evaluate: (user: User, resource: any) => boolean
  description: string
}

export interface Permission {
  action: Action
  subject: Subject
  conditions?: {
    organizationId?: string
    userId?: string
    isOwner?: boolean
    dynamic?: DynamicCondition
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

export const PermissionGroups = {
  METADATA_MANAGEMENT: [
    Permissions.CREATE_METADATA,
    Permissions.READ_METADATA,
    Permissions.UPDATE_METADATA,
    Permissions.DELETE_METADATA,
    Permissions.VALIDATE_METADATA,
  ],
  USER_MANAGEMENT: [
    Permissions.CREATE_USER,
    Permissions.READ_USER,
    Permissions.UPDATE_USER,
    Permissions.DELETE_USER,
  ],
  ORGANIZATION_MANAGEMENT: [
    Permissions.MANAGE_ORGANIZATION,
    Permissions.READ_ORGANIZATION,
  ],
  SYSTEM_MANAGEMENT: [Permissions.VIEW_ANALYTICS, Permissions.MANAGE_SETTINGS],
} as const

export const InheritedPermissions: Record<UserRole, UserRole[]> = {
  [UserRole.ADMIN]: [],
  [UserRole.NODE_OFFICER]: [UserRole.USER],
  [UserRole.USER]: [],
}

// Helper function to get all inherited permissions for a role
export function getAllPermissionsForRole(role: UserRole): Permission[] {
  const inheritedRoles = InheritedPermissions[role]
  const inheritedPermissions = inheritedRoles.flatMap((r) => RolePermissions[r])
  return [...RolePermissions[role], ...inheritedPermissions]
}

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [...Object.values(PermissionGroups).flat()],
  [UserRole.NODE_OFFICER]: [
    ...PermissionGroups.METADATA_MANAGEMENT,
    {
      ...Permissions.READ_USER,
      conditions: {
        organizationId: "${user.organization}",
        dynamic: {
          evaluate: (user, resource) =>
            user.organization === resource.organization,
          description: "Check if user belongs to the same organization",
        },
      },
    },
    {
      ...Permissions.UPDATE_USER,
      conditions: { organizationId: "${user.organization}" },
    },
    {
      ...Permissions.READ_ORGANIZATION,
      conditions: { organizationId: "${user.organization}" },
    },
    {
      ...Permissions.VIEW_ANALYTICS,
      conditions: { organizationId: "${user.organization}" },
    },
  ],
  [UserRole.USER]: [Permissions.READ_METADATA, Permissions.READ_ORGANIZATION],
}

/**
 * Login request schema
 */
export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address").openapi({
      example: "user@example.com",
      description: "User's email address",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .openapi({
        example: "password123",
        description: "User's password",
      }),
  })
  .openapi("LoginRequest")

export type LoginRequest = z.infer<typeof loginSchema>

/**
 * Registration request schema
 */
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").openapi({
      example: "John Doe",
      description: "User's full name",
    }),
    email: z.string().email("Invalid email address").openapi({
      example: "user@example.com",
      description: "User's email address",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .openapi({
        example: "password123",
        description: "User's password",
      }),
    organization: z.string().optional().openapi({
      example: "ACME Corp",
      description: "User's organization",
    }),
    department: z.string().optional().openapi({
      example: "Engineering",
      description: "User's department",
    }),
    phone: z.string().optional().openapi({
      example: "+1234567890",
      description: "User's phone number",
    }),
  })
  .openapi("RegisterRequest")

export type RegisterRequest = z.infer<typeof registerSchema>

/**
 * Password reset request schema
 */
export const forgotPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address").openapi({
      example: "user@example.com",
      description: "User's email address",
    }),
  })
  .openapi("ForgotPasswordRequest")

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().openapi({
      example: "reset-token-123",
      description: "Password reset token",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .openapi({
        example: "newpassword123",
        description: "New password",
      }),
  })
  .openapi("ResetPasswordRequest")

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().openapi({
      example: "oldpassword123",
      description: "Current password",
    }),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .openapi({
        example: "newpassword123",
        description: "New password",
      }),
  })
  .openapi("ChangePasswordRequest")

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z
  .object({
    refreshToken: z.string().openapi({
      example: "refresh-token-123",
      description: "Refresh token",
    }),
  })
  .openapi("RefreshTokenRequest")

export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>

/**
 * Email verification schema
 */
export const verifyEmailSchema = z
  .object({
    token: z.string().openapi({
      example: "verification-token-123",
      description: "Email verification token",
    }),
  })
  .openapi("VerifyEmailRequest")

export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>

/**
 * Auth response
 */
export const authResponseSchema = z
  .object({
    user: z.object({
      id: z.string().openapi({
        example: "user-123",
        description: "User ID",
      }),
      name: z.string().openapi({
        example: "John Doe",
        description: "User's full name",
      }),
      email: z.string().openapi({
        example: "user@example.com",
        description: "User's email address",
      }),
      role: z.nativeEnum(UserRole).openapi({
        example: UserRole.USER,
        description: "User's role",
      }),
      organization: z.string().optional().openapi({
        example: "ACME Corp",
        description: "User's organization",
      }),
      department: z.string().optional().openapi({
        example: "Engineering",
        description: "User's department",
      }),
    }),
    accessToken: z.string().openapi({
      example: "access-token-123",
      description: "JWT access token",
    }),
    refreshToken: z.string().openapi({
      example: "refresh-token-123",
      description: "JWT refresh token",
    }),
  })
  .openapi("AuthResponse")

export type AuthResponse = z.infer<typeof authResponseSchema>
