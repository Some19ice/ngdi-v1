import { User as PrismaUser } from "@prisma/client"

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  NODE_OFFICER = "NODE_OFFICER",
}

export interface AuthUser extends Omit<PrismaUser, "password"> {
  role: UserRole
}

export interface AuthError {
  message: string
  type?: "error" | "warning" | "info"
}

export interface SignInValues {
  email: string
  password: string
  rememberMe: boolean
}

export interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  error: AuthError | null
  signIn: (values: SignInValues) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export interface Permission {
  action: string
  subject: string
}
