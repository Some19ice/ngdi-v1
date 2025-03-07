"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = exports.userRouter = void 0;
const hono_1 = require("hono");
const user_service_1 = require("../services/user.service");
const middleware_1 = require("../middleware");
const auth_types_1 = require("../types/auth.types");
/**
 * User routes
 */
exports.userRouter = new hono_1.Hono();
// Apply authentication middleware to all routes
exports.userRouter.use("*", middleware_1.authMiddleware);
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
exports.userRouter.get("/profile", async (c) => {
    const userId = c.get("userId");
    const user = await user_service_1.userService.getUserById(userId);
    return c.json({
        success: true,
        data: user,
    });
});
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
exports.userRouter.put("/profile", async (c) => {
    const userId = c.get("userId");
    const data = await c.req.json();
    const updatedUser = await user_service_1.userService.updateProfile(userId, data);
    return c.json({
        success: true,
        data: updatedUser,
    });
});
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
exports.userRouter.post("/change-password", async (c) => {
    const userId = c.get("userId");
    const { currentPassword, newPassword } = await c.req.json();
    await user_service_1.userService.changePassword(userId, currentPassword, newPassword);
    return c.json({
        success: true,
        message: "Password changed successfully",
    });
});
// Admin authorization middleware
function adminOnly() {
    return async (c, next) => {
        const userRole = c.get("userRole");
        if (userRole !== auth_types_1.UserRole.ADMIN) {
            return c.json({
                success: false,
                message: "Unauthorized. Admin access required.",
            }, 403);
        }
        await next();
    };
}
// Admin-only routes
exports.adminRouter = new hono_1.Hono()
    // Apply authentication middleware
    .use("*", middleware_1.authMiddleware)
    // Check if user is admin
    .use("*", adminOnly());
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
exports.adminRouter.get("/", async (c) => {
    const { page = "1", limit = "10", search, role } = c.req.query();
    const users = await user_service_1.userService.getAllUsers({
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
// Mount admin routes
exports.userRouter.route("/admin", exports.adminRouter);
// Export the router
exports.default = exports.userRouter;
