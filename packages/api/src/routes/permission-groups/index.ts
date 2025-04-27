import { OpenAPIHono, createRoute } from "@hono/zod-openapi"
import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { authMiddleware, requirePermission } from "../../middleware"
import {
  PERMISSION_READ,
  PERMISSION_CREATE,
  PERMISSION_UPDATE,
  PERMISSION_DELETE,
} from "../../constants/permissions"
import { ErrorHandlingService } from "../../services/error-handling.service"
import { ApiError, ErrorCode } from "../../middleware/error-handler"

// Create permission groups router
const permissionGroupsRouter = new OpenAPIHono()

// Apply auth middleware to all routes
permissionGroupsRouter.use("*", authMiddleware)

// Permission group schema
const permissionGroupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
})

// Permission group response schema
const permissionGroupResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Permission group with permissions schema
const permissionGroupWithPermissionsSchema =
  permissionGroupResponseSchema.extend({
    permissions: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        action: z.string(),
        subject: z.string(),
      })
    ),
  })

// List permission groups
permissionGroupsRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Permission Groups"],
    security: [{ bearerAuth: [] }],
    description: "List all permission groups",
    responses: {
      200: {
        description: "List of permission groups",
        content: {
          "application/json": {
            schema: z.object({
              groups: z.array(permissionGroupResponseSchema),
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
    // Check if user has permission to read permissions
    await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(
      c,
      async () => {}
    )

    const groups = await prisma.permissionGroup.findMany({
      orderBy: { name: "asc" },
    })

    return c.json({ groups })
  }
)

// Get permission group by ID
permissionGroupsRouter.openapi(
  createRoute({
    method: "get",
    path: "/:id",
    tags: ["Permission Groups"],
    security: [{ bearerAuth: [] }],
    description: "Get permission group by ID with its permissions",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Permission group details with permissions",
        content: {
          "application/json": {
            schema: permissionGroupWithPermissionsSchema,
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
        description: "Permission group not found",
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

      const { id } = c.req.param()

      const group = await prisma.permissionGroup.findUnique({
        where: { id },
        include: {
          permissionGroupItems: {
            include: {
              permission: true,
            },
          },
        },
      })

      if (!group) {
        throw new ApiError(
          "Permission group not found",
          404,
          ErrorCode.NOT_FOUND
        )
      }

      // Transform the response
      const response = {
        ...group,
        permissions: group.permissionGroupItems.map((item) => ({
          id: item.permission.id,
          name: item.permission.name,
          action: item.permission.action,
          subject: item.permission.subject,
        })),
      }

      // Remove permissionGroupItems from the response
      delete response.permissionGroupItems

      return c.json(response)
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Create permission group
permissionGroupsRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Permission Groups"],
    security: [{ bearerAuth: [] }],
    description: "Create a new permission group",
    request: {
      body: {
        content: {
          "application/json": {
            schema: permissionGroupSchema.extend({
              permissionIds: z.array(z.string()).optional(),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Permission group created",
        content: {
          "application/json": {
            schema: permissionGroupWithPermissionsSchema,
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
    },
  }),
  async (c) => {
    try {
      // Check if user has permission to create permissions
      await requirePermission(
        PERMISSION_CREATE.action,
        PERMISSION_CREATE.subject
      )(c, async () => {})

      const data = await c.req.json()
      const { permissionIds, ...groupData } = data

      // Create the permission group
      const group = await prisma.permissionGroup.create({
        data: groupData,
      })

      // Add permissions if provided
      if (permissionIds && permissionIds.length > 0) {
        await prisma.$transaction(
          permissionIds.map((permissionId) =>
            prisma.permissionGroupItem.create({
              data: {
                groupId: group.id,
                permissionId,
              },
            })
          )
        )
      }

      // Get the group with permissions
      const groupWithPermissions = await prisma.permissionGroup.findUnique({
        where: { id: group.id },
        include: {
          permissionGroupItems: {
            include: {
              permission: true,
            },
          },
        },
      })

      // Transform the response
      const response = {
        ...groupWithPermissions,
        permissions: groupWithPermissions.permissionGroupItems.map((item) => ({
          id: item.permission.id,
          name: item.permission.name,
          action: item.permission.action,
          subject: item.permission.subject,
        })),
      }

      // Remove permissionGroupItems from the response
      delete response.permissionGroupItems

      return c.json(response, 201)
    } catch (error) {
      if (error.code === "P2002") {
        throw new ApiError(
          "Permission group with this name already exists",
          400,
          ErrorCode.UNIQUE_VIOLATION
        )
      }

      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Update permission group
permissionGroupsRouter.openapi(
  createRoute({
    method: "put",
    path: "/:id",
    tags: ["Permission Groups"],
    security: [{ bearerAuth: [] }],
    description: "Update a permission group",
    request: {
      params: z.object({
        id: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: permissionGroupSchema.partial().extend({
              permissionIds: z.array(z.string()).optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Permission group updated",
        content: {
          "application/json": {
            schema: permissionGroupWithPermissionsSchema,
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
        description: "Permission group not found",
      },
    },
  }),
  async (c) => {
    try {
      // Check if user has permission to update permissions
      await requirePermission(
        PERMISSION_UPDATE.action,
        PERMISSION_UPDATE.subject
      )(c, async () => {})

      const { id } = c.req.param()
      const data = await c.req.json()
      const { permissionIds, ...groupData } = data

      // Check if the permission group exists
      const existingGroup = await prisma.permissionGroup.findUnique({
        where: { id },
      })

      if (!existingGroup) {
        throw new ApiError(
          "Permission group not found",
          404,
          ErrorCode.NOT_FOUND
        )
      }

      // Update the permission group
      const group = await prisma.permissionGroup.update({
        where: { id },
        data: groupData,
      })

      // Update permissions if provided
      if (permissionIds !== undefined) {
        // Delete existing group items
        await prisma.permissionGroupItem.deleteMany({
          where: { groupId: id },
        })

        // Add new permissions
        if (permissionIds.length > 0) {
          await prisma.$transaction(
            permissionIds.map((permissionId) =>
              prisma.permissionGroupItem.create({
                data: {
                  groupId: group.id,
                  permissionId,
                },
              })
            )
          )
        }
      }

      // Get the updated group with permissions
      const groupWithPermissions = await prisma.permissionGroup.findUnique({
        where: { id: group.id },
        include: {
          permissionGroupItems: {
            include: {
              permission: true,
            },
          },
        },
      })

      // Transform the response
      const response = {
        ...groupWithPermissions,
        permissions: groupWithPermissions.permissionGroupItems.map((item) => ({
          id: item.permission.id,
          name: item.permission.name,
          action: item.permission.action,
          subject: item.permission.subject,
        })),
      }

      // Remove permissionGroupItems from the response
      delete response.permissionGroupItems

      return c.json(response)
    } catch (error) {
      if (error.code === "P2025") {
        throw new ApiError(
          "Permission group not found",
          404,
          ErrorCode.NOT_FOUND
        )
      }

      if (error.code === "P2002") {
        throw new ApiError(
          "Permission group with this name already exists",
          400,
          ErrorCode.UNIQUE_VIOLATION
        )
      }

      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Delete permission group
permissionGroupsRouter.openapi(
  createRoute({
    method: "delete",
    path: "/:id",
    tags: ["Permission Groups"],
    security: [{ bearerAuth: [] }],
    description: "Delete a permission group",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Permission group deleted",
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
        description: "Permission group not found",
      },
    },
  }),
  async (c) => {
    try {
      // Check if user has permission to delete permissions
      await requirePermission(
        PERMISSION_DELETE.action,
        PERMISSION_DELETE.subject
      )(c, async () => {})

      const { id } = c.req.param()

      // Check if the permission group exists
      const group = await prisma.permissionGroup.findUnique({
        where: { id },
      })

      if (!group) {
        throw new ApiError(
          "Permission group not found",
          404,
          ErrorCode.NOT_FOUND
        )
      }

      // Delete the permission group
      await prisma.permissionGroup.delete({
        where: { id },
      })

      return c.json({
        success: true,
        message: "Permission group deleted successfully",
      })
    } catch (error) {
      if (error.code === "P2025") {
        throw new ApiError(
          "Permission group not found",
          404,
          ErrorCode.NOT_FOUND
        )
      }

      return ErrorHandlingService.handleError(error, c)
    }
  }
)

export default permissionGroupsRouter
