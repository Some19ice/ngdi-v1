import { prisma } from "../lib/prisma"
import { User, UserRole, Prisma } from "@prisma/client"
import { HTTPException } from "hono/http-exception"
import { ApiError, ErrorCode } from "../middleware/error-handler"
import { comparePassword, hashPassword } from "../utils/password"
import {
  UserProfileRequest,
  UserResponse,
  UserListQuery,
  UserListResponse,
  UserSearchQuery,
} from "../types/user.types"
import {
  ChangePasswordRequest,
  UserRole as AppUserRole,
} from "../types/auth.types"
import {
  mapPrismaRoleToAppRole,
  mapAppRoleToPrismaRole,
} from "../utils/role-mapper"

interface UserUpdateInput {
  name?: string
  email?: string
  organization?: string
  department?: string
  phone?: string
}

interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: keyof User
  sortOrder?: "asc" | "desc"
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * User service
 */
export const userService = {
  /**
   * Get user profile
   */
  getProfile: async (userId: string): Promise<UserResponse> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new HTTPException(404, { message: "User not found" })
    }

    return {
      id: user.id,
      name: user.name || "",
      email: user.email,
      role: mapPrismaRoleToAppRole(user.role),
      organization: user.organization || undefined,
      department: user.department || undefined,
      phone: user.phone || undefined,
      image: user.image || undefined,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (
    userId: string,
    data: UserUpdateInput
  ): Promise<UserResponse> => {
    // Check if email is being updated and if it's already taken
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser && existingUser.id !== userId) {
        throw new HTTPException(400, { message: "Email already taken" })
      }
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
      })

      return {
        id: updatedUser.id,
        name: updatedUser.name || "",
        email: updatedUser.email,
        role: mapPrismaRoleToAppRole(updatedUser.role),
        organization: updatedUser.organization || undefined,
        department: updatedUser.department || undefined,
        phone: updatedUser.phone || undefined,
        image: updatedUser.image || undefined,
        emailVerified: !!updatedUser.emailVerified,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      }
    } catch (error) {
      throw new HTTPException(500, { message: "Failed to update user" })
    }
  },

  /**
   * Change user password
   */
  changePassword: async (
    userId: string,
    currentPassword: string,
    newPassword?: string
  ): Promise<void> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new HTTPException(404, { message: "User not found" })
    }

    // If newPassword is not provided, treat currentPassword as the new password
    // This is for admin reset functionality
    if (!newPassword) {
      const hashedPassword = await hashPassword(currentPassword)
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })
      return
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    )

    if (!isPasswordValid) {
      throw new HTTPException(400, { message: "Current password is incorrect" })
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
  },

  /**
   * Get all users
   */
  getAllUsers: async (query: UserSearchQuery): Promise<UserListResponse> => {
    const {
      page = 1,
      limit = 10,
      search = "",
      role,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query

    const where: Prisma.UserWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        role ? { role: mapAppRoleToPrismaRole(role as AppUserRole) } : {},
      ],
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: mapPrismaRoleToAppRole(user.role),
        emailVerified: user.emailVerified !== null,
        organization: user.organization || "",
        department: user.department || undefined,
        phone: user.phone || undefined,
        image: user.image || undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<UserResponse> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new HTTPException(404, { message: "User not found" })
    }

    return {
      id: user.id,
      name: user.name || "",
      email: user.email,
      role: mapPrismaRoleToAppRole(user.role),
      organization: user.organization || undefined,
      department: user.department || undefined,
      phone: user.phone || undefined,
      image: user.image || undefined,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }
  },

  /**
   * Update user role
   */
  updateUserRole: async (
    userId: string,
    role: AppUserRole
  ): Promise<UserResponse> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new HTTPException(404, { message: "User not found" })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: mapAppRoleToPrismaRole(role),
      },
    })

    return {
      id: updatedUser.id,
      name: updatedUser.name || "",
      email: updatedUser.email,
      role: mapPrismaRoleToAppRole(updatedUser.role),
      organization: updatedUser.organization || undefined,
      department: updatedUser.department || undefined,
      phone: updatedUser.phone || undefined,
      image: updatedUser.image || undefined,
      emailVerified: !!updatedUser.emailVerified,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    }
  },

  /**
   * Delete user (admin only)
   */
  deleteUser: async (userId: string): Promise<void> => {
    try {
      await prisma.user.delete({
        where: { id: userId },
      })
    } catch (error) {
      throw new HTTPException(500, { message: "Failed to delete user" })
    }
  },
}
