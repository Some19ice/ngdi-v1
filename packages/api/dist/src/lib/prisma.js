"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// Import from centralized Prisma client
const prisma_client_1 = require("../shared/prisma-client");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prisma_client_1.prisma; } });
