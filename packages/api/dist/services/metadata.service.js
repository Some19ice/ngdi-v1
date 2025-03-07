"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataService = void 0;
const prisma_1 = require("../lib/prisma");
const http_exception_1 = require("hono/http-exception");
/**
 * Metadata service
 */
exports.metadataService = {
    /**
     * Get metadata
     */
    getMetadata: async (params, userId) => {
        const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", } = params;
        const skip = (page - 1) * limit;
        const where = userId ? { userId } : {};
        const [metadata, total] = await Promise.all([
            prisma_1.prisma.metadata.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
            }),
            prisma_1.prisma.metadata.count({ where }),
        ]);
        return {
            data: metadata,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },
    /**
     * Create new metadata
     */
    createMetadata: async (data, userId) => {
        try {
            const metadata = await prisma_1.prisma.metadata.create({
                data: {
                    ...data,
                    userId,
                },
            });
            return metadata;
        }
        catch (error) {
            throw new http_exception_1.HTTPException(500, { message: "Failed to create metadata" });
        }
    },
    /**
     * Update metadata
     */
    updateMetadata: async (id, data, userId) => {
        const metadata = await prisma_1.prisma.metadata.findUnique({
            where: { id },
        });
        if (!metadata) {
            throw new http_exception_1.HTTPException(404, { message: "Metadata not found" });
        }
        if (metadata.userId !== userId) {
            throw new http_exception_1.HTTPException(403, {
                message: "Not authorized to update this metadata",
            });
        }
        try {
            const updatedMetadata = await prisma_1.prisma.metadata.update({
                where: { id },
                data,
            });
            return updatedMetadata;
        }
        catch (error) {
            throw new http_exception_1.HTTPException(500, { message: "Failed to update metadata" });
        }
    },
    /**
     * Delete metadata
     */
    deleteMetadata: async (id, userId) => {
        const metadata = await prisma_1.prisma.metadata.findUnique({
            where: { id },
        });
        if (!metadata) {
            throw new http_exception_1.HTTPException(404, { message: "Metadata not found" });
        }
        if (metadata.userId !== userId) {
            throw new http_exception_1.HTTPException(403, {
                message: "Not authorized to delete this metadata",
            });
        }
        try {
            await prisma_1.prisma.metadata.delete({
                where: { id },
            });
        }
        catch (error) {
            throw new http_exception_1.HTTPException(500, { message: "Failed to delete metadata" });
        }
    },
    /**
     * Search metadata
     */
    searchMetadata: async (searchQuery) => {
        const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", organization, author, dateFrom, dateTo, fileFormat, search, category, } = searchQuery;
        const skip = (page - 1) * limit;
        const conditions = [];
        if (organization) {
            conditions.push({ organization: { contains: organization } });
        }
        if (author) {
            conditions.push({ author: { contains: author } });
        }
        if (dateFrom) {
            conditions.push({ dateFrom: { gte: dateFrom } });
        }
        if (dateTo) {
            conditions.push({ dateTo: { lte: dateTo } });
        }
        if (fileFormat) {
            conditions.push({ fileFormat });
        }
        if (category) {
            conditions.push({ categories: { has: category } });
        }
        if (search) {
            conditions.push({
                OR: [
                    { title: { contains: search } },
                    { abstract: { contains: search } },
                    { purpose: { contains: search } },
                ],
            });
        }
        const where = conditions.length > 0 ? { AND: conditions } : {};
        const [metadata, total] = await Promise.all([
            prisma_1.prisma.metadata.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
            }),
            prisma_1.prisma.metadata.count({ where }),
        ]);
        return {
            metadata: metadata.map((item) => ({
                id: item.id,
                title: item.title,
                author: item.author,
                organization: item.organization,
                dateFrom: item.dateFrom,
                dateTo: item.dateTo,
                abstract: item.abstract,
                purpose: item.purpose,
                thumbnailUrl: item.thumbnailUrl,
                imageName: item.imageName,
                frameworkType: item.frameworkType,
                categories: item.categories,
                coordinateSystem: item.coordinateSystem,
                projection: item.projection,
                scale: item.scale,
                resolution: item.resolution || undefined,
                accuracyLevel: item.accuracyLevel,
                completeness: item.completeness || undefined,
                consistencyCheck: item.consistencyCheck || undefined,
                validationStatus: item.validationStatus || undefined,
                fileFormat: item.fileFormat,
                fileSize: item.fileSize || undefined,
                numFeatures: item.numFeatures || undefined,
                softwareReqs: item.softwareReqs || undefined,
                updateCycle: item.updateCycle || undefined,
                lastUpdate: item.lastUpdate?.toISOString() || undefined,
                nextUpdate: item.nextUpdate?.toISOString() || undefined,
                distributionFormat: item.distributionFormat,
                accessMethod: item.accessMethod,
                downloadUrl: item.downloadUrl || undefined,
                apiEndpoint: item.apiEndpoint || undefined,
                licenseType: item.licenseType,
                usageTerms: item.usageTerms,
                attributionRequirements: item.attributionRequirements,
                accessRestrictions: item.accessRestrictions,
                contactPerson: item.contactPerson,
                email: item.email,
                department: item.department || undefined,
                userId: item.userId,
                createdAt: item.createdAt.toISOString(),
                updatedAt: item.updatedAt.toISOString(),
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },
    /**
     * Get user's metadata
     */
    getUserMetadata: async (userId, query) => {
        const { page, limit, search, category, sortBy = "createdAt", sortOrder = "desc", } = query;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {
            userId,
            ...(search
                ? {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { abstract: { contains: search, mode: "insensitive" } },
                        { author: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {}),
            ...(category ? { categories: { has: category } } : {}),
        };
        // Get data with pagination
        const [result, total] = await Promise.all([
            prisma_1.prisma.metadata.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
            }),
            prisma_1.prisma.metadata.count({ where }),
        ]);
        return {
            metadata: result.map((metadata) => ({
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
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },
};
exports.default = exports.metadataService;
