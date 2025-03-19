import { Context, Next } from "hono"
import { verify } from "jsonwebtoken"
import { prisma } from "../lib/prisma"
import { HTTPException } from "hono/http-exception"
import { UserRole } from "@prisma/client"

interface JWTPayload {
  userId: string
  email: string
  role: UserRole | string
  [key: string]: any // Allow for additional fields
}

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("[API DEBUG] No Authorization header or not Bearer token")
      throw new HTTPException(401, { message: "Unauthorized" })
    }

    const token = authHeader.split(" ")[1]

    console.log(
      "[API DEBUG] Received auth token:",
      token ? `${token.substring(0, 10)}...` : "none"
    )
    console.log(
      "[API DEBUG] Verifying token with JWT_SECRET:",
      process.env.JWT_SECRET ? "present" : "missing"
    )

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload
      console.log("[API DEBUG] Decoded token:", {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      })

      // If the role is already in the expected format (string), convert it to UserRole enum
      let userRole: UserRole
      if (typeof decoded.role === "string") {
        // Normalize role value to handle case differences
        const normalizedRole = decoded.role.toUpperCase()

        // Convert string role to UserRole enum
        if (normalizedRole === "ADMIN") {
          userRole = UserRole.ADMIN
        } else if (normalizedRole === "NODE_OFFICER") {
          userRole = UserRole.NODE_OFFICER
        } else {
          userRole = UserRole.USER
        }

        console.log("[API DEBUG] Normalized role:", {
          original: decoded.role,
          normalized: normalizedRole,
          final: userRole,
        })
      } else {
        userRole = decoded.role
      }

      // Set user in context
      c.set("user", {
        id: decoded.userId,
        email: decoded.email,
        role: userRole,
      })

      console.log("[API DEBUG] User set in context:", {
        id: decoded.userId,
        email: decoded.email,
        role: userRole,
      })

      return await next()
    } catch (jwtError) {
      console.error("[API DEBUG] JWT verification error:", jwtError)
      throw new HTTPException(401, { message: "Invalid token" })
    }
  } catch (error) {
    console.error("[API DEBUG] Auth middleware error:", error)
    throw new HTTPException(401, { message: "Invalid token" })
  }
}

export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get("user")
  console.log("[API DEBUG] Admin middleware check:", {
    userRole: user.role,
    isAdmin: user.role === UserRole.ADMIN,
  })

  if (user.role !== UserRole.ADMIN) {
    throw new HTTPException(403, { message: "Forbidden" })
  }
  await next()
}

export function requireRole(role: UserRole) {
  return async (c: Context, next: Next) => {
    const user = c.get("user")
    if (!user) {
      return c.json({ error: "Unauthorized - User not found in context" }, 401)
    }

    if (user.role !== role) {
      return c.json({ error: "Forbidden - Insufficient permissions" }, 403)
    }

    await next()
  }
}
