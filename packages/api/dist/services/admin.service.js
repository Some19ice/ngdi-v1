"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const user_repository_1 = require("../db/repositories/user.repository");
const metadata_repository_1 = require("../db/repositories/metadata.repository");
const error_handler_1 = require("../middleware/error-handler");
const role_mapper_1 = require("../utils/role-mapper");
const client_1 = require("../db/client");
/**
 * Admin service for administrative operations
 */
exports.adminService = {
    /**
     * Get enhanced admin dashboard statistics
     */
    getAdminDashboardStats: async () => {
        // Get active time period (30 days ago)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        // Fetch all the statistics in parallel for better performance
        const [userCount, organizations, metadataCount, activeUsers, pendingCount] = await Promise.all([
            // Total number of users
            client_1.prisma.user.count(),
            // Get unique organizations
            client_1.prisma.user.groupBy({
                by: ["organization"],
                where: {
                    organization: {
                        not: null,
                    },
                },
            }),
            // Total metadata entries
            client_1.prisma.metadata.count(),
            // Active users (users with activity in the last 30 days)
            client_1.prisma.user.count({
                where: {
                    metadata: {
                        some: {
                            updatedAt: {
                                gte: thirtyDaysAgo,
                            },
                        },
                    },
                },
            }),
            // Pending approvals (metadata with 'validationStatus' that is not 'Validated')
            client_1.prisma.metadata.count({
                where: {
                    validationStatus: {
                        not: "Validated",
                    },
                },
            }),
        ]);
        // Filter out null organizations and get the count
        const orgCount = organizations.filter((org) => org.organization !== null).length;
        // Calculate system health based on actual metrics
        const metadataRatio = metadataCount > 0 ? Math.min(metadataCount / 1000, 1) : 0;
        const userRatio = userCount > 0 ? Math.min(userCount / 200, 1) : 0;
        const activeRatio = userCount > 0 ? activeUsers / userCount : 0;
        // Weight the factors (adjust as needed)
        const systemHealth = Math.round((metadataRatio * 0.3 + userRatio * 0.3 + activeRatio * 0.4) * 100);
        return {
            userCount,
            orgCount,
            metadataCount,
            activeUsers,
            pendingApprovals: pendingCount,
            systemHealth,
        };
    },
    /**
     * Get all users with pagination and filtering
     */
    getAllUsers: async (query) => {
        const result = await user_repository_1.userRepository.findAll(query);
        return {
            users: result.users.map((user) => ({
                id: user.id,
                email: user.email,
                name: user.name || "",
                role: (0, role_mapper_1.mapPrismaRoleToAppRole)(user.role),
                emailVerified: user.emailVerified !== null,
                organization: user.organization || undefined,
                department: user.department || undefined,
                phone: user.phone || undefined,
                image: user.image || undefined,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            })),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    },
    /**
     * Update user role
     */
    updateUserRole: async (userId, role) => {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new error_handler_1.ApiError("User not found", 404, error_handler_1.ErrorCode.RESOURCE_NOT_FOUND);
        }
        const updatedUser = await user_repository_1.userRepository.update(userId, {
            role: (0, role_mapper_1.mapAppRoleToPrismaRole)(role),
        });
        return {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name || "",
            role: (0, role_mapper_1.mapPrismaRoleToAppRole)(updatedUser.role),
            emailVerified: updatedUser.emailVerified !== null,
            organization: updatedUser.organization || undefined,
            department: updatedUser.department || undefined,
            phone: updatedUser.phone || undefined,
            image: updatedUser.image || undefined,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
        };
    },
    /**
     * Delete user
     */
    deleteUser: async (userId) => {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new error_handler_1.ApiError("User not found", 404, error_handler_1.ErrorCode.RESOURCE_NOT_FOUND);
        }
        // Delete all user's metadata first
        await metadata_repository_1.metadataRepository.deleteByUserId(userId);
        // Then delete the user
        await user_repository_1.userRepository.delete(userId);
    },
    /**
     * Get detailed user information
     */
    getUserDetails: async (userId) => {
        // Try exact match first
        let user = await user_repository_1.userRepository.findById(userId);
        // If not found, try case-insensitive search
        if (!user) {
            const allUsers = await client_1.prisma.user.findMany({
                take: 100,
                select: { id: true },
            });
            const matchedUser = allUsers.find((u) => u.id.toLowerCase() === userId.toLowerCase());
            if (matchedUser) {
                user = await user_repository_1.userRepository.findById(matchedUser.id);
            }
        }
        if (!user) {
            throw new error_handler_1.ApiError("User not found", 404, error_handler_1.ErrorCode.RESOURCE_NOT_FOUND);
        }
        // Get metadata count and recent activity
        const [metadataCount, recentMetadata] = await Promise.all([
            client_1.prisma.metadata.count({
                where: { userId: user.id },
            }),
            client_1.prisma.metadata.findMany({
                where: { userId: user.id },
                orderBy: { updatedAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    updatedAt: true,
                },
            }),
        ]);
        return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            role: (0, role_mapper_1.mapPrismaRoleToAppRole)(user.role),
            emailVerified: user.emailVerified !== null,
            organization: user.organization || undefined,
            department: user.department || undefined,
            phone: user.phone || undefined,
            image: user.image || undefined,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            metadataCount,
            recentActivity: recentMetadata.map((m) => ({
                id: m.id,
                title: m.title,
                updatedAt: m.updatedAt.toISOString(),
            })),
        };
    },
    /**
     * Get all metadata with pagination and filtering
     */
    getAllMetadata: async (query) => {
        const result = await metadata_repository_1.metadataRepository.findAll(query);
        return {
            metadata: result.metadata.map((metadata) => ({
                id: metadata.id,
                title: metadata.title,
                author: metadata.author,
                organization: metadata.organization,
                dateFrom: metadata.dateFrom,
                dateTo: metadata.dateTo,
                abstract: metadata.abstract,
                purpose: metadata.purpose,
                thumbnailUrl: metadata.thumbnailUrl,
                imageName: metadata.imageName,
                frameworkType: metadata.frameworkType,
                categories: metadata.categories,
                coordinateSystem: metadata.coordinateSystem,
                projection: metadata.projection,
                scale: metadata.scale,
                resolution: metadata.resolution || undefined,
                accuracyLevel: metadata.accuracyLevel,
                completeness: metadata.completeness || undefined,
                consistencyCheck: metadata.consistencyCheck || undefined,
                validationStatus: metadata.validationStatus || undefined,
                fileFormat: metadata.fileFormat,
                fileSize: metadata.fileSize || undefined,
                numFeatures: metadata.numFeatures || undefined,
                softwareReqs: metadata.softwareReqs || undefined,
                updateCycle: metadata.updateCycle || undefined,
                lastUpdate: metadata.lastUpdate?.toISOString() || undefined,
                nextUpdate: metadata.nextUpdate?.toISOString() || undefined,
                distributionFormat: metadata.distributionFormat,
                accessMethod: metadata.accessMethod,
                downloadUrl: metadata.downloadUrl || undefined,
                apiEndpoint: metadata.apiEndpoint || undefined,
                licenseType: metadata.licenseType,
                usageTerms: metadata.usageTerms,
                attributionRequirements: metadata.attributionRequirements,
                accessRestrictions: metadata.accessRestrictions,
                contactPerson: metadata.contactPerson,
                email: metadata.email,
                department: metadata.department || undefined,
                userId: metadata.userId,
                createdAt: metadata.createdAt.toISOString(),
                updatedAt: metadata.updatedAt.toISOString(),
            })),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    },
    /**
     * Delete metadata
     */
    deleteMetadata: async (id) => {
        const metadata = await metadata_repository_1.metadataRepository.findById(id);
        if (!metadata) {
            throw new error_handler_1.ApiError("Metadata not found", 404, error_handler_1.ErrorCode.RESOURCE_NOT_FOUND);
        }
        await metadata_repository_1.metadataRepository.delete(id);
    },
    /**
     * Verify user's email manually
     */
    verifyUserEmail: async (userId) => {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new error_handler_1.ApiError("User not found", 404, error_handler_1.ErrorCode.RESOURCE_NOT_FOUND);
        }
        const updatedUser = await user_repository_1.userRepository.update(userId, {
            emailVerified: new Date(),
        });
        return {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name || "",
            role: (0, role_mapper_1.mapPrismaRoleToAppRole)(updatedUser.role),
            emailVerified: updatedUser.emailVerified !== null,
            organization: updatedUser.organization || undefined,
            department: updatedUser.department || undefined,
            phone: updatedUser.phone || undefined,
            image: updatedUser.image || undefined,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
        };
    },
};
