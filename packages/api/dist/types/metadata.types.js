"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataSearchQuerySchema = exports.MetadataRequestSchema = exports.MetadataIdParamSchema = exports.metadataSchema = void 0;
const zod_1 = require("zod");
/**
 * Metadata schema
 */
exports.metadataSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters'),
    author: zod_1.z.string().min(2, 'Author must be at least 2 characters'),
    organization: zod_1.z.string().min(2, 'Organization must be at least 2 characters'),
    dateFrom: zod_1.z.string(),
    dateTo: zod_1.z.string(),
    abstract: zod_1.z.string().min(10, 'Abstract must be at least 10 characters'),
    purpose: zod_1.z.string().min(10, 'Purpose must be at least 10 characters'),
    thumbnailUrl: zod_1.z.string().url('Invalid thumbnail URL'),
    imageName: zod_1.z.string(),
    frameworkType: zod_1.z.string(),
    categories: zod_1.z.array(zod_1.z.string()).default([]),
    coordinateSystem: zod_1.z.string(),
    projection: zod_1.z.string(),
    scale: zod_1.z.number().int().positive('Scale must be a positive integer'),
    resolution: zod_1.z.string().optional(),
    accuracyLevel: zod_1.z.string(),
    completeness: zod_1.z.number().int().min(0).max(100, 'Completeness must be between 0 and 100').optional(),
    consistencyCheck: zod_1.z.boolean().optional(),
    validationStatus: zod_1.z.string().optional(),
    fileFormat: zod_1.z.string(),
    fileSize: zod_1.z.number().int().positive('File size must be a positive integer').optional(),
    numFeatures: zod_1.z.number().int().positive('Number of features must be a positive integer').optional(),
    softwareReqs: zod_1.z.string().optional(),
    updateCycle: zod_1.z.string().optional(),
    lastUpdate: zod_1.z.string().optional(),
    nextUpdate: zod_1.z.string().optional(),
    distributionFormat: zod_1.z.string(),
    accessMethod: zod_1.z.string(),
    downloadUrl: zod_1.z.string().url('Invalid download URL').optional(),
    apiEndpoint: zod_1.z.string().url('Invalid API endpoint').optional(),
    licenseType: zod_1.z.string(),
    usageTerms: zod_1.z.string(),
    attributionRequirements: zod_1.z.string(),
    accessRestrictions: zod_1.z.array(zod_1.z.string()).default([]),
    contactPerson: zod_1.z.string(),
    email: zod_1.z.string().email('Invalid email address'),
    department: zod_1.z.string().optional(),
});
/**
 * Metadata ID parameter schema
 */
exports.MetadataIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid metadata ID format'),
});
/**
 * Metadata request schema
 */
exports.MetadataRequestSchema = exports.metadataSchema;
/**
 * Metadata search query parameters
 */
exports.metadataSearchQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    organization: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional(),
    fileFormat: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['title', 'author', 'organization', 'createdAt']).optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
