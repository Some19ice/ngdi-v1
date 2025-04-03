"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = exports.userRouter = void 0;
const hono_1 = require("hono");
const user_service_1 = require("../services/user.service");
const middleware_1 = require("../middleware");
const auth_types_1 = require("../types/auth.types");
const prisma_1 = require("../lib/prisma");
const http_exception_1 = require("hono/http-exception");
/**
 * User routes
 */
exports.userRouter = new hono_1.Hono();
// Apply authentication middleware to all routes
exports.userRouter.use("*", middleware_1.authMiddleware);
// Helper to require authentication
function requireAuth() {
    return middleware_1.authMiddleware;
}
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
    const userId = c.var.userId;
    if (!userId) {
        throw new http_exception_1.HTTPException(401, { message: "Unauthorized" });
    }
    const user = await user_service_1.userService.getUserById(userId);
    return c.json(user);
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
    const userId = c.var.userId;
    if (!userId) {
        throw new http_exception_1.HTTPException(401, { message: "Unauthorized" });
    }
    const data = await c.req.json();
    const updatedUser = await user_service_1.userService.updateProfile(userId, data);
    return c.json(updatedUser);
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
    const userId = c.var.userId;
    if (!userId) {
        throw new http_exception_1.HTTPException(401, { message: "Unauthorized" });
    }
    const { currentPassword, newPassword } = await c.req.json();
    await user_service_1.userService.changePassword(userId, currentPassword, newPassword);
    return c.json({ message: "Password changed successfully" });
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
/**
 * Get user dashboard metadata stats
 */
exports.userRouter.get("/dashboard/metadata-stats", requireAuth(), async (c) => {
    const userId = c.get("userId");
    try {
        console.log(`Fetching metadata stats for user ${userId}`);
        // Check if validationStatus exists in the schema
        const metadataFields = await prisma_1.prisma.$queryRaw `
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Metadata' AND column_name = 'validationStatus'
    `;
        console.log("Metadata fields check:", metadataFields);
        // Get counts of metadata by status (safely)
        let total, published, draft, rejected, pendingReview;
        try {
            total = await prisma_1.prisma.metadata.count({ where: { userId } });
            // Only attempt status filtering if the field exists
            if (Array.isArray(metadataFields) && metadataFields.length > 0) {
                published = await prisma_1.prisma.metadata.count({
                    where: { userId, validationStatus: "PUBLISHED" },
                });
                draft = await prisma_1.prisma.metadata.count({
                    where: { userId, validationStatus: "DRAFT" },
                });
                rejected = await prisma_1.prisma.metadata.count({
                    where: { userId, validationStatus: "REJECTED" },
                });
                pendingReview = await prisma_1.prisma.metadata.count({
                    where: { userId, validationStatus: "PENDING_REVIEW" },
                });
            }
            else {
                // If validationStatus doesn't exist, return zeros
                published = 0;
                draft = total; // Assume all are drafts if no status
                rejected = 0;
                pendingReview = 0;
                console.log("validationStatus field not found in schema, using default values");
            }
        }
        catch (countError) {
            console.error("Error counting metadata by status:", countError);
            // Provide fallback values
            total = await prisma_1.prisma.metadata.count({ where: { userId } });
            published = 0;
            draft = total;
            rejected = 0;
            pendingReview = 0;
        }
        // Calculate average completeness
        let avgCompleteness = 0;
        try {
            const metadataWithCompleteness = await prisma_1.prisma.metadata.findMany({
                where: {
                    userId,
                    completeness: { not: null },
                },
                select: { completeness: true },
            });
            const totalCompleteness = metadataWithCompleteness.reduce((sum, record) => sum + (record.completeness || 0), 0);
            avgCompleteness =
                metadataWithCompleteness.length > 0
                    ? Math.round(totalCompleteness / metadataWithCompleteness.length)
                    : 0;
        }
        catch (completenessError) {
            console.error("Error calculating completeness:", completenessError);
            // Leave avgCompleteness as 0
        }
        return c.json({
            total,
            published,
            draft,
            rejected,
            pendingReview,
            avgCompleteness,
        });
    }
    catch (error) {
        console.error("Error fetching metadata stats:", error);
        // Return a more detailed error message
        throw new http_exception_1.HTTPException(500, {
            message: `Failed to fetch metadata statistics: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
});
/**
 * Get user recent activity
 */
exports.userRouter.get("/dashboard/activity", requireAuth(), async (c) => {
    const userId = c.get("userId");
    const userName = c.get("userEmail").split("@")[0] || "User"; // Simple name extraction
    try {
        console.log(`Fetching activity for user ${userId}`);
        let activities = [];
        try {
            // Get recently viewed or edited metadata
            const recentMetadata = await prisma_1.prisma.metadata.findMany({
                where: { userId },
                orderBy: { updatedAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    updatedAt: true,
                    createdAt: true,
                },
            });
            console.log(`Found ${recentMetadata.length} metadata records for activity`);
            // Map to activity format
            activities = recentMetadata.map((metadata) => {
                const isNew = metadata.createdAt.getTime() === metadata.updatedAt.getTime();
                return {
                    id: metadata.id,
                    type: isNew ? "create" : "edit",
                    targetType: "metadata",
                    targetId: metadata.id,
                    targetTitle: metadata.title,
                    timestamp: metadata.updatedAt.toISOString(),
                    user: {
                        id: userId,
                        name: userName,
                    },
                };
            });
        }
        catch (metadataError) {
            console.error("Error generating activity from metadata:", metadataError);
            // Don't throw, just return an empty array
        }
        // If we have no real activities, add a fallback system activity to prevent UI errors
        if (activities.length === 0) {
            activities.push({
                id: "system-activity-1",
                type: "view",
                targetType: "system",
                targetId: "welcome",
                targetTitle: "Welcome to NGDI Portal",
                timestamp: new Date().toISOString(),
                user: {
                    id: userId,
                    name: userName,
                },
            });
        }
        return c.json(activities);
    }
    catch (error) {
        console.error("Error fetching user activity:", error);
        // Return a fallback activity instead of throwing an error
        return c.json([
            {
                id: "error-activity-1",
                type: "view",
                targetType: "system",
                targetId: "error",
                targetTitle: "Dashboard",
                timestamp: new Date().toISOString(),
                user: {
                    id: userId,
                    name: userName,
                },
            },
        ]);
    }
});
/**
 * @openapi
 * /api/users/dashboard/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 * Get user notifications
 */
exports.userRouter.get("/dashboard/notifications", requireAuth(), async (c) => {
    const userId = c.get("userId");
    try {
        console.log(`Fetching notifications for user ${userId}`);
        let notifications = [];
        try {
            // This is just an example - in a real app, you would have a notifications table
            // For now, generate notifications based on user's metadata
            const recentMetadata = await prisma_1.prisma.metadata.findMany({
                where: { userId },
                orderBy: { updatedAt: "desc" },
                take: 3,
                select: {
                    id: true,
                    title: true,
                    validationStatus: true,
                    updatedAt: true,
                },
            });
            console.log(`Found ${recentMetadata.length} metadata records for notifications`);
            // Map to notifications format
            notifications = recentMetadata.map((metadata) => {
                let type = "info";
                let message = "";
                let title = "";
                if (metadata.validationStatus === "PUBLISHED") {
                    type = "success";
                    title = "Metadata published";
                    message = `Your metadata record '${metadata.title}' has been published.`;
                }
                else if (metadata.validationStatus === "REJECTED") {
                    type = "error";
                    title = "Metadata rejected";
                    message = `Your metadata record '${metadata.title}' needs revision.`;
                }
                else if (metadata.validationStatus === "PENDING_REVIEW") {
                    type = "warning";
                    title = "Pending review";
                    message = `Your metadata record '${metadata.title}' is pending review.`;
                }
                else {
                    title = "Metadata updated";
                    message = `You've made changes to '${metadata.title}'.`;
                }
                return {
                    id: metadata.id,
                    title,
                    message,
                    type,
                    isRead: false,
                    createdAt: metadata.updatedAt.toISOString(),
                    link: `/metadata/detail/${metadata.id}`,
                };
            });
        }
        catch (metadataError) {
            console.error("Error generating notifications from metadata:", metadataError);
            // Don't re-throw, just continue with an empty notifications array
        }
        // Add a system notification (always include this one even if metadata failed)
        notifications.push({
            id: "system-1",
            title: "Welcome to NGDI Portal",
            message: "Explore the platform features and start managing your geospatial metadata.",
            type: "info",
            isRead: false,
            createdAt: new Date().toISOString(),
            link: "/dashboard",
        });
        return c.json(notifications);
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        // Return a more detailed error message but with an empty array to prevent UI failures
        return c.json([
            {
                id: "error-1",
                title: "Notification error",
                message: "We couldn't load your notifications. Please try again later.",
                type: "error",
                isRead: false,
                createdAt: new Date().toISOString(),
                link: "/dashboard",
            },
        ]);
    }
});
// Add a debug endpoint to check the metadata schema
exports.userRouter.get("/debug/metadata-schema", requireAuth(), async (c) => {
    try {
        // Get column information for Metadata table
        const columns = await prisma_1.prisma.$queryRaw `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Metadata'
    `;
        // Get a sample metadata record if any exist
        const sampleRecord = await prisma_1.prisma.metadata.findFirst({
            where: { userId: c.get("userId") },
        });
        return c.json({
            success: true,
            schema: {
                columns,
                sampleRecord: sampleRecord
                    ? {
                        id: sampleRecord.id,
                        title: sampleRecord.title,
                        validationStatus: sampleRecord.validationStatus,
                        completeness: sampleRecord.completeness,
                        // Add other fields that might be relevant
                    }
                    : null,
            },
        });
    }
    catch (error) {
        console.error("Error fetching metadata schema:", error);
        return c.json({
            success: false,
            error: `Failed to fetch metadata schema: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
});
// Export the router
exports.default = exports.userRouter;
