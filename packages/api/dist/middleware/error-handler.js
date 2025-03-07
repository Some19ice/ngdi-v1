"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.ErrorCode = void 0;
exports.errorHandler = errorHandler;
exports.errorMiddleware = errorMiddleware;
/**
 * Error codes for API errors
 */
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    ErrorCode["AUTHORIZATION_ERROR"] = "AUTHORIZATION_ERROR";
    ErrorCode["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ErrorCode["RESOURCE_ALREADY_EXISTS"] = "RESOURCE_ALREADY_EXISTS";
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(message, status = 400, code = "INTERNAL_SERVER_ERROR", errors) {
        super(message);
        this.message = message;
        this.status = status;
        this.code = code;
        this.errors = errors;
        this.name = "ApiError";
    }
}
exports.ApiError = ApiError;
function formatZodError(error) {
    const issues = error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
    }));
    // Create a summary message from all validation issues
    const message = issues.map((issue) => issue.message).join(", ");
    return {
        message,
        errors: issues,
    };
}
/**
 * Global error handler for Hono
 */
function errorHandler(err) {
    let status = 500;
    let message = "Internal Server Error";
    let code = "INTERNAL_SERVER_ERROR";
    let errors;
    // Handle raw Zod validation error result from zValidator
    if (typeof err === "object" &&
        "success" in err &&
        !err.success &&
        "error" in err &&
        err.error &&
        typeof err.error === "object" &&
        "issues" in err.error &&
        "name" in err.error &&
        err.error.name === "ZodError") {
        const formattedError = formatZodError(err.error);
        status = 400;
        message = formattedError.message;
        code = "VALIDATION_ERROR";
        errors = formattedError.errors;
    }
    else if (err instanceof ApiError) {
        status = err.status;
        message = err.message;
        code = err.code;
        errors = err.errors;
    }
    else {
        console.error("API Error:", err);
    }
    return new Response(JSON.stringify({
        success: false,
        message,
        code,
        errors,
    }), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}
async function errorMiddleware(c, next) {
    try {
        await next();
    }
    catch (err) {
        console.error("API Error:", err);
        return errorHandler(err);
    }
}
