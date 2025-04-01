import { z } from "@hono/zod-openapi"

/**
 * Authentication and authorization related types
 */
export enum UserRole {
  ADMIN = "ADMIN",
  NODE_OFFICER = "NODE_OFFICER",
  USER = "USER",
  GUEST = "GUEST",
}

/**
 * Basic user interface
 */
export interface User {
  id: string
  name?: string
  email: string
  role: UserRole
  image?: string
  organizationId?: string
}

/**
 * Simple permission definition
 */
export interface Permission {
  action: string
  subject: string
}

/**
 * Role inclusion hierarchy - which role includes permissions of other roles
 */
export const RoleIncludes: Record<UserRole, UserRole[]> = {
  [UserRole.ADMIN]: [],
  [UserRole.NODE_OFFICER]: [UserRole.USER],
  [UserRole.USER]: [],
  [UserRole.GUEST]: [],
}

/**
 * Basic permissions for each role
 */
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    { action: "create", subject: "metadata" },
    { action: "read", subject: "metadata" },
    { action: "update", subject: "metadata" },
    { action: "delete", subject: "metadata" },
    { action: "manage", subject: "metadata" },
    { action: "create", subject: "user" },
    { action: "read", subject: "user" },
    { action: "update", subject: "user" },
    { action: "delete", subject: "user" },
    { action: "read", subject: "system" },
  ],
  [UserRole.NODE_OFFICER]: [
    { action: "create", subject: "metadata" },
    { action: "read", subject: "metadata" },
    { action: "update", subject: "metadata" },
    { action: "manage", subject: "metadata" },
    { action: "read", subject: "user" },
    { action: "create", subject: "user" },
  ],
  [UserRole.USER]: [
    { action: "read", subject: "metadata" },
    { action: "create", subject: "metadata" },
  ],
  [UserRole.GUEST]: [{ action: "read", subject: "metadata" }],
}

/**
 * Authentication result interface
 */
export interface AuthResult {
  success: boolean
  message?: string
  user?: User
  token?: string
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}

/**
 * Password schema
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character")

/**
 * Login request schema
 */
export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address").openapi({
      example: "user@example.com",
      description: "User's email address",
    }),
    password: passwordSchema.openapi({
      example: "StrongP@ss123",
      description:
        "User's password - must contain uppercase, lowercase, number, and special character",
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
    password: passwordSchema.openapi({
      example: "StrongP@ss123",
      description:
        "User's password - must contain uppercase, lowercase, number, and special character",
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
 * Request password reset schema
 */
export const requestPasswordResetSchema = z
  .object({
    email: z.string().email().openapi({
      example: "user@example.com",
      description: "Email address to send password reset link to",
    }),
  })
  .openapi("RequestPasswordResetRequest")

export type RequestPasswordResetRequest = z.infer<
  typeof requestPasswordResetSchema
>

/**
 * Forgot password schema (alias for requestPasswordResetSchema)
 */
export const forgotPasswordSchema = requestPasswordResetSchema

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
