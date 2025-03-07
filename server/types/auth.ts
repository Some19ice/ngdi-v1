import { User, UserRole } from "@prisma/client"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface UserResponse {
  id: string
  name: string
  email: string
  role: UserRole
  emailVerified: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: UserResponse
  token: string
}

export interface TokenPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}
