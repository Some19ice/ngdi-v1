import { Context, Next } from "hono";
import { UserRole } from "../types/auth.types";
export declare function authMiddleware(ctx: Context, next: Next): Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 401, "json">) | undefined>;
export declare function requireRole(requiredRole: UserRole): (ctx: Context, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 403, "json">) | undefined>;
