import { Context, Next } from "hono"
import { z } from "zod"
import { ApiError, ErrorCode } from "./error-handler"
import { errorHandler } from "./error-handler"

// Define a type for our validated data
type ValidatedData<T extends z.ZodType> = {
  valid: z.infer<T>
}

/**
 * Middleware to validate request body against a Zod schema
 */
export async function validateBody<T extends z.ZodType>(
  schema: T,
  c: Context,
  next: Next
) {
  try {
    const body = await c.req.json()
    const result = await schema.safeParseAsync(body)

    if (!result.success) {
      return errorHandler({ success: false, error: result.error })
    }

    // Store the validated data in the context
    c.set("valid", result.data)
    await next()
  } catch (error) {
    if (error instanceof Error) {
      return errorHandler(new ApiError(error.message, 400))
    }
    return errorHandler(new ApiError("Invalid request", 400))
  }
}

/**
 * Middleware to validate query parameters against a Zod schema
 */
export async function validateQueryParams<T extends z.ZodType>(
  schema: T,
  c: Context,
  next: Next
) {
  try {
    const query = c.req.query()
    const result = await schema.safeParseAsync(query)

    if (!result.success) {
      return errorHandler({ success: false, error: result.error })
    }

    // Store the validated data in the context
    c.set("valid", result.data)
    await next()
  } catch (error) {
    if (error instanceof Error) {
      return errorHandler(new ApiError(error.message, 400))
    }
    return errorHandler(new ApiError("Invalid request", 400))
  }
}

/**
 * Middleware to validate URL parameters against a Zod schema
 */
export async function validateUrlParams<T extends z.ZodType>(
  schema: T,
  c: Context,
  next: Next
) {
  try {
    const params = c.req.param()
    const result = await schema.safeParseAsync(params)

    if (!result.success) {
      return errorHandler({ success: false, error: result.error })
    }

    // Store the validated data in the context
    c.set("valid", result.data)
    await next()
  } catch (error) {
    if (error instanceof Error) {
      return errorHandler(new ApiError(error.message, 400))
    }
    return errorHandler(new ApiError("Invalid request", 400))
  }
}

/**
 * Generic validator middleware that can handle body, query, or params validation
 */
export function zodValidator<T extends z.ZodType>(
  schema: T,
  target: "json" | "query" | "params" = "json"
) {
  return async (c: Context, next: Next) => {
    switch (target) {
      case "query":
        return validateQueryParams(schema, c, next)
      case "params":
        return validateUrlParams(schema, c, next)
      default:
        return validateBody(schema, c, next)
    }
  }
}

// Type helper to get validated data from context
export function getValidatedData<T extends z.ZodType>(c: Context): z.infer<T> {
  return c.get("valid") as z.infer<T>
}

export function validateRequest(schema: z.Schema) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json()
      const validatedData = await schema.parseAsync(body)
      c.set("validatedData", validatedData)
      await next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(
          "Validation failed",
          400,
          "VALIDATION_ERROR",
          error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        )
      }
      throw error
    }
  }
}

export function validateQuery(schema: z.Schema) {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query()
      const validatedData = await schema.parseAsync(query)
      c.set("validatedQuery", validatedData)
      await next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(
          "Query validation failed",
          400,
          "VALIDATION_ERROR",
          error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        )
      }
      throw error
    }
  }
}

export function validateParams(schema: z.Schema) {
  return async (c: Context, next: Next) => {
    try {
      const params = c.req.param()
      const validatedData = await schema.parseAsync(params)
      c.set("validatedParams", validatedData)
      await next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(
          "Path parameter validation failed",
          400,
          "VALIDATION_ERROR",
          error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        )
      }
      throw error
    }
  }
}
