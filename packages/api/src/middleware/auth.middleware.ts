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
      throw new HTTPException(401, { message: "Unauthorized" })
    }

    const token = authHeader.split(" ")[1]

    console.log(
      "[API DEBUG] Verifying token with JWT_SECRET:",
      process.env.JWT_SECRET ? "present" : "missing"
    )

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload
      console.log("[API DEBUG] Decoded token:", decoded)

      // If the role is already in the expected format (string), convert it to UserRole enum
      let userRole: UserRole
      if (typeof decoded.role === "string") {
        // Convert string role to UserRole enum
        userRole = decoded.role as UserRole
      } else {
        userRole = decoded.role
      }

      // If this is a server-generated token without a DB lookup
      if (userRole === UserRole.ADMIN) {
        c.set("user", {
          id: decoded.userId,
          email: decoded.email,
          role: UserRole.ADMIN,
        })
        return await next()
      }

      // Otherwise, look up the user in the database to confirm
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      })

      if (!user) {
        console.log("[API DEBUG] User not found for ID:", decoded.userId)
        throw new HTTPException(401, { message: "User not found" })
      }

      // Add user info to context
      c.set("user", user)
      console.log("[DEBUG] Set user in middleware:", user, "using c.set()")
      await next()
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
