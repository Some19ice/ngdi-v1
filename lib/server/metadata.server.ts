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
      // Enhanced search across all relevant fields with wildcards for better matching
      where.OR = [
        // Main search fields with wildcard on both sides
        { dataName: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { dataType: { contains: search, mode: "insensitive" } },

        // Location-based searches - important for searching by place names
        { country: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
        { lga: { contains: search, mode: "insensitive" } },
        { townCity: { contains: search, mode: "insensitive" } },
        { geopoliticalZone: { contains: search, mode: "insensitive" } },

        // ID-based search (exact start match)
        { id: { startsWith: search } },
      ]

      // For PostgreSQL JSON search
      try {
        // Try to add a JSON path query for fundamentalDatasets
        // Check if the field exists in any string value of the JSON
        where.OR.push({
          fundamentalDatasets: {
            path: ["$.**"],
            string_contains: search,
          },
        })
      } catch (e) {
        console.log("JSON path search not supported:", e)

        // Fallback: Try a string-based search if database is SQLite or doesn't support JSON operators
        try {
          where.OR.push({
            fundamentalDatasets: {
              contains: search,
            },
          })
        } catch (e2) {
          console.log("Basic JSON contains search failed:", e2)
        }
      }

      // Debug log the search term and condition
      console.log("Search condition added:", {
        searchTerm: search,
        conditionCount: where.OR.length,
        searchLocations: true,
        searchJSON: true,
      })
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

      // Debug log the category filter
      console.log("Category filter added:", {
        category,
        condition:
          category === "vector" || category === "raster"
            ? { dataType: { equals: category, mode: "insensitive" } }
            : { OR: where.OR },
      })
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
