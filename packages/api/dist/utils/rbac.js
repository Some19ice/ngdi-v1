"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionError = void 0;
exports.logPermissionCheck = logPermissionCheck;
exports.can = can;
exports.canAll = canAll;
exports.canAny = canAny;
exports.withPermission = withPermission;
exports.canAccessResource = canAccessResource;
exports.canAccessOrganizationResource = canAccessOrganizationResource;
const auth_types_1 = require("../types/auth.types");
class PermissionError extends Error {
    constructor(user, permission, message) {
        super(message);
        this.user = user;
        this.permission = permission;
        this.name = "PermissionError";
    }
}
exports.PermissionError = PermissionError;
// Audit log for permission checks
function logPermissionCheck(user, permission, resource, result) {
    if (process.env.NODE_ENV === "development") {
        console.log("Permission check:", {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                organization: user.organization,
            },
            permission,
            resource,
            result,
            timestamp: new Date().toISOString(),
        });
    }
}
function can(user, permission, resource) {
    try {
        // Get all permissions including inherited ones
        const userPermissions = (0, auth_types_1.getAllPermissionsForRole)(user.role);
        if (!userPermissions?.length) {
            console.warn(`No permissions found for role: ${user.role}`);
            return false;
        }
        const hasPermission = userPermissions.some((p) => p.action === permission.action && p.subject === permission.subject);
        if (!hasPermission) {
            logPermissionCheck(user, permission, resource, false);
            return false;
        }
        // Check resource-based conditions if they exist
        if (permission.conditions || resource) {
            // Admin bypass for resource checks
            if (user.role === auth_types_1.UserRole.ADMIN) {
                logPermissionCheck(user, permission, resource, true);
                return true;
            }
            // Check dynamic conditions first
            if (permission.conditions?.dynamic) {
                const dynamicResult = permission.conditions.dynamic.evaluate(user, resource);
                if (!dynamicResult) {
                    logPermissionCheck(user, permission, resource, false);
                    return false;
                }
            }
            // Check organization-based access
            if ((permission.conditions?.organizationId || resource?.organizationId) &&
                user.organization) {
                const targetOrgId = permission.conditions?.organizationId || resource?.organizationId;
                if (targetOrgId !== user.organization) {
                    logPermissionCheck(user, permission, resource, false);
                    return false;
                }
            }
            // Check user-based access
            if (permission.conditions?.userId || resource?.userId) {
                const targetUserId = permission.conditions?.userId || resource?.userId;
                if (permission.conditions?.isOwner && targetUserId !== user.id) {
                    logPermissionCheck(user, permission, resource, false);
                    return false;
                }
            }
        }
        logPermissionCheck(user, permission, resource, true);
        return true;
    }
    catch (error) {
        console.error("Permission check failed:", {
            user,
            permission,
            resource,
            error,
        });
        return false;
    }
}
function canAll(user, permissions, resource) {
    return permissions.every((permission) => can(user, permission, resource));
}
function canAny(user, permissions, resource) {
    return permissions.some((permission) => can(user, permission, resource));
}
// Higher-order function to protect API routes
function withPermission(permission) {
    return function (user, handler) {
        return async function (...args) {
            if (!user) {
                throw new PermissionError({ id: "", email: "", role: auth_types_1.UserRole.USER }, permission, "Unauthorized - User not authenticated");
            }
            if (!can(user, permission)) {
                throw new PermissionError(user, permission, "Forbidden - Insufficient permissions");
            }
            return handler(...args);
        };
    };
}
// Helper to check if user can access their own resource or has admin rights
function canAccessResource(user, permission, resourceUserId) {
    return can(user, permission, { userId: resourceUserId });
}
// Helper to check if user can access organization resource
function canAccessOrganizationResource(user, permission, resourceOrganizationId) {
    if (!resourceOrganizationId)
        return false;
    return can(user, permission, { organizationId: resourceOrganizationId });
}
