"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQueryParams = validateQueryParams;
exports.validateUrlParams = validateUrlParams;
exports.zodValidator = zodValidator;
exports.getValidatedData = getValidatedData;
exports.validateRequest = validateRequest;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const zod_1 = require("zod");
const error_handler_1 = require("./error-handler");
const error_handler_2 = require("./error-handler");
/**
 * Middleware to validate request body against a Zod schema
 */
async function validateBody(schema, c, next) {
    try {
        const body = await c.req.json();
        const result = await schema.safeParseAsync(body);
        if (!result.success) {
            return (0, error_handler_2.errorHandler)({ success: false, error: result.error });
        }
        // Store the validated data in the context
        c.set("valid", result.data);
        await next();
    }
    catch (error) {
        if (error instanceof Error) {
            return (0, error_handler_2.errorHandler)(new error_handler_1.ApiError(error.message, 400));
        }
        return (0, error_handler_2.errorHandler)(new error_handler_1.ApiError("Invalid request", 400));
    }
}
/**
 * Middleware to validate query parameters against a Zod schema
 */
async function validateQueryParams(schema, c, next) {
    try {
        const query = c.req.query();
        const result = await schema.safeParseAsync(query);
        if (!result.success) {
            return (0, error_handler_2.errorHandler)({ success: false, error: result.error });
        }
        // Store the validated data in the context
        c.set("valid", result.data);
        await next();
    }
    catch (error) {
        if (error instanceof Error) {
            return (0, error_handler_2.errorHandler)(new error_handler_1.ApiError(error.message, 400));
        }
        return (0, error_handler_2.errorHandler)(new error_handler_1.ApiError("Invalid request", 400));
    }
}
/**
 * Middleware to validate URL parameters against a Zod schema
 */
async function validateUrlParams(schema, c, next) {
    try {
        const params = c.req.param();
        const result = await schema.safeParseAsync(params);
        if (!result.success) {
            return (0, error_handler_2.errorHandler)({ success: false, error: result.error });
        }
        // Store the validated data in the context
        c.set("valid", result.data);
        await next();
    }
    catch (error) {
        if (error instanceof Error) {
            return (0, error_handler_2.errorHandler)(new error_handler_1.ApiError(error.message, 400));
        }
        return (0, error_handler_2.errorHandler)(new error_handler_1.ApiError("Invalid request", 400));
    }
}
/**
 * Generic validator middleware that can handle body, query, or params validation
 */
function zodValidator(schema, target = "json") {
    return async (c, next) => {
        switch (target) {
            case "query":
                return validateQueryParams(schema, c, next);
            case "params":
                return validateUrlParams(schema, c, next);
            default:
                return validateBody(schema, c, next);
        }
    };
}
// Type helper to get validated data from context
function getValidatedData(c) {
    return c.get("valid");
}
function validateRequest(schema) {
    return async (c, next) => {
        try {
            const body = await c.req.json();
            const validatedData = await schema.parseAsync(body);
            c.set("validatedData", validatedData);
            await next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new error_handler_1.ApiError("Validation failed", 400, "VALIDATION_ERROR", error.errors.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                })));
            }
            throw error;
        }
    };
}
function validateQuery(schema) {
    return async (c, next) => {
        try {
            const query = c.req.query();
            const validatedData = await schema.parseAsync(query);
            c.set("validatedQuery", validatedData);
            await next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new error_handler_1.ApiError("Query validation failed", 400, "VALIDATION_ERROR", error.errors.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                })));
            }
            throw error;
        }
    };
}
function validateParams(schema) {
    return async (c, next) => {
        try {
            const params = c.req.param();
            const validatedData = await schema.parseAsync(params);
            c.set("validatedParams", validatedData);
            await next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new error_handler_1.ApiError("Path parameter validation failed", 400, "VALIDATION_ERROR", error.errors.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                })));
            }
            throw error;
        }
    };
}
