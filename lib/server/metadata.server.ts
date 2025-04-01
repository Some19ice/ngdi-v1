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
      author,
      organization,
      categories,
      dataTypes,
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

    // Handle author filter
    if (author) {
      if (where.OR) {
        // If we already have an OR condition, add AND condition for author
        where.AND = [
          ...(where.AND || []),
          { author: { contains: author, mode: "insensitive" } },
        ]
      } else {
        where.author = { contains: author, mode: "insensitive" }
      }
    }

    // Handle organization filter
    if (organization) {
      if (where.OR || where.AND) {
        // If we already have an OR or AND condition, add to AND
        where.AND = [
          ...(where.AND || []),
          { organization: { contains: organization, mode: "insensitive" } },
        ]
      } else {
        where.organization = { contains: organization, mode: "insensitive" }
      }
    }

    // Handle categories
    const categoryFilters = []
    if (Array.isArray(categories) && categories.length > 0) {
      categoryFilters.push(...categories)
    } else if (typeof categories === "string" && categories) {
      categoryFilters.push(categories)
    }

    if (category && category !== "all") {
      categoryFilters.push(category)
    }

    if (categoryFilters.length > 0) {
      // Add each category to the query
      const categoryConditions = categoryFilters.map((cat) => ({
        categories: { has: cat },
      }))

      if (where.OR || where.AND) {
        // If we already have conditions, add to AND with an OR for categories
        where.AND = [...(where.AND || []), { OR: categoryConditions }]
      } else {
        where.OR = categoryConditions
      }

      console.log("Category filter added:", {
        categoryFilters,
        condition: where.OR || where.AND,
      })
    }

    // Handle data types
    const dataTypeFilters = []
    if (Array.isArray(dataTypes) && dataTypes.length > 0) {
      dataTypeFilters.push(...dataTypes)
    } else if (typeof dataTypes === "string" && dataTypes) {
      dataTypeFilters.push(dataTypes)
    }

    if (dataTypeFilters.length > 0) {
      const typeConditions = dataTypeFilters.map((type) => {
        if (type === "vector")
          return { frameworkType: { equals: "Vector", mode: "insensitive" } }
        if (type === "raster")
          return { frameworkType: { equals: "Raster", mode: "insensitive" } }
        if (type === "tabular")
          return { frameworkType: { equals: "Table", mode: "insensitive" } }
        return { frameworkType: { contains: type, mode: "insensitive" } }
      })

      if (where.OR || where.AND) {
        // If we already have conditions, add to AND with an OR for data types
        where.AND = [...(where.AND || []), { OR: typeConditions }]
      } else {
        where.OR = typeConditions
      }

      console.log("Data type filter added:", {
        dataTypeFilters,
        condition: typeConditions,
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
          author: item.author || undefined,
          organization: item.organization || undefined,
          dateFrom: item.dateFrom || "",
          dateTo: item.dateTo || "",
          abstract: item.abstract || "",
          frameworkType: item.frameworkType || undefined,
          dataType: item.frameworkType || undefined, // Map frameworkType to dataType for UI compatibility
          thumbnailUrl: item.thumbnailUrl || undefined,
          categories: item.categories || [],
          updatedAt: item.updatedAt,
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
