import { Prisma, Metadata } from "@prisma/client";
import { MetadataSearchQuery } from "../../types/metadata.types";
/**
 * Metadata repository for database operations
 */
export declare const metadataRepository: {
    /**
     * Find metadata by ID
     */
    findById: (id: string) => Promise<Metadata | null>;
    /**
     * Create new metadata
     */
    create: (data: Prisma.MetadataCreateInput) => Promise<Metadata>;
    /**
     * Update metadata
     */
    update: (id: string, data: Prisma.MetadataUpdateInput) => Promise<Metadata>;
    /**
     * Delete metadata
     */
    delete: (id: string) => Promise<Metadata>;
    /**
     * Find all metadata with pagination and filtering
     */
    findAll: (query: MetadataSearchQuery) => Promise<{
        metadata: ({
            user: {
                name: string | null;
                email: string;
                id: string;
            };
        } & {
            email: string;
            organization: string;
            department: string | null;
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            author: string;
            dateFrom: string;
            dateTo: string;
            abstract: string;
            purpose: string;
            thumbnailUrl: string;
            imageName: string;
            frameworkType: string;
            categories: string[];
            coordinateSystem: string;
            projection: string;
            scale: number;
            resolution: string | null;
            accuracyLevel: string;
            completeness: number | null;
            consistencyCheck: boolean | null;
            validationStatus: string | null;
            fileFormat: string;
            fileSize: number | null;
            numFeatures: number | null;
            softwareReqs: string | null;
            updateCycle: string | null;
            lastUpdate: Date | null;
            nextUpdate: Date | null;
            distributionFormat: string;
            accessMethod: string;
            downloadUrl: string | null;
            apiEndpoint: string | null;
            licenseType: string;
            usageTerms: string;
            attributionRequirements: string;
            accessRestrictions: string[];
            contactPerson: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Find metadata by user ID
     */
    findByUserId: (userId: string, query: MetadataSearchQuery) => Promise<{
        metadata: {
            email: string;
            organization: string;
            department: string | null;
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            author: string;
            dateFrom: string;
            dateTo: string;
            abstract: string;
            purpose: string;
            thumbnailUrl: string;
            imageName: string;
            frameworkType: string;
            categories: string[];
            coordinateSystem: string;
            projection: string;
            scale: number;
            resolution: string | null;
            accuracyLevel: string;
            completeness: number | null;
            consistencyCheck: boolean | null;
            validationStatus: string | null;
            fileFormat: string;
            fileSize: number | null;
            numFeatures: number | null;
            softwareReqs: string | null;
            updateCycle: string | null;
            lastUpdate: Date | null;
            nextUpdate: Date | null;
            distributionFormat: string;
            accessMethod: string;
            downloadUrl: string | null;
            apiEndpoint: string | null;
            licenseType: string;
            usageTerms: string;
            attributionRequirements: string;
            accessRestrictions: string[];
            contactPerson: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Count total metadata
     */
    count: () => Promise<number>;
    /**
     * Count metadata created after a specific date
     */
    countCreatedAfter: (date: Date) => Promise<number>;
    /**
     * Delete all metadata by user ID
     */
    deleteByUserId: (userId: string) => Promise<Prisma.BatchPayload>;
};
