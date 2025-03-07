import { PrismaClient } from '@prisma/client';
import { config } from "../config"

// Create a singleton Prisma client instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.env === "development" ? ["query", "error", "warn"] : ["error"],
  })

// Prevent multiple instances in development
if (config.env === "development") {
  globalForPrisma.prisma = prisma
} 