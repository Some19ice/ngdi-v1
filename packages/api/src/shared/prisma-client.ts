/**
 * Prisma client export that maintains compatibility with existing code
 * while using the shared Prisma client from the db package.
 *
 * This avoids schema duplication and ensures consistency across the application.
 */

// Import the shared Prisma client from the db package
import { prisma } from "@ngdi/db"

// Export the prisma client
export { prisma }

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
