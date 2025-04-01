import { z } from 'zod';

/**
 * Metadata schema
 */
export const metadataSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  author: z.string().min(2, "Author must be at least 2 characters"),
  organization: z.string().min(2, "Organization must be at least 2 characters"),
  dateFrom: z.string(),
  dateTo: z.string(),
  abstract: z.string().min(10, "Abstract must be at least 10 characters"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL"),
  imageName: z.string(),
  frameworkType: z.string(),
  categories: z.array(z.string()).default([]),
  coordinateSystem: z.string(),
  projection: z.string(),
  scale: z.number().int().positive("Scale must be a positive integer"),
  resolution: z.string().optional(),
  coordinateUnit: z.enum(["DD", "DMS"]).default("DD"),
  minLatitude: z.number().default(0),
  minLongitude: z.number().default(0),
  maxLatitude: z.number().default(0),
  maxLongitude: z.number().default(0),
  accuracyLevel: z.string(),
  completeness: z
    .number()
    .int()
    .min(0)
    .max(100, "Completeness must be between 0 and 100")
    .optional(),
  consistencyCheck: z.boolean().optional(),
  validationStatus: z.string().optional(),
  fileFormat: z.string(),
  fileSize: z
    .number()
    .int()
    .positive("File size must be a positive integer")
    .optional(),
  numFeatures: z
    .number()
    .int()
    .positive("Number of features must be a positive integer")
    .optional(),
  softwareReqs: z.string().optional(),
  updateCycle: z.string().optional(),
  lastUpdate: z.string().optional(),
  nextUpdate: z.string().optional(),
  distributionFormat: z.string(),
  accessMethod: z.string(),
  downloadUrl: z.string().url("Invalid download URL").optional(),
  apiEndpoint: z.string().url("Invalid API endpoint").optional(),
  licenseType: z.string(),
  usageTerms: z.string(),
  attributionRequirements: z.string(),
  accessRestrictions: z.array(z.string()).default([]),
  contactPerson: z.string(),
  email: z.string().email("Invalid email address"),
  department: z.string().optional(),
})

export type MetadataRequest = z.infer<typeof metadataSchema>;

/**
 * Metadata ID parameter schema
 */
export const MetadataIdParamSchema = z.object({
  id: z.string().uuid('Invalid metadata ID format'),
});

export type MetadataIdParam = z.infer<typeof MetadataIdParamSchema>;

/**
 * Metadata request schema
 */
export const MetadataRequestSchema = metadataSchema;

/**
 * Metadata response
 */
export interface MetadataResponse {
  id: string
  title: string
  author: string | null
  organization: string | null
  dateFrom: string | null
  dateTo: string | null
  abstract: string | null
  purpose: string | null
  thumbnailUrl: string | null
  imageName: string | null
  frameworkType: string | null
  coordinateUnit?: string | null
  minLatitude?: number | null
  minLongitude?: number | null
  maxLatitude?: number | null
  maxLongitude?: number | null
  dataName?: string | null
  productionDate?: string | null
  updatedAt: string
}

/**
 * Metadata search query parameters
 */
export const metadataSearchQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  category: z.string().optional(),
  frameworkType: z.string().optional(),
  author: z.string().optional(),
  organization: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  fileFormat: z.string().optional(),
  sortBy: z
    .enum(["title", "author", "organization", "createdAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

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