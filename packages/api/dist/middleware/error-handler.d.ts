import { Context, Next } from "hono";
import { ZodError } from "zod";
/**
 * Error codes for API errors
 */
export declare enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    BAD_REQUEST = "BAD_REQUEST"
}
/**
 * Custom API Error class
 */
export declare class ApiError extends Error {
    message: string;
    status: number;
    code: string;
    errors?: any[] | undefined;
    constructor(message: string, status?: number, code?: string, errors?: any[] | undefined);
}
/**
 * Global error handler for Hono
 */
export declare function errorHandler(err: Error | ApiError | {
    error: ZodError;
} | {
    success: false;
    error: {
        issues: any[];
        name: string;
    };
}): Response;
export declare function errorMiddleware(c: Context, next: Next): Promise<Response | undefined>;
