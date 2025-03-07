import { Context, Next } from "hono"
import { verify } from "jsonwebtoken"
import { prisma } from "../lib/prisma"
import { HTTPException } from "hono/http-exception"
import { UserRole } from "@prisma/client"

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
    await next()
  } catch (error) {
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
