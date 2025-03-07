"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const config_1 = require("../config");
// Create a singleton Prisma client instance
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: config_1.config.env === "development" ? ["query", "error", "warn"] : ["error"],
    });
// Prevent multiple instances in development
if (config_1.config.env === "development") {
    globalForPrisma.prisma = exports.prisma;
}
