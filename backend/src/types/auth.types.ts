import { z } from "zod"

/**
 * User roles enum
 */
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  NODE_OFFICER = "NODE_OFFICER",
}

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type LoginRequest = z.infer<typeof loginSchema>

/**
 * Registration request schema
 */
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organization: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
})

export type RegisterRequest = z.infer<typeof registerSchema>

/**
 * Password reset request schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>

/**
 * Auth response
 */
export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    role: UserRole
    organization?: string
    department?: string
  }
  accessToken: string
  refreshToken: string
}
