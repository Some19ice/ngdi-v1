"use strict";
/**
 * Prisma client export that maintains compatibility with existing code
 * while using the root Prisma schema.
 *
 * This avoids schema duplication and ensures consistency across the application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// PrismaClient is reused to avoid connection limit exhaustion
const client_1 = require("@prisma/client");
// Create singleton Prisma client
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });
// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
// Log connection status
exports.prisma
    .$connect()
    .then(() => {
    console.log("API: Prisma connected successfully to the database");
})
    .catch((error) => {
    console.error("API: Prisma connection error:", error);
});
