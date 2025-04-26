import * as hono_types from 'hono/types';
import { Hono, Env } from 'hono';

/**
 * Custom variables stored in Hono context
 */
interface Variables {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    role?: string;
    organizationId?: string;
    department?: string;
}

declare const app: Hono<{
    Variables: Variables;
    Bindings: Env;
}, hono_types.BlankSchema, "/">;

export { app as default };
