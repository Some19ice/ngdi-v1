import { UserRole as AppUserRole } from "../types/auth.types"
import { Prisma, UserRole as PrismaUserRole } from "@prisma/client"

/**
 * Maps Prisma UserRole to application UserRole
 */
export function mapPrismaRoleToAppRole(
  prismaRole: PrismaUserRole
): AppUserRole {
  switch (prismaRole) {
    case "USER":
      return AppUserRole.USER
    case "ADMIN":
      return AppUserRole.ADMIN
    case "NODE_OFFICER":
      return AppUserRole.NODE_OFFICER
    default:
      return AppUserRole.USER // Default fallback
  }
}

/**
 * Maps application UserRole to Prisma UserRole
 */
export function mapAppRoleToPrismaRole(appRole: AppUserRole): PrismaUserRole {
  switch (appRole) {
    case AppUserRole.USER:
      return "USER"
    case AppUserRole.ADMIN:
      return "ADMIN"
    case AppUserRole.NODE_OFFICER:
      return "NODE_OFFICER"
    default:
      return "USER" // Default fallback
  }
}

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isValidUserRole(role: string): role is AppUserRole {
  return Object.values(AppUserRole).includes(role as AppUserRole)
}
