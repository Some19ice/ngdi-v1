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
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const prisma_1 = require("../lib/prisma");
const error_handler_1 = require("../middleware/error-handler");
const jwt_1 = require("../utils/jwt");
const auth_service_1 = require("../services/auth.service");
const http_exception_1 = require("hono/http-exception");
const auth_1 = require("../middleware/auth");
const error_types_1 = require("../types/error.types");
const cookie_utils_1 = require("../utils/cookie.utils");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const redis_service_1 = require("../services/redis.service");
const auth_types_1 = require("../types/auth.types");
const jose = __importStar(require("jose"));
// Create auth router
const auth = new hono_1.Hono();
// Create an error handler that conforms to Hono's expected type
const honoErrorHandler = (err, c) => {
    const result = (0, error_handler_1.errorHandler)(err, c);
    // If the result contains a status and body, convert it to a Response
    if ('status' in result && 'body' in result) {
        return c.json(result.body, result.status);
    }
    // Otherwise, return the result directly (should already be a Response)
    return result;
};
// Apply error handler
auth.onError(honoErrorHandler);
// Apply rate limiting to auth routes
auth.use("/login", (0, rate_limit_middleware_1.rateLimit)({
    windowSeconds: 300, // 5 minutes
    maxRequests: 5, // 5 attempts
    keyPrefix: "rate:login:",
}));
auth.use("/register", (0, rate_limit_middleware_1.rateLimit)({
    windowSeconds: 3600, // 1 hour
    maxRequests: 3, // 3 attempts
    keyPrefix: "rate:register:",
}));
// Helper function to get proper cookie domain based on environment
function getCookieDomain() {
    if (process.env.NODE_ENV === "production") {
        // Use the COOKIE_DOMAIN env var if set, otherwise default to the production domain
        return process.env.COOKIE_DOMAIN || process.env.VERCEL_URL || ".vercel.app";
    }
    // For local development, don't set domain to allow browser to handle it
    return undefined;
}
// Login route
auth.post("/login", (0, zod_validator_1.zValidator)("json", auth_types_1.loginSchema), async (c) => {
    try {
        const data = await c.req.json();
        const result = await auth_service_1.AuthService.login(data);
        // Set auth cookies
        (0, cookie_utils_1.setCookieWithOptions)(c, "auth_token", result.accessToken);
        (0, cookie_utils_1.setCookieWithOptions)(c, "refresh_token", result.refreshToken);
        return c.json(result);
    }
    catch (error) {
        if (error instanceof error_types_1.AuthError) {
            return c.json({
                success: false,
                code: error.code,
                message: error.message,
                details: error.details,
            }, error.status);
        }
        throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_CREDENTIALS, "Authentication failed", 401);
    }
});
// Register route
auth.post("/register", (0, zod_validator_1.zValidator)("json", auth_types_1.registerSchema), async (c) => {
    try {
        const data = await c.req.json();
        const result = await auth_service_1.AuthService.register(data);
        // Set auth cookies
        (0, cookie_utils_1.setCookieWithOptions)(c, "auth_token", result.accessToken);
        (0, cookie_utils_1.setCookieWithOptions)(c, "refresh_token", result.refreshToken);
        return c.json(result);
    }
    catch (error) {
        if (error instanceof error_types_1.AuthError) {
            return c.json({
                success: false,
                code: error.code,
                message: error.message,
                details: error.details,
            }, error.status);
        }
        throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_CREDENTIALS, "Registration failed", 401);
    }
});
// Verify email route
auth.get("/verify-email", (0, zod_validator_1.zValidator)("query", auth_types_1.verifyEmailSchema), async (c) => {
    try {
        const { token } = await c.req.valid("query");
        await auth_service_1.AuthService.verifyEmail(token);
        return c.json({ success: true, message: "Email verified successfully" });
    }
    catch (error) {
        if (error instanceof error_types_1.AuthError) {
            return c.json({
                success: false,
                code: error.code,
                message: error.message,
                details: error.details,
            }, error.status);
        }
        throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_TOKEN, "Email verification failed", 400);
    }
});
// Refresh token route
auth.post("/refresh-token", async (c) => {
    try {
        // Get refresh token from Authorization header or cookies
        let refreshToken = c.req.header("Authorization")?.replace("Bearer ", "");
        // If not in header, try to get from cookies
        if (!refreshToken) {
            const cookieHeader = c.req.raw.headers.get("cookie");
            if (cookieHeader) {
                const cookies = cookieHeader.split(";");
                const refreshTokenCookie = cookies.find((c) => c.trim().startsWith("refresh_token="));
                if (refreshTokenCookie) {
                    refreshToken = refreshTokenCookie.split("=")[1];
                }
            }
        }
        // Check if we have a refresh token
        if (!refreshToken) {
            throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_TOKEN, "Refresh token is required", 400);
        }
        // Verify refresh token
        const decoded = await (0, jwt_1.verifyRefreshToken)(refreshToken);
        // Generate new access token
        const accessToken = await (0, jwt_1.generateToken)({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        });
        // Generate new refresh token
        const newRefreshToken = await (0, jwt_1.generateRefreshToken)({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        });
        // Set auth cookies
        (0, cookie_utils_1.setCookieWithOptions)(c, "auth_token", accessToken);
        (0, cookie_utils_1.setCookieWithOptions)(c, "refresh_token", newRefreshToken);
        return c.json({
            success: true,
            message: "Token refreshed",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        }, 200);
    }
    catch (error) {
        console.error("Token refresh error:", error);
        throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_TOKEN, "Invalid refresh token", 401);
    }
});
// Request password reset
auth.post("/forgot-password", (0, rate_limit_middleware_1.rateLimit)({
    windowSeconds: 3600, // 1 hour
    maxRequests: 3, // 3 attempts per hour
    keyPrefix: "rate:forgotpw:",
}), (0, zod_validator_1.zValidator)("json", auth_types_1.forgotPasswordSchema), async (c) => {
    try {
        const { email } = await c.req.json();
        await auth_service_1.AuthService.forgotPassword(email);
        return c.json({ success: true, message: "Password reset email sent" });
    }
    catch (error) {
        // Always return success to prevent email enumeration
        return c.json({ success: true, message: "Password reset email sent" });
    }
});
// Reset password
auth.post("/reset-password", (0, rate_limit_middleware_1.rateLimit)({
    windowSeconds: 3600, // 1 hour
    maxRequests: 5, // 5 attempts per hour
    keyPrefix: "rate:resetpw:",
}), (0, zod_validator_1.zValidator)("json", auth_types_1.resetPasswordSchema), async (c) => {
    try {
        const { token, password } = await c.req.json();
        await auth_service_1.AuthService.resetPassword(token, password);
        return c.json({ success: true, message: "Password reset successfully" });
    }
    catch (error) {
        if (error instanceof error_types_1.AuthError) {
            return c.json({
                success: false,
                code: error.code,
                message: error.message,
                details: error.details,
            }, error.status);
        }
        throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_TOKEN, "Password reset failed", 400);
    }
});
// Logout route
auth.post("/logout", async (c) => {
    try {
        // Get token from Authorization header
        let token = c.req.header("Authorization")?.replace("Bearer ", "");
        // If not in header, try to get from cookies
        if (!token) {
            const cookieHeader = c.req.raw.headers.get("cookie");
            if (cookieHeader) {
                const cookies = cookieHeader.split(";");
                const authCookie = cookies.find((c) => c.trim().startsWith("auth_token="));
                if (authCookie) {
                    token = authCookie.split("=")[1];
                }
            }
        }
        // If token exists, blacklist it
        if (token) {
            try {
                // Verify the token first to ensure it's valid
                const decoded = await (0, jwt_1.verifyToken)(token);
                // Get token expiry
                const decodedToken = jose.decodeJwt(token);
                const expiry = decodedToken.exp - Math.floor(Date.now() / 1000);
                // Blacklist the token for its remaining lifetime
                if (expiry > 0) {
                    await redis_service_1.redisService.blacklistToken(token, expiry);
                }
            }
            catch (tokenError) {
                // Token verification failed, but we still want to clear cookies
                console.error("Token verification failed during logout:", tokenError);
            }
        }
        // Clear cookies in all cases
        (0, cookie_utils_1.setCookieWithOptions)(c, "auth_token", "", { maxAge: 0 });
        (0, cookie_utils_1.setCookieWithOptions)(c, "refresh_token", "", { maxAge: 0 });
        return c.json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        // Always return success for logout to prevent revealing system state
        return c.json({ success: true, message: "Logged out successfully" });
    }
});
// Get current user (me) endpoint
auth.use("/me", auth_1.authMiddleware);
auth.get("/me", async (c) => {
    const userId = c.var.userId;
    if (!userId) {
        throw new http_exception_1.HTTPException(401, { message: "Unauthorized" });
    }
    try {
        // Get user from database
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                image: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_CREDENTIALS, "User not found", 404);
        }
        return c.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error("Get current user error:", error);
        if (error instanceof error_types_1.AuthError) {
            throw error;
        }
        throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_CREDENTIALS, "Authentication failed", 401);
    }
});
// Auth check endpoint - lightweight status check for client-side apps
auth.get("/check", async (c) => {
    try {
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
                const authCookie = cookies.find((cookie) => cookie.trim().startsWith("auth_token="));
                if (authCookie) {
                    token = authCookie.split("=")[1];
                }
            }
        }
        // Check if we have a token
        if (!token) {
            return c.json({
                authenticated: false,
                message: "No authentication token found",
            }, 200); // Return 200 even for unauthenticated to avoid CORS issues
        }
        // Check if token is blacklisted
        const isBlacklisted = await redis_service_1.redisService.isTokenBlacklisted(token);
        if (isBlacklisted) {
            return c.json({
                authenticated: false,
                message: "Token has been invalidated",
            }, 200);
        }
        // Verify the token
        try {
            const decoded = await (0, jwt_1.verifyToken)(token);
            // Return user info without sensitive data
            return c.json({
                authenticated: true,
                user: {
                    id: decoded.userId,
                    email: decoded.email,
                    role: decoded.role,
                },
            }, 200);
        }
        catch (tokenError) {
            console.log("Token verification failed:", tokenError);
            // Return clear unauthenticated state
            return c.json({
                authenticated: false,
                message: "Invalid or expired token",
            }, 200); // Return 200 to avoid CORS issues
        }
    }
    catch (error) {
        console.error("Auth check error:", error);
        // Return generic error but still 200 to avoid disrupting client
        return c.json({
            authenticated: false,
            message: "Authentication check failed",
        }, 200);
    }
});
exports.default = auth;
