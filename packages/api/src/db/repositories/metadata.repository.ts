import { Prisma, Metadata } from "@prisma/client"
import { prisma } from "../client"
import { MetadataSearchQuery } from "../../types/metadata.types"

/**
 * Metadata repository for database operations
 */
export const metadataRepository = {
  /**
   * Find metadata by ID
   */
  findById: async (id: string): Promise<Metadata | null> => {
    return prisma.metadata.findUnique({
      where: { id },
    })
  },

  /**
   * Create new metadata
   */
  create: async (data: Prisma.MetadataCreateInput): Promise<Metadata> => {
    return prisma.metadata.create({
      data,
    })
  },

  /**
   * Update metadata
   */
  update: async (
    id: string,
    data: Prisma.MetadataUpdateInput
  ): Promise<Metadata> => {
    return prisma.metadata.update({
      where: { id },
      data,
    })
  },

  /**
   * Delete metadata
   */
  delete: async (id: string): Promise<Metadata> => {
    return prisma.metadata.delete({
      where: { id },
    })
  },

  /**
   * Find all metadata with pagination and filtering
   */
  findAll: async (query: MetadataSearchQuery) => {
    const {
      page,
      limit,
      search,
      category,
      author,
      organization,
      dateFrom,
      dateTo,
      fileFormat,
      sortBy,
      sortOrder,
    } = query

    // Build where clause
    const where: Prisma.MetadataWhereInput = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { purpose: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.categories = {
        has: category,
      }
    }

    if (author) {
      where.author = {
        contains: author,
        mode: "insensitive",
      }
    }

    if (organization) {
      where.organization = {
        contains: organization,
        mode: "insensitive",
      }
    }

    if (dateFrom) {
      where.dateFrom = {
        gte: dateFrom,
      }
    }

    if (dateTo) {
      where.dateTo = {
        lte: dateTo,
      }
    }

    if (fileFormat) {
      where.fileFormat = {
        equals: fileFormat,
        mode: "insensitive",
      }
    }

    // Count total metadata matching the filter
    const total = await prisma.metadata.count({ where })

    // Get metadata with pagination
    const metadata = await prisma.metadata.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return {
      metadata,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  /**
   * Find metadata by user ID
   */
  findByUserId: async (userId: string, query: MetadataSearchQuery) => {
    const { page, limit, search, sortBy, sortOrder } = query

    // Build where clause
    const where: Prisma.MetadataWhereInput = {
      userId,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
      ]
    }

    // Count total metadata matching the filter
    const total = await prisma.metadata.count({ where })

    // Get metadata with pagination
    const metadata = await prisma.metadata.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    })

    return {
      metadata,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  /**
   * Count total metadata
   */
  count: async (): Promise<number> => {
    return prisma.metadata.count()
  },

  /**
   * Count metadata created after a specific date
   */
  countCreatedAfter: async (date: Date): Promise<number> => {
    return prisma.metadata.count({
      where: {
        createdAt: {
          gte: date,
        },
      },
    })
  },

  /**
   * Delete all metadata by user ID
   */
  deleteByUserId: async (userId: string): Promise<Prisma.BatchPayload> => {
    return prisma.metadata.deleteMany({
      where: {
        userId,
      },
    })
  },
}
