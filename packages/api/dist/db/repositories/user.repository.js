"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const client_1 = require("../client");
/**
 * User repository for database operations
 */
exports.userRepository = {
    /**
     * Find a user by ID
     */
    findById: async (id) => {
        return client_1.prisma.user.findUnique({
            where: { id },
        });
    },
    /**
     * Find a user by email
     */
    findByEmail: async (email) => {
        return client_1.prisma.user.findUnique({
            where: { email },
        });
    },
    /**
     * Create a new user
     */
    create: async (data) => {
        return client_1.prisma.user.create({
            data,
        });
    },
    /**
     * Update a user
     */
    update: async (id, data) => {
        return client_1.prisma.user.update({
            where: { id },
            data,
        });
    },
    /**
     * Delete a user
     */
    delete: async (id) => {
        return client_1.prisma.user.delete({
            where: { id },
        });
    },
    /**
     * Find all users with pagination and filtering
     */
    findAll: async (query) => {
        const { page, limit, search, role, sortBy, sortOrder } = query;
        // Build where clause
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { organization: { contains: search, mode: "insensitive" } },
            ];
        }
        if (role) {
            where.role = role;
        }
        // Count total users matching the filter
        const total = await client_1.prisma.user.count({ where });
        // Get users with pagination
        const users = await client_1.prisma.user.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
        });
        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },
    /**
     * Count total users
     */
    count: async () => {
        return client_1.prisma.user.count();
    },
    /**
     * Count users created after a specific date
     */
    countCreatedAfter: async (date) => {
        return client_1.prisma.user.count({
            where: {
                createdAt: {
                    gte: date,
                },
            },
        });
    },
    /**
     * Count users by role
     */
    countByRole: async () => {
        const usersByRole = await client_1.prisma.user.groupBy({
            by: ["role"],
            _count: {
                role: true,
            },
        });
        return usersByRole.reduce((acc, curr) => {
            acc[curr.role] = curr._count.role;
            return acc;
        }, {});
    },
};
