import { z } from "zod"
import { UserRole } from "./auth.types"

/**
 * User profile schema
 */
export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  organization: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().url().optional(),
})

export type UserProfileRequest = z.infer<typeof userProfileSchema>

/**
 * User response
 */
export interface UserResponse {
  id: string
  name: string
  email: string
  role: UserRole
  organization?: string
  department?: string
  phone?: string
  image?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

/**
 * User list query parameters
 */
export const userListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  sortBy: z
    .enum(["name", "email", "role", "createdAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export type UserListQuery = z.infer<typeof userListQuerySchema>

/**
 * User list response
 */
export interface UserListResponse {
  users: UserResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Update user role schema
 */
export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
})

export type UpdateUserRoleRequest = z.infer<typeof updateUserRoleSchema>
