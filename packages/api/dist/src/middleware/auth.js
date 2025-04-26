"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
exports.authMiddleware = authMiddleware;
exports.authorize = authorize;
const error_types_1 = require("../types/error.types");
const client_1 = require("@prisma/client");
const http_exception_1 = require("hono/http-exception");
const AUTH_COOKIE_NAME = "auth_token";
// Cache validated tokens to reduce repeated verification
const tokenCache = new Map();
// Clean the token cache periodically
setInterval(() => {
    const now = Date.now();
    // Remove entries older than 5 minutes
    tokenCache.forEach((value, key) => {
        if (now - value.timestamp > 5 * 60 * 1000) {
            tokenCache.delete(key);
        }
    });
}, 60 * 1000); // Run cleanup every minute
/**
 * Authenticate middleware - bypass authentication for demo
 */
async function authenticate(c, next) {
    // Set mock admin user in context
    c.set("userId", "demo-user-id");
    c.set("userEmail", "demo@example.com");
    c.set("userRole", client_1.UserRole.ADMIN);
    await next();
}
/**
 * Authorize middleware - always authorize for demo
 */
function authorize(roles) {
    return async (c, next) => {
        // For demo purposes, always authorize
        await next();
    };
}
/**
 * Authorize owner or admin middleware - checks if user is accessing their own resource or has admin privileges
 */
function authorizeOwnerOrAdmin(resourceUserId) {
    return async (c, next) => {
        const userId = c.get("userId");
        const userRole = c.get("userRole");
        if (userId !== resourceUserId && userRole !== client_1.UserRole.ADMIN) {
            throw new error_types_1.AuthError(error_types_1.AuthErrorCode.FORBIDDEN, "You can only access your own resources", 403);
        }
        await next();
    };
}
/**
 * Auth middleware function - can be used directly with Hono
 */
function authMiddleware(c, next) {
    return authenticate(c, next);
}
/**
 * Combined auth middleware helpers
 */
exports.auth = {
    authenticate,
    requireRoles: (roles) => [authenticate, authorize(roles)],
    requireAdmin: [authenticate, authorize([client_1.UserRole.ADMIN])],
    requireNodeOfficer: [authenticate, authorize([client_1.UserRole.NODE_OFFICER])],
    requireAdminOrNodeOfficer: [
        authenticate,
        authorize([client_1.UserRole.ADMIN, client_1.UserRole.NODE_OFFICER]),
    ],
    requireOwnerOrAdmin: (resourceUserId) => [
        authenticate,
        authorizeOwnerOrAdmin(resourceUserId),
    ],
};
const userRoles = Object.values(client_1.UserRole);
function isValidUserRole(role) {
    return typeof role === "string" && userRoles.includes(role);
}
const requireRoles = (roles) => async (c, next) => {
    const maybeRole = c.var.userRole;
    if (!maybeRole || typeof maybeRole !== "string") {
        throw new http_exception_1.HTTPException(401, { message: "Unauthorized - No role found" });
    }
    // Convert string to UserRole enum
    let userRole;
    try {
        userRole = client_1.UserRole[maybeRole];
        if (!userRole) {
            throw new Error("Invalid role");
        }
    }
    catch {
        throw new http_exception_1.HTTPException(403, { message: "Forbidden - Invalid role" });
    }
    if (!roles.includes(userRole)) {
        throw new http_exception_1.HTTPException(403, {
            message: "Forbidden - Insufficient permissions",
        });
    }
    await next();
};
