import { Hono } from "hono";
import { UserRole } from "../types/auth.types";
/**
 * User routes
 */
export declare const userRouter: Hono<{
    Variables: {
        userId: string;
        userEmail: string;
        userRole: UserRole;
    };
}, import("hono/types").BlankSchema, "/">;
export declare const adminRouter: import("hono/hono-base").HonoBase<{
    Variables: {
        userId: string;
        userEmail: string;
        userRole: UserRole;
    };
} & {
    Variables: import("../types/hono.types").Variables;
}, {
    [x: string]: {};
} | {
    [x: string]: {};
}, "/">;
export default userRouter;
