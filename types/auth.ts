import { UserProfile } from "./user"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: UserProfile
  token: string
  refreshToken: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface Session {
  user: UserProfile | null
  expires: string
  accessToken: string
  refreshToken: string
}
