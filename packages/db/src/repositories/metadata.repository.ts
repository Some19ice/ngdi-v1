import { Metadata, Prisma } from "@prisma/client";
import { prisma } from "..";

/**
 * Interface for metadata filter options
 */
export interface MetadataFilterOptions {
  searchTerm?: string;
  dataTypes?: string[];
  organizations?: string[];
  statuses?: string[];
  categories?: string[];
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  country?: string;
  state?: string;
  minScale?: number;
  maxScale?: number;
  fileFormats?: string[];
  bbox?: {
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
  };
}

/**
 * Interface for metadata pagination options
 */
export interface MetadataPaginationOptions {
  page: number;
  pageSize: number;
  sortField: string;
  sortOrder: "asc" | "desc";
}

/**
 * Interface for metadata statistics
 */
export interface MetadataStatistics {
  totalCount: number;
  byDataType: { dataType: string; count: number }[];
  byOrganization: { organization: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byCategory: { category: string; count: number }[];
  byFileFormat: { fileFormat: string; count: number }[];
  createdByMonth: { month: string; count: number }[];
}

/**
 * Repository for metadata operations
 */
export class MetadataRepository {
  /**
   * Find metadata by ID
   * @param id Metadata ID
   * @returns Metadata or null if not found
   */
  async findById(id: string): Promise<Metadata | null> {
    return prisma.metadata.findUnique({
      where: { id },
    });
  }

  /**
   * Find metadata by ID with user information
   * @param id Metadata ID
   * @returns Metadata with user information or null if not found
   */
  async findByIdWithUser(id: string): Promise<(Metadata & { user: { name: string; email: string; organization: string } }) | null> {
    return prisma.metadata.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            organization: true,
          },
        },
      },
    });
  }

  /**
   * Find metadata with filtering and pagination
   * @param filterOptions Filter options
   * @param paginationOptions Pagination options
   * @returns Paginated metadata list
   */
  async findMany(
    filterOptions: MetadataFilterOptions,
    paginationOptions: MetadataPaginationOptions
  ): Promise<{ data: Metadata[]; total: number }> {
    const {
      searchTerm,
      dataTypes,
      organizations,
      statuses,
      categories,
      startDate,
      endDate,
      userId,
      country,
      state,
      minScale,
      maxScale,
      fileFormats,
      bbox,
    } = filterOptions;

    const { page, pageSize, sortField, sortOrder } = paginationOptions;

    // Build where clause
    const where: Prisma.MetadataWhereInput = {};
    const whereConditions: Prisma.MetadataWhereInput[] = [];

    // Search term
    if (searchTerm) {
      whereConditions.push({
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { dataName: { contains: searchTerm, mode: "insensitive" } },
          { abstract: { contains: searchTerm, mode: "insensitive" } },
          { organization: { contains: searchTerm, mode: "insensitive" } },
          { author: { contains: searchTerm, mode: "insensitive" } },
        ],
      });
    }

    // Data types
    if (dataTypes && dataTypes.length > 0) {
      whereConditions.push({
        dataType: { in: dataTypes },
      });
    }

    // Organizations
    if (organizations && organizations.length > 0) {
      whereConditions.push({
        organization: { in: organizations },
      });
    }

    // Statuses
    if (statuses && statuses.length > 0) {
      whereConditions.push({
        validationStatus: { in: statuses },
      });
    }

    // Categories
    if (categories && categories.length > 0) {
      whereConditions.push({
        categories: { hasSome: categories },
      });
    }

    // Date range
    if (startDate || endDate) {
      const dateCondition: Prisma.MetadataWhereInput = {};
      if (startDate) {
        dateCondition.createdAt = { ...dateCondition.createdAt, gte: startDate };
      }
      if (endDate) {
        dateCondition.createdAt = { ...dateCondition.createdAt, lte: endDate };
      }
      whereConditions.push(dateCondition);
    }

    // User ID
    if (userId) {
      whereConditions.push({
        userId,
      });
    }

    // Country and state
    if (country || state) {
      const locationCondition: Prisma.JsonFilter = {};
      if (country) {
        locationCondition.path = ["country"];
        locationCondition.equals = country;
      }
      if (state) {
        locationCondition.path = ["state"];
        locationCondition.equals = state;
      }
      whereConditions.push({
        locationInfo: locationCondition,
      });
    }

    // Scale range
    if (minScale !== undefined || maxScale !== undefined) {
      const scaleCondition: Prisma.IntFilter = {};
      if (minScale !== undefined) {
        scaleCondition.gte = minScale;
      }
      if (maxScale !== undefined) {
        scaleCondition.lte = maxScale;
      }
      whereConditions.push({
        scale: scaleCondition,
      });
    }

    // File formats
    if (fileFormats && fileFormats.length > 0) {
      whereConditions.push({
        fileFormat: { in: fileFormats },
      });
    }

    // Bounding box
    if (bbox) {
      whereConditions.push({
        AND: [
          { minLongitude: { lte: bbox.maxLon } },
          { maxLongitude: { gte: bbox.minLon } },
          { minLatitude: { lte: bbox.maxLat } },
          { maxLatitude: { gte: bbox.minLat } },
        ],
      });
    }

    // Combine all conditions
    if (whereConditions.length > 0) {
      where.AND = whereConditions;
    }

    // Count total records
    const total = await prisma.metadata.count({ where });

    // Get paginated data
    const data = await prisma.metadata.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            organization: true,
          },
        },
      },
    });

    return { data, total };
  }

  /**
   * Create a new metadata entry
   * @param data Metadata data
   * @returns Created metadata
   */
  async create(data: Prisma.MetadataCreateInput): Promise<Metadata> {
    return prisma.metadata.create({ data });
  }

  /**
   * Update an existing metadata entry
   * @param id Metadata ID
   * @param data Metadata data
   * @returns Updated metadata
   */
  async update(id: string, data: Prisma.MetadataUpdateInput): Promise<Metadata> {
    return prisma.metadata.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a metadata entry
   * @param id Metadata ID
   * @returns Deleted metadata
   */
  async delete(id: string): Promise<Metadata> {
    return prisma.metadata.delete({
      where: { id },
    });
  }

  /**
   * Get metadata statistics
   * @returns Metadata statistics
   */
  async getStatistics(): Promise<MetadataStatistics> {
    // Get total count
    const totalCount = await prisma.metadata.count();

    // Get counts by data type
    const byDataType = await prisma.metadata.groupBy({
      by: ["dataType"],
      _count: true,
      orderBy: {
        _count: {
          dataType: "desc",
        },
      },
    });

    // Get counts by organization
    const byOrganization = await prisma.metadata.groupBy({
      by: ["organization"],
      _count: true,
      orderBy: {
        _count: {
          organization: "desc",
        },
      },
      take: 10, // Limit to top 10
    });

    // Get counts by status
    const byStatus = await prisma.metadata.groupBy({
      by: ["validationStatus"],
      _count: true,
      orderBy: {
        _count: {
          validationStatus: "desc",
        },
      },
    });

    // Get counts by file format
    const byFileFormat = await prisma.metadata.groupBy({
      by: ["fileFormat"],
      _count: true,
      orderBy: {
        _count: {
          fileFormat: "desc",
        },
      },
    });

    // Get counts by category (requires raw query)
    const categoryCounts = await prisma.$queryRaw<{ category: string; count: number }[]>`
      SELECT unnest(categories) as category, COUNT(*) as count
      FROM "Metadata"
      GROUP BY category
      ORDER BY count DESC
    `;

    // Get counts by month
    const createdByMonth = await prisma.$queryRaw<{ month: string; count: number }[]>`
      SELECT to_char("createdAt", 'YYYY-MM') as month, COUNT(*) as count
      FROM "Metadata"
      GROUP BY month
      ORDER BY month
    `;

    return {
      totalCount,
      byDataType: byDataType.map((item) => ({
        dataType: item.dataType,
        count: item._count,
      })),
      byOrganization: byOrganization.map((item) => ({
        organization: item.organization,
        count: item._count,
      })),
      byStatus: byStatus.map((item) => ({
        status: item.validationStatus || "Unknown",
        count: item._count,
      })),
      byCategory: categoryCounts,
      byFileFormat: byFileFormat.map((item) => ({
        fileFormat: item.fileFormat,
        count: item._count,
      })),
      createdByMonth,
    };
  }

  /**
   * Find metadata within a bounding box
   * @param bbox Bounding box coordinates
   * @returns Metadata within the bounding box
   */
  async findWithinBoundingBox(bbox: {
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
  }): Promise<Metadata[]> {
    return prisma.metadata.findMany({
      where: {
        AND: [
          { minLongitude: { lte: bbox.maxLon } },
          { maxLongitude: { gte: bbox.minLon } },
          { minLatitude: { lte: bbox.maxLat } },
          { maxLatitude: { gte: bbox.minLat } },
        ],
      },
      select: {
        id: true,
        title: true,
        dataName: true,
        dataType: true,
        abstract: true,
        thumbnailUrl: true,
        minLatitude: true,
        minLongitude: true,
        maxLatitude: true,
        maxLongitude: true,
        coordinateSystem: true,
        projection: true,
      },
    });
  }

  /**
   * Search metadata with full-text search
   * @param query Search query
   * @param limit Maximum number of results
   * @returns Metadata matching the search query
   */
  async search(query: string, limit: number = 10): Promise<Metadata[]> {
    // Use raw query for full-text search
    return prisma.$queryRaw<Metadata[]>`
      SELECT id, title, "dataName", "dataType", abstract, "thumbnailUrl", "organization", "author"
      FROM "Metadata"
      WHERE 
        title ILIKE ${`%${query}%`} OR
        "dataName" ILIKE ${`%${query}%`} OR
        abstract ILIKE ${`%${query}%`} OR
        "organization" ILIKE ${`%${query}%`} OR
        "author" ILIKE ${`%${query}%`}
      ORDER BY 
        CASE 
          WHEN title ILIKE ${`%${query}%`} THEN 1
          WHEN "dataName" ILIKE ${`%${query}%`} THEN 2
          WHEN "organization" ILIKE ${`%${query}%`} THEN 3
          WHEN "author" ILIKE ${`%${query}%`} THEN 4
          WHEN abstract ILIKE ${`%${query}%`} THEN 5
          ELSE 6
        END
      LIMIT ${limit}
    `;
  }

  /**
   * Get metadata statistics from the materialized view
   * @returns Metadata statistics from the materialized view
   */
  async getStatisticsFromMaterializedView(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM metadata_stats ORDER BY count DESC`;
  }

  /**
   * Refresh the metadata statistics materialized view
   */
  async refreshStatisticsMaterializedView(): Promise<void> {
    await prisma.$executeRaw`REFRESH MATERIALIZED VIEW metadata_stats`;
  }
}
