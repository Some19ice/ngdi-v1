import { Context, Next } from "hono"
import { verify } from "jsonwebtoken"
import { prisma } from "../lib/prisma"
import { HTTPException } from "hono/http-exception"
import { UserRole } from "@prisma/client"
import { config } from "../config"

interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" })
    }

    const token = authHeader.split(" ")[1]

    // Check if this is a server API key request
    if (config.serverApiKey && token === config.serverApiKey) {
      console.log("[DEBUG] Server API key authentication successful")
      // Set an admin user context for server requests
      c.set("user", {
        id: "server",
        email: "server@system.local",
        role: UserRole.ADMIN,
      })
      await next()
      return
    }

    // Additional logging for debugging
    if (token === process.env.SERVER_API_KEY) {
      console.log(
        "[DEBUG] Token matches process.env.SERVER_API_KEY but not config.serverApiKey"
      )
    }

    // Normal JWT authentication flow
    const decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      throw new HTTPException(401, { message: "User not found" })
    }

    // Add user info to context
    c.set("user", user)
    console.log("[DEBUG] User authentication successful:", user.email)
    await next()
  } catch (error) {
    console.error("[ERROR] Authentication failed:", error)
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
