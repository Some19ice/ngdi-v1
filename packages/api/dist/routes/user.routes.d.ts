import { UserRole } from "../types/auth.types";
/**
 * User routes
 */
export declare const userRouter: import("hono/hono-base").HonoBase<{
    Variables: {
        userId: string;
        userEmail: string;
        userRole: UserRole;
        secureHeadersNonce?: string;
    };
} & {
    Variables: import("../types/hono.types").Variables;
}, {
    [x: string]: {};
}, "/">;
export default userRouter;
