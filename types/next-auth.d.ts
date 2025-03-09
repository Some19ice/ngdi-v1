import { UserRole } from "@/lib/auth/constants"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      image?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    role: UserRole
    image?: string
  }
}
