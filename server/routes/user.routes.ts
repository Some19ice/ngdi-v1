import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { UserService } from "../services/user.service"
import { authMiddleware } from "../middleware"
import type { Context } from "hono"
import type { Variables } from "hono/types"

interface CustomContext extends Context<{ Variables: Variables }> {
  get(key: "user"): { id: string; role: string }
}

const user = new Hono()

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
})

user.use("*", authMiddleware)

user.get("/profile", async (c: CustomContext) => {
  const user = c.get("user")
  const result = await UserService.getCurrentUser(user.id)
  return c.json(result)
})

user.put(
  "/profile",
  zValidator("json", updateProfileSchema),
  async (c: CustomContext) => {
    const user = c.get("user")
    const data = await c.req.json()
    const result = await UserService.updateUser(user.id, data)
    return c.json(result)
  }
)

user.post(
  "/change-password",
  zValidator("json", changePasswordSchema),
  async (c: CustomContext) => {
    const user = c.get("user")
    const { currentPassword, newPassword } = await c.req.json()
    await UserService.changePassword(user.id, currentPassword, newPassword)
    return c.json({ success: true })
  }
)

export { user }
