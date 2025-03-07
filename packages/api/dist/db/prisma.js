"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataRepository = exports.userRepository = exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Create a singleton Prisma client
exports.prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
});
// Helper functions for common database operations
exports.userRepository = {
    findById: (id) => exports.prisma.user.findUnique({ where: { id } }),
    findByEmail: (email) => exports.prisma.user.findUnique({ where: { email } }),
    create: (data) => exports.prisma.user.create({ data }),
    update: (id, data) => exports.prisma.user.update({ where: { id }, data }),
    delete: (id) => exports.prisma.user.delete({ where: { id } }),
    findAll: (params) => exports.prisma.user.findMany(params),
};
exports.metadataRepository = {
    findById: (id) => exports.prisma.metadata.findUnique({ where: { id } }),
    create: (data) => exports.prisma.metadata.create({ data }),
    update: (id, data) => exports.prisma.metadata.update({ where: { id }, data }),
    delete: (id) => exports.prisma.metadata.delete({ where: { id } }),
    findByUserId: (userId, query) => exports.prisma.metadata.findMany({
        where: { userId },
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: "desc" },
    }),
};
