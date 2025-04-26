"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
exports.requireRole = requireRole;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const http_exception_1 = require("hono/http-exception");
// Load environment variables from .env file
dotenv_1.default.config();
console.log("API auth middleware loaded");
/**
 * Simplified auth middleware that provides mock admin user for demo purposes
 */
async function authMiddleware(c, next) {
    // Set a mock admin user in the context
    c.set("user", {
        id: "demo-user-id",
        email: "demo@example.com",
        role: client_1.UserRole.ADMIN,
    });
    console.log("[API DEBUG] Demo mode: Using mock admin user");
    return await next();
}
async function adminMiddleware(c, next) {
    const user = c.get("user");
    console.log("[API DEBUG] Admin middleware check:", {
        userRole: user.role,
        isAdmin: user.role === client_1.UserRole.ADMIN,
    });
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
