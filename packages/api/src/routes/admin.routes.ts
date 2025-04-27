import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { adminService } from "../services/admin.service"
import { UserRole } from "../types/auth.types"
import { UserIdParamSchema } from "../types/user.types"
import { MetadataIdParamSchema } from "../types/metadata.types"
import { Context } from "../types/hono.types"
import { ApiError } from "../middleware/error-handler"
import { prisma } from "../lib/prisma"
import { logger } from "../lib/logger"
import { UserRole as PrismaUserRole } from "@prisma/client"
import { SafeJSON } from "../utils/json-serializer"
import { memoryCache } from "../utils/cache"
import { errorHandler } from "../services/error-handling.service"

// Define the user type based on the auth middleware
interface User {
  id: string
  email: string
  role: UserRole
}

/**
 * Admin routes
 */
export const adminRouter = new Hono<{
  Variables: {
    userId: string
    userEmail: string
    userRole: UserRole
    secureHeadersNonce?: string
    user: User
  }
}>()

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

  // Generate cache key from query parameters
  const cacheKey = `admin-users-${page}-${limit}-${search || ""}-${role || ""}`

  // Check cache first for non-search queries
  const cachedResult = memoryCache.get(cacheKey)
  if (cachedResult && !search) {
    // Don't use cache for search queries
    logger.info("Serving admin users from cache")

    return new Response(cachedResult as string, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
      },
    })
  }

  const users = await adminService.getAllUsers({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    role: role as UserRole | undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  // Serialize response
  const serializedResponse = SafeJSON.stringify({
    success: true,
    data: users,
  })

  // Cache the result for 2 minutes, but only if it's not a search query
  if (!search) {
    memoryCache.set(cacheKey, serializedResponse, 120000) // 2 minutes TTL
  }

  return new Response(serializedResponse, {
    headers: {
      "Content-Type": "application/json",
      "X-Cache": "MISS",
    },
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

    try {
      const user = await adminService.updateUserRole(id, role as UserRole)

      return c.json({
        success: true,
        message: "User role updated successfully",
        data: user,
      })
    } catch (error) {
      return errorHandler(error, c)
    }
  }
)

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get detailed user information
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
 *         description: Detailed user information
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
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     emailVerified:
 *                       type: boolean
 *                     organization:
 *                       type: string
 *                     department:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     image:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                     metadataCount:
 *                       type: number
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.get(
  "/users/:id",
  zValidator("param", UserIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param")

    try {
      logger.info(`Fetching details for user ${id}`)
      const userDetails = await adminService.getUserDetails(id)

      return c.json({
        success: true,
        data: userDetails,
      })
    } catch (error) {
      return errorHandler(error, c)
    }
  }
)

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
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

  // Generate cache key from query parameters
  const cacheKey = `admin-metadata-${page}-${limit}-${search || ""}-${category || ""}-${dateFrom || ""}-${dateTo || ""}`

  // Check cache first
  const cachedResult = memoryCache.get(cacheKey)
  if (cachedResult && !search) {
    // Don't use cache for search queries
    logger.info("Serving admin metadata from cache")

    return new Response(cachedResult as string, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
      },
    })
  }

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

  // Serialize response
  const serializedResponse = SafeJSON.stringify({
    success: true,
    data: result,
  })

  // Cache the result for 2 minutes, but only if it's not a search query
  if (!search) {
    memoryCache.set(cacheKey, serializedResponse, 120000) // 2 minutes TTL
  }

  return new Response(serializedResponse, {
    headers: {
      "Content-Type": "application/json",
      "X-Cache": "MISS",
    },
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
 *     summary: Get admin dashboard statistics
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.get("/dashboard-stats", async (c) => {
  try {
    const user = c.get("user")
    if (!user) {
      throw new ApiError("Unauthorized", 401)
    }

    // Generate a cache key based on the user ID
    const cacheKey = `dashboard-stats-${user.id}`

    // Check if we have cached data
    const cachedStats = memoryCache.get(cacheKey)
    if (cachedStats) {
      logger.info("Serving dashboard stats from cache", {
        userId: user.id,
        email: user.email,
      })

      return new Response(cachedStats as string, {
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      })
    }

    logger.info("Fetching dashboard stats", {
      userId: user.id,
      email: user.email,
    })

    // Run all database queries in parallel using Promise.all
    const [
      totalUsers,
      totalMetadata,
      userRoleDistribution,
      recentMetadata,
      userGrowth,
      metadataByFramework,
      topOrganizations,
    ] = await Promise.all([
      // Get total users
      prisma.user.count(),

      // Get total metadata entries
      prisma.metadata.count(),

      // Get user role distribution
      prisma.user.groupBy({
        by: ["role"],
        _count: {
          id: true,
        },
      }),

      // Get recent metadata entries with optimized field selection
      prisma.metadata.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          author: true,
          organization: true,
          createdAt: true,
          thumbnailUrl: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),

      // Get user growth
      prisma.user.groupBy({
        by: ["createdAt"],
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 30,
      }),

      // Get metadata by framework type
      prisma.metadata.groupBy({
        by: ["frameworkType"],
        _count: {
          id: true,
        },
      }),

      // Get top organizations
      prisma.metadata.groupBy({
        by: ["organization"],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 5,
      }),
    ])

    logger.debug("All dashboard queries completed", {
      totalUsers,
      totalMetadataCount: totalMetadata,
      userRoleDistCount: userRoleDistribution.length,
      recentMetadataCount: recentMetadata.length,
      userGrowthPoints: userGrowth.length,
      metadataByFrameworkCount: metadataByFramework.length,
      topOrganizationsCount: topOrganizations.length,
    })

    const stats = {
      totalUsers,
      totalMetadata,
      userRoleDistribution,
      recentMetadata,
      userGrowth,
      metadataByFramework,
      topOrganizations,
    }

    // Serialize the response once
    const serializedResponse = SafeJSON.stringify(stats)

    // Cache the serialized response for 5 minutes (300000 ms)
    memoryCache.set(cacheKey, serializedResponse, 300000)

    // Return the response
    return new Response(serializedResponse, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    })
  } catch (error) {
    logger.error("Error fetching dashboard stats", {
      error,
      userId: c.get("user")?.id,
      email: c.get("user")?.email,
    })

    if (error instanceof ApiError) {
      return c.json({ error: error.message }, error.status as any)
    }

    return c.json(
      {
        error: "Failed to fetch dashboard statistics",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      500 as any
    )
  }
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.get("/stats", async (c) => {
  try {
    // Check for cached stats
    const cacheKey = "admin-system-stats"
    const cachedStats = memoryCache.get(cacheKey)

    if (cachedStats) {
      logger.info("Serving system stats from cache")

      return new Response(cachedStats as string, {
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      })
    }

    const stats = await adminService.getAdminDashboardStats()

    // Serialize the response
    const serializedResponse = SafeJSON.stringify({
      success: true,
      data: stats,
    })

    // Cache for 5 minutes
    memoryCache.set(cacheKey, serializedResponse, 300000)

    // Use SafeJSON to handle BigInt values
    return new Response(serializedResponse, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    })
  } catch (error) {
    logger.error("Error fetching system stats", {
      error,
      userId: c.get("user")?.id,
      email: c.get("user")?.email,
    })

    if (error instanceof ApiError) {
      return c.json({ error: error.message }, error.status as any)
    }

    return c.json(
      {
        success: false,
        message: "Failed to fetch system statistics",
      },
      500
    )
  }
})

export default adminRouter
