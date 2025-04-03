"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataService = void 0;
const prisma_1 = require("../lib/prisma");
const http_exception_1 = require("hono/http-exception");
const cache_service_1 = require("./cache.service");
const error_handler_1 = require("../middleware/error-handler");
/**
 * Metadata Service - responsible for metadata CRUD operations
 * Uses caching to optimize database access
 *
 * NOTE: This is a sample service implementation to demonstrate caching.
 * Adjust the actual fields and relations according to your Prisma schema.
 */
exports.metadataService = {
    /**
     * Get metadata by ID, with caching
     */
    async getMetadataById(id) {
        // Check cache first
        const cacheKey = `metadata:${id}`;
        const cachedMetadata = await cache_service_1.cacheService.get(cacheKey);
        if (cachedMetadata) {
            console.log(`Cache hit for metadata ID: ${id}`);
            return cachedMetadata;
        }
        // Not in cache, fetch from database
        // Adjust the 'include' object based on your actual Prisma schema
        const metadata = await prisma_1.prisma.metadata.findUnique({
            where: { id }
        });
        if (!metadata) {
            throw new error_handler_1.ApiError(`Metadata with ID ${id} not found`, 404, error_handler_1.ErrorCode.RESOURCE_NOT_FOUND);
        }
        // Store in cache for faster access next time
        await cache_service_1.cacheService.set(cacheKey, metadata, 300); // Cache for 5 minutes
        return metadata;
    },
    /**
     * List metadata with pagination, filtering and caching
     */
    async listMetadata(params) {
        const { page = 1, limit = 20, search, userId, sort = 'updatedAt', order = 'desc' } = params;
        // Calculate pagination
        const skip = (page - 1) * limit;
        // Build cache key based on query parameters
        const cacheKey = `metadata:list:${JSON.stringify({
            page, limit, search, userId, sort, order
        })}`;
        // Check cache first
        const cachedResults = await cache_service_1.cacheService.get(cacheKey);
        if (cachedResults) {
            console.log(`Cache hit for metadata listing`);
            return cachedResults;
        }
        // Build where clause - adjust for your schema
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search } }
                // Add other fields to search as needed based on your schema
            ];
        }
        if (userId) {
            where.userId = userId;
        }
        // Execute queries with timing
        const startTime = Date.now();
        // Execute count and find in parallel for better performance
        const [total, items] = await Promise.all([
            prisma_1.prisma.metadata.count({ where }),
            prisma_1.prisma.metadata.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order }
            })
        ]);
        const queryTime = Date.now() - startTime;
        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const result = {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
            meta: {
                queryTime
            }
        };
        // Cache results
        // Use shorter TTL for list endpoints as they change more frequently
        await cache_service_1.cacheService.set(cacheKey, result, 60); // Cache for 1 minute
        return result;
    },
    /**
     * Create new metadata
     */
    async createMetadata(data, userId) {
        // If userId is provided, include it in the data
        const createData = userId ? { ...data, userId } : data;
        const metadata = await prisma_1.prisma.metadata.create({
            data: createData
        });
        // Clear list caches when data changes
        await cache_service_1.cacheService.clearByPrefix('metadata:list:');
        return metadata;
    },
    /**
     * Update metadata
     */
    async updateMetadata(id, data, userId) {
        // Check if metadata exists
        const exists = await prisma_1.prisma.metadata.findUnique({ where: { id } });
        if (!exists) {
            throw new error_handler_1.ApiError(`Metadata with ID ${id} not found`, 404, error_handler_1.ErrorCode.RESOURCE_NOT_FOUND);
        }
        // If userId is provided, include ownership check
        if (userId && exists.userId !== userId) {
            throw new error_handler_1.ApiError("You don't have permission to update this metadata", 403, error_handler_1.ErrorCode.BUSINESS_RULE_VIOLATION);
        }
        const metadata = await prisma_1.prisma.metadata.update({
            where: { id },
            data
        });
        // Delete specific cache
        await cache_service_1.cacheService.delete(`metadata:${id}`);
        // Clear list caches when data changes
        await cache_service_1.cacheService.clearByPrefix('metadata:list:');
        return metadata;
    },
    /**
     * Delete metadata
     */
    async deleteMetadata(id, userId) {
        // Check if metadata exists
        const exists = await prisma_1.prisma.metadata.findUnique({ where: { id } });
        if (!exists) {
            throw new error_handler_1.ApiError(`Metadata with ID ${id} not found`, 404, error_handler_1.ErrorCode.RESOURCE_NOT_FOUND);
        }
        // If userId is provided, include ownership check
        if (userId && exists.userId !== userId) {
            throw new error_handler_1.ApiError("You don't have permission to delete this metadata", 403, error_handler_1.ErrorCode.BUSINESS_RULE_VIOLATION);
        }
        await prisma_1.prisma.metadata.delete({ where: { id } });
        // Delete specific cache
        await cache_service_1.cacheService.delete(`metadata:${id}`);
        // Clear list caches when data changes
        await cache_service_1.cacheService.clearByPrefix('metadata:list:');
        return { success: true };
    },
    /**
     * Search metadata
     */
    searchMetadata: async (searchQuery) => {
        const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", organization, author, dateFrom, dateTo, fileFormat, search, category, frameworkType, } = searchQuery;
        console.log("API searchMetadata called with:", {
            searchQuery,
            table: "metadata",
        });
        const skip = (page - 1) * limit;
        // Build where conditions for metadata table
        const where = {};
        // If frameworkType is specified, use it directly (for Vector, Raster, Table)
        if (frameworkType) {
            where.frameworkType = { equals: frameworkType, mode: "insensitive" };
        }
        if (search) {
            // Enhanced search across all relevant fields
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { abstract: { contains: search, mode: "insensitive" } },
                { purpose: { contains: search, mode: "insensitive" } },
                { author: { contains: search, mode: "insensitive" } },
                { organization: { contains: search, mode: "insensitive" } },
                { frameworkType: { contains: search, mode: "insensitive" } },
                // Add a search for IDs that start with the search term
                { id: { startsWith: search } },
            ];
        }
        if (category) {
            // For category filtering, handle special cases and normalize
            if (category.toLowerCase() === "vector") {
                where.frameworkType = { equals: "Vector", mode: "insensitive" };
            }
            else if (category.toLowerCase() === "raster") {
                where.frameworkType = { equals: "Raster", mode: "insensitive" };
            }
            else if (category.toLowerCase() === "table") {
                where.frameworkType = { equals: "Table", mode: "insensitive" };
            }
            else {
                // For other categories, try to find it in the categories array or category-related fields
                where.OR = [
                    ...(where.OR || []),
                    // Search in categories array
                    { categories: { has: category } },
                    // Search for dataType-related terms in various fields
                    { frameworkType: { contains: category, mode: "insensitive" } },
                    { title: { contains: category, mode: "insensitive" } },
                    { abstract: { contains: category, mode: "insensitive" } },
                ];
            }
            console.log(`Applied category filter: ${category}`, where);
        }
        if (organization) {
            where.organization = { contains: organization, mode: "insensitive" };
        }
        if (dateFrom) {
            where.productionDate = { gte: new Date(dateFrom) };
        }
        if (dateTo) {
            where.productionDate = {
                ...(where.productionDate || {}),
                lte: new Date(dateTo),
            };
        }
        try {
            console.log("Executing Prisma query with:", {
                where,
                skip,
                take: limit,
                orderBy: {
                    [mapSortField(sortBy)]: sortOrder,
                },
            });
            // Execute query and count in parallel using metadata table
            const [metadata, total] = await Promise.all([
                prisma_1.prisma.metadata.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: {
                        // Map frontend sort fields to database fields
                        [mapSortField(sortBy)]: sortOrder,
                    },
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        organization: true,
                        abstract: true,
                        purpose: true,
                        thumbnailUrl: true,
                        dateFrom: true,
                        dateTo: true,
                        frameworkType: true,
                        categories: true,
                        fileFormat: true,
                        createdAt: true,
                        updatedAt: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                }),
                prisma_1.prisma.metadata.count({ where }),
            ]);
            console.log("Prisma query results:", {
                metadataCount: metadata.length,
                total,
                firstItem: metadata.length > 0 ? metadata[0] : null,
            });
            // Map the fields to the expected MetadataResponse structure
            const mappedMetadata = metadata.map((item) => ({
                id: item.id,
                title: item.title,
                author: item.author,
                organization: item.organization,
                dateFrom: item.dateFrom?.toString() || null,
                dateTo: item.dateTo?.toString() || null,
                abstract: item.abstract,
                purpose: item.purpose,
                thumbnailUrl: item.thumbnailUrl,
                imageName: null,
                frameworkType: item.frameworkType,
                coordinateUnit: null,
                minLatitude: null,
                minLongitude: null,
                maxLatitude: null,
                maxLongitude: null,
                dataName: null,
                productionDate: null,
                updatedAt: item.updatedAt.toISOString(),
            }));
            return {
                metadata: mappedMetadata,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            console.error("Error searching metadata:", error);
            throw new http_exception_1.HTTPException(500, { message: "Failed to search metadata" });
        }
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
// Helper function to map sort fields from frontend to database fields
function mapSortField(sortBy) {
    switch (sortBy) {
        case "title":
            return "title";
        case "createdAt":
            return "createdAt";
        default:
            return sortBy;
    }
}
// Helper function to format dates
function formatDate(date) {
    if (!date)
        return new Date().toISOString();
    if (date instanceof Date) {
        return date.toISOString();
    }
    return date;
}
