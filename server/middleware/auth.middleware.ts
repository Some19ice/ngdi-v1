import { Context, Next } from "hono"
import { AuthService } from "../services/auth.service"

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload = await AuthService.verifyToken(token)
    c.set("user", { id: payload.userId, role: payload.role })
    await next()
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401)
  }
}
