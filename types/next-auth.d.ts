import { UserRole } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole | undefined
      organization?: string | null
      department?: string | null
      createdAt?: Date | null
      access_token?: string
      token_type?: string
      image?: string | null
    }
    accessToken: string
    error?: string
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    organization?: string | null
    department?: string | null
    createdAt?: Date | null
    image?: string | null
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole
    organization?: string | null
    department?: string | null
    createdAt?: Date | null
    access_token?: string
    refresh_token?: string
    accessTokenExpires?: number
    error?: "RefreshAccessTokenError"
    id: string
    name?: string
    accessToken: string
  }
}
