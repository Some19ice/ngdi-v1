import { UserRole } from "./constants"

export interface BaseAuthFields {
  id: string
  email: string // Required by NextAuth
  name: string // Required by NextAuth
  role: UserRole
  organization: string | null
  department: string | null
  phone: string | null
  createdAt: Date | null
  emailVerified: Date | null
}

export interface SessionUser extends BaseAuthFields {
  image: string | null
  accessToken: string | null
  deviceId: string | null
}

export interface AuthUser {
  id: string
  email: string // Required by NextAuth
  name: string // Required by NextAuth
  role: UserRole
  organization: string | null
  department: string | null
  phone: string | null
  createdAt: Date | null
  emailVerified: Date | null
  image: string | null
}

export interface AuthToken extends Omit<BaseAuthFields, "name"> {
  name: string | null // Allow null for token
  picture: string | null
  accessToken: string | null
  refreshToken: string | null
  accessTokenExpires: number
  deviceId: string | null
  error?: "RefreshAccessTokenError" // Optional error
}
