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
      frameworkType,
    } = searchQuery

    console.log("API searchMetadata called with:", {
      searchQuery,
      table: "metadata",
    })

    const skip = (page - 1) * limit

    // Build where conditions for metadata table
    const where: any = {}

    // If frameworkType is specified, use it directly (for Vector, Raster, Table)
    if (frameworkType) {
      where.frameworkType = { equals: frameworkType, mode: "insensitive" }
    }

    if (search) {
      // Enhanced search across all relevant fields
      where.OR = [
        { dataName: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { dataType: { contains: search, mode: "insensitive" } },
        // Remove fundamentalDatasets search as it's causing Prisma validation errors
        // fundamentalDatasets is likely not a string field that supports text search
        // { fundamentalDatasets: { contains: search, mode: "insensitive" } },
        // Add a search for IDs that start with the search term
        { id: { startsWith: search } },
      ]
    }

    if (category) {
      // For category filtering, handle special cases and normalize
      if (category.toLowerCase() === "vector") {
        where.frameworkType = { equals: "Vector", mode: "insensitive" }
      } else if (category.toLowerCase() === "raster") {
        where.frameworkType = { equals: "Raster", mode: "insensitive" }
      } else if (category.toLowerCase() === "table") {
        where.frameworkType = { equals: "Table", mode: "insensitive" }
      } else {
        // For other categories, try to find it in the categories array or category-related fields
        where.OR = [
          ...(where.OR || []),
          // Search in categories array
          { categories: { has: category } },
          // Search for dataType-related terms in various fields
          { frameworkType: { contains: category, mode: "insensitive" } },
          { title: { contains: category, mode: "insensitive" } },
          { abstract: { contains: category, mode: "insensitive" } },
        ]
      }

      console.log(`Applied category filter: ${category}`, where)
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

      // Execute query and count in parallel using metadata table
      const [metadata, total] = await Promise.all([
        prisma.metadata.findMany({
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
        prisma.metadata.count({ where }),
      ])

      console.log("Prisma query results:", {
        metadataCount: metadata.length,
        total,
        firstItem: metadata.length > 0 ? metadata[0] : null,
      })

      // Map the fields to the expected MetadataResponse structure
      return {
        metadata: metadata.map((item) => ({
          id: item.id,
          title: item.title,
          author: item.author,
          organization: item.organization,
          dateFrom: item.dateFrom,
          dateTo: item.dateTo,
          abstract: item.abstract || "",
          purpose: item.purpose || "",
          thumbnailUrl: item.thumbnailUrl || "",
          imageName: "",
          frameworkType: item.frameworkType || "",
          categories: item.categories || [],
          coordinateSystem: "",
          projection: "",
          scale: 0,
          accuracyLevel: "",
          fileFormat: item.fileFormat || "Unknown",
          distributionFormat: "",
          accessMethod: "",
          licenseType: "",
          usageTerms: "",
          attributionRequirements: "",
          accessRestrictions: [],
          contactPerson: item.user?.name || "",
          email: item.user?.email || "",
          userId: "",
          createdAt: formatDate(item.createdAt),
          updatedAt: formatDate(item.updatedAt),
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      console.error("Error searching metadata:", error)
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
      return "title"
    case "createdAt":
      return "createdAt"
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
