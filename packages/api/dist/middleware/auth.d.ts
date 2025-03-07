import { Next } from "hono";
import { UserRole } from "../types/auth.types";
import { Context } from "../types/hono.types";
/**
 * Authenticate middleware - verifies JWT token and attaches user to context
 */
declare function authenticate(c: Context, next: Next): Promise<void>;
/**
 * Auth middleware function - can be used directly with Hono
 */
export declare function authMiddleware(c: Context, next: Next): Promise<void>;
/**
 * Combined auth middleware helpers
 */
export declare const auth: {
    authenticate: typeof authenticate;
    requireRoles: (roles: UserRole[]) => ((c: Context, next: Next) => Promise<void>)[];
    requireAdmin: ((c: Context, next: Next) => Promise<void>)[];
    requireNodeOfficer: ((c: Context, next: Next) => Promise<void>)[];
    requireAdminOrNodeOfficer: ((c: Context, next: Next) => Promise<void>)[];
    requireOwnerOrAdmin: (resourceUserId: string) => ((c: Context, next: Next) => Promise<void>)[];
};
export {};
