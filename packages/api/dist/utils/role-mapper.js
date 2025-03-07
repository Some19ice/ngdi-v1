"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPrismaRoleToAppRole = mapPrismaRoleToAppRole;
exports.mapAppRoleToPrismaRole = mapAppRoleToPrismaRole;
exports.isValidUserRole = isValidUserRole;
const auth_types_1 = require("../types/auth.types");
/**
 * Maps Prisma UserRole to application UserRole
 */
function mapPrismaRoleToAppRole(prismaRole) {
    switch (prismaRole) {
        case "USER":
            return auth_types_1.UserRole.USER;
        case "ADMIN":
            return auth_types_1.UserRole.ADMIN;
        case "NODE_OFFICER":
            return auth_types_1.UserRole.NODE_OFFICER;
        default:
            return auth_types_1.UserRole.USER; // Default fallback
    }
}
/**
 * Maps application UserRole to Prisma UserRole
 */
function mapAppRoleToPrismaRole(appRole) {
    switch (appRole) {
        case auth_types_1.UserRole.USER:
            return "USER";
        case auth_types_1.UserRole.ADMIN:
            return "ADMIN";
        case auth_types_1.UserRole.NODE_OFFICER:
            return "NODE_OFFICER";
        default:
            return "USER"; // Default fallback
    }
}
/**
 * Type guard to check if a string is a valid UserRole
 */
function isValidUserRole(role) {
    return Object.values(auth_types_1.UserRole).includes(role);
}
