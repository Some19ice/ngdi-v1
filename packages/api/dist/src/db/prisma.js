"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataRepository = exports.userRepository = void 0;
const prisma_client_1 = require("../shared/prisma-client");
// Helper functions for common database operations
exports.userRepository = {
    findById: (id) => prisma_client_1.prisma.user.findUnique({ where: { id } }),
    findByEmail: (email) => prisma_client_1.prisma.user.findUnique({ where: { email } }),
    create: (data) => prisma_client_1.prisma.user.create({ data }),
    update: (id, data) => prisma_client_1.prisma.user.update({ where: { id }, data }),
    delete: (id) => prisma_client_1.prisma.user.delete({ where: { id } }),
    findAll: (params) => prisma_client_1.prisma.user.findMany(params),
};
exports.metadataRepository = {
    findById: (id) => prisma_client_1.prisma.metadata.findUnique({ where: { id } }),
    create: (data) => prisma_client_1.prisma.metadata.create({ data }),
    update: (id, data) => prisma_client_1.prisma.metadata.update({ where: { id }, data }),
    delete: (id) => prisma_client_1.prisma.metadata.delete({ where: { id } }),
    findByUserId: (userId, query) => prisma_client_1.prisma.metadata.findMany({
        where: { userId },
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: "desc" },
    }),
};
