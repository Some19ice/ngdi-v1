"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataRepository = void 0;
const client_1 = require("../client");
/**
 * Metadata repository for database operations
 */
exports.metadataRepository = {
    /**
     * Find metadata by ID
     */
    findById: async (id) => {
        return client_1.prisma.metadata.findUnique({
            where: { id },
        });
    },
    /**
     * Create new metadata
     */
    create: async (data) => {
        return client_1.prisma.metadata.create({
            data,
        });
    },
    /**
     * Update metadata
     */
    update: async (id, data) => {
        return client_1.prisma.metadata.update({
            where: { id },
            data,
        });
    },
    /**
     * Delete metadata
     */
    delete: async (id) => {
        return client_1.prisma.metadata.delete({
            where: { id },
        });
    },
    /**
     * Find all metadata with pagination and filtering
     */
    findAll: async (query) => {
        const { page, limit, search, category, author, organization, dateFrom, dateTo, fileFormat, sortBy, sortOrder, } = query;
        // Build where clause
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { abstract: { contains: search, mode: "insensitive" } },
                { purpose: { contains: search, mode: "insensitive" } },
            ];
        }
        if (category) {
            where.categories = {
                has: category,
            };
        }
        if (author) {
            where.author = {
                contains: author,
                mode: "insensitive",
            };
        }
        if (organization) {
            where.organization = {
                contains: organization,
                mode: "insensitive",
            };
        }
        if (dateFrom) {
            where.dateFrom = {
                gte: dateFrom,
            };
        }
        if (dateTo) {
            where.dateTo = {
                lte: dateTo,
            };
        }
        if (fileFormat) {
            where.fileFormat = {
                equals: fileFormat,
                mode: "insensitive",
            };
        }
        // Count total metadata matching the filter
        const total = await client_1.prisma.metadata.count({ where });
        // Get metadata with pagination
        const metadata = await client_1.prisma.metadata.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return {
            metadata,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },
    /**
     * Find metadata by user ID
     */
    findByUserId: async (userId, query) => {
        const { page, limit, search, sortBy, sortOrder } = query;
        // Build where clause
        const where = {
            userId,
        };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { abstract: { contains: search, mode: "insensitive" } },
            ];
        }
        // Count total metadata matching the filter
        const total = await client_1.prisma.metadata.count({ where });
        // Get metadata with pagination
        const metadata = await client_1.prisma.metadata.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
        });
        return {
            metadata,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },
    /**
     * Count total metadata
     */
    count: async () => {
        return client_1.prisma.metadata.count();
    },
    /**
     * Count metadata created after a specific date
     */
    countCreatedAfter: async (date) => {
        return client_1.prisma.metadata.count({
            where: {
                createdAt: {
                    gte: date,
                },
            },
        });
    },
    /**
     * Delete all metadata by user ID
     */
    deleteByUserId: async (userId) => {
        return client_1.prisma.metadata.deleteMany({
            where: {
                userId,
            },
        });
    },
};
