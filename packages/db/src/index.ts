import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";
export * from "./repositories"

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a Prisma client with connection pooling and logging configuration
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Store the client in the global object in development to prevent connection exhaustion
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Connect to the database with better error handling
const connectWithRetry = async (retries = 5, delay = 2000) => {
  let currentRetry = 0;

  while (currentRetry < retries) {
    try {
      await prisma.$connect();
      console.log("Database connected successfully");
      return true;
    } catch (error) {
      currentRetry++;
      console.error(
        `Database connection error (attempt ${currentRetry}/${retries}):`,
        error
      );

      if (currentRetry >= retries) {
        console.error(
          "Maximum connection retries reached. Using database in disconnected mode."
        );
        return false;
      }

      console.log(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return false;
};

// Initialize connection
connectWithRetry().catch((error) => {
  console.error("Failed to establish database connection:", error);
});
