"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResponseSchema = exports.verifyEmailSchema = exports.refreshTokenSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.registerSchema = exports.loginSchema = exports.RolePermissions = exports.InheritedPermissions = exports.PermissionGroups = exports.Permissions = exports.UserRole = void 0;
exports.getAllPermissionsForRole = getAllPermissionsForRole;
const zod_openapi_1 = require("@hono/zod-openapi");
/**
 * User roles enum
 */
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["NODE_OFFICER"] = "NODE_OFFICER";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.Permissions = {
    // Metadata permissions
    CREATE_METADATA: { action: "create", subject: "metadata" },
    READ_METADATA: { action: "read", subject: "metadata" },
    UPDATE_METADATA: { action: "update", subject: "metadata" },
    DELETE_METADATA: { action: "delete", subject: "metadata" },
    VALIDATE_METADATA: { action: "validate", subject: "metadata" },
    // User management permissions
    CREATE_USER: { action: "create", subject: "user" },
    READ_USER: { action: "read", subject: "user" },
    UPDATE_USER: { action: "update", subject: "user" },
    DELETE_USER: { action: "delete", subject: "user" },
    ASSIGN_ROLE: { action: "assign", subject: "role" },
    // Organization permissions
    MANAGE_ORGANIZATION: { action: "manage", subject: "organization" },
    READ_ORGANIZATION: { action: "read", subject: "organization" },
    // System permissions
    VIEW_ANALYTICS: { action: "view", subject: "analytics" },
    MANAGE_SETTINGS: { action: "manage", subject: "settings" },
};
exports.PermissionGroups = {
    METADATA_MANAGEMENT: [
        exports.Permissions.CREATE_METADATA,
        exports.Permissions.READ_METADATA,
        exports.Permissions.UPDATE_METADATA,
        exports.Permissions.DELETE_METADATA,
        exports.Permissions.VALIDATE_METADATA,
    ],
    USER_MANAGEMENT: [
        exports.Permissions.CREATE_USER,
        exports.Permissions.READ_USER,
        exports.Permissions.UPDATE_USER,
        exports.Permissions.DELETE_USER,
    ],
    ORGANIZATION_MANAGEMENT: [
        exports.Permissions.MANAGE_ORGANIZATION,
        exports.Permissions.READ_ORGANIZATION,
    ],
    SYSTEM_MANAGEMENT: [exports.Permissions.VIEW_ANALYTICS, exports.Permissions.MANAGE_SETTINGS],
};
exports.InheritedPermissions = {
    [UserRole.ADMIN]: [],
    [UserRole.NODE_OFFICER]: [UserRole.USER],
    [UserRole.USER]: [],
};
// Helper function to get all inherited permissions for a role
function getAllPermissionsForRole(role) {
    const inheritedRoles = exports.InheritedPermissions[role];
    const inheritedPermissions = inheritedRoles.flatMap((r) => exports.RolePermissions[r]);
    return [...exports.RolePermissions[role], ...inheritedPermissions];
}
exports.RolePermissions = {
    [UserRole.ADMIN]: [...Object.values(exports.PermissionGroups).flat()],
    [UserRole.NODE_OFFICER]: [
        ...exports.PermissionGroups.METADATA_MANAGEMENT,
        {
            ...exports.Permissions.READ_USER,
            conditions: {
                organizationId: "${user.organization}",
                dynamic: {
                    evaluate: (user, resource) => user.organization === resource.organization,
                    description: "Check if user belongs to the same organization",
                },
            },
        },
        {
            ...exports.Permissions.UPDATE_USER,
            conditions: { organizationId: "${user.organization}" },
        },
        {
            ...exports.Permissions.READ_ORGANIZATION,
            conditions: { organizationId: "${user.organization}" },
        },
        {
            ...exports.Permissions.VIEW_ANALYTICS,
            conditions: { organizationId: "${user.organization}" },
        },
    ],
    [UserRole.USER]: [exports.Permissions.READ_METADATA, exports.Permissions.READ_ORGANIZATION],
};
/**
 * Login request schema
 */
exports.loginSchema = zod_openapi_1.z
    .object({
    email: zod_openapi_1.z.string().email("Invalid email address").openapi({
        example: "user@example.com",
        description: "User's email address",
    }),
    password: zod_openapi_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .openapi({
        example: "password123",
        description: "User's password",
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
    password: zod_openapi_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .openapi({
        example: "password123",
        description: "User's password",
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
 * Password reset request schema
 */
exports.forgotPasswordSchema = zod_openapi_1.z
    .object({
    email: zod_openapi_1.z.string().email("Invalid email address").openapi({
        example: "user@example.com",
        description: "User's email address",
    }),
})
    .openapi("ForgotPasswordRequest");
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
