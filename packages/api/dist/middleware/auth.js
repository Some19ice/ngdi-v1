"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
const error_handler_1 = require("./error-handler");
const auth_types_1 = require("../types/auth.types");
/**
 * Authenticate middleware - verifies JWT token and attaches user to context
 */
async function authenticate(c, next) {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new error_handler_1.ApiError("Unauthorized - No token provided", 401);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = await (0, jwt_1.verifyToken)(token);
        // Set user info in context
        c.set("userId", decoded.userId);
        c.set("userEmail", decoded.email);
        c.set("userRole", decoded.role);
        await next();
    }
    catch (error) {
        throw new error_handler_1.ApiError("Unauthorized - Invalid token", 401);
    }
}
/**
 * Authorize middleware - checks if user has required roles
 */
function authorize(roles) {
    return async (c, next) => {
        const userRole = c.get("userRole");
        if (!roles.includes(userRole)) {
            throw new error_handler_1.ApiError("Forbidden - Insufficient permissions", 403);
        }
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
        if (userId !== resourceUserId && userRole !== auth_types_1.UserRole.ADMIN) {
            throw new error_handler_1.ApiError("Forbidden - You can only access your own resources", 403);
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
    requireAdmin: [authenticate, authorize([auth_types_1.UserRole.ADMIN])],
    requireNodeOfficer: [authenticate, authorize([auth_types_1.UserRole.NODE_OFFICER])],
    requireAdminOrNodeOfficer: [
        authenticate,
        authorize([auth_types_1.UserRole.ADMIN, auth_types_1.UserRole.NODE_OFFICER]),
    ],
    requireOwnerOrAdmin: (resourceUserId) => [
        authenticate,
        authorizeOwnerOrAdmin(resourceUserId),
    ],
};
