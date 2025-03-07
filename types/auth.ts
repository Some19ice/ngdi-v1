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
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
