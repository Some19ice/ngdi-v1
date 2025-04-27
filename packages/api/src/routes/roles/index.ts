import { OpenAPIHono, createRoute } from "@hono/zod-openapi"
import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { authMiddleware, requirePermission } from "../../middleware"
import {
  ROLE_READ,
  ROLE_CREATE,
  ROLE_UPDATE,
  ROLE_DELETE,
  ROLE_ASSIGN,
} from "../../constants/permissions"
import { errorHandler } from "../../services/error-handling.service"
import { ApiError, ErrorCode } from "../../middleware/error-handler"

// Create roles router
const rolesRouter = new OpenAPIHono()

// Apply auth middleware to all routes
rolesRouter.use("*", authMiddleware)

// Role schema
const roleSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  isSystem: z.boolean().optional().default(false),
})

// Role response schema
const roleResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Role with permissions schema
const roleWithPermissionsSchema = roleResponseSchema.extend({
  permissions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      action: z.string(),
      subject: z.string(),
    })
  ),
})

// List roles
rolesRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "List all roles",
    responses: {
      200: {
        description: "List of roles",
        content: {
          "application/json": {
            schema: z.object({
              roles: z.array(roleResponseSchema),
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
    // Check if user has permission to read roles
    await requirePermission(ROLE_READ.action, ROLE_READ.subject)(
      c,
      async () => {}
    )

    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
    })

    return c.json({ roles })
  }
)

// Get role by ID
rolesRouter.openapi(
  createRoute({
    method: "get",
    path: "/:id",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Get role by ID with its permissions",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Role details with permissions",
        content: {
          "application/json": {
            schema: roleWithPermissionsSchema,
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
        description: "Role not found",
      },
    },
  }),
  async (c) => {
    // Check if user has permission to read roles
    await requirePermission(ROLE_READ.action, ROLE_READ.subject)(
      c,
      async () => {}
    )

    const { id } = c.req.param()

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    if (!role) {
      return c.json({ error: "Role not found" }, 404)
    }

    // Transform the response
    const response = {
      ...role,
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        action: rp.permission.action,
        subject: rp.permission.subject,
      })),
    }

    // Remove rolePermissions from the response
    delete response.rolePermissions

    return c.json(response)
  }
)

// Create role
rolesRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Create a new role",
    request: {
      body: {
        content: {
          "application/json": {
            schema: roleSchema.extend({
              permissionIds: z.array(z.string()).optional(),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Role created",
        content: {
          "application/json": {
            schema: roleWithPermissionsSchema,
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
    // Check if user has permission to create roles
    await requirePermission(ROLE_CREATE.action, ROLE_CREATE.subject)(
      c,
      async () => {}
    )

    const data = await c.req.json()
    const { permissionIds, ...roleData } = data

    try {
      // Create the role
      const role = await prisma.role.create({
        data: roleData,
      })

      // Add permissions if provided
      if (permissionIds && permissionIds.length > 0) {
        await prisma.$transaction(
          permissionIds.map((permissionId) =>
            prisma.rolePermission.create({
              data: {
                roleId: role.id,
                permissionId,
              },
            })
          )
        )
      }

      // Get the role with permissions
      const roleWithPermissions = await prisma.role.findUnique({
        where: { id: role.id },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      })

      // Transform the response
      const response = {
        ...roleWithPermissions,
        permissions: roleWithPermissions.rolePermissions.map((rp) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          action: rp.permission.action,
          subject: rp.permission.subject,
        })),
      }

      // Remove rolePermissions from the response
      delete response.rolePermissions

      return c.json(response, 201)
    } catch (error) {
      // Handle specific Prisma errors before passing to the general error handler
      if (error.code === "P2002") {
        throw new ApiError(
          "Role with this name already exists",
          400,
          ErrorCode.UNIQUE_VIOLATION
        )
      }

      return errorHandler(error, c)
    }
  }
)

// Update role
rolesRouter.openapi(
  createRoute({
    method: "put",
    path: "/:id",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Update a role",
    request: {
      params: z.object({
        id: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: roleSchema.partial().extend({
              permissionIds: z.array(z.string()).optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Role updated",
        content: {
          "application/json": {
            schema: roleWithPermissionsSchema,
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
        description: "Role not found",
      },
    },
  }),
  async (c) => {
    // Check if user has permission to update roles
    await requirePermission(ROLE_UPDATE.action, ROLE_UPDATE.subject)(
      c,
      async () => {}
    )

    const { id } = c.req.param()
    const data = await c.req.json()
    const { permissionIds, ...roleData } = data

    try {
      // Check if the role exists and is not a system role
      const existingRole = await prisma.role.findUnique({
        where: { id },
      })

      if (!existingRole) {
        return c.json({ error: "Role not found" }, 404)
      }

      if (existingRole.isSystem && data.isSystem === false) {
        return c.json({ error: "Cannot change system role status" }, 400)
      }

      // Update the role
      const role = await prisma.role.update({
        where: { id },
        data: roleData,
      })

      // Update permissions if provided
      if (permissionIds !== undefined) {
        // Delete existing role permissions
        await prisma.rolePermission.deleteMany({
          where: { roleId: id },
        })

        // Add new permissions
        if (permissionIds.length > 0) {
          await prisma.$transaction(
            permissionIds.map((permissionId) =>
              prisma.rolePermission.create({
                data: {
                  roleId: role.id,
                  permissionId,
                },
              })
            )
          )
        }
      }

      // Get the updated role with permissions
      const roleWithPermissions = await prisma.role.findUnique({
        where: { id: role.id },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      })

      // Transform the response
      const response = {
        ...roleWithPermissions,
        permissions: roleWithPermissions.rolePermissions.map((rp) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          action: rp.permission.action,
          subject: rp.permission.subject,
        })),
      }

      // Remove rolePermissions from the response
      delete response.rolePermissions

      return c.json(response)
    } catch (error) {
      // Handle specific Prisma errors before passing to the general error handler
      if (error.code === "P2025") {
        throw new ApiError("Role not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
      }

      if (error.code === "P2002") {
        throw new ApiError(
          "Role with this name already exists",
          400,
          ErrorCode.UNIQUE_VIOLATION
        )
      }

      return errorHandler(error, c)
    }
  }
)

// Delete role
rolesRouter.openapi(
  createRoute({
    method: "delete",
    path: "/:id",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Delete a role",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Role deleted",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: "Cannot delete system role",
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Forbidden",
      },
      404: {
        description: "Role not found",
      },
    },
  }),
  async (c) => {
    // Check if user has permission to delete roles
    await requirePermission(ROLE_DELETE.action, ROLE_DELETE.subject)(
      c,
      async () => {}
    )

    const { id } = c.req.param()

    try {
      // Check if the role exists and is not a system role
      const role = await prisma.role.findUnique({
        where: { id },
      })

      if (!role) {
        return c.json({ error: "Role not found" }, 404)
      }

      if (role.isSystem) {
        return c.json({ error: "Cannot delete system role" }, 400)
      }

      // Delete the role
      await prisma.role.delete({
        where: { id },
      })

      return c.json({ message: "Role deleted successfully" })
    } catch (error) {
      // Handle specific Prisma errors before passing to the general error handler
      if (error.code === "P2025") {
        throw new ApiError("Role not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
      }

      return errorHandler(error, c)
    }
  }
)

// Assign role to user
rolesRouter.openapi(
  createRoute({
    method: "post",
    path: "/assign/:roleId/user/:userId",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Assign a role to a user",
    request: {
      params: z.object({
        roleId: z.string(),
        userId: z.string()
      })
    },
    responses: {
      200: {
        description: "Role assigned to user",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string()
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Role or user not found"
      }
    }
  }),
  async (c) => {
    // Check if user has permission to assign roles
    await requirePermission(ROLE_ASSIGN.action, ROLE_ASSIGN.subject)(c, async () => {})

    const { roleId, userId } = c.req.param()

    try {
      // Check if the role and user exist
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      })

      if (!role) {
        return c.json({ error: "Role not found" }, 404)
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return c.json({ error: "User not found" }, 404)
      }

      // Update the user's role
      await prisma.user.update({
        where: { id: userId },
        data: { roleId }
      })

      return c.json({ message: "Role assigned to user successfully" })
    } catch (error) {
      return c.json({ error: "Failed to assign role to user" }, 500)
    }
  }
)

// Get users with a specific role
rolesRouter.openapi(
  createRoute({
    method: "get",
    path: "/:id/users",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Get users with a specific role",
    request: {
      params: z.object({
        id: z.string()
      })
    },
    responses: {
      200: {
        description: "List of users with the role",
        content: {
          "application/json": {
            schema: z.object({
              users: z.array(z.object({
                id: z.string(),
                name: z.string().nullable(),
                email: z.string(),
                role: z.string()
              }))
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Role not found"
      }
    }
  }),
  async (c) => {
    // Check if user has permission to read roles
    await requirePermission(ROLE_READ.action, ROLE_READ.subject)(c, async () => {})

    const { id } = c.req.param()

    try {
      // Check if the role exists
      const role = await prisma.role.findUnique({
        where: { id }
      })

      if (!role) {
        return c.json({ error: "Role not found" }, 404)
      }

      // Get users with the role
      const users = await prisma.user.findMany({
        where: { roleId: id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })

      return c.json({ users })
    } catch (error) {
      return c.json({ error: "Failed to get users with role" }, 500)
    }
  }
)

export default rolesRouter
