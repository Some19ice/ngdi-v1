import { z } from "zod";
import { UserRole } from "./auth.types";
/**
 * User profile schema
 */
export declare const userProfileSchema: z.ZodObject<{
    name: z.ZodString;
    organization: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    organization?: string | undefined;
    department?: string | undefined;
    phone?: string | undefined;
    image?: string | undefined;
}, {
    name: string;
    organization?: string | undefined;
    department?: string | undefined;
    phone?: string | undefined;
    image?: string | undefined;
}>;
export type UserProfileRequest = z.infer<typeof userProfileSchema>;
/**
 * User ID parameter schema
 */
export declare const UserIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
/**
 * Update profile schema
 */
export declare const UpdateProfileSchema: z.ZodObject<{
    name: z.ZodString;
    organization: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    organization?: string | undefined;
    department?: string | undefined;
    phone?: string | undefined;
    image?: string | undefined;
}, {
    name: string;
    organization?: string | undefined;
    department?: string | undefined;
    phone?: string | undefined;
    image?: string | undefined;
}>;
/**
 * Change password schema
 */
export declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
/**
 * User response
 */
export interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    organization?: string;
    department?: string;
    phone?: string;
    image?: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}
/**
 * User list query parameters
 */
export declare const userListQuerySchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    search: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof UserRole>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["name", "email", "role", "createdAt"]>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "name" | "email" | "role" | "createdAt";
    sortOrder: "asc" | "desc";
    role?: UserRole | undefined;
    search?: string | undefined;
}, {
    role?: UserRole | undefined;
    search?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    sortBy?: "name" | "email" | "role" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
/**
 * User search query
 */
export interface UserSearchQuery {
    page: number;
    limit: number;
    sortBy: "email" | "name" | "role" | "createdAt";
    sortOrder: "asc" | "desc";
    role?: UserRole;
    search?: string;
}
/**
 * User list response
 */
export interface UserListResponse {
    users: UserResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
/**
 * User search response
 */
export type UserSearchResponse = UserListResponse;
/**
 * Update user role schema
 */
export declare const updateUserRoleSchema: z.ZodObject<{
    role: z.ZodNativeEnum<typeof UserRole>;
}, "strip", z.ZodTypeAny, {
    role: UserRole;
}, {
    role: UserRole;
}>;
export type UpdateUserRoleRequest = z.infer<typeof updateUserRoleSchema>;
