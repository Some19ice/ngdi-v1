import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { userService } from "../services/user.service"
import { auth, authMiddleware } from "../middleware"
import {
  ChangePasswordSchema,
  UpdateProfileSchema,
  UserIdParamSchema,
  userListQuerySchema,
  UserProfileRequest,
  UserResponse,
} from "../types/user.types"
import { UserRole } from "../types/auth.types"
import { Context } from "../types/hono.types"
import { Next } from "hono"
import { ChangePasswordRequest } from "../types/auth.types"
import { metadataService } from "../services/metadata.service"
import { prisma } from "../lib/prisma"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

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

// Helper to require authentication
function requireAuth() {
  return authMiddleware
}

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

/**
 * Get user dashboard metadata stats
 */
userRouter.get("/dashboard/metadata-stats", requireAuth(), async (c) => {
  const userId = c.get("userId")

  try {
    console.log(`Fetching metadata stats for user ${userId}`)

    // Check if validationStatus exists in the schema
    const metadataFields = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Metadata' AND column_name = 'validationStatus'
    `

    console.log("Metadata fields check:", metadataFields)

    // Get counts of metadata by status (safely)
    let total, published, draft, rejected, pendingReview

    try {
      total = await prisma.metadata.count({ where: { userId } })

      // Only attempt status filtering if the field exists
      if (Array.isArray(metadataFields) && metadataFields.length > 0) {
        published = await prisma.metadata.count({
          where: { userId, validationStatus: "PUBLISHED" },
        })
        draft = await prisma.metadata.count({
          where: { userId, validationStatus: "DRAFT" },
        })
        rejected = await prisma.metadata.count({
          where: { userId, validationStatus: "REJECTED" },
        })
        pendingReview = await prisma.metadata.count({
          where: { userId, validationStatus: "PENDING_REVIEW" },
        })
      } else {
        // If validationStatus doesn't exist, return zeros
        published = 0
        draft = total // Assume all are drafts if no status
        rejected = 0
        pendingReview = 0
        console.log(
          "validationStatus field not found in schema, using default values"
        )
      }
    } catch (countError) {
      console.error("Error counting metadata by status:", countError)
      // Provide fallback values
      total = await prisma.metadata.count({ where: { userId } })
      published = 0
      draft = total
      rejected = 0
      pendingReview = 0
    }

    // Calculate average completeness
    let avgCompleteness = 0
    try {
      const metadataWithCompleteness = await prisma.metadata.findMany({
        where: {
          userId,
          completeness: { not: null },
        },
        select: { completeness: true },
      })

      const totalCompleteness = metadataWithCompleteness.reduce(
        (sum, record) => sum + (record.completeness || 0),
        0
      )

      avgCompleteness =
        metadataWithCompleteness.length > 0
          ? Math.round(totalCompleteness / metadataWithCompleteness.length)
          : 0
    } catch (completenessError) {
      console.error("Error calculating completeness:", completenessError)
      // Leave avgCompleteness as 0
    }

    return c.json({
      total,
      published,
      draft,
      rejected,
      pendingReview,
      avgCompleteness,
    })
  } catch (error) {
    console.error("Error fetching metadata stats:", error)
    // Return a more detailed error message
    throw new HTTPException(500, {
      message: `Failed to fetch metadata statistics: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})

/**
 * Get user recent activity
 */
userRouter.get("/dashboard/activity", requireAuth(), async (c) => {
  const userId = c.get("userId")
  const userName = c.get("userEmail").split("@")[0] || "User" // Simple name extraction

  // Define Activity type
  type Activity = {
    id: string
    type: "view" | "edit" | "create" | "comment"
    targetType: "metadata" | "map" | "profile" | "system"
    targetId: string
    targetTitle: string
    timestamp: string
    user: {
      id: string
      name: string
    }
  }

  try {
    console.log(`Fetching activity for user ${userId}`)

    let activities: Activity[] = []

    try {
      // Get recently viewed or edited metadata
      const recentMetadata = await prisma.metadata.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          updatedAt: true,
          createdAt: true,
        },
      })

      console.log(
        `Found ${recentMetadata.length} metadata records for activity`
      )

      // Map to activity format
      activities = recentMetadata.map((metadata) => {
        const isNew =
          metadata.createdAt.getTime() === metadata.updatedAt.getTime()
        return {
          id: metadata.id,
          type: isNew ? "create" : ("edit" as "create" | "edit"),
          targetType: "metadata" as "metadata",
          targetId: metadata.id,
          targetTitle: metadata.title,
          timestamp: metadata.updatedAt.toISOString(),
          user: {
            id: userId,
            name: userName,
          },
        }
      })
    } catch (metadataError) {
      console.error("Error generating activity from metadata:", metadataError)
      // Don't throw, just return an empty array
    }

    // If we have no real activities, add a fallback system activity to prevent UI errors
    if (activities.length === 0) {
      activities.push({
        id: "system-activity-1",
        type: "view",
        targetType: "system",
        targetId: "welcome",
        targetTitle: "Welcome to NGDI Portal",
        timestamp: new Date().toISOString(),
        user: {
          id: userId,
          name: userName,
        },
      })
    }

    return c.json(activities)
  } catch (error) {
    console.error("Error fetching user activity:", error)
    // Return a fallback activity instead of throwing an error
    return c.json([
      {
        id: "error-activity-1",
        type: "view" as "view",
        targetType: "system" as "system",
        targetId: "error",
        targetTitle: "Dashboard",
        timestamp: new Date().toISOString(),
        user: {
          id: userId,
          name: userName,
        },
      },
    ])
  }
})

/**
 * @openapi
 * /api/users/dashboard/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 * Get user notifications
 */
userRouter.get("/dashboard/notifications", requireAuth(), async (c) => {
  const userId = c.get("userId")

  // Define Notification type
  type Notification = {
    id: string
    title: string
    message: string
    type: "info" | "warning" | "success" | "error"
    isRead: boolean
    createdAt: string
    link: string
  }

  try {
    console.log(`Fetching notifications for user ${userId}`)

    let notifications: Notification[] = []

    try {
      // This is just an example - in a real app, you would have a notifications table
      // For now, generate notifications based on user's metadata
      const recentMetadata = await prisma.metadata.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          validationStatus: true,
          updatedAt: true,
        },
      })

      console.log(
        `Found ${recentMetadata.length} metadata records for notifications`
      )

      // Map to notifications format
      notifications = recentMetadata.map((metadata) => {
        let type: "info" | "warning" | "success" | "error" = "info"
        let message = ""
        let title = ""

        if (metadata.validationStatus === "PUBLISHED") {
          type = "success"
          title = "Metadata published"
          message = `Your metadata record '${metadata.title}' has been published.`
        } else if (metadata.validationStatus === "REJECTED") {
          type = "error"
          title = "Metadata rejected"
          message = `Your metadata record '${metadata.title}' needs revision.`
        } else if (metadata.validationStatus === "PENDING_REVIEW") {
          type = "warning"
          title = "Pending review"
          message = `Your metadata record '${metadata.title}' is pending review.`
        } else {
          title = "Metadata updated"
          message = `You've made changes to '${metadata.title}'.`
        }

        return {
          id: metadata.id,
          title,
          message,
          type,
          isRead: false,
          createdAt: metadata.updatedAt.toISOString(),
          link: `/metadata/detail/${metadata.id}`,
        }
      })
    } catch (metadataError) {
      console.error(
        "Error generating notifications from metadata:",
        metadataError
      )
      // Don't re-throw, just continue with an empty notifications array
    }

    // Add a system notification (always include this one even if metadata failed)
    notifications.push({
      id: "system-1",
      title: "Welcome to NGDI Portal",
      message:
        "Explore the platform features and start managing your geospatial metadata.",
      type: "info",
      isRead: false,
      createdAt: new Date().toISOString(),
      link: "/dashboard",
    })

    return c.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    // Return a more detailed error message but with an empty array to prevent UI failures
    return c.json([
      {
        id: "error-1",
        title: "Notification error",
        message: "We couldn't load your notifications. Please try again later.",
        type: "error" as "error",
        isRead: false,
        createdAt: new Date().toISOString(),
        link: "/dashboard",
      },
    ])
  }
})

// Add a debug endpoint to check the metadata schema
userRouter.get("/debug/metadata-schema", requireAuth(), async (c) => {
  try {
    // Get column information for Metadata table
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Metadata'
    `

    // Get a sample metadata record if any exist
    const sampleRecord = await prisma.metadata.findFirst({
      where: { userId: c.get("userId") },
    })

    return c.json({
      success: true,
      schema: {
        columns,
        sampleRecord: sampleRecord
          ? {
              id: sampleRecord.id,
              title: sampleRecord.title,
              validationStatus: sampleRecord.validationStatus,
              completeness: sampleRecord.completeness,
              // Add other fields that might be relevant
            }
          : null,
      },
    })
  } catch (error) {
    console.error("Error fetching metadata schema:", error)
    return c.json({
      success: false,
      error: `Failed to fetch metadata schema: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})

// Export the router
export default userRouter
