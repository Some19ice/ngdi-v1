import { Context, Next } from "hono"
import { ZodError } from "zod"
import { ContentfulStatusCode } from "hono/utils/http-status"

/**
 * Error codes for API errors
 */
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 400,
    public code: string = "INTERNAL_SERVER_ERROR",
    public errors?: any[]
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function formatZodError(error: ZodError) {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }))

  // Create a summary message from all validation issues
  const message = issues.map((issue) => issue.message).join(", ")

  return {
    message,
    errors: issues,
  }
}

/**
 * Global error handler for Hono
 */
export function errorHandler(
  err:
    | Error
    | ApiError
    | { error: ZodError }
    | { success: false; error: { issues: any[]; name: string } }
) {
  let status = 500
  let message = "Internal Server Error"
  let code = "INTERNAL_SERVER_ERROR"
  let errors: any[] | undefined

  // Handle raw Zod validation error result from zValidator
  if (
    typeof err === "object" &&
    "success" in err &&
    !err.success &&
    "error" in err &&
    err.error &&
    typeof err.error === "object" &&
    "issues" in err.error &&
    "name" in err.error &&
    err.error.name === "ZodError"
  ) {
    const formattedError = formatZodError(err.error as ZodError)
    status = 400
    message = formattedError.message
    code = "VALIDATION_ERROR"
    errors = formattedError.errors
  } else if (err instanceof ApiError) {
    status = err.status
    message = err.message
    code = err.code
    errors = err.errors
  } else {
    console.error("API Error:", err)
  }

  return new Response(
    JSON.stringify({
      success: false,
      message,
      code,
      errors,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
}

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next()
  } catch (err: any) {
    console.error("API Error:", err)
    return errorHandler(err)
  }
}
