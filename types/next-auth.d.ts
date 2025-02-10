import { UserRole } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      access_token?: string
      token_type?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string
    token_type?: string
    provider_token?: string
  }
}
