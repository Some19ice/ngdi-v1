import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { adminService } from "../services/admin.service"
import { authMiddleware } from "../middleware/auth"
import { UserRole } from "../types/auth.types"
import { UserIdParamSchema } from "../types/user.types"
import { MetadataIdParamSchema } from "../types/metadata.types"
import { Context } from "../types/hono.types"

/**
 * Admin routes
 */
export const adminRouter = new Hono<{
  Variables: {
    userId: string
    userEmail: string
    userRole: UserRole
    secureHeadersNonce?: string
  }
}>()
  // Apply authentication middleware to all routes
  .use("*", authMiddleware)
  // Check if user is admin
  .use("*", async (c, next) => {
    const userRole = c.var.userRole

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
  })

/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     totalMetadata:
 *                       type: number
 *                     newUsersLast30Days:
 *                       type: number
 *                     newMetadataLast30Days:
 *                       type: number
 *                     usersByRole:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.get("/stats", async (c) => {
  const stats = await adminService.getSystemStats()

  return c.json({
    success: true,
    data: stats,
  })
})

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Get all users
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
 *         description: Search term for email, first name, or last name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSearchResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.get("/users", async (c) => {
  const { page = "1", limit = "10", search, role } = c.req.query()

  const users = await adminService.getAllUsers({
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

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: User role updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.put(
  "/users/:id/role",
  zValidator("param", UserIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param")
    const { role } = await c.req.json()

    if (!role || !Object.values(UserRole).includes(role as UserRole)) {
      return c.json(
        {
          success: false,
          message: "Invalid role",
        },
        400
      )
    }

    const updatedUser = await adminService.updateUserRole(id, role as UserRole)

    return c.json({
      success: true,
      data: updatedUser,
    })
  }
)

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.delete(
  "/users/:id",
  zValidator("param", UserIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param")

    await adminService.deleteUser(id)

    return c.json({
      success: true,
      message: "User deleted successfully",
    })
  }
)

/**
 * @openapi
 * /api/admin/users/{id}/verify-email:
 *   post:
 *     summary: Manually verify user's email
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.post(
  "/users/:id/verify-email",
  zValidator("param", UserIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param")

    const user = await adminService.verifyUserEmail(id)

    return c.json({
      success: true,
      data: user,
      message: "Email verified successfully",
    })
  }
)

/**
 * @openapi
 * /api/admin/metadata:
 *   get:
 *     summary: Get all metadata
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
 *         description: Search term for title, author, or organization
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date from
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date to
 *     responses:
 *       200:
 *         description: List of metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetadataSearchResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.get("/metadata", async (c) => {
  const {
    page = "1",
    limit = "10",
    search,
    category,
    dateFrom,
    dateTo,
  } = c.req.query()

  const result = await adminService.getAllMetadata({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    category,
    dateFrom,
    dateTo,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  return c.json({
    success: true,
    data: result,
  })
})

/**
 * @openapi
 * /api/admin/metadata/{id}:
 *   delete:
 *     summary: Delete metadata
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Metadata ID
 *     responses:
 *       200:
 *         description: Metadata deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.delete(
  "/metadata/:id",
  zValidator("param", MetadataIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param")

    await adminService.deleteMetadata(id)

    return c.json({
      success: true,
      message: "Metadata deleted successfully",
    })
  }
)

/**
 * @openapi
 * /api/admin/dashboard-stats:
 *   get:
 *     summary: Get comprehensive dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userCount:
 *                       type: number
 *                     orgCount:
 *                       type: number
 *                     metadataCount:
 *                       type: number
 *                     activeUsers:
 *                       type: number
 *                     pendingApprovals:
 *                       type: number
 *                     systemHealth:
 *                       type: number
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
adminRouter.get("/dashboard-stats", async (c) => {
  try {
    const stats = await adminService.getAdminDashboardStats()
    
    return c.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return c.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics",
      },
      500
    )
  }
})

export default adminRouter
