import { prisma } from "../lib/prisma"
import { Metadata, Prisma } from "@prisma/client"
import { HTTPException } from "hono/http-exception"
import {
  MetadataRequest,
  MetadataResponse,
  MetadataSearchQuery,
  MetadataSearchResponse,
} from "../types/metadata.types"
import { UserRole } from "../types/auth.types"

interface MetadataInput {
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
  updateCycle: string
  lastUpdate?: Date
  nextUpdate?: Date
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

interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: keyof Metadata
  sortOrder?: "asc" | "desc"
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Metadata service
 */
export const metadataService = {
  /**
   * Get metadata
   */
  getMetadata: async (
    params: PaginationParams,
    userId?: string
  ): Promise<PaginatedResponse<Metadata>> => {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params

    const skip = (page - 1) * limit

    const where = userId ? { userId } : {}

    const [metadata, total] = await Promise.all([
      prisma.metadata.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.metadata.count({ where }),
    ])

    return {
      data: metadata,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  /**
   * Create new metadata
   */
  createMetadata: async (
    data: MetadataInput,
    userId: string
  ): Promise<Metadata> => {
    try {
      const metadata = await prisma.metadata.create({
        data: {
          ...data,
          userId,
        },
      })

      return metadata
    } catch (error) {
      throw new HTTPException(500, { message: "Failed to create metadata" })
    }
  },

  /**
   * Update metadata
   */
  updateMetadata: async (
    id: string,
    data: Partial<MetadataInput>,
    userId: string
  ): Promise<Metadata> => {
    const metadata = await prisma.metadata.findUnique({
      where: { id },
    })

    if (!metadata) {
      throw new HTTPException(404, { message: "Metadata not found" })
    }

    if (metadata.userId !== userId) {
      throw new HTTPException(403, {
        message: "Not authorized to update this metadata",
      })
    }

    try {
      const updatedMetadata = await prisma.metadata.update({
        where: { id },
        data,
      })

      return updatedMetadata
    } catch (error) {
      throw new HTTPException(500, { message: "Failed to update metadata" })
    }
  },

  /**
   * Delete metadata
   */
  deleteMetadata: async (id: string, userId: string): Promise<void> => {
    const metadata = await prisma.metadata.findUnique({
      where: { id },
    })

    if (!metadata) {
      throw new HTTPException(404, { message: "Metadata not found" })
    }

    if (metadata.userId !== userId) {
      throw new HTTPException(403, {
        message: "Not authorized to delete this metadata",
      })
    }

    try {
      await prisma.metadata.delete({
        where: { id },
      })
    } catch (error) {
      throw new HTTPException(500, { message: "Failed to delete metadata" })
    }
  },

  /**
   * Search metadata
   */
  searchMetadata: async (
    searchQuery: MetadataSearchQuery
  ): Promise<MetadataSearchResponse> => {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      organization,
      author,
      dateFrom,
      dateTo,
      fileFormat,
      search,
      category,
    } = searchQuery

    console.log("API searchMetadata called with:", {
      searchQuery,
      table: "NGDIMetadata", // Log that we're using NGDIMetadata
    })

    const skip = (page - 1) * limit

    // Build where conditions for NGDIMetadata table
    const where: any = {}

    if (search) {
      // Enhanced search across all relevant fields
      where.OR = [
        { dataName: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { dataType: { contains: search, mode: "insensitive" } },
        { fundamentalDatasets: { contains: search, mode: "insensitive" } },
        // Add a search for IDs that start with the search term
        { id: { startsWith: search } },
      ]
    }

    if (category) {
      // For NGDIMetadata, we need to adjust how categories are filtered
      if (category === "vector") {
        where.dataType = { equals: "Vector", mode: "insensitive" }
      } else if (category === "raster") {
        where.dataType = { equals: "Raster", mode: "insensitive" }
      } else {
        // Try to match category against any field
        where.OR = [
          ...(where.OR || []),
          { dataType: { contains: category, mode: "insensitive" } },
          { dataName: { contains: category, mode: "insensitive" } },
          { abstract: { contains: category, mode: "insensitive" } },
        ]
      }
    }

    if (organization) {
      where.organization = { contains: organization, mode: "insensitive" }
    }

    if (dateFrom) {
      where.productionDate = { gte: new Date(dateFrom) }
    }

    if (dateTo) {
      where.productionDate = {
        ...(where.productionDate || {}),
        lte: new Date(dateTo),
      }
    }

    try {
      console.log("Executing Prisma query with:", {
        where,
        skip,
        take: limit,
        orderBy: {
          [mapSortField(sortBy)]: sortOrder,
        },
      })

      // Execute query and count in parallel using NGDIMetadata table
      const [metadata, total] = await Promise.all([
        prisma.nGDIMetadata.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            // Map frontend sort fields to database fields
            [mapSortField(sortBy)]: sortOrder,
          },
          select: {
            id: true,
            dataName: true,
            dataType: true,
            cloudCoverPercentage: true,
            productionDate: true,
            abstract: true,
            fundamentalDatasets: true,
          },
        }),
        prisma.nGDIMetadata.count({ where }),
      ])

      console.log("Prisma query results:", {
        metadataCount: metadata.length,
        total,
        firstItem: metadata.length > 0 ? metadata[0] : null,
      })

      // Map the NGDIMetadata fields to the expected MetadataResponse structure
      return {
        metadata: metadata.map((item) => ({
          id: item.id,
          title: item.dataName || "Untitled",
          author: "NGDI", // Default author
          organization: "NGDI", // Default organization
          dateFrom: formatDate(item.productionDate),
          dateTo: formatDate(item.productionDate),
          abstract: item.abstract || "",
          purpose: "",
          thumbnailUrl: "",
          imageName: "",
          frameworkType: "",
          categories: [item.dataType || ""],
          coordinateSystem: "",
          projection: "",
          scale: 0,
          accuracyLevel: "",
          fileFormat: "Unknown",
          distributionFormat: "",
          accessMethod: "",
          licenseType: "",
          usageTerms: "",
          attributionRequirements: "",
          accessRestrictions: [],
          contactPerson: "",
          email: "",
          userId: "",
          createdAt: formatDate(item.productionDate),
          updatedAt: formatDate(item.productionDate),
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      console.error("Error searching NGDIMetadata:", error)
      throw new HTTPException(500, { message: "Failed to search metadata" })
    }
  },

  /**
   * Get user's metadata
   */
  getUserMetadata: async (
    userId: string,
    query: {
      page: number
      limit: number
      search?: string
      category?: string
      sortBy: "title" | "author" | "organization" | "createdAt"
      sortOrder: "asc" | "desc"
    }
  ): Promise<MetadataSearchResponse> => {
    const {
      page,
      limit,
      search,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query

    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.MetadataWhereInput = {
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
    }

    // Get data with pagination
    const [result, total] = await Promise.all([
      prisma.metadata.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.metadata.count({ where }),
    ])

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
    }
  },
}

export default metadataService

// Helper function to map sort fields from frontend to database fields
function mapSortField(sortBy: string): string {
  switch (sortBy) {
    case "title":
      return "dataName"
    case "createdAt":
      return "productionDate"
    default:
      return sortBy
  }
}

// Helper function to format dates
function formatDate(date: Date | string | null): string {
  if (!date) return new Date().toISOString()
  if (date instanceof Date) {
    return date.toISOString()
  }
  return date
}
