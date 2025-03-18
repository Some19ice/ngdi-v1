"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const admin_service_1 = require("../services/admin.service");
const auth_1 = require("../middleware/auth");
const auth_types_1 = require("../types/auth.types");
const user_types_1 = require("../types/user.types");
const metadata_types_1 = require("../types/metadata.types");
/**
 * Admin routes
 */
exports.adminRouter = new hono_1.Hono()
    // Apply authentication middleware to all routes
    .use("*", auth_1.authMiddleware)
    // Check if user is admin
    .use("*", async (c, next) => {
    const userRole = c.var.userRole;
    if (userRole !== auth_types_1.UserRole.ADMIN) {
        return c.json({
            success: false,
            message: "Unauthorized. Admin access required.",
        }, 403);
    }
    await next();
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
 *                     totalUsers:
 *                       type: number
 *                     totalMetadata:
 *                       type: number
 *                     newUsersLast30Days:
 *                       type: number
 *                     newMetadataLast30Days:
 *                       type: number
 *                     usersByRole:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
exports.adminRouter.get("/stats", async (c) => {
    const stats = await admin_service_1.adminService.getSystemStats();
    return c.json({
        success: true,
        data: stats,
    });
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
    const users = await admin_service_1.adminService.getAllUsers({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        role: role,
        sortBy: "createdAt",
        sortOrder: "desc",
    });
    return c.json({
        success: true,
        data: users,
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
    const updatedUser = await admin_service_1.adminService.updateUserRole(id, role);
    return c.json({
        success: true,
        data: updatedUser,
    });
});
/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
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
    return c.json({
        success: true,
        data: result,
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
 *     summary: Get comprehensive dashboard statistics
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
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
exports.adminRouter.get("/dashboard-stats", async (c) => {
    try {
        const stats = await admin_service_1.adminService.getAdminDashboardStats();
        return c.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return c.json({
            success: false,
            message: "Failed to fetch dashboard statistics",
        }, 500);
    }
});
exports.default = exports.adminRouter;
