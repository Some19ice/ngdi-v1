import { api } from "@/lib/api"
import {
  UserProfile,
  UserUpdateRequest,
  UserSearchParams,
  UserListResponse,
} from "@/types/user"
import { ApiResponse } from "@/types/api"

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<ApiResponse<UserProfile>>("/users/profile")
    return response.data.data
  },

  async updateProfile(data: UserUpdateRequest): Promise<UserProfile> {
    const response = await api.put<ApiResponse<UserProfile>>(
      "/users/profile",
      data
    )
    return response.data.data
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.post<ApiResponse<void>>("/users/change-password", {
      currentPassword,
      newPassword,
    })
  },

  async getAllUsers(params: UserSearchParams): Promise<UserListResponse> {
    const response = await api.get<ApiResponse<UserListResponse>>("/users", {
      params,
    })
    return response.data.data
  },

  async getUserById(id: string): Promise<UserProfile> {
    const response = await api.get<ApiResponse<UserProfile>>(`/users/${id}`)
    return response.data.data
  },

  async updateUserRole(id: string, role: string): Promise<UserProfile> {
    const response = await api.put<ApiResponse<UserProfile>>(
      `/users/${id}/role`,
      { role }
    )
    return response.data.data
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/users/${id}`)
  },
}
