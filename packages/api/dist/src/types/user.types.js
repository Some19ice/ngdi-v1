"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRoleSchema = exports.userSearchResponseSchema = exports.userListResponseSchema = exports.userListQuerySchema = exports.userResponseSchema = exports.ChangePasswordSchema = exports.UpdateProfileSchema = exports.UserIdParamSchema = exports.userProfileSchema = void 0;
const zod_openapi_1 = require("@hono/zod-openapi");
const auth_types_1 = require("./auth.types");
/**
 * User profile schema
 */
exports.userProfileSchema = zod_openapi_1.z
    .object({
    name: zod_openapi_1.z.string().min(2, "Name must be at least 2 characters").openapi({
        example: "John Doe",
        description: "User's full name",
    }),
    organization: zod_openapi_1.z.string().optional().openapi({
        example: "ACME Corp",
        description: "User's organization",
    }),
    department: zod_openapi_1.z.string().optional().openapi({
        example: "Engineering",
        description: "User's department",
    }),
    phone: zod_openapi_1.z.string().optional().openapi({
        example: "+1234567890",
        description: "User's phone number",
    }),
    image: zod_openapi_1.z.string().url().optional().openapi({
        example: "https://example.com/avatar.jpg",
        description: "User's profile image URL",
    }),
})
    .openapi("UserProfile");
/**
 * User ID parameter schema
 */
exports.UserIdParamSchema = zod_openapi_1.z
    .object({
    id: zod_openapi_1.z.string().uuid("Invalid user ID format").openapi({
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "User's unique identifier",
    }),
})
    .openapi("UserIdParam");
/**
 * Update profile schema
 */
exports.UpdateProfileSchema = exports.userProfileSchema;
/**
 * Change password schema
 */
exports.ChangePasswordSchema = zod_openapi_1.z
    .object({
    currentPassword: zod_openapi_1.z.string().openapi({
        example: "oldpassword123",
        description: "Current password",
    }),
    newPassword: zod_openapi_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .openapi({
        example: "newpassword123",
        description: "New password",
    }),
})
    .openapi("ChangePassword");
/**
 * User response schema
 */
exports.userResponseSchema = zod_openapi_1.z
    .object({
    id: zod_openapi_1.z.string().openapi({
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "User's unique identifier",
    }),
    name: zod_openapi_1.z.string().openapi({
        example: "John Doe",
        description: "User's full name",
    }),
    email: zod_openapi_1.z.string().email().openapi({
        example: "john@example.com",
        description: "User's email address",
    }),
    role: zod_openapi_1.z.nativeEnum(auth_types_1.UserRole).openapi({
        example: auth_types_1.UserRole.USER,
        description: "User's role",
    }),
    organization: zod_openapi_1.z.string().optional().openapi({
        example: "ACME Corp",
        description: "User's organization",
    }),
    department: zod_openapi_1.z.string().optional().openapi({
        example: "Engineering",
        description: "User's department",
    }),
    phone: zod_openapi_1.z.string().optional().openapi({
        example: "+1234567890",
        description: "User's phone number",
    }),
    image: zod_openapi_1.z.string().optional().openapi({
        example: "https://example.com/avatar.jpg",
        description: "User's profile image URL",
    }),
    emailVerified: zod_openapi_1.z.boolean().openapi({
        example: true,
        description: "Whether the user's email is verified",
    }),
    createdAt: zod_openapi_1.z.string().openapi({
        example: "2024-03-05T15:31:06.843Z",
        description: "When the user was created",
    }),
    updatedAt: zod_openapi_1.z.string().openapi({
        example: "2024-03-05T15:31:06.843Z",
        description: "When the user was last updated",
    }),
})
    .openapi("UserResponse");
/**
 * User list query parameters
 */
exports.userListQuerySchema = zod_openapi_1.z
    .object({
    page: zod_openapi_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .openapi({
        example: "1",
        description: "Page number",
    }),
    limit: zod_openapi_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .openapi({
        example: "10",
        description: "Number of items per page",
    }),
    search: zod_openapi_1.z.string().optional().openapi({
        example: "john",
        description: "Search term for name or email",
    }),
    role: zod_openapi_1.z.nativeEnum(auth_types_1.UserRole).optional().openapi({
        example: auth_types_1.UserRole.USER,
        description: "Filter by user role",
    }),
    sortBy: zod_openapi_1.z
        .enum(["name", "email", "role", "createdAt"])
        .optional()
        .default("createdAt")
        .openapi({
        example: "createdAt",
        description: "Field to sort by",
    }),
    sortOrder: zod_openapi_1.z.enum(["asc", "desc"]).optional().default("desc").openapi({
        example: "desc",
        description: "Sort order",
    }),
})
    .openapi("UserListQuery");
/**
 * User list response schema
 */
exports.userListResponseSchema = zod_openapi_1.z
    .object({
    users: zod_openapi_1.z.array(exports.userResponseSchema).openapi({
        description: "List of users",
    }),
    total: zod_openapi_1.z.number().openapi({
        example: 100,
        description: "Total number of users",
    }),
    page: zod_openapi_1.z.number().openapi({
        example: 1,
        description: "Current page number",
    }),
    limit: zod_openapi_1.z.number().openapi({
        example: 10,
        description: "Number of items per page",
    }),
    totalPages: zod_openapi_1.z.number().openapi({
        example: 10,
        description: "Total number of pages",
    }),
})
    .openapi("UserListResponse");
/**
 * User search response schema
 */
exports.userSearchResponseSchema = exports.userListResponseSchema;
/**
 * Update user role schema
 */
exports.updateUserRoleSchema = zod_openapi_1.z
    .object({
    role: zod_openapi_1.z.nativeEnum(auth_types_1.UserRole).openapi({
        example: auth_types_1.UserRole.USER,
        description: "New role for the user",
    }),
})
    .openapi("UpdateUserRole");
