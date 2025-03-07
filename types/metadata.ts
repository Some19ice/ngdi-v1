export interface MetadataRequest {
  title: string
  author: string
  organization: string
  dateFrom: string
  dateTo: string
  abstract: string
  purpose: string
  thumbnailUrl: string
  imageName: string
  frameworkType: string
  categories: string[]
  coordinateSystem: string
  projection: string
  scale: number
  resolution?: string
  accuracyLevel: string
  completeness?: number
  consistencyCheck?: boolean
  validationStatus?: string
  fileFormat: string
  fileSize?: number
  numFeatures?: number
  softwareReqs?: string
  updateCycle?: string
  lastUpdate?: string
  nextUpdate?: string
  distributionFormat: string
  accessMethod: string
  downloadUrl?: string
  apiEndpoint?: string
  licenseType: string
  usageTerms: string
  attributionRequirements: string
  accessRestrictions: string[]
  contactPerson: string
  email: string
  department?: string
}

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
  author: string
  organization: string
  dateFrom: string | Date
  dateTo: string | Date
}

export interface MetadataListResponse {
  metadata: MetadataItem[]
  total: number
  totalPages: number
  currentPage: number
}
