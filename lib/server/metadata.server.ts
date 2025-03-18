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
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { purpose: { contains: search, mode: "insensitive" } },

        // ID-based search (exact start match)
        { id: { startsWith: search } },
      ]

      // Debug log the search term and condition
      console.log("Search condition added:", {
        searchTerm: search,
        conditionCount: where.OR.length,
      })
    }

    if (category && category !== "all") {
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

      // Debug log the category filter
      console.log("Category filter added:", {
        category,
        condition: where.frameworkType || where.OR,
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
        table: "metadata", // Log the table name we're querying
      })

      // Execute query and count in parallel
      const [metadata, total] = await Promise.all([
        prisma.metadata.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
          select: {
            id: true,
            title: true,
            author: true,
            organization: true,
            dateFrom: true,
            dateTo: true,
            abstract: true,
            purpose: true,
            thumbnailUrl: true,
            imageName: true,
            frameworkType: true,
            categories: true,
            fileFormat: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.metadata.count({ where }),
      ])

      console.log("Prisma query results:", {
        metadataCount: metadata.length,
        total,
        firstItem: metadata.length > 0 ? metadata[0] : null,
      })

      // Return the metadata items directly as they already match our expected format
      return {
        metadata: metadata.map((item) => ({
          id: item.id,
          title: item.title,
          author: item.author,
          organization: item.organization,
          dateFrom: item.dateFrom || "",
          dateTo: item.dateTo || "",
          abstract: item.abstract || "",
          frameworkType: item.frameworkType,
          dataType: item.frameworkType, // Map frameworkType to dataType for UI compatibility
          thumbnailUrl: item.thumbnailUrl,
          categories: item.categories || [],
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
