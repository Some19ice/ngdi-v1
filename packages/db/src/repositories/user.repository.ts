import { Prisma, User } from "@prisma/client";
import { prisma } from "..";

/**
 * Interface for user filter options
 */
export interface UserFilterOptions {
  searchTerm?: string;
  roles?: string[];
  organizations?: string[];
  departments?: string[];
  isLocked?: boolean;
  isVerified?: boolean;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Interface for user pagination options
 */
export interface UserPaginationOptions {
  page: number;
  pageSize: number;
  sortField: string;
  sortOrder: "asc" | "desc";
}

/**
 * Repository for user operations
 */
export class UserRepository {
  /**
   * Find user by ID
   * @param id User ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   * @param email User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID with role information
   * @param id User ID
   * @returns User with role information or null if not found
   */
  async findByIdWithRole(id: string): Promise<(User & { customRole: { name: string; description: string } | null }) | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        customRole: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Find user by email with role information
   * @param email User email
   * @returns User with role information or null if not found
   */
  async findByEmailWithRole(email: string): Promise<(User & { customRole: { name: string; description: string } | null }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        customRole: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Find users with filtering and pagination
   * @param filterOptions Filter options
   * @param paginationOptions Pagination options
   * @returns Paginated user list
   */
  async findMany(
    filterOptions: UserFilterOptions,
    paginationOptions: UserPaginationOptions
  ): Promise<{ data: User[]; total: number }> {
    const {
      searchTerm,
      roles,
      organizations,
      departments,
      isLocked,
      isVerified,
      startDate,
      endDate,
    } = filterOptions;

    const { page, pageSize, sortField, sortOrder } = paginationOptions;

    // Build where clause
    const where: Prisma.UserWhereInput = {};
    const whereConditions: Prisma.UserWhereInput[] = [];

    // Search term
    if (searchTerm) {
      whereConditions.push({
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { organization: { contains: searchTerm, mode: "insensitive" } },
          { department: { contains: searchTerm, mode: "insensitive" } },
        ],
      });
    }

    // Roles
    if (roles && roles.length > 0) {
      whereConditions.push({
        OR: [
          { role: { in: roles as any[] } },
          { customRole: { name: { in: roles } } },
        ],
      });
    }

    // Organizations
    if (organizations && organizations.length > 0) {
      whereConditions.push({
        organization: { in: organizations },
      });
    }

    // Departments
    if (departments && departments.length > 0) {
      whereConditions.push({
        department: { in: departments },
      });
    }

    // Locked status
    if (isLocked !== undefined) {
      whereConditions.push({
        locked: isLocked,
      });
    }

    // Verified status
    if (isVerified !== undefined) {
      if (isVerified) {
        whereConditions.push({
          emailVerified: { not: null },
        });
      } else {
        whereConditions.push({
          emailVerified: null,
        });
      }
    }

    // Date range
    if (startDate || endDate) {
      const dateCondition: Prisma.UserWhereInput = {};
      if (startDate) {
        dateCondition.createdAt = { ...dateCondition.createdAt, gte: startDate };
      }
      if (endDate) {
        dateCondition.createdAt = { ...dateCondition.createdAt, lte: endDate };
      }
      whereConditions.push(dateCondition);
    }

    // Combine all conditions
    if (whereConditions.length > 0) {
      where.AND = whereConditions;
    }

    // Count total records
    const total = await prisma.user.count({ where });

    // Get paginated data
    const data = await prisma.user.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        customRole: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    });

    return { data, total };
  }

  /**
   * Create a new user
   * @param data User data
   * @returns Created user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param data User data
   * @returns Updated user
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Deleted user
   */
  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Get user permissions (both direct and role-based)
   * @param id User ID
   * @returns User permissions
   */
  async getUserPermissions(id: string): Promise<{
    rolePermissions: { permission: { name: string; action: string; subject: string } }[];
    userPermissions: { permission: { name: string; action: string; subject: string }; conditions: any }[];
  }> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        customRole: {
          select: {
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    name: true,
                    action: true,
                    subject: true,
                  },
                },
              },
            },
          },
        },
        userPermissions: {
          where: {
            granted: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          select: {
            permission: {
              select: {
                name: true,
                action: true,
                subject: true,
              },
            },
            conditions: true,
          },
        },
      },
    });

    return {
      rolePermissions: user?.customRole?.rolePermissions || [],
      userPermissions: user?.userPermissions || [],
    };
  }

  /**
   * Lock a user account
   * @param id User ID
   * @param lockedUntil Date until which the account is locked
   * @returns Updated user
   */
  async lockUser(id: string, lockedUntil: Date): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        locked: true,
        lockedUntil,
      },
    });
  }

  /**
   * Unlock a user account
   * @param id User ID
   * @returns Updated user
   */
  async unlockUser(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        locked: false,
        lockedUntil: null,
        failedAttempts: 0,
        lastFailedAttempt: null,
      },
    });
  }

  /**
   * Increment failed login attempts
   * @param id User ID
   * @returns Updated user
   */
  async incrementFailedAttempts(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        failedAttempts: {
          increment: 1,
        },
        lastFailedAttempt: new Date(),
      },
    });
  }

  /**
   * Reset failed login attempts
   * @param id User ID
   * @returns Updated user
   */
  async resetFailedAttempts(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        failedAttempts: 0,
        lastFailedAttempt: null,
      },
    });
  }

  /**
   * Verify user email
   * @param id User ID
   * @returns Updated user
   */
  async verifyEmail(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        emailVerified: new Date(),
      },
    });
  }

  /**
   * Get user statistics
   * @returns User statistics
   */
  async getStatistics(): Promise<{
    totalCount: number;
    byRole: { role: string; count: number }[];
    byOrganization: { organization: string; count: number }[];
    byVerificationStatus: { verified: boolean; count: number }[];
    byLockStatus: { locked: boolean; count: number }[];
    createdByMonth: { month: string; count: number }[];
  }> {
    // Get total count
    const totalCount = await prisma.user.count();

    // Get counts by role
    const byRole = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
      orderBy: {
        _count: {
          role: "desc",
        },
      },
    });

    // Get counts by organization
    const byOrganization = await prisma.user.groupBy({
      by: ["organization"],
      _count: true,
      orderBy: {
        _count: {
          organization: "desc",
        },
      },
      take: 10, // Limit to top 10
    });

    // Get counts by verification status
    const byVerificationStatus = await prisma.$queryRaw<{ verified: boolean; count: number }[]>`
      SELECT 
        CASE WHEN "emailVerified" IS NULL THEN false ELSE true END as verified,
        COUNT(*) as count
      FROM "User"
      GROUP BY verified
    `;

    // Get counts by lock status
    const byLockStatus = await prisma.user.groupBy({
      by: ["locked"],
      _count: true,
    });

    // Get counts by month
    const createdByMonth = await prisma.$queryRaw<{ month: string; count: number }[]>`
      SELECT to_char("createdAt", 'YYYY-MM') as month, COUNT(*) as count
      FROM "User"
      GROUP BY month
      ORDER BY month
    `;

    return {
      totalCount,
      byRole: byRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
      byOrganization: byOrganization.map((item) => ({
        organization: item.organization || "Unknown",
        count: item._count,
      })),
      byVerificationStatus,
      byLockStatus: byLockStatus.map((item) => ({
        locked: item.locked,
        count: item._count,
      })),
      createdByMonth,
    };
  }
}
