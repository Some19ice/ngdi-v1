import { OpenAPIHono, createRoute } from "@hono/zod-openapi"
import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { authMiddleware, requirePermission } from "../../middleware"
import { PERMISSION_READ, PERMISSION_ASSIGN } from "../../constants/permissions"
import { getAllPermissionsForUser } from "../../utils/permissions"
import { ErrorHandlingService } from "../../services/error-handling.service"
import { ApiError, ErrorCode } from "../../middleware/error-handler"

// Create user permissions router
const userPermissionsRouter = new OpenAPIHono()

// Apply auth middleware to all routes
userPermissionsRouter.use("*", authMiddleware)

// User permission schema
const userPermissionSchema = z.object({
  permissionId: z.string(),
  granted: z.boolean().default(true),
  conditions: z.any().optional(),
  expiresAt: z.string().datetime().optional(),
})

// User permission response schema
const userPermissionResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  permissionId: z.string(),
  granted: z.boolean(),
  conditions: z.any().nullable(),
  expiresAt: z.string().datetime().nullable(),
  createdAt: z.string(),
  permission: z.object({
    id: z.string(),
    name: z.string(),
    action: z.string(),
    subject: z.string(),
    description: z.string().nullable(),
  }),
})

// Get user permissions
userPermissionsRouter.openapi(
  createRoute({
    method: "get",
    path: "/user/:userId",
    tags: ["User Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Get permissions for a user",
    request: {
      params: z.object({
        userId: z.string(),
      }),
    },
    responses: {
      200: {
        description: "User permissions",
        content: {
          "application/json": {
            schema: z.object({
              directPermissions: z.array(userPermissionResponseSchema),
              allPermissions: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  action: z.string(),
                  subject: z.string(),
                  description: z.string().nullable(),
                  source: z.enum(["role", "direct"]),
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
      404: {
        description: "User not found",
      },
    },
  }),
  async (c) => {
    try {
      // Check if user has permission to read permissions
      await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(
        c,
        async () => {}
      )

      const { userId } = c.req.param()

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new ApiError("User not found", 404, ErrorCode.NOT_FOUND)
      }

      // Get direct permissions
      const directPermissions = await prisma.userPermission.findMany({
        where: {
          userId,
          granted: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: {
          permission: true,
        },
      })

      // Get all permissions (including role permissions)
      const allPermissions = await getAllPermissionsForUser(userId)

      // Transform all permissions to include source
      const transformedAllPermissions = allPermissions.map((permission) => {
        const isDirect = directPermissions.some(
          (dp) => dp.permissionId === permission.id
        )
        return {
          ...permission,
          source: isDirect ? "direct" : "role",
        }
      })

      return c.json({
        directPermissions,
        allPermissions: transformedAllPermissions,
      })
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Grant permission to user
userPermissionsRouter.openapi(
  createRoute({
    method: "post",
    path: "/user/:userId",
    tags: ["User Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Grant a permission to a user",
    request: {
      params: z.object({
        userId: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: userPermissionSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Permission granted",
        content: {
          "application/json": {
            schema: userPermissionResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid input",
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Forbidden",
      },
      404: {
        description: "User or permission not found",
      },
    },
  }),
  async (c) => {
    try {
      // Check if user has permission to assign permissions
      await requirePermission(
        PERMISSION_ASSIGN.action,
        PERMISSION_ASSIGN.subject
      )(c, async () => {})

      const { userId } = c.req.param()
      const data = await c.req.json()

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new ApiError("User not found", 404, ErrorCode.NOT_FOUND)
      }

      // Check if the permission exists
      const permission = await prisma.permission.findUnique({
        where: { id: data.permissionId },
      })

      if (!permission) {
        throw new ApiError("Permission not found", 404, ErrorCode.NOT_FOUND)
      }

      // Create or update the user permission
      const userPermission = await prisma.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId,
            permissionId: data.permissionId,
          },
        },
        update: {
          granted: data.granted,
          conditions: data.conditions,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        },
        create: {
          userId,
          permissionId: data.permissionId,
          granted: data.granted,
          conditions: data.conditions,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        },
        include: {
          permission: true,
        },
      })

      return c.json(userPermission, 201)
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Revoke permission from user
userPermissionsRouter.openapi(
  createRoute({
    method: "delete",
    path: "/user/:userId/permission/:permissionId",
    tags: ["User Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Revoke a permission from a user",
    request: {
      params: z.object({
        userId: z.string(),
        permissionId: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Permission revoked",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
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
        description: "User permission not found",
      },
    },
  }),
  async (c) => {
    try {
      // Check if user has permission to assign permissions
      await requirePermission(
        PERMISSION_ASSIGN.action,
        PERMISSION_ASSIGN.subject
      )(c, async () => {})

      const { userId, permissionId } = c.req.param()

      // Check if the user permission exists
      const userPermission = await prisma.userPermission.findUnique({
        where: {
          userId_permissionId: {
            userId,
            permissionId,
          },
        },
      })

      if (!userPermission) {
        throw new ApiError(
          "User permission not found",
          404,
          ErrorCode.NOT_FOUND
        )
      }

      // Delete the user permission
      await prisma.userPermission.delete({
        where: {
          userId_permissionId: {
            userId,
            permissionId,
          },
        },
      })

      return c.json({
        success: true,
        message: "Permission revoked successfully",
      })
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Check if user has permission
userPermissionsRouter.openapi(
  createRoute({
    method: "post",
    path: "/check",
    tags: ["User Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Check if a user has a specific permission",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              userId: z.string(),
              action: z.string(),
              subject: z.string(),
              resource: z.any().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Permission check result",
        content: {
          "application/json": {
            schema: z.object({
              granted: z.boolean(),
              reason: z.string().optional(),
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
      // Check if user has permission to read permissions
      await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(
        c,
        async () => {}
      )

      const { userId, action, subject, resource } = await c.req.json()

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new ApiError("User not found", 404, ErrorCode.NOT_FOUND)
      }

      // Import the hasPermission function
      const { hasPermission } = await import("../../utils/permissions")

      // Check if the user has the permission
      const result = await hasPermission(user, action, subject, resource)

      return c.json(result)
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

export default userPermissionsRouter
