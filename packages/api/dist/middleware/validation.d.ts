import { Context, Next } from 'hono';
import { z } from 'zod';
/**
 * Middleware to validate request body against a Zod schema
 */
export declare function validateBody<T extends z.ZodType>(schema: T, c: Context, next: Next): Promise<Response | undefined>;
/**
 * Middleware to validate query parameters against a Zod schema
 */
export declare function validateQuery<T extends z.ZodType>(schema: T, c: Context, next: Next): Promise<Response | undefined>;
export declare function zodValidator<T extends z.ZodType>(schema: T, target?: "json" | "query"): (c: Context, next: Next) => Promise<Response | undefined>;
/**
 * Middleware to validate URL parameters against a Zod schema
 */
export declare const validateParams: <T extends z.ZodType>(schema: T) => (c: Context, next: Next) => Promise<void>;
export declare function getValidatedData<T extends z.ZodType>(c: Context): z.infer<T>;
