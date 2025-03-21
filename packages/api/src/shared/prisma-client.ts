/**
 * Prisma client export that maintains compatibility with existing code
 * while using the root Prisma schema.
 *
 * This avoids schema duplication and ensures consistency across the application.
 */

// PrismaClient is reused to avoid connection limit exhaustion
import { PrismaClient } from "@prisma/client"

// Create singleton Prisma client
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Log connection status
prisma
  .$connect()
  .then(() => {
    console.log("API: Prisma connected successfully to the database")
  })
  .catch((error) => {
    console.error("API: Prisma connection error:", error)
  })
