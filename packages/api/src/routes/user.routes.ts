import { OpenAPIHono, createRoute } from "@hono/zod-openapi"
import { auth } from "../middleware/auth"
import { userService } from "../services/user.service"
import { UserRole } from "../types/auth.types"
import {
  userProfileSchema,
  UserIdParamSchema,
  ChangePasswordSchema,
  userResponseSchema,
  userListQuerySchema,
  userListResponseSchema,
  updateUserRoleSchema,
  UserSearchQuery,
} from "../types/user.types"
import { Context, Variables } from "../types/hono.types"
import { Env, MiddlewareHandler } from "hono"
import { HTTPException } from "hono/http-exception"

type AppEnv = {
  Variables: Variables
  Bindings: Env
}

// Create user router instance
const userRouter = new OpenAPIHono<AppEnv>()

// Apply auth middleware to all routes
userRouter.use("*", ((c, next) =>
  auth.authenticate(
    c as unknown as Context,
    next
  )) as MiddlewareHandler<AppEnv>)

// Get user profile
userRouter.openapi(
  createRoute({
    method: "get",
    path: "/profile",
    tags: ["User"],
    description: "Get user profile",
    responses: {
      200: {
        description: "User profile retrieved successfully",
        content: {
          "application/json": {
            schema: userResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const userId = c.var.userId
    if (!userId) {
      throw new HTTPException(401, { message: "Unauthorized" })
    }
    const profile = await userService.getProfile(userId)
    return c.json(profile)
  }
)

// Update user profile
userRouter.openapi(
  createRoute({
    method: "put",
    path: "/profile",
    tags: ["User"],
    description: "Update user profile",
    request: {
      body: {
        content: {
          "application/json": {
            schema: userProfileSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "User profile updated successfully",
        content: {
          "application/json": {
            schema: userResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const userId = c.var.userId
    if (!userId) {
      throw new HTTPException(401, { message: "Unauthorized" })
    }
    const data = await c.req.json()
    const updatedProfile = await userService.updateProfile(userId, data)
    return c.json(updatedProfile)
  }
)

// Change password
userRouter.openapi(
  createRoute({
    method: "post",
    path: "/change-password",
    tags: ["User"],
    description: "Change user password",
    request: {
      body: {
        content: {
          "application/json": {
            schema: ChangePasswordSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Password changed successfully",
      },
    },
  }),
  async (c) => {
    const userId = c.var.userId
    if (!userId) {
      throw new HTTPException(401, { message: "Unauthorized" })
    }
    const { currentPassword, newPassword } = await c.req.json()
    await userService.changePassword(userId, currentPassword, newPassword)
    return c.json({ message: "Password changed successfully" })
  }
)

// Create admin router instance
const adminRouter = new OpenAPIHono<AppEnv>()

// Apply admin auth middleware to all routes
adminRouter.use("*", ((c, next) => {
  const [authenticate, authorize] = auth.requireAdmin
  return authenticate(c as unknown as Context, async () => {
    await authorize(c as unknown as Context, next)
  })
}) as MiddlewareHandler<AppEnv>)

// Get all users
adminRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Admin"],
    description: "Get all users (admin only)",
    request: {
      query: userListQuerySchema,
    },
    responses: {
      200: {
        description: "Users retrieved successfully",
        content: {
          "application/json": {
            schema: userListResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const query = c.req.query()
    const searchQuery: UserSearchQuery = {
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
      search: query.search,
      role: query.role as UserRole,
      sortBy: (query.sortBy || "createdAt") as
        | "name"
        | "email"
        | "role"
        | "createdAt",
      sortOrder: (query.sortOrder || "desc") as "asc" | "desc",
    }
    const users = await userService.getAllUsers(searchQuery)
    return c.json(users)
  }
)

// Get user by ID
adminRouter.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Admin"],
    description: "Get user by ID (admin only)",
    request: {
      params: UserIdParamSchema,
    },
    responses: {
      200: {
        description: "User retrieved successfully",
        content: {
          "application/json": {
            schema: userResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.param()
    const user = await userService.getUserById(id)
    return c.json(user)
  }
)

// Update user role
adminRouter.openapi(
  createRoute({
    method: "put",
    path: "/{id}/role",
    tags: ["Admin"],
    description: "Update user role (admin only)",
    request: {
      params: UserIdParamSchema,
      body: {
        content: {
          "application/json": {
            schema: updateUserRoleSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "User role updated successfully",
        content: {
          "application/json": {
            schema: userResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.param()
    const { role } = await c.req.json()
    const updatedUser = await userService.updateUserRole(id, role)
    return c.json(updatedUser)
  }
)

// Delete user
adminRouter.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["Admin"],
    description: "Delete user (admin only)",
    request: {
      params: UserIdParamSchema,
    },
    responses: {
      200: {
        description: "User deleted successfully",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.param()
    await userService.deleteUser(id)
    return c.json({ message: "User deleted successfully" })
  }
)

// Create a main router that combines user and admin routes
const router = new OpenAPIHono<AppEnv>()

// Mount user routes
router.route("/", userRouter)

// Mount admin routes
router.route("/admin", adminRouter)

// Export the router as default
export default router
