import { UserRole as AppUserRole } from "../types/auth.types";
import { UserRole as PrismaUserRole } from "@prisma/client";
/**
 * Maps Prisma UserRole to application UserRole
 */
export declare function mapPrismaRoleToAppRole(prismaRole: PrismaUserRole): AppUserRole;
/**
 * Maps application UserRole to Prisma UserRole
 */
export declare function mapAppRoleToPrismaRole(appRole: AppUserRole): PrismaUserRole;
/**
 * Type guard to check if a string is a valid UserRole
 */
export declare function isValidUserRole(role: string): role is AppUserRole;
