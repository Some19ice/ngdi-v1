import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { userService } from "../services/user.service"
import { auth, authMiddleware } from "../middleware"
import {
  ChangePasswordSchema,
  UpdateProfileSchema,
  UserIdParamSchema,
  userListQuerySchema,
} from "../types/user.types"
import { UserRole } from "../types/auth.types"
import { Context } from "../types/hono.types"
import { Next } from "hono"

/**
 * User routes
 */
export const userRouter = new Hono<{
  Variables: {
    userId: string
    userEmail: string
    userRole: UserRole
  }
}>()

// Apply authentication middleware to all routes
userRouter.use("*", authMiddleware)

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
userRouter.get("/profile", async (c: Context) => {
  const userId = c.get("userId")

  const user = await userService.getUserById(userId)

  return c.json({
    success: true,
    data: user,
  })
})

/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileSchema'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
userRouter.put("/profile", async (c: Context) => {
  const userId = c.get("userId")
  const data = await c.req.json()

  const updatedUser = await userService.updateProfile(userId, data)

  return c.json({
    success: true,
    data: updatedUser,
  })
})

/**
 * @openapi
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordSchema'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
userRouter.post("/change-password", async (c: Context) => {
  const userId = c.get("userId")
  const { currentPassword, newPassword } = await c.req.json()

  await userService.changePassword(userId, currentPassword, newPassword)

  return c.json({
    success: true,
    message: "Password changed successfully",
  })
})

// Admin authorization middleware
function adminOnly() {
  return async (c: Context, next: Next) => {
    const userRole = c.get("userRole")

    if (userRole !== UserRole.ADMIN) {
      return c.json(
        {
          success: false,
          message: "Unauthorized. Admin access required.",
        },
        403
      )
    }

    await next()
  }
}

// Admin-only routes
export const adminRouter = new Hono<{
  Variables: {
    userId: string
    userEmail: string
    userRole: UserRole
  }
}>()
  // Apply authentication middleware
  .use("*", authMiddleware)
  // Check if user is admin
  .use("*", adminOnly())

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN, NODE_OFFICER]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.get("/", async (c: Context) => {
  const { page = "1", limit = "10", search, role } = c.req.query()

  const users = await userService.getAllUsers({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    role: role as UserRole | undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  return c.json({
    success: true,
    data: users,
  })
})

// Mount admin routes
userRouter.route("/admin", adminRouter)

// Export the router
export default userRouter
