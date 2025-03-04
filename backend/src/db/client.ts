import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';

// Create a singleton Prisma client instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.server.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  });

// Prevent multiple instances in development
if (config.server.isDevelopment) {
  globalForPrisma.prisma = prisma;
} 