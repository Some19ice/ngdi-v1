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
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.categories = { has: category }
    }

    try {
      console.log("Executing Prisma query with:", {
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
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
          },
        }),
        prisma.metadata.count({ where }),
      ])

      console.log("Prisma query results:", {
        metadataCount: metadata.length,
        total,
        firstItem: metadata.length > 0 ? metadata[0] : null,
      })

      return {
        metadata: metadata.map((item) => ({
          id: item.id,
          title: item.title,
          author: item.author,
          organization: item.organization,
          dateFrom: formatDate(item.dateFrom),
          dateTo: formatDate(item.dateTo),
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
  return date
}
