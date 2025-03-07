import { PrismaClient, Metadata } from "@prisma/client"
import { prisma } from "../lib/prisma"

export class MetadataService {
  static async createMetadata(
    data: Omit<Metadata, "id" | "createdAt" | "updatedAt" | "userId">,
    userId: string
  ): Promise<Metadata> {
    return prisma.metadata.create({
      data: {
        ...data,
        userId,
      },
    })
  }

  static async getMetadataById(id: string): Promise<Metadata | null> {
    return prisma.metadata.findUnique({
      where: { id },
    })
  }

  static async updateMetadata(
    id: string,
    data: Partial<Omit<Metadata, "id" | "createdAt" | "updatedAt" | "userId">>
  ): Promise<Metadata> {
    return prisma.metadata.update({
      where: { id },
      data,
    })
  }

  static async deleteMetadata(id: string): Promise<void> {
    await prisma.metadata.delete({
      where: { id },
    })
  }

  static async searchMetadata(
    query: string,
    page = 1,
    limit = 10
  ): Promise<{ items: Metadata[]; total: number }> {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.metadata.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { abstract: { contains: query, mode: "insensitive" } },
            { categories: { has: query } },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.metadata.count({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { abstract: { contains: query, mode: "insensitive" } },
            { categories: { has: query } },
          ],
        },
      }),
    ])

    return { items, total }
  }

  static async getUserMetadata(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ items: Metadata[]; total: number }> {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.metadata.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.metadata.count({
        where: { userId },
      }),
    ])

    return { items, total }
  }
}

export const metadataService = new MetadataService()
