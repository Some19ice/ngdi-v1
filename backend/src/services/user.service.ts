import { userRepository } from "../db/repositories/user.repository"
import { ApiError, ErrorCode } from "../middleware/error-handler"
import { comparePassword, hashPassword } from "../utils/password"
import {
  UserProfileRequest,
  UserResponse,
  UserListQuery,
  UserListResponse,
} from "../types/user.types"
import { ChangePasswordRequest } from "../types/auth.types"

/**
 * User service
 */
export const userService = {
  /**
   * Get user profile
   */
  getProfile: async (userId: string): Promise<UserResponse> => {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
    }

    return {
      id: user.id,
      name: user.name || "",
      email: user.email,
      role: user.role,
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
    data: UserProfileRequest
  ): Promise<UserResponse> => {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
    }

    const updatedUser = await userRepository.update(userId, data)

    return {
      id: updatedUser.id,
      name: updatedUser.name || "",
      email: updatedUser.email,
      role: updatedUser.role,
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
   * Change user password
   */
  changePassword: async (
    userId: string,
    data: ChangePasswordRequest
  ): Promise<void> => {
    const { currentPassword, newPassword } = data

    const user = await userRepository.findById(userId)

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    )

    if (!isPasswordValid) {
      throw new ApiError(
        "Current password is incorrect",
        400,
        ErrorCode.VALIDATION_ERROR
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await userRepository.update(userId, {
      password: hashedPassword,
    })
  },

  /**
   * Get all users (admin only)
   */
  getAllUsers: async (query: UserListQuery): Promise<UserListResponse> => {
    const result = await userRepository.findAll(query)

    return {
      users: result.users.map((user) => ({
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: user.role,
        organization: user.organization || undefined,
        department: user.department || undefined,
        phone: user.phone || undefined,
        image: user.image || undefined,
        emailVerified: !!user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    }
  },

  /**
   * Get user by ID (admin only)
   */
  getUserById: async (userId: string): Promise<UserResponse> => {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
    }

    return {
      id: user.id,
      name: user.name || "",
      email: user.email,
      role: user.role,
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
   * Update user role (admin only)
   */
  updateUserRole: async (
    userId: string,
    role: string
  ): Promise<UserResponse> => {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
    }

    const updatedUser = await userRepository.update(userId, { role })

    return {
      id: updatedUser.id,
      name: updatedUser.name || "",
      email: updatedUser.email,
      role: updatedUser.role,
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
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
    }

    await userRepository.delete(userId)
  },
}
