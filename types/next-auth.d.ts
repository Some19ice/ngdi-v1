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
      /** The user's custom role name */
      customRole?: string
      /** The user's permissions */
      permissions?: {
        action: string
        subject: string
      }[]
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    image?: string
    /** The user's custom role name */
    customRole?: string
    /** The user's permissions */
    permissions?: {
      action: string
      subject: string
    }[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    role: UserRole
    image?: string
    /** The user's custom role name */
    customRole?: string
    /** The user's permissions */
    permissions?: {
      action: string
      subject: string
    }[]
  }
}
