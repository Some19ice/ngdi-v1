import { OpenAPIHono, createRoute } from "@hono/zod-openapi"
import { z } from "zod"
import { prisma } from "../../lib/prisma"
import {
  authMiddleware,
  requirePermission,
  requireAllPermissions,
} from "../../middleware"
import {
  PERMISSION_READ,
  PERMISSION_CREATE,
  PERMISSION_UPDATE,
  PERMISSION_DELETE,
} from "../../constants/permissions"
import { ErrorHandlingService } from "../../services/error-handling.service"
import { ApiError, ErrorCode } from "../../middleware/error-handler"

// Create permissions router
const permissionsRouter = new OpenAPIHono()

// Apply auth middleware to all routes
permissionsRouter.use("*", authMiddleware)

// Permission schema
const permissionSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  action: z.string().min(1),
  subject: z.string().min(1),
  conditions: z.any().optional(),
})

// Permission response schema
const permissionResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  action: z.string(),
  subject: z.string(),
  conditions: z.any().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// List permissions
permissionsRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "List all permissions",
    responses: {
      200: {
        description: "List of permissions",
        content: {
          "application/json": {
            schema: z.object({
              permissions: z.array(permissionResponseSchema),
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
      // Check if user has permission to read permissions
      await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(
        c,
        async () => {}
      )

      const permissions = await prisma.permission.findMany({
        orderBy: { name: "asc" },
      })

      return c.json({ permissions })
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Get permission by ID
permissionsRouter.openapi(
  createRoute({
    method: "get",
    path: "/:id",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Get permission by ID",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Permission details",
        content: {
          "application/json": {
            schema: permissionResponseSchema,
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
        description: "Permission not found",
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

      const permission = await prisma.permission.findUnique({
        where: { id },
      })

      if (!permission) {
        throw new ApiError("Permission not found", 404, ErrorCode.NOT_FOUND)
      }

      return c.json(permission)
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Create permission
permissionsRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Create a new permission",
    request: {
      body: {
        content: {
          "application/json": {
            schema: permissionSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Permission created",
        content: {
          "application/json": {
            schema: permissionResponseSchema,
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

      const permission = await prisma.permission.create({
        data,
      })

      return c.json(permission, 201)
    } catch (error) {
      if (error.code === "P2002") {
        throw new ApiError(
          "Permission with this action and subject already exists",
          400,
          ErrorCode.UNIQUE_VIOLATION
        )
      }

      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Update permission
permissionsRouter.openapi(
  createRoute({
    method: "put",
    path: "/:id",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Update a permission",
    request: {
      params: z.object({
        id: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: permissionSchema.partial(),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Permission updated",
        content: {
          "application/json": {
            schema: permissionResponseSchema,
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
        description: "Permission not found",
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

      const permission = await prisma.permission.update({
        where: { id },
        data,
      })

      return c.json(permission)
    } catch (error) {
      if (error.code === "P2025") {
        throw new ApiError("Permission not found", 404, ErrorCode.NOT_FOUND)
      }

      if (error.code === "P2002") {
        throw new ApiError(
          "Permission with this action and subject already exists",
          400,
          ErrorCode.UNIQUE_VIOLATION
        )
      }

      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Delete permission
permissionsRouter.openapi(
  createRoute({
    method: "delete",
    path: "/:id",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Delete a permission",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Permission deleted",
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
        description: "Permission not found",
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

      await prisma.permission.delete({
        where: { id },
      })

      return c.json({
        success: true,
        message: "Permission deleted successfully",
      })
    } catch (error) {
      if (error.code === "P2025") {
        throw new ApiError("Permission not found", 404, ErrorCode.NOT_FOUND)
      }

      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Get permissions by subject
permissionsRouter.openapi(
  createRoute({
    method: "get",
    path: "/subject/:subject",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Get permissions by subject",
    request: {
      params: z.object({
        subject: z.string(),
      }),
    },
    responses: {
      200: {
        description: "List of permissions for the subject",
        content: {
          "application/json": {
            schema: z.object({
              permissions: z.array(permissionResponseSchema),
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
      // Check if user has permission to read permissions
      await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(
        c,
        async () => {}
      )

      const { subject } = c.req.param()

      const permissions = await prisma.permission.findMany({
        where: { subject },
        orderBy: { name: "asc" },
      })

      return c.json({ permissions })
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

// Get permissions by action
permissionsRouter.openapi(
  createRoute({
    method: "get",
    path: "/action/:action",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Get permissions by action",
    request: {
      params: z.object({
        action: z.string(),
      }),
    },
    responses: {
      200: {
        description: "List of permissions for the action",
        content: {
          "application/json": {
            schema: z.object({
              permissions: z.array(permissionResponseSchema),
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
      // Check if user has permission to read permissions
      await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(
        c,
        async () => {}
      )

      const { action } = c.req.param()

      const permissions = await prisma.permission.findMany({
        where: { action },
        orderBy: { name: "asc" },
      })

      return c.json({ permissions })
    } catch (error) {
      return ErrorHandlingService.handleError(error, c)
    }
  }
)

export default permissionsRouter
