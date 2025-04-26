/**
 * Prisma client export that maintains compatibility with existing code
 * while using the root Prisma schema.
 *
 * This avoids schema duplication and ensures consistency across the application.
 */

// PrismaClient is reused to avoid connection limit exhaustion
import { PrismaClient } from "@prisma/client"

// Create singleton Prisma client with retry logic
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Configure Prisma client with connection retry logic
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Use existing instance or create a new one
export const prisma = globalForPrisma.prisma || prismaClientSingleton()

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Connect to the database with better error handling
const connectWithRetry = async (retries = 5, delay = 2000) => {
  let currentRetry = 0

  while (currentRetry < retries) {
    try {
      await prisma.$connect()
      console.log("API: Prisma connected successfully to the database")
      return true
    } catch (error) {
      currentRetry++
      console.error(
        `API: Prisma connection error (attempt ${currentRetry}/${retries}):`,
        error
      )

      if (currentRetry >= retries) {
        console.error(
          "API: Maximum connection retries reached. Using database in disconnected mode."
        )
        return false
      }

      console.log(`Retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return false
}

// Initialize connection
connectWithRetry().catch((error) => {
  console.error("API: Failed to establish database connection:", error)
})
