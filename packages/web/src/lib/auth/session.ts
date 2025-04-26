import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { PrismaClient } from "@prisma/client"
import { UserRole, normalizeRole } from "./constants"

const prisma = new PrismaClient()

// Interface for the current user
export interface CurrentUser {
  id: string
  email: string
  name: string | null
  role: UserRole
  organization?: string | null
}

/**
 * Get the current user from the session
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    // Get the token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return null
    }

    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "")

    try {
      const { payload } = await jwtVerify(token, secret)

      // Get user ID from token
      const userId = payload.sub as string

      if (!userId) {
        return null
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organization: true,
        },
      })

      if (!user) {
        return null
      }

      // Normalize role
      const normalizedRole = normalizeRole(user.role)

      if (!normalizedRole) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: normalizedRole,
        organization: user.organization,
      }
    } catch (error) {
      console.error("Token verification failed:", error)
      return null
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Check if the current user has a specific role
 * @param role The role to check
 * @returns True if the user has the role, false otherwise
 */
export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return false
  }

  const roles = Array.isArray(role) ? role : [role]
  return roles.includes(currentUser.role)
}

/**
 * Check if the current user is an admin
 * @returns True if the user is an admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(UserRole.ADMIN)
}
