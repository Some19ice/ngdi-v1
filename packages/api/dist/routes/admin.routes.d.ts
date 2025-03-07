import { UserRole } from "../types/auth.types";
/**
 * Admin routes
 */
export declare const adminRouter: import("hono/hono-base").HonoBase<{
    Variables: {
        userId: string;
        userEmail: string;
        userRole: UserRole;
        secureHeadersNonce?: string;
    };
} & {
    Variables: import("../types/hono.types").Variables;
}, {
    "*": {};
} | {
    "*": {};
}, "/">;
export default adminRouter;
