import { PrismaClient } from "@prisma/client"

// Create a singleton Prisma client
export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
})

// Helper functions for common database operations
export const userRepository = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  create: (data: any) => prisma.user.create({ data }),
  update: (id: string, data: any) =>
    prisma.user.update({ where: { id }, data }),
  delete: (id: string) => prisma.user.delete({ where: { id } }),
  findAll: (params: { skip?: number; take?: number; where?: any }) =>
    prisma.user.findMany(params),
}

export const metadataRepository = {
  findById: (id: string) => prisma.metadata.findUnique({ where: { id } }),
  create: (data: any) => prisma.metadata.create({ data }),
  update: (id: string, data: any) =>
    prisma.metadata.update({ where: { id }, data }),
  delete: (id: string) => prisma.metadata.delete({ where: { id } }),
  findByUserId: (userId: string, query: { skip?: number; take?: number }) =>
    prisma.metadata.findMany({
      where: { userId },
      skip: query.skip,
      take: query.take,
      orderBy: { createdAt: "desc" },
    }),
}
