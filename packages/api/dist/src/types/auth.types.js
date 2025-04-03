"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResponseSchema = exports.verifyEmailSchema = exports.refreshTokenSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.requestPasswordResetSchema = exports.registerSchema = exports.loginSchema = exports.passwordSchema = exports.RolePermissions = exports.RoleIncludes = exports.UserRole = void 0;
const zod_openapi_1 = require("@hono/zod-openapi");
/**
 * Authentication and authorization related types
 */
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["NODE_OFFICER"] = "NODE_OFFICER";
    UserRole["USER"] = "USER";
    UserRole["GUEST"] = "GUEST";
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * Role inclusion hierarchy - which role includes permissions of other roles
 */
exports.RoleIncludes = {
    [UserRole.ADMIN]: [],
    [UserRole.NODE_OFFICER]: [UserRole.USER],
    [UserRole.USER]: [],
    [UserRole.GUEST]: [],
};
/**
 * Basic permissions for each role
 */
exports.RolePermissions = {
    [UserRole.ADMIN]: [
        { action: "create", subject: "metadata" },
        { action: "read", subject: "metadata" },
        { action: "update", subject: "metadata" },
        { action: "delete", subject: "metadata" },
        { action: "manage", subject: "metadata" },
        { action: "create", subject: "user" },
        { action: "read", subject: "user" },
        { action: "update", subject: "user" },
        { action: "delete", subject: "user" },
        { action: "read", subject: "system" },
    ],
    [UserRole.NODE_OFFICER]: [
        { action: "create", subject: "metadata" },
        { action: "read", subject: "metadata" },
        { action: "update", subject: "metadata" },
        { action: "manage", subject: "metadata" },
        { action: "read", subject: "user" },
        { action: "create", subject: "user" },
    ],
    [UserRole.USER]: [
        { action: "read", subject: "metadata" },
        { action: "create", subject: "metadata" },
    ],
    [UserRole.GUEST]: [{ action: "read", subject: "metadata" }],
};
/**
 * Password schema
 */
exports.passwordSchema = zod_openapi_1.z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");
/**
 * Login request schema
 */
exports.loginSchema = zod_openapi_1.z
    .object({
    email: zod_openapi_1.z.string().email("Invalid email address").openapi({
        example: "user@example.com",
        description: "User's email address",
    }),
    password: exports.passwordSchema.openapi({
        example: "StrongP@ss123",
        description: "User's password - must contain uppercase, lowercase, number, and special character",
    }),
})
    .openapi("LoginRequest");
/**
 * Registration request schema
 */
exports.registerSchema = zod_openapi_1.z
    .object({
    name: zod_openapi_1.z.string().min(2, "Name must be at least 2 characters").openapi({
        example: "John Doe",
        description: "User's full name",
    }),
    email: zod_openapi_1.z.string().email("Invalid email address").openapi({
        example: "user@example.com",
        description: "User's email address",
    }),
    password: exports.passwordSchema.openapi({
        example: "StrongP@ss123",
        description: "User's password - must contain uppercase, lowercase, number, and special character",
    }),
    organization: zod_openapi_1.z.string().optional().openapi({
        example: "ACME Corp",
        description: "User's organization",
    }),
    department: zod_openapi_1.z.string().optional().openapi({
        example: "Engineering",
        description: "User's department",
    }),
    phone: zod_openapi_1.z.string().optional().openapi({
        example: "+1234567890",
        description: "User's phone number",
    }),
})
    .openapi("RegisterRequest");
/**
 * Request password reset schema
 */
exports.requestPasswordResetSchema = zod_openapi_1.z
    .object({
    email: zod_openapi_1.z.string().email().openapi({
        example: "user@example.com",
        description: "Email address to send password reset link to",
    }),
})
    .openapi("RequestPasswordResetRequest");
/**
 * Forgot password schema (alias for requestPasswordResetSchema)
 */
exports.forgotPasswordSchema = exports.requestPasswordResetSchema;
/**
 * Reset password schema
 */
exports.resetPasswordSchema = zod_openapi_1.z
    .object({
    token: zod_openapi_1.z.string().openapi({
        example: "reset-token-123",
        description: "Password reset token",
    }),
    password: zod_openapi_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .openapi({
        example: "newpassword123",
        description: "New password",
    }),
})
    .openapi("ResetPasswordRequest");
/**
 * Change password schema
 */
exports.changePasswordSchema = zod_openapi_1.z
    .object({
    currentPassword: zod_openapi_1.z.string().openapi({
        example: "oldpassword123",
        description: "Current password",
    }),
    newPassword: zod_openapi_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .openapi({
        example: "newpassword123",
        description: "New password",
    }),
})
    .openapi("ChangePasswordRequest");
/**
 * Refresh token schema
 */
exports.refreshTokenSchema = zod_openapi_1.z
    .object({
    refreshToken: zod_openapi_1.z.string().openapi({
        example: "refresh-token-123",
        description: "Refresh token",
    }),
})
    .openapi("RefreshTokenRequest");
/**
 * Email verification schema
 */
exports.verifyEmailSchema = zod_openapi_1.z
    .object({
    token: zod_openapi_1.z.string().openapi({
        example: "verification-token-123",
        description: "Email verification token",
    }),
})
    .openapi("VerifyEmailRequest");
/**
 * Auth response
 */
exports.authResponseSchema = zod_openapi_1.z
    .object({
    user: zod_openapi_1.z.object({
        id: zod_openapi_1.z.string().openapi({
            example: "user-123",
            description: "User ID",
        }),
        name: zod_openapi_1.z.string().openapi({
            example: "John Doe",
            description: "User's full name",
        }),
        email: zod_openapi_1.z.string().openapi({
            example: "user@example.com",
            description: "User's email address",
        }),
        role: zod_openapi_1.z.nativeEnum(UserRole).openapi({
            example: UserRole.USER,
            description: "User's role",
        }),
        organization: zod_openapi_1.z.string().optional().openapi({
            example: "ACME Corp",
            description: "User's organization",
        }),
        department: zod_openapi_1.z.string().optional().openapi({
            example: "Engineering",
            description: "User's department",
        }),
    }),
    accessToken: zod_openapi_1.z.string().openapi({
        example: "access-token-123",
        description: "JWT access token",
    }),
    refreshToken: zod_openapi_1.z.string().openapi({
        example: "refresh-token-123",
        description: "JWT refresh token",
    }),
})
    .openapi("AuthResponse");
