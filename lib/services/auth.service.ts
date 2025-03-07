import { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth"
import { UserProfile } from "@/types/user"
import { api } from "@/lib/api"
import { ApiResponse } from "@/types/api"

interface AuthApiResponse {
  user: UserProfile
  token: string
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthApiResponse>>(
      "/auth/login",
      data
    )
    return response.data.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthApiResponse>>(
      "/auth/register",
      data
    )
    return response.data.data
  },

  async verifyEmail(token: string): Promise<void> {
    await api.get<ApiResponse<void>>(`/auth/verify-email?token=${token}`)
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post<ApiResponse<void>>("/auth/request-password-reset", { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post<ApiResponse<void>>("/auth/reset-password", {
      token,
      password,
    })
  },

  async refreshToken(): Promise<string> {
    const response = await api.post<ApiResponse<{ token: string }>>(
      "/auth/refresh-token"
    )
    return response.data.data.token
  },

  async logout(): Promise<void> {
    await api.post<ApiResponse<void>>("/auth/logout")
  },
}
