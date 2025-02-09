import { UserRole } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      organization?: string | null
      department?: string | null
      createdAt?: Date | null
    }
  }

  interface User {
    id: string
    role: UserRole
    organization?: string | null
    department?: string | null
    createdAt?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    organization?: string | null
    department?: string | null
    createdAt?: Date | null
  }
}
