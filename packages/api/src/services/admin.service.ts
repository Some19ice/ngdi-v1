import { userRepository } from "../db/repositories/user.repository"
import { metadataRepository } from "../db/repositories/metadata.repository"
import { ApiError, ErrorCode } from "../middleware/error-handler"
import { UserRole } from "../types/auth.types"
import {
  UserResponse,
  UserSearchQuery,
  UserSearchResponse,
} from "../types/user.types"
import {
  MetadataSearchQuery,
  MetadataSearchResponse,
} from "../types/metadata.types"
import {
  mapPrismaRoleToAppRole,
  mapAppRoleToPrismaRole,
} from "../utils/role-mapper"
import { prisma } from "../db/client"

/**
 * Admin service for administrative operations
 */
export const adminService = {
  /**
   * Get system statistics
   */
  getSystemStats: async (): Promise<{
    totalUsers: number
    totalMetadata: number
    newUsersLast30Days: number
    newMetadataLast30Days: number
    usersByRole: Record<UserRole, number>
  }> => {
    const totalUsers = await userRepository.count()
    const totalMetadata = await metadataRepository.count()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newUsersLast30Days =
      await userRepository.countCreatedAfter(thirtyDaysAgo)
    const newMetadataLast30Days =
      await metadataRepository.countCreatedAfter(thirtyDaysAgo)

    const usersByRole = await userRepository.countByRole()

    return {
      totalUsers,
      totalMetadata,
      newUsersLast30Days,
      newMetadataLast30Days,
      usersByRole,
    }
  },

  /**
   * Get enhanced admin dashboard statistics
   */
  getAdminDashboardStats: async (): Promise<{
    userCount: number
    orgCount: number
    metadataCount: number
    activeUsers: number
    pendingApprovals: number
    systemHealth: number
  }> => {
    // Get active time period (30 days ago)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Fetch all the statistics in parallel for better performance
    const [userCount, organizations, metadataCount, activeUsers, pendingCount] =
      await Promise.all([
        // Total number of users
        prisma.user.count(),

        // Get unique organizations
        prisma.user.groupBy({
          by: ["organization"],
          where: {
            organization: {
              not: null,
            },
          },
        }),

        // Total metadata entries
        prisma.metadata.count(),

        // Active users (users with activity in the last 30 days)
        prisma.user.count({
          where: {
            metadata: {
              some: {
                updatedAt: {
                  gte: thirtyDaysAgo,
                },
              },
            },
          },
        }),

        // Pending approvals (metadata with 'validationStatus' that is not 'Validated')
        prisma.metadata.count({
          where: {
            validationStatus: {
              not: "Validated",
            },
          },
        }),
      ])

    // Filter out null organizations and get the count
    const orgCount = organizations.filter(
      (org) => org.organization !== null
    ).length

    // Calculate system health based on actual metrics
    const metadataRatio =
      metadataCount > 0 ? Math.min(metadataCount / 1000, 1) : 0
    const userRatio = userCount > 0 ? Math.min(userCount / 200, 1) : 0
    const activeRatio = userCount > 0 ? activeUsers / userCount : 0

    // Weight the factors (adjust as needed)
    const systemHealth = Math.round(
      (metadataRatio * 0.3 + userRatio * 0.3 + activeRatio * 0.4) * 100
    )

    return {
      userCount,
      orgCount,
      metadataCount,
      activeUsers,
      pendingApprovals: pendingCount,
      systemHealth,
    }
  },

  /**
   * Get all users with pagination and filtering
   */
  getAllUsers: async (query: UserSearchQuery): Promise<UserSearchResponse> => {
    const result = await userRepository.findAll(query)

    return {
      users: result.users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name || "",
        role: mapPrismaRoleToAppRole(user.role),
        emailVerified: user.emailVerified !== null,
        organization: user.organization || undefined,
        department: user.department || undefined,
        phone: user.phone || undefined,
        image: user.image || undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    }
  },

  /**
   * Update user role
   */
  updateUserRole: async (
    userId: string,
    role: UserRole
  ): Promise<UserResponse> => {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
    }

    const updatedUser = await userRepository.update(userId, {
      role: mapAppRoleToPrismaRole(role),
    })

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name || "",
      role: mapPrismaRoleToAppRole(updatedUser.role),
      emailVerified: updatedUser.emailVerified !== null,
      organization: updatedUser.organization || undefined,
      department: updatedUser.department || undefined,
      phone: updatedUser.phone || undefined,
      image: updatedUser.image || undefined,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string): Promise<void> => {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
    }

    // Delete all user's metadata first
    await metadataRepository.deleteByUserId(userId)

    // Then delete the user
    await userRepository.delete(userId)
  },

  /**
   * Get detailed user information
   */
  getUserDetails: async (
    userId: string
  ): Promise<{
    id: string
    email: string
    name: string
    role: UserRole
    emailVerified: boolean
    organization?: string
    department?: string
    phone?: string
    image?: string
    createdAt: string
    updatedAt: string
    metadataCount: number
    recentActivity: Array<{
      id: string
      title: string
      updatedAt: string
    }>
  }> => {
    // Try exact match first
    let user = await userRepository.findById(userId)

    // If not found, try case-insensitive search
    if (!user) {
      const allUsers = await prisma.user.findMany({
        take: 100,
        select: { id: true },
      })

      const matchedUser = allUsers.find(
        (u) => u.id.toLowerCase() === userId.toLowerCase()
      )

      if (matchedUser) {
        user = await userRepository.findById(matchedUser.id)
      }
    }

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
    }

    // Get metadata count and recent activity
    const [metadataCount, recentMetadata] = await Promise.all([
      prisma.metadata.count({
        where: { userId: user.id },
      }),
      prisma.metadata.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          updatedAt: true,
        },
      }),
    ])

    return {
      id: user.id,
      email: user.email,
      name: user.name || "",
      role: mapPrismaRoleToAppRole(user.role),
      emailVerified: user.emailVerified !== null,
      organization: user.organization || undefined,
      department: user.department || undefined,
      phone: user.phone || undefined,
      image: user.image || undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      metadataCount,
      recentActivity: recentMetadata.map((m) => ({
        id: m.id,
        title: m.title,
        updatedAt: m.updatedAt.toISOString(),
      })),
    }
  },

  /**
   * Get all metadata with pagination and filtering
   */
  getAllMetadata: async (
    query: MetadataSearchQuery
  ): Promise<MetadataSearchResponse> => {
    const result = await metadataRepository.findAll(query)

    return {
      metadata: result.metadata.map((metadata) => ({
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
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    }
  },

  /**
   * Delete metadata
   */
  deleteMetadata: async (id: string): Promise<void> => {
    const metadata = await metadataRepository.findById(id)

    if (!metadata) {
      throw new ApiError(
        "Metadata not found",
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      )
    }

    await metadataRepository.delete(id)
  },

  /**
   * Verify user's email manually
   */
  verifyUserEmail: async (userId: string): Promise<UserResponse> => {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
    }

    const updatedUser = await userRepository.update(userId, {
      emailVerified: new Date(),
    })

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name || "",
      role: mapPrismaRoleToAppRole(updatedUser.role),
      emailVerified: updatedUser.emailVerified !== null,
      organization: updatedUser.organization || undefined,
      department: updatedUser.department || undefined,
      phone: updatedUser.phone || undefined,
      image: updatedUser.image || undefined,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    }
  },
}
