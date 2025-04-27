import { prisma } from "@ngdi/db"

// Export the centralized Prisma client from @ngdi/db
export { prisma }

// Log Prisma connection status
prisma
  .$connect()
  .then(() => {
    console.log("Prisma connected successfully to the database")
  })
  .catch((error) => {
    console.error("Prisma connection error:", error)
  })
