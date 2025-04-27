import { OpenAPIHono, createRoute } from "@hono/zod-openapi"
import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { authMiddleware, requirePermission } from "../../middleware"
import { SYSTEM_LOGS } from "../../constants/permissions"
import { ErrorHandlingService } from "../../services/error-handling.service"
import { ApiError, ErrorCode } from "../../middleware/error-handler"

// Create activity logs router
const activityLogsRouter = new OpenAPIHono()

// Apply auth middleware to all routes
activityLogsRouter.use("*", authMiddleware)

// Activity log response schema
const activityLogResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.string(),
  subject: z.string(),
  subjectId: z.string().nullable(),
  metadata: z.any().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
  user: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      email: z.string(),
    })
    .optional(),
})

// List activity logs
activityLogsRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Activity Logs"],
    security: [{ bearerAuth: [] }],
    description: "List activity logs with pagination and filtering",
    request: {
      query: z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("20"),
        userId: z.string().optional(),
        action: z.string().optional(),
        subject: z.string().optional(),
        subjectId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    },
    responses: {
      200: {
        description: "List of activity logs",
        content: {
          "application/json": {
            schema: z.object({
              logs: z.array(activityLogResponseSchema),
              pagination: z.object({
                total: z.number(),
                page: z.number(),
                limit: z.number(),
                pages: z.number(),
              }),
            }),
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Forbidden",
      },
    },
  }),
  async (c) => {
    try {
      // Check if user has permission to view logs
      await requirePermission(SYSTEM_LOGS.action, SYSTEM_LOGS.subject)(
        c,
        async () => {}
      )

      const query = c.req.query()
      const page = parseInt(query.page || "1")
      const limit = parseInt(query.limit || "20")
      const skip = (page - 1) * limit

      // Build filter conditions
      const where: any = {}

      if (query.userId) {
        where.userId = query.userId
      }

      if (query.action) {
        where.action = query.action
      }

      if (query.subject) {
        where.subject = query.subject
      }

      if (query.subjectId) {
        where.subjectId = query.subjectId
      }

      if (query.startDate || query.endDate) {
        where.createdAt = {}

        if (query.startDate) {
          where.createdAt.gte = new Date(query.startDate)
        }

        if (query.endDate) {
          where.createdAt.lte = new Date(query.endDate)
        }
      }

      // Get total count
      const total = await prisma.activityLog.count({ where })

      // Get logs
      const logs = await prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })

      return c.json({
        logs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Get activity log by ID
activityLogsRouter.openapi(
  createRoute({
    method: "get",
    path: "/:id",
    tags: ["Activity Logs"],
    security: [{ bearerAuth: [] }],
    description: "Get activity log by ID",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Activity log details",
        content: {
          "application/json": {
            schema: activityLogResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Forbidden",
      },
      404: {
        description: "Activity log not found",
      },
    },
  }),
  async (c) => {
    try {
      // Check if user has permission to view logs
      await requirePermission(SYSTEM_LOGS.action, SYSTEM_LOGS.subject)(
        c,
        async () => {}
      )

      const { id } = c.req.param()

      const log = await prisma.activityLog.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!log) {
        throw new ApiError("Activity log not found", 404, ErrorCode.NOT_FOUND)
      }

      return c.json(log)
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Get user activity
activityLogsRouter.openapi(
  createRoute({
    method: "get",
    path: "/user/:userId",
    tags: ["Activity Logs"],
    security: [{ bearerAuth: [] }],
    description: "Get activity logs for a specific user",
    request: {
      params: z.object({
        userId: z.string(),
      }),
      query: z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("20"),
      }),
    },
    responses: {
      200: {
        description: "User activity logs",
        content: {
          "application/json": {
            schema: z.object({
              logs: z.array(activityLogResponseSchema),
              pagination: z.object({
                total: z.number(),
                page: z.number(),
                limit: z.number(),
                pages: z.number(),
              }),
            }),
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Forbidden",
      },
      404: {
        description: "User not found",
      },
    },
  }),
  async (c) => {
    try {
      // Check if user has permission to view logs
      await requirePermission(SYSTEM_LOGS.action, SYSTEM_LOGS.subject)(
        c,
        async () => {}
      )

      const { userId } = c.req.param()
      const query = c.req.query()
      const page = parseInt(query.page || "1")
      const limit = parseInt(query.limit || "20")
      const skip = (page - 1) * limit

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new ApiError("User not found", 404, ErrorCode.NOT_FOUND)
      }

      // Get total count
      const total = await prisma.activityLog.count({
        where: { userId },
      })

      // Get logs
      const logs = await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })

      return c.json({
        logs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Get resource activity
activityLogsRouter.openapi(
  createRoute({
    method: "get",
    path: "/resource/:subject/:subjectId",
    tags: ["Activity Logs"],
    security: [{ bearerAuth: [] }],
    description: "Get activity logs for a specific resource",
    request: {
      params: z.object({
        subject: z.string(),
        subjectId: z.string(),
      }),
      query: z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("20"),
      }),
    },
    responses: {
      200: {
        description: "Resource activity logs",
        content: {
          "application/json": {
            schema: z.object({
              logs: z.array(activityLogResponseSchema),
              pagination: z.object({
                total: z.number(),
                page: z.number(),
                limit: z.number(),
                pages: z.number(),
              }),
            }),
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Forbidden",
      },
    },
  }),
  async (c) => {
    try {
      // Check if user has permission to view logs
      await requirePermission(SYSTEM_LOGS.action, SYSTEM_LOGS.subject)(
        c,
        async () => {}
      )

      const { subject, subjectId } = c.req.param()
      const query = c.req.query()
      const page = parseInt(query.page || "1")
      const limit = parseInt(query.limit || "20")
      const skip = (page - 1) * limit

      // Get total count
      const total = await prisma.activityLog.count({
        where: { subject, subjectId },
      })

      // Get logs
      const logs = await prisma.activityLog.findMany({
        where: { subject, subjectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })

      return c.json({
        logs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Get activity summary
activityLogsRouter.openapi(
  createRoute({
    method: "get",
    path: "/summary",
    tags: ["Activity Logs"],
    security: [{ bearerAuth: [] }],
    description: "Get activity summary statistics",
    request: {
      query: z.object({
        days: z.string().optional().default("7"),
      }),
    },
    responses: {
      200: {
        description: "Activity summary",
        content: {
          "application/json": {
            schema: z.object({
              totalActivities: z.number(),
              userActivities: z.array(
                z.object({
                  userId: z.string(),
                  userName: z.string().nullable(),
                  userEmail: z.string(),
                  count: z.number(),
                })
              ),
              actionActivities: z.array(
                z.object({
                  action: z.string(),
                  count: z.number(),
                })
              ),
              subjectActivities: z.array(
                z.object({
                  subject: z.string(),
                  count: z.number(),
                })
              ),
              dailyActivities: z.array(
                z.object({
                  date: z.string(),
                  count: z.number(),
                })
              ),
            }),
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Forbidden",
      },
    },
  }),
  async (c) => {
    try {
      // Check if user has permission to view logs
      await requirePermission(SYSTEM_LOGS.action, SYSTEM_LOGS.subject)(
        c,
        async () => {}
      )

      const query = c.req.query()
      const days = parseInt(query.days || "7")

      // Calculate the start date
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get total activities
      const totalActivities = await prisma.activityLog.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      })

      // Get user activities
      const userActivities = await prisma.$queryRaw`
        SELECT
          "userId",
          u.name as "userName",
          u.email as "userEmail",
          COUNT(*) as count
        FROM "ActivityLog" a
        JOIN "User" u ON a."userId" = u.id
        WHERE a."createdAt" >= ${startDate}
        GROUP BY "userId", u.name, u.email
        ORDER BY count DESC
        LIMIT 10
      `

      // Get action activities
      const actionActivities = await prisma.$queryRaw`
        SELECT
          action,
          COUNT(*) as count
        FROM "ActivityLog"
        WHERE "createdAt" >= ${startDate}
        GROUP BY action
        ORDER BY count DESC
        LIMIT 10
      `

      // Get subject activities
      const subjectActivities = await prisma.$queryRaw`
        SELECT
          subject,
          COUNT(*) as count
        FROM "ActivityLog"
        WHERE "createdAt" >= ${startDate}
        GROUP BY subject
        ORDER BY count DESC
        LIMIT 10
      `

      // Get daily activities
      const dailyActivities = await prisma.$queryRaw`
        SELECT
          DATE_TRUNC('day', "createdAt") as date,
          COUNT(*) as count
        FROM "ActivityLog"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date
      `

      return c.json({
        totalActivities,
        userActivities,
        actionActivities,
        subjectActivities,
        dailyActivities,
      })
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

export default activityLogsRouter
