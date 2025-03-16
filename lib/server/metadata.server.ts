import { MetadataListResponse, MetadataSearchParams } from "@/types/metadata"
import { prisma } from "@/lib/prisma"

/**
 * Server-side metadata service for fetching metadata directly from the database
 */
export const metadataServerService = {
  /**
   * Search metadata with pagination and filtering
   */
  async searchMetadata(
    params: MetadataSearchParams
  ): Promise<MetadataListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params

    console.log("Server-side metadata search:", {
      params,
      prismaConnected: !!prisma,
    })

    const skip = (page - 1) * limit

    // Build where conditions
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
      // For NGDIMetadata, we might need to adjust how categories are filtered
      // This depends on how categories are stored in your database
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

    try {
      console.log("Executing Prisma query with:", {
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        table: "NGDIMetadata", // Log the table name we're querying
      })

      // Execute query and count in parallel
      const [metadata, total] = await Promise.all([
        prisma.nGDIMetadata.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            // Map frontend sort fields to database fields
            ...(sortBy === "title"
              ? { dataName: sortOrder }
              : sortBy === "createdAt"
                ? { productionDate: sortOrder }
                : { [sortBy]: sortOrder }),
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

      // Map the NGDIMetadata fields to the expected MetadataItem structure
      return {
        metadata: metadata.map((item) => ({
          id: item.id,
          title: item.dataName || "Untitled",
          author: "NGDI", // Default author
          organization: "NGDI", // Default organization
          dateFrom: formatDate(item.productionDate),
          dateTo: formatDate(item.productionDate),
          cloudCoverPercentage: item.cloudCoverPercentage ?? undefined,
          abstract: item.abstract || undefined,
          dataType: item.dataType || undefined,
          fundamentalDatasets: item.fundamentalDatasets
            ? String(item.fundamentalDatasets)
            : undefined,
        })),
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      console.error("Error fetching metadata:", error)
      // Return empty results on error
      return {
        metadata: [],
        total: 0,
        currentPage: page,
        totalPages: 0,
      }
    }
  },
}

// Helper function to format dates
function formatDate(date: Date | string): string {
  if (date instanceof Date) {
    return date.toISOString()
  }
  return date || new Date().toISOString()
}
