"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
exports.requireRole = requireRole;
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma_1 = require("../lib/prisma");
const http_exception_1 = require("hono/http-exception");
const client_1 = require("@prisma/client");
async function authMiddleware(c, next) {
    try {
        const authHeader = c.req.header("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            throw new http_exception_1.HTTPException(401, { message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });
        if (!user) {
            throw new http_exception_1.HTTPException(401, { message: "User not found" });
        }
        // Add user info to context
        c.set("user", user);
        await next();
    }
    catch (error) {
        throw new http_exception_1.HTTPException(401, { message: "Invalid token" });
    }
}
async function adminMiddleware(c, next) {
    const user = c.get("user");
    if (user.role !== client_1.UserRole.ADMIN) {
        throw new http_exception_1.HTTPException(403, { message: "Forbidden" });
    }
    await next();
}
function requireRole(role) {
    return async (c, next) => {
        const user = c.get("user");
        if (!user) {
            return c.json({ error: "Unauthorized - User not found in context" }, 401);
        }
        if (user.role !== role) {
            return c.json({ error: "Forbidden - Insufficient permissions" }, 403);
        }
        await next();
    };
}
