import { Prisma, User, UserRole } from "@prisma/client"
import { prisma } from "../client"
import { UserListQuery } from "../../types/user.types"

/**
 * User repository for database operations
 */
export const userRepository = {
  /**
   * Find a user by ID
   */
  findById: async (id: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { id },
    })
  },

  /**
   * Find a user by email
   */
  findByEmail: async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  /**
   * Create a new user
   */
  create: async (data: Prisma.UserCreateInput): Promise<User> => {
    return prisma.user.create({
      data,
    })
  },

  /**
   * Update a user
   */
  update: async (id: string, data: Prisma.UserUpdateInput): Promise<User> => {
    return prisma.user.update({
      where: { id },
      data,
    })
  },

  /**
   * Delete a user
   */
  delete: async (id: string): Promise<User> => {
    return prisma.user.delete({
      where: { id },
    })
  },

  /**
   * Find all users with pagination and filtering
   */
  findAll: async (query: UserListQuery) => {
    const { page, limit, search, role, sortBy, sortOrder } = query

    // Build where clause
    const where: Prisma.UserWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
      ]
    }

    if (role) {
      where.role = role as UserRole
    }

    // Count total users matching the filter
    const total = await prisma.user.count({ where })

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    })

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  /**
   * Count total users
   */
  count: async (): Promise<number> => {
    return prisma.user.count()
  },

  /**
   * Count users created after a specific date
   */
  countCreatedAfter: async (date: Date): Promise<number> => {
    return prisma.user.count({
      where: {
        createdAt: {
          gte: date,
        },
      },
    })
  },

  /**
   * Count users by role
   */
  countByRole: async (): Promise<Record<string, number>> => {
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    })

    return usersByRole.reduce(
      (acc, curr) => {
        acc[curr.role] = curr._count.role
        return acc
      },
      {} as Record<string, number>
    )
  },
}
