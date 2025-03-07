"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_openapi_1 = require("@hono/zod-openapi");
const auth_types_1 = require("../../types/auth.types");
const middleware_1 = require("../../middleware");
const auth_utils_1 = require("../../utils/auth.utils");
const prisma_1 = require("../../lib/prisma");
const error_handler_1 = require("../../middleware/error-handler");
const validation_1 = require("../../middleware/validation");
const zod_1 = require("zod");
// Create auth router
const auth = new zod_openapi_1.OpenAPIHono();
// Apply rate limiting to all auth routes
auth.use("*", middleware_1.authRateLimit);
// Define response schemas
const tokenResponse = zod_1.z.object({
    token: zod_1.z.string(),
});
const errorResponse = zod_1.z.object({
    message: zod_1.z.string(),
});
const messageResponse = zod_1.z.object({
    message: zod_1.z.string(),
});
// Login route - using regular Hono route instead of OpenAPI
auth.post("/login", async (c) => {
    try {
        const data = await c.req.json();
        const { email, password } = auth_types_1.loginSchema.parse(data);
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return c.json({ message: "Invalid credentials" }, 401);
        }
        const isValidPassword = await (0, auth_utils_1.comparePassword)(password, user.password);
        if (!isValidPassword) {
            return c.json({ message: "Invalid credentials" }, 401);
        }
        if (!user.emailVerified || !(user.emailVerified instanceof Date)) {
            return c.json({ message: "Please verify your email first" }, 401);
        }
        const token = await (0, auth_utils_1.generateToken)({
            id: user.id,
            role: user.role,
        });
        return c.json({ token });
    }
    catch (error) {
        return c.json({ message: error instanceof Error ? error.message : "An error occurred" }, 401);
    }
});
// Register route
auth.openapi({
    method: "post",
    path: "/register",
    tags: ["Authentication"],
    summary: "Register new user",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: auth_types_1.registerSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "User registered successfully",
            content: {
                "application/json": {
                    schema: messageResponse,
                },
            },
        },
        400: {
            description: "Invalid input or email already exists",
            content: {
                "application/json": {
                    schema: errorResponse,
                },
            },
        },
    },
}, async (c) => {
    const { email, password, name } = (0, validation_1.getValidatedData)(c);
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new error_handler_1.ApiError("Email already exists", 400);
    }
    const hashedPassword = await (0, auth_utils_1.hashPassword)(password);
    await prisma_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: auth_types_1.UserRole.USER,
        },
    });
    return c.json({ message: "User registered successfully" }, 201);
});
// Verify email route
auth.openapi({
    method: "get",
    path: "/verify-email",
    tags: ["Authentication"],
    summary: "Verify email with token",
    request: {
        query: auth_types_1.verifyEmailSchema,
    },
    responses: {
        200: {
            description: "Email verified successfully",
            content: {
                "application/json": {
                    schema: messageResponse,
                },
            },
        },
        400: {
            description: "Invalid token",
            content: {
                "application/json": {
                    schema: errorResponse,
                },
            },
        },
    },
}, async (c) => {
    const { token } = (0, validation_1.getValidatedData)(c);
    const verificationToken = await prisma_1.prisma.verificationToken.findUnique({
        where: { token },
    });
    if (!verificationToken) {
        throw new error_handler_1.ApiError("Invalid token", 400);
    }
    if (verificationToken.expires < new Date()) {
        throw new error_handler_1.ApiError("Token expired", 400);
    }
    await prisma_1.prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() },
    });
    await prisma_1.prisma.verificationToken.delete({
        where: { token },
    });
    return c.json({ message: "Email verified successfully" });
});
// Refresh token route
auth.openapi({
    method: "post",
    path: "/refresh-token",
    tags: ["Authentication"],
    summary: "Refresh access token",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: auth_types_1.refreshTokenSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Token refreshed successfully",
            content: {
                "application/json": {
                    schema: messageResponse,
                },
            },
        },
        401: {
            description: "Invalid refresh token",
            content: {
                "application/json": {
                    schema: errorResponse,
                },
            },
        },
    },
}, async (c) => {
    // TODO: Implement refresh token logic
    return c.json({ message: "Refresh token endpoint" });
});
// Forgot password route
auth.openapi({
    method: "post",
    path: "/forgot-password",
    tags: ["Authentication"],
    summary: "Request password reset",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: auth_types_1.forgotPasswordSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Password reset email sent",
            content: {
                "application/json": {
                    schema: messageResponse,
                },
            },
        },
    },
}, async (c) => {
    // TODO: Implement forgot password logic
    return c.json({ message: "Forgot password endpoint" });
});
// Reset password route
auth.openapi({
    method: "post",
    path: "/reset-password",
    tags: ["Authentication"],
    summary: "Reset password with token",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: auth_types_1.resetPasswordSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Password reset successful",
            content: {
                "application/json": {
                    schema: messageResponse,
                },
            },
        },
        400: {
            description: "Invalid token",
            content: {
                "application/json": {
                    schema: errorResponse,
                },
            },
        },
    },
}, async (c) => {
    // TODO: Implement reset password logic
    return c.json({ message: "Reset password endpoint" });
});
exports.default = auth;
