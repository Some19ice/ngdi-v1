import { PrismaClient } from "@prisma/client"

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
    // Configure connection pool with environment variables
    // See: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#connection-pool
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
