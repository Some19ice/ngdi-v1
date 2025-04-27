import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { UserRole } from "@/lib/auth/constants"

interface PermissionOptions {
  allowedRoles?: UserRole[]
  throwOnUnauthorized?: boolean
}

export async function checkUserPermission(
  request: Request,
  options?: PermissionOptions
) {
  try {
    // Extract token from request headers or cookies
    let token: string | null = null

    // Try to get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }

    // If not found in header, try to get from cookies
    if (!token) {
      // Create a cookie store from the request
      const cookieStore = await cookies()
      token = cookieStore.get("auth_token")?.value || null
    }

    if (!token) {
      if (options?.throwOnUnauthorized) {
        throw new Error("Authentication required")
      }
      return null
    }

    // In a real application, you would verify the JWT token
    // and extract the user ID from it
    // For now, we'll simulate this with a mock user ID
    const userId = "current-user-id"

    // Find the user in the database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    })

    if (!user) {
      if (options?.throwOnUnauthorized) {
        throw new Error("User not found")
      }
      return null
    }

    // Check if user has required role
    if (
      options?.allowedRoles &&
      options.allowedRoles.length > 0 &&
      !options.allowedRoles.includes(user.role as UserRole)
    ) {
      if (options?.throwOnUnauthorized) {
        throw new Error("Insufficient permissions")
      }
      return null
    }

    return user
  } catch (error) {
    console.error("Error checking permissions:", error)
    if (options?.throwOnUnauthorized) {
      throw error
    }
    return null
  }
}
