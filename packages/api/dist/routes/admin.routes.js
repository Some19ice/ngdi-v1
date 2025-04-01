"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const admin_service_1 = require("../services/admin.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_types_1 = require("../types/auth.types");
const user_types_1 = require("../types/user.types");
const metadata_types_1 = require("../types/metadata.types");
const error_handler_1 = require("../middleware/error-handler");
const prisma_1 = require("../lib/prisma");
const logger_1 = require("../lib/logger");
const json_serializer_1 = require("../utils/json-serializer");
const cache_1 = require("../utils/cache");
/**
 * Admin routes
 */
exports.adminRouter = new hono_1.Hono()
    // Apply authentication middleware to all routes
    .use("*", auth_middleware_1.authMiddleware)
    // Check if user is admin
    .use("*", async (c, next) => {
    try {
        const user = c.get("user");
        if (!user || user.role !== auth_types_1.UserRole.ADMIN) {
            return c.json({
                success: false,
                message: "Unauthorized. Admin access required.",
            }, 403);
        }
        await next();
    }
    catch (error) {
        console.error("Admin authorization error:", error);
        return c.json({
            success: false,
            message: "Error checking admin permissions",
        }, 500);
    }
});
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
exports.adminRouter.get("/users", async (c) => {
    const { page = "1", limit = "10", search, role } = c.req.query();
    // Generate cache key from query parameters
    const cacheKey = `admin-users-${page}-${limit}-${search || ""}-${role || ""}`;
    // Check cache first for non-search queries
    const cachedResult = cache_1.memoryCache.get(cacheKey);
    if (cachedResult && !search) {
        // Don't use cache for search queries
        logger_1.logger.info("Serving admin users from cache");
        return new Response(cachedResult, {
            headers: {
                "Content-Type": "application/json",
                "X-Cache": "HIT",
            },
        });
    }
    const users = await admin_service_1.adminService.getAllUsers({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        role: role,
        sortBy: "createdAt",
        sortOrder: "desc",
    });
    // Serialize response
    const serializedResponse = json_serializer_1.SafeJSON.stringify({
        success: true,
        data: users,
    });
    // Cache the result for 2 minutes, but only if it's not a search query
    if (!search) {
        cache_1.memoryCache.set(cacheKey, serializedResponse, 120000); // 2 minutes TTL
    }
    return new Response(serializedResponse, {
        headers: {
            "Content-Type": "application/json",
            "X-Cache": "MISS",
        },
    });
});
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
exports.adminRouter.put("/users/:id/role", (0, zod_validator_1.zValidator)("param", user_types_1.UserIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const { role } = await c.req.json();
    if (!role || !Object.values(auth_types_1.UserRole).includes(role)) {
        return c.json({
            success: false,
            message: "Invalid role",
        }, 400);
    }
    try {
        const user = await admin_service_1.adminService.updateUserRole(id, role);
        return c.json({
            success: true,
            message: "User role updated successfully",
            data: user,
        });
    }
    catch (error) {
        if (error instanceof error_handler_1.ApiError && error.status === 404) {
            return c.json({
                success: false,
                message: error.message,
            }, 404);
        }
        console.error("Error updating user role:", error);
        return c.json({
            success: false,
            message: "Failed to update user role",
        }, 500);
    }
});
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
exports.adminRouter.get("/users/:id", (0, zod_validator_1.zValidator)("param", user_types_1.UserIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    try {
        console.log(`[API] Fetching details for user ${id}`);
        const userDetails = await admin_service_1.adminService.getUserDetails(id);
        return c.json({
            success: true,
            data: userDetails,
        });
    }
    catch (error) {
        if (error instanceof error_handler_1.ApiError && error.status === 404) {
            return c.json({
                success: false,
                message: "User not found",
            }, 404);
        }
        console.error("Error fetching user details:", error);
        return c.json({
            success: false,
            message: "Failed to fetch user details",
        }, 500);
    }
});
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
exports.adminRouter.delete("/users/:id", (0, zod_validator_1.zValidator)("param", user_types_1.UserIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    await admin_service_1.adminService.deleteUser(id);
    return c.json({
        success: true,
        message: "User deleted successfully",
    });
});
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
exports.adminRouter.post("/users/:id/verify-email", (0, zod_validator_1.zValidator)("param", user_types_1.UserIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const user = await admin_service_1.adminService.verifyUserEmail(id);
    return c.json({
        success: true,
        data: user,
        message: "Email verified successfully",
    });
});
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
exports.adminRouter.get("/metadata", async (c) => {
    const { page = "1", limit = "10", search, category, dateFrom, dateTo, } = c.req.query();
    // Generate cache key from query parameters
    const cacheKey = `admin-metadata-${page}-${limit}-${search || ""}-${category || ""}-${dateFrom || ""}-${dateTo || ""}`;
    // Check cache first
    const cachedResult = cache_1.memoryCache.get(cacheKey);
    if (cachedResult && !search) {
        // Don't use cache for search queries
        logger_1.logger.info("Serving admin metadata from cache");
        return new Response(cachedResult, {
            headers: {
                "Content-Type": "application/json",
                "X-Cache": "HIT",
            },
        });
    }
    const result = await admin_service_1.adminService.getAllMetadata({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        category,
        dateFrom,
        dateTo,
        sortBy: "createdAt",
        sortOrder: "desc",
    });
    // Serialize response
    const serializedResponse = json_serializer_1.SafeJSON.stringify({
        success: true,
        data: result,
    });
    // Cache the result for 2 minutes, but only if it's not a search query
    if (!search) {
        cache_1.memoryCache.set(cacheKey, serializedResponse, 120000); // 2 minutes TTL
    }
    return new Response(serializedResponse, {
        headers: {
            "Content-Type": "application/json",
            "X-Cache": "MISS",
        },
    });
});
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
exports.adminRouter.delete("/metadata/:id", (0, zod_validator_1.zValidator)("param", metadata_types_1.MetadataIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    await admin_service_1.adminService.deleteMetadata(id);
    return c.json({
        success: true,
        message: "Metadata deleted successfully",
    });
});
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
exports.adminRouter.get("/dashboard-stats", async (c) => {
    try {
        const user = c.get("user");
        if (!user) {
            throw new error_handler_1.ApiError("Unauthorized", 401);
        }
        // Generate a cache key based on the user ID
        const cacheKey = `dashboard-stats-${user.id}`;
        // Check if we have cached data
        const cachedStats = cache_1.memoryCache.get(cacheKey);
        if (cachedStats) {
            logger_1.logger.info("Serving dashboard stats from cache", {
                userId: user.id,
                email: user.email,
            });
            return new Response(cachedStats, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Cache": "HIT",
                },
            });
        }
        logger_1.logger.info("Fetching dashboard stats", {
            userId: user.id,
            email: user.email,
        });
        // Run all database queries in parallel using Promise.all
        const [totalUsers, totalMetadata, userRoleDistribution, recentMetadata, userGrowth, metadataByFramework, topOrganizations,] = await Promise.all([
            // Get total users
            prisma_1.prisma.user.count(),
            // Get total metadata entries
            prisma_1.prisma.metadata.count(),
            // Get user role distribution
            prisma_1.prisma.user.groupBy({
                by: ["role"],
                _count: {
                    id: true,
                },
            }),
            // Get recent metadata entries with optimized field selection
            prisma_1.prisma.metadata.findMany({
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
            prisma_1.prisma.user.groupBy({
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
            prisma_1.prisma.metadata.groupBy({
                by: ["frameworkType"],
                _count: {
                    id: true,
                },
            }),
            // Get top organizations
            prisma_1.prisma.metadata.groupBy({
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
        ]);
        logger_1.logger.debug("All dashboard queries completed", {
            totalUsers,
            totalMetadataCount: totalMetadata,
            userRoleDistCount: userRoleDistribution.length,
            recentMetadataCount: recentMetadata.length,
            userGrowthPoints: userGrowth.length,
            metadataByFrameworkCount: metadataByFramework.length,
            topOrganizationsCount: topOrganizations.length,
        });
        const stats = {
            totalUsers,
            totalMetadata,
            userRoleDistribution,
            recentMetadata,
            userGrowth,
            metadataByFramework,
            topOrganizations,
        };
        // Serialize the response once
        const serializedResponse = json_serializer_1.SafeJSON.stringify(stats);
        // Cache the serialized response for 5 minutes (300000 ms)
        cache_1.memoryCache.set(cacheKey, serializedResponse, 300000);
        // Return the response
        return new Response(serializedResponse, {
            headers: {
                "Content-Type": "application/json",
                "X-Cache": "MISS",
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Error fetching dashboard stats", {
            error,
            userId: c.get("user")?.id,
            email: c.get("user")?.email,
        });
        if (error instanceof error_handler_1.ApiError) {
            return c.json({ error: error.message }, error.status);
        }
        return c.json({
            error: "Failed to fetch dashboard statistics",
            message: error instanceof Error ? error.message : "Unknown error occurred",
        }, 500);
    }
});
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
exports.adminRouter.get("/stats", async (c) => {
    try {
        // Check for cached stats
        const cacheKey = "admin-system-stats";
        const cachedStats = cache_1.memoryCache.get(cacheKey);
        if (cachedStats) {
            logger_1.logger.info("Serving system stats from cache");
            return new Response(cachedStats, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Cache": "HIT",
                },
            });
        }
        const stats = await admin_service_1.adminService.getAdminDashboardStats();
        // Serialize the response
        const serializedResponse = json_serializer_1.SafeJSON.stringify({
            success: true,
            data: stats,
        });
        // Cache for 5 minutes
        cache_1.memoryCache.set(cacheKey, serializedResponse, 300000);
        // Use SafeJSON to handle BigInt values
        return new Response(serializedResponse, {
            headers: {
                "Content-Type": "application/json",
                "X-Cache": "MISS",
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Error fetching system stats", {
            error,
            userId: c.get("user")?.id,
            email: c.get("user")?.email,
        });
        if (error instanceof error_handler_1.ApiError) {
            return c.json({ error: error.message }, error.status);
        }
        return c.json({
            success: false,
            message: "Failed to fetch system statistics",
        }, 500);
    }
});
exports.default = exports.adminRouter;
