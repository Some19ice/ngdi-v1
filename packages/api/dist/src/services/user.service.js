"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const prisma_1 = require("../lib/prisma");
const http_exception_1 = require("hono/http-exception");
const password_1 = require("../utils/password");
const role_mapper_1 = require("../utils/role-mapper");
/**
 * User service
 */
exports.userService = {
    /**
     * Get user profile
     */
    getProfile: async (userId) => {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new http_exception_1.HTTPException(404, { message: "User not found" });
        }
        return {
            id: user.id,
            name: user.name || "",
            email: user.email,
            role: (0, role_mapper_1.mapPrismaRoleToAppRole)(user.role),
            organization: user.organization || undefined,
            department: user.department || undefined,
            phone: user.phone || undefined,
            image: user.image || undefined,
            emailVerified: !!user.emailVerified,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    },
    /**
     * Update user profile
     */
    updateProfile: async (userId, data) => {
        // Check if email is being updated and if it's already taken
        if (data.email) {
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existingUser && existingUser.id !== userId) {
                throw new http_exception_1.HTTPException(400, { message: "Email already taken" });
            }
        }
        try {
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id: userId },
                data,
            });
            return {
                id: updatedUser.id,
                name: updatedUser.name || "",
                email: updatedUser.email,
                role: (0, role_mapper_1.mapPrismaRoleToAppRole)(updatedUser.role),
                organization: updatedUser.organization || undefined,
                department: updatedUser.department || undefined,
                phone: updatedUser.phone || undefined,
                image: updatedUser.image || undefined,
                emailVerified: !!updatedUser.emailVerified,
                createdAt: updatedUser.createdAt.toISOString(),
                updatedAt: updatedUser.updatedAt.toISOString(),
            };
        }
        catch (error) {
            throw new http_exception_1.HTTPException(500, { message: "Failed to update user" });
        }
    },
    /**
     * Change user password
     */
    changePassword: async (userId, currentPassword, newPassword) => {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new http_exception_1.HTTPException(404, { message: "User not found" });
        }
        // If newPassword is not provided, treat currentPassword as the new password
        // This is for admin reset functionality
        if (!newPassword) {
            const hashedPassword = await (0, password_1.hashPassword)(currentPassword);
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            return;
        }
        // Verify current password
        const isPasswordValid = await (0, password_1.comparePassword)(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new http_exception_1.HTTPException(400, { message: "Current password is incorrect" });
        }
        // Hash and update new password
        const hashedPassword = await (0, password_1.hashPassword)(newPassword);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    },
    /**
     * Get all users
     */
    getAllUsers: async (query) => {
        const { page = 1, limit = 10, search = "", role, sortBy = "createdAt", sortOrder = "desc", } = query;
        const where = {
            AND: [
                search
                    ? {
                        OR: [
                            { name: { contains: search, mode: "insensitive" } },
                            { email: { contains: search, mode: "insensitive" } },
                        ],
                    }
                    : {},
                role ? { role: (0, role_mapper_1.mapAppRoleToPrismaRole)(role) } : {},
            ],
        };
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        return {
            users: users.map((user) => ({
                id: user.id,
                name: user.name || "",
                email: user.email,
                role: (0, role_mapper_1.mapPrismaRoleToAppRole)(user.role),
                emailVerified: user.emailVerified !== null,
                organization: user.organization || "",
                department: user.department || undefined,
                phone: user.phone || undefined,
                image: user.image || undefined,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },
    /**
     * Get user by ID
     */
    getUserById: async (userId) => {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new http_exception_1.HTTPException(404, { message: "User not found" });
        }
        return {
            id: user.id,
            name: user.name || "",
            email: user.email,
            role: (0, role_mapper_1.mapPrismaRoleToAppRole)(user.role),
            organization: user.organization || undefined,
            department: user.department || undefined,
            phone: user.phone || undefined,
            image: user.image || undefined,
            emailVerified: !!user.emailVerified,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    },
    /**
     * Update user role
     */
    updateUserRole: async (userId, role) => {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new http_exception_1.HTTPException(404, { message: "User not found" });
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                role: (0, role_mapper_1.mapAppRoleToPrismaRole)(role),
            },
        });
        return {
            id: updatedUser.id,
            name: updatedUser.name || "",
            email: updatedUser.email,
            role: (0, role_mapper_1.mapPrismaRoleToAppRole)(updatedUser.role),
            organization: updatedUser.organization || undefined,
            department: updatedUser.department || undefined,
            phone: updatedUser.phone || undefined,
            image: updatedUser.image || undefined,
            emailVerified: !!updatedUser.emailVerified,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
        };
    },
    /**
     * Delete user (admin only)
     */
    deleteUser: async (userId) => {
        try {
            await prisma_1.prisma.user.delete({
                where: { id: userId },
            });
        }
        catch (error) {
            throw new http_exception_1.HTTPException(500, { message: "Failed to delete user" });
        }
    },
};
