import { Prisma, User } from "@prisma/client"
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
      where.role = role
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
}
