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
  page?: number
  limit?: number
  search?: string
  category?: string
  author?: string
  organization?: string
  categories?: string[] | string
  dataTypes?: string[] | string
  frameworkType?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
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
