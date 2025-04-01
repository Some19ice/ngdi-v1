"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
const error_types_1 = require("../types/error.types");
const client_1 = require("@prisma/client");
const jose = __importStar(require("jose"));
const redis_service_1 = require("../services/redis.service");
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
 * Authenticate middleware - verifies JWT token from Authorization header or cookies
 * and attaches user information to context
 */
async function authenticate(c, next) {
    // First try to get token from Authorization header
    const authHeader = c.req.header("Authorization");
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }
    else {
        // If not in header, try to get from cookies
        const cookieHeader = c.req.raw.headers.get("cookie");
        if (cookieHeader) {
            const cookies = cookieHeader.split(";");
            const authCookie = cookies.find((c) => c.trim().startsWith(`${AUTH_COOKIE_NAME}=`));
            if (authCookie) {
                token = authCookie.split("=")[1];
            }
        }
    }
    if (!token) {
        throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_TOKEN, "No valid token provided", 401);
    }
    try {
        // Check if token is blacklisted
        const isBlacklisted = await redis_service_1.redisService.isTokenBlacklisted(token);
        if (isBlacklisted) {
            throw new error_types_1.AuthError(error_types_1.AuthErrorCode.TOKEN_BLACKLISTED, "Token has been revoked", 401);
        }
        // Check cache first
        const cacheEntry = tokenCache.get(token);
        const now = Math.floor(Date.now() / 1000);
        // If we have a valid cache entry that hasn't expired
        if (cacheEntry && cacheEntry.expiry > now) {
            // Set user info in context from cache
            c.set("userId", cacheEntry.userId);
            c.set("userEmail", cacheEntry.email);
            c.set("userRole", cacheEntry.role);
            // Continue with request
            await next();
            return;
        }
        // If not in cache or expired, perform full verification
        const decoded = await (0, jwt_1.verifyToken)(token);
        // Cache the result
        try {
            // Get expiry from token
            const decodedToken = jose.decodeJwt(token);
            const expiry = decodedToken.exp;
            // Only cache if the token has an expiry
            if (expiry) {
                tokenCache.set(token, {
                    userId: decoded.userId,
                    email: decoded.email,
                    role: decoded.role,
                    expiry,
                    timestamp: Date.now(),
                });
            }
        }
        catch (cacheError) {
            // If caching fails, just continue (non-critical)
            console.warn("Failed to cache token:", cacheError);
        }
        // Set user info in context
        c.set("userId", decoded.userId);
        c.set("userEmail", decoded.email);
        c.set("userRole", decoded.role);
        await next();
    }
    catch (error) {
        console.error("Authentication error:", error);
        if (error instanceof error_types_1.AuthError) {
            throw error;
        }
        if (error instanceof Error) {
            if (error.name === "TokenExpiredError") {
                throw new error_types_1.AuthError(error_types_1.AuthErrorCode.TOKEN_EXPIRED, "Token has expired", 401);
            }
            else if (error.name === "JsonWebTokenError") {
                throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_TOKEN, "Invalid token format", 401);
            }
        }
        throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_TOKEN, "Invalid token", 401);
    }
}
/**
 * Authorize middleware - checks if user has required roles
 */
function authorize(roles) {
    return async (c, next) => {
        const userRoleString = c.get("userRole");
        // Validate userRole and convert to enum
        if (!userRoleString) {
            throw new error_types_1.AuthError(error_types_1.AuthErrorCode.FORBIDDEN, "No role assigned to user", 403);
        }
        // Type assertion after validation
        const userRole = userRoleString;
        if (!roles.includes(userRole)) {
            throw new error_types_1.AuthError(error_types_1.AuthErrorCode.FORBIDDEN, "Insufficient permissions", 403);
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
