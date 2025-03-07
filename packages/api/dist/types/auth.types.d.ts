import { z } from "zod";
/**
 * User roles enum
 */
export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
    NODE_OFFICER = "NODE_OFFICER"
}
/**
 * Login request schema
 */
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginRequest = z.infer<typeof loginSchema>;
/**
 * Registration request schema
 */
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    organization: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    organization?: string | undefined;
    department?: string | undefined;
    phone?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    organization?: string | undefined;
    department?: string | undefined;
    phone?: string | undefined;
}>;
export type RegisterRequest = z.infer<typeof registerSchema>;
/**
 * Password reset request schema
 */
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
/**
 * Reset password schema
 */
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
/**
 * Change password schema
 */
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
/**
 * Refresh token schema
 */
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
/**
 * Email verification schema
 */
export declare const verifyEmailSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;
/**
 * Auth response
 */
export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        organization?: string;
        department?: string;
    };
    accessToken: string;
    refreshToken: string;
}
