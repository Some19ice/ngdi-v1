"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const prisma_1 = require("../lib/prisma");
const error_handler_1 = require("../middleware/error-handler");
const jwt_1 = require("../utils/jwt");
const auth_types_1 = require("../types/auth.types");
const http_exception_1 = require("hono/http-exception");
const auth_1 = require("../middleware/auth");
const error_types_1 = require("../types/error.types");
const cookie_utils_1 = require("../utils/cookie.utils");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const redis_service_1 = require("../services/redis.service");
const auth_types_2 = require("../types/auth.types");
// Create auth router
const auth = new hono_1.Hono();
// Create an error handler that conforms to Hono's expected type
const honoErrorHandler = (err, c) => {
    const result = (0, error_handler_1.errorHandler)(err, c);
    // If the result contains a status and body, convert it to a Response
    if ("status" in result && "body" in result) {
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
// Mock user data for demo mode
const MOCK_USER = {
    id: "demo-user-id",
    email: "demo@example.com",
    name: "Demo Admin User",
    role: auth_types_1.UserRole.ADMIN,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};
// DEMO MODE: Login route with mock response
auth.post("/login", (0, zod_validator_1.zValidator)("json", auth_types_2.loginSchema), async (c) => {
    console.log("[DEMO MODE] Mock login - bypassing authentication");
    const data = await c.req.json();
    console.log(`[DEMO MODE] Login attempt for email: ${data.email}`);
    // Set mock cookies
    (0, cookie_utils_1.setCookieWithOptions)(c, "auth_token", "mock-access-token");
    (0, cookie_utils_1.setCookieWithOptions)(c, "refresh_token", "mock-refresh-token");
    (0, cookie_utils_1.setCookieWithOptions)(c, "authenticated", "true", {
        httpOnly: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
    });
    return c.json({
        user: MOCK_USER,
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
});
// DEMO MODE: Register route with mock response
auth.post("/register", (0, zod_validator_1.zValidator)("json", auth_types_2.registerSchema), async (c) => {
    console.log("[DEMO MODE] Mock registration - bypassing actual registration");
    const data = await c.req.json();
    console.log(`[DEMO MODE] Registration attempt for email: ${data.email}`);
    // Set mock cookies
    (0, cookie_utils_1.setCookieWithOptions)(c, "auth_token", "mock-access-token");
    (0, cookie_utils_1.setCookieWithOptions)(c, "refresh_token", "mock-refresh-token");
    return c.json({
        user: MOCK_USER,
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
});
// DEMO MODE: Verify email route with mock response
auth.get("/verify-email", (0, zod_validator_1.zValidator)("query", auth_types_2.verifyEmailSchema), async (c) => {
    console.log("[DEMO MODE] Mock email verification");
    return c.json({ success: true, message: "Email verified successfully" });
});
// DEMO MODE: Refresh token route with mock response
auth.post("/refresh-token", async (c) => {
    console.log("[DEMO MODE] Mock token refresh");
    // Set mock cookies
    (0, cookie_utils_1.setCookieWithOptions)(c, "auth_token", "mock-access-token");
    (0, cookie_utils_1.setCookieWithOptions)(c, "refresh_token", "mock-refresh-token");
    return c.json({
        success: true,
        message: "Token refreshed",
        data: {
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
        },
    });
});
// DEMO MODE: Request password reset with mock response
auth.post("/forgot-password", (0, zod_validator_1.zValidator)("json", auth_types_2.forgotPasswordSchema), async (c) => {
    console.log("[DEMO MODE] Mock forgot password request");
    const { email } = await c.req.json();
    console.log(`[DEMO MODE] Password reset requested for: ${email}`);
    return c.json({ success: true, message: "Password reset email sent" });
});
// DEMO MODE: Reset password with mock response
auth.post("/reset-password", (0, zod_validator_1.zValidator)("json", auth_types_2.resetPasswordSchema), async (c) => {
    console.log("[DEMO MODE] Mock password reset");
    return c.json({ success: true, message: "Password reset successfully" });
});
// DEMO MODE: Logout route with mock response
auth.post("/logout", async (c) => {
    console.log("[DEMO MODE] Mock logout");
    // Clear cookies even in demo mode
    (0, cookie_utils_1.clearCookie)(c, "auth_token");
    (0, cookie_utils_1.clearCookie)(c, "refresh_token");
    (0, cookie_utils_1.clearCookie)(c, "authenticated");
    return c.json({ success: true, message: "Logged out successfully" });
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
// CSRF token endpoint for secure form submission
auth.get("/csrf", async (c) => {
    try {
        // Generate a random CSRF token
        const csrfToken = crypto.randomUUID();
        // Set as a cookie with appropriate security settings
        (0, cookie_utils_1.setCookieWithOptions)(c, "csrfToken", csrfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60, // 1 hour
        });
        return c.json({ success: true, csrfToken });
    }
    catch (error) {
        console.error("CSRF token generation error:", error);
        throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_CREDENTIALS, "Could not generate security token", 500);
    }
});
exports.default = auth;
