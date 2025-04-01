/**
 * Shared Metadata Request type used by both the frontend and API
 */
export interface MetadataRequest {
  // General information
  title: string
  author: string
  organization: string
  dateFrom: string
  dateTo: string
  abstract: string
  purpose: string
  thumbnailUrl: string
  imageName: string

  // Framework and categorization
  frameworkType: string
  categories: string[]

  // Spatial information
  coordinateSystem: string
  projection: string
  scale: number
  resolution?: string

  // Spatial domain information
  coordinateUnit: "DD" | "DMS"
  minLatitude: number
  minLongitude: number
  maxLatitude: number
  maxLongitude: number

  // Quality information
  accuracyLevel: string
  completeness?: number
  consistencyCheck?: boolean
  validationStatus?: string

  // File information
  fileFormat: string
  fileSize?: number
  numFeatures?: number
  softwareReqs?: string

  // Update information
  updateCycle: string
  lastUpdate?: string
  nextUpdate?: string

  // Distribution information
  distributionFormat: string
  accessMethod: string
  downloadUrl?: string
  apiEndpoint?: string

  // License information
  licenseType: string
  usageTerms: string
  attributionRequirements: string
  accessRestrictions: string[]

  // Contact information
  contactPerson: string
  email: string
  department?: string
}

/**
 * Metadata response with additional system fields
 */
export interface MetadataResponse extends MetadataRequest {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface MetadataSearchParams {
  q?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"

  // Search parameters
  search?: string
  category?: string
  author?: string
  organization?: string
  categories?: string[]
  dataTypes?: string[]
  frameworkType?: string
  dateFrom?: string
  dateTo?: string

  // View mode options
  viewMode?: "list" | "map"

  // Advanced filtering options
  advancedFilters?: {
    quality?: "low" | "medium" | "high"
    validationStatus?: "pending" | "validated" | "rejected"
    dateFrom?: string
    dateTo?: string
    organizations?: string[]
    resourceTypes?: string[]
    topics?: string[]
  }

  // Spatial filtering
  bbox?: number[] // [minX, minY, maxX, maxY]
}

export interface MetadataSearchResponse {
  metadata: MetadataResponse[]
  total: number
  currentPage: number
  limit: number
  totalPages: number
}

export interface MetadataItem {
  id: string
  title: string
  author?: string
  organization?: string
  dateFrom: string
  dateTo?: string
  cloudCoverPercentage?: string | number
  abstract?: string
  dataType?: string
  frameworkType?: string
  categories?: string[]
  thumbnailUrl?: string
  dataName?: string
  productionDate?: string
  fundamentalDatasets?: string
}

export interface MetadataListResponse {
  metadata: MetadataItem[]
  total: number
  totalPages: number
  currentPage: number
}

// Admin metadata status and validation status enums
export enum MetadataStatus {
  Published = "Published",
  Draft = "Draft",
  UnderReview = "Under Review"
}

export enum ValidationStatus {
  Validated = "Validated",
  Pending = "Pending",
  Failed = "Failed"
}

// Admin metadata item with additional administrative fields
export interface AdminMetadataItem extends MetadataItem {
  status: MetadataStatus;
  validationStatus: ValidationStatus;
  downloads: number;
  views: number;
  tags: string[];
  lastModified?: string;
  modifiedBy?: string;
}

export interface AdminMetadataSearchParams extends MetadataSearchParams {
  status?: MetadataStatus;
  validationStatus?: ValidationStatus;
}

export interface AdminMetadataSearchResponse {
  metadata: AdminMetadataItem[];
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}
