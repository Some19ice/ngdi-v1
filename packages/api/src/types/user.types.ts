import { z } from "@hono/zod-openapi"
import { UserRole } from "./auth.types"

/**
 * User profile schema
 */
export const userProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").openapi({
      example: "John Doe",
      description: "User's full name",
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
    image: z.string().url().optional().openapi({
      example: "https://example.com/avatar.jpg",
      description: "User's profile image URL",
    }),
  })
  .openapi("UserProfile")

export type UserProfileRequest = z.infer<typeof userProfileSchema>

/**
 * User ID parameter schema
 */
export const UserIdParamSchema = z
  .object({
    id: z.string().uuid("Invalid user ID format").openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
      description: "User's unique identifier",
    }),
  })
  .openapi("UserIdParam")

export type UserIdParam = z.infer<typeof UserIdParamSchema>

/**
 * Update profile schema
 */
export const UpdateProfileSchema = userProfileSchema

/**
 * Change password schema
 */
export const ChangePasswordSchema = z
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
  .openapi("ChangePassword")

export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>

/**
 * User response schema
 */
export const userResponseSchema = z
  .object({
    id: z.string().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
      description: "User's unique identifier",
    }),
    name: z.string().openapi({
      example: "John Doe",
      description: "User's full name",
    }),
    email: z.string().email().openapi({
      example: "john@example.com",
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
    phone: z.string().optional().openapi({
      example: "+1234567890",
      description: "User's phone number",
    }),
    image: z.string().optional().openapi({
      example: "https://example.com/avatar.jpg",
      description: "User's profile image URL",
    }),
    emailVerified: z.boolean().openapi({
      example: true,
      description: "Whether the user's email is verified",
    }),
    createdAt: z.string().openapi({
      example: "2024-03-05T15:31:06.843Z",
      description: "When the user was created",
    }),
    updatedAt: z.string().openapi({
      example: "2024-03-05T15:31:06.843Z",
      description: "When the user was last updated",
    }),
  })
  .openapi("UserResponse")

export type UserResponse = z.infer<typeof userResponseSchema>

/**
 * User list query parameters
 */
export const userListQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .openapi({
        example: "1",
        description: "Page number",
      }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .openapi({
        example: "10",
        description: "Number of items per page",
      }),
    search: z.string().optional().openapi({
      example: "john",
      description: "Search term for name or email",
    }),
    role: z.nativeEnum(UserRole).optional().openapi({
      example: UserRole.USER,
      description: "Filter by user role",
    }),
    sortBy: z
      .enum(["name", "email", "role", "createdAt"])
      .optional()
      .default("createdAt")
      .openapi({
        example: "createdAt",
        description: "Field to sort by",
      }),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc").openapi({
      example: "desc",
      description: "Sort order",
    }),
  })
  .openapi("UserListQuery")

export type UserListQuery = z.infer<typeof userListQuerySchema>

/**
 * User search query
 */
export interface UserSearchQuery {
  page: number
  limit: number
  sortBy: "email" | "name" | "role" | "createdAt"
  sortOrder: "asc" | "desc"
  role?: UserRole
  search?: string
}

/**
 * User list response schema
 */
export const userListResponseSchema = z
  .object({
    users: z.array(userResponseSchema).openapi({
      description: "List of users",
    }),
    total: z.number().openapi({
      example: 100,
      description: "Total number of users",
    }),
    page: z.number().openapi({
      example: 1,
      description: "Current page number",
    }),
    limit: z.number().openapi({
      example: 10,
      description: "Number of items per page",
    }),
    totalPages: z.number().openapi({
      example: 10,
      description: "Total number of pages",
    }),
  })
  .openapi("UserListResponse")

export type UserListResponse = z.infer<typeof userListResponseSchema>

/**
 * User search response schema
 */
export const userSearchResponseSchema = userListResponseSchema

export type UserSearchResponse = z.infer<typeof userSearchResponseSchema>

/**
 * Update user role schema
 */
export const updateUserRoleSchema = z
  .object({
    role: z.nativeEnum(UserRole).openapi({
      example: UserRole.USER,
      description: "New role for the user",
    }),
  })
  .openapi("UpdateUserRole")

export type UpdateUserRoleRequest = z.infer<typeof updateUserRoleSchema>
