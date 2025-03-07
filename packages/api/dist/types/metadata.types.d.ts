import { z } from 'zod';
/**
 * Metadata schema
 */
export declare const metadataSchema: z.ZodObject<{
    title: z.ZodString;
    author: z.ZodString;
    organization: z.ZodString;
    dateFrom: z.ZodString;
    dateTo: z.ZodString;
    abstract: z.ZodString;
    purpose: z.ZodString;
    thumbnailUrl: z.ZodString;
    imageName: z.ZodString;
    frameworkType: z.ZodString;
    categories: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    coordinateSystem: z.ZodString;
    projection: z.ZodString;
    scale: z.ZodNumber;
    resolution: z.ZodOptional<z.ZodString>;
    accuracyLevel: z.ZodString;
    completeness: z.ZodOptional<z.ZodNumber>;
    consistencyCheck: z.ZodOptional<z.ZodBoolean>;
    validationStatus: z.ZodOptional<z.ZodString>;
    fileFormat: z.ZodString;
    fileSize: z.ZodOptional<z.ZodNumber>;
    numFeatures: z.ZodOptional<z.ZodNumber>;
    softwareReqs: z.ZodOptional<z.ZodString>;
    updateCycle: z.ZodOptional<z.ZodString>;
    lastUpdate: z.ZodOptional<z.ZodString>;
    nextUpdate: z.ZodOptional<z.ZodString>;
    distributionFormat: z.ZodString;
    accessMethod: z.ZodString;
    downloadUrl: z.ZodOptional<z.ZodString>;
    apiEndpoint: z.ZodOptional<z.ZodString>;
    licenseType: z.ZodString;
    usageTerms: z.ZodString;
    attributionRequirements: z.ZodString;
    accessRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    contactPerson: z.ZodString;
    email: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    organization: string;
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
    accuracyLevel: string;
    fileFormat: string;
    distributionFormat: string;
    accessMethod: string;
    licenseType: string;
    usageTerms: string;
    attributionRequirements: string;
    accessRestrictions: string[];
    contactPerson: string;
    department?: string | undefined;
    resolution?: string | undefined;
    completeness?: number | undefined;
    consistencyCheck?: boolean | undefined;
    validationStatus?: string | undefined;
    fileSize?: number | undefined;
    numFeatures?: number | undefined;
    softwareReqs?: string | undefined;
    updateCycle?: string | undefined;
    lastUpdate?: string | undefined;
    nextUpdate?: string | undefined;
    downloadUrl?: string | undefined;
    apiEndpoint?: string | undefined;
}, {
    email: string;
    organization: string;
    title: string;
    author: string;
    dateFrom: string;
    dateTo: string;
    abstract: string;
    purpose: string;
    thumbnailUrl: string;
    imageName: string;
    frameworkType: string;
    coordinateSystem: string;
    projection: string;
    scale: number;
    accuracyLevel: string;
    fileFormat: string;
    distributionFormat: string;
    accessMethod: string;
    licenseType: string;
    usageTerms: string;
    attributionRequirements: string;
    contactPerson: string;
    department?: string | undefined;
    categories?: string[] | undefined;
    resolution?: string | undefined;
    completeness?: number | undefined;
    consistencyCheck?: boolean | undefined;
    validationStatus?: string | undefined;
    fileSize?: number | undefined;
    numFeatures?: number | undefined;
    softwareReqs?: string | undefined;
    updateCycle?: string | undefined;
    lastUpdate?: string | undefined;
    nextUpdate?: string | undefined;
    downloadUrl?: string | undefined;
    apiEndpoint?: string | undefined;
    accessRestrictions?: string[] | undefined;
}>;
export type MetadataRequest = z.infer<typeof metadataSchema>;
/**
 * Metadata ID parameter schema
 */
export declare const MetadataIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type MetadataIdParam = z.infer<typeof MetadataIdParamSchema>;
/**
 * Metadata request schema
 */
export declare const MetadataRequestSchema: z.ZodObject<{
    title: z.ZodString;
    author: z.ZodString;
    organization: z.ZodString;
    dateFrom: z.ZodString;
    dateTo: z.ZodString;
    abstract: z.ZodString;
    purpose: z.ZodString;
    thumbnailUrl: z.ZodString;
    imageName: z.ZodString;
    frameworkType: z.ZodString;
    categories: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    coordinateSystem: z.ZodString;
    projection: z.ZodString;
    scale: z.ZodNumber;
    resolution: z.ZodOptional<z.ZodString>;
    accuracyLevel: z.ZodString;
    completeness: z.ZodOptional<z.ZodNumber>;
    consistencyCheck: z.ZodOptional<z.ZodBoolean>;
    validationStatus: z.ZodOptional<z.ZodString>;
    fileFormat: z.ZodString;
    fileSize: z.ZodOptional<z.ZodNumber>;
    numFeatures: z.ZodOptional<z.ZodNumber>;
    softwareReqs: z.ZodOptional<z.ZodString>;
    updateCycle: z.ZodOptional<z.ZodString>;
    lastUpdate: z.ZodOptional<z.ZodString>;
    nextUpdate: z.ZodOptional<z.ZodString>;
    distributionFormat: z.ZodString;
    accessMethod: z.ZodString;
    downloadUrl: z.ZodOptional<z.ZodString>;
    apiEndpoint: z.ZodOptional<z.ZodString>;
    licenseType: z.ZodString;
    usageTerms: z.ZodString;
    attributionRequirements: z.ZodString;
    accessRestrictions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    contactPerson: z.ZodString;
    email: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    organization: string;
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
    accuracyLevel: string;
    fileFormat: string;
    distributionFormat: string;
    accessMethod: string;
    licenseType: string;
    usageTerms: string;
    attributionRequirements: string;
    accessRestrictions: string[];
    contactPerson: string;
    department?: string | undefined;
    resolution?: string | undefined;
    completeness?: number | undefined;
    consistencyCheck?: boolean | undefined;
    validationStatus?: string | undefined;
    fileSize?: number | undefined;
    numFeatures?: number | undefined;
    softwareReqs?: string | undefined;
    updateCycle?: string | undefined;
    lastUpdate?: string | undefined;
    nextUpdate?: string | undefined;
    downloadUrl?: string | undefined;
    apiEndpoint?: string | undefined;
}, {
    email: string;
    organization: string;
    title: string;
    author: string;
    dateFrom: string;
    dateTo: string;
    abstract: string;
    purpose: string;
    thumbnailUrl: string;
    imageName: string;
    frameworkType: string;
    coordinateSystem: string;
    projection: string;
    scale: number;
    accuracyLevel: string;
    fileFormat: string;
    distributionFormat: string;
    accessMethod: string;
    licenseType: string;
    usageTerms: string;
    attributionRequirements: string;
    contactPerson: string;
    department?: string | undefined;
    categories?: string[] | undefined;
    resolution?: string | undefined;
    completeness?: number | undefined;
    consistencyCheck?: boolean | undefined;
    validationStatus?: string | undefined;
    fileSize?: number | undefined;
    numFeatures?: number | undefined;
    softwareReqs?: string | undefined;
    updateCycle?: string | undefined;
    lastUpdate?: string | undefined;
    nextUpdate?: string | undefined;
    downloadUrl?: string | undefined;
    apiEndpoint?: string | undefined;
    accessRestrictions?: string[] | undefined;
}>;
/**
 * Metadata response
 */
export interface MetadataResponse {
    id: string;
    title: string;
    author: string;
    organization: string;
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
    resolution?: string;
    accuracyLevel: string;
    completeness?: number;
    consistencyCheck?: boolean;
    validationStatus?: string;
    fileFormat: string;
    fileSize?: number;
    numFeatures?: number;
    softwareReqs?: string;
    updateCycle?: string;
    lastUpdate?: string;
    nextUpdate?: string;
    distributionFormat: string;
    accessMethod: string;
    downloadUrl?: string;
    apiEndpoint?: string;
    licenseType: string;
    usageTerms: string;
    attributionRequirements: string;
    accessRestrictions: string[];
    contactPerson: string;
    email: string;
    department?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * Metadata search query parameters
 */
export declare const metadataSearchQuerySchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    organization: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    fileFormat: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["title", "author", "organization", "createdAt"]>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "organization" | "createdAt" | "title" | "author";
    sortOrder: "asc" | "desc";
    organization?: string | undefined;
    search?: string | undefined;
    author?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    fileFormat?: string | undefined;
    category?: string | undefined;
}, {
    organization?: string | undefined;
    search?: string | undefined;
    author?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    fileFormat?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    sortBy?: "organization" | "createdAt" | "title" | "author" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    category?: string | undefined;
}>;
export type MetadataSearchQuery = z.infer<typeof metadataSearchQuerySchema>;
/**
 * Metadata search response
 */
export interface MetadataSearchResponse {
    metadata: MetadataResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
