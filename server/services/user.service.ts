import { PrismaClient, User, UserRole } from "@prisma/client"
import { compare, hash } from "bcryptjs"
import { prisma } from "../lib/prisma"

export class UserService {
  static async getCurrentUser(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error("User not found")
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as User
  }

  static async updateUser(
    userId: string,
    data: {
      name?: string
      organization?: string
      department?: string
      phone?: string
    }
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    })

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as User
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error("User not found")
    }

    const isValidPassword = await compare(currentPassword, user.password)

    if (!isValidPassword) {
      throw new Error("Invalid current password")
    }

    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
  }
}

export const userService = new UserService()
