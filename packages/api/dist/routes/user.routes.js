"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_openapi_1 = require("@hono/zod-openapi");
const auth_1 = require("../middleware/auth");
const user_service_1 = require("../services/user.service");
const user_types_1 = require("../types/user.types");
// Create user router instance
const userRouter = new zod_openapi_1.OpenAPIHono();
// Apply auth middleware to all routes
userRouter.use("*", ((c, next) => auth_1.auth.authenticate(c, next)));
// Get user profile
userRouter.openapi((0, zod_openapi_1.createRoute)({
    method: "get",
    path: "/profile",
    tags: ["User"],
    description: "Get user profile",
    responses: {
        200: {
            description: "User profile retrieved successfully",
            content: {
                "application/json": {
                    schema: user_types_1.userResponseSchema,
                },
            },
        },
    },
}), async (c) => {
    const userId = c.get("userId");
    const profile = await user_service_1.userService.getProfile(userId);
    return c.json(profile);
});
// Update user profile
userRouter.openapi((0, zod_openapi_1.createRoute)({
    method: "put",
    path: "/profile",
    tags: ["User"],
    description: "Update user profile",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: user_types_1.userProfileSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "User profile updated successfully",
            content: {
                "application/json": {
                    schema: user_types_1.userResponseSchema,
                },
            },
        },
    },
}), async (c) => {
    const userId = c.get("userId");
    const data = await c.req.json();
    const updatedProfile = await user_service_1.userService.updateProfile(userId, data);
    return c.json(updatedProfile);
});
// Change password
userRouter.openapi((0, zod_openapi_1.createRoute)({
    method: "post",
    path: "/change-password",
    tags: ["User"],
    description: "Change user password",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: user_types_1.ChangePasswordSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Password changed successfully",
        },
    },
}), async (c) => {
    const userId = c.get("userId");
    const { currentPassword, newPassword } = await c.req.json();
    await user_service_1.userService.changePassword(userId, currentPassword, newPassword);
    return c.json({ message: "Password changed successfully" });
});
// Create admin router instance
const adminRouter = new zod_openapi_1.OpenAPIHono();
// Apply admin auth middleware to all routes
adminRouter.use("*", ((c, next) => {
    const [authenticate, authorize] = auth_1.auth.requireAdmin;
    return authenticate(c, async () => {
        await authorize(c, next);
    });
}));
// Get all users
adminRouter.openapi((0, zod_openapi_1.createRoute)({
    method: "get",
    path: "/",
    tags: ["Admin"],
    description: "Get all users (admin only)",
    request: {
        query: user_types_1.userListQuerySchema,
    },
    responses: {
        200: {
            description: "Users retrieved successfully",
            content: {
                "application/json": {
                    schema: user_types_1.userListResponseSchema,
                },
            },
        },
    },
}), async (c) => {
    const query = c.req.query();
    const searchQuery = {
        page: parseInt(query.page || "1"),
        limit: parseInt(query.limit || "10"),
        search: query.search,
        role: query.role,
        sortBy: (query.sortBy || "createdAt"),
        sortOrder: (query.sortOrder || "desc"),
    };
    const users = await user_service_1.userService.getAllUsers(searchQuery);
    return c.json(users);
});
// Get user by ID
adminRouter.openapi((0, zod_openapi_1.createRoute)({
    method: "get",
    path: "/{id}",
    tags: ["Admin"],
    description: "Get user by ID (admin only)",
    request: {
        params: user_types_1.UserIdParamSchema,
    },
    responses: {
        200: {
            description: "User retrieved successfully",
            content: {
                "application/json": {
                    schema: user_types_1.userResponseSchema,
                },
            },
        },
    },
}), async (c) => {
    const { id } = c.req.param();
    const user = await user_service_1.userService.getUserById(id);
    return c.json(user);
});
// Update user role
adminRouter.openapi((0, zod_openapi_1.createRoute)({
    method: "put",
    path: "/{id}/role",
    tags: ["Admin"],
    description: "Update user role (admin only)",
    request: {
        params: user_types_1.UserIdParamSchema,
        body: {
            content: {
                "application/json": {
                    schema: user_types_1.updateUserRoleSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "User role updated successfully",
            content: {
                "application/json": {
                    schema: user_types_1.userResponseSchema,
                },
            },
        },
    },
}), async (c) => {
    const { id } = c.req.param();
    const { role } = await c.req.json();
    const updatedUser = await user_service_1.userService.updateUserRole(id, role);
    return c.json(updatedUser);
});
// Delete user
adminRouter.openapi((0, zod_openapi_1.createRoute)({
    method: "delete",
    path: "/{id}",
    tags: ["Admin"],
    description: "Delete user (admin only)",
    request: {
        params: user_types_1.UserIdParamSchema,
    },
    responses: {
        200: {
            description: "User deleted successfully",
        },
    },
}), async (c) => {
    const { id } = c.req.param();
    await user_service_1.userService.deleteUser(id);
    return c.json({ message: "User deleted successfully" });
});
// Create a main router that combines user and admin routes
const router = new zod_openapi_1.OpenAPIHono();
// Mount user routes
router.route("/", userRouter);
// Mount admin routes
router.route("/admin", adminRouter);
// Export the router as default
exports.default = router;
