import { Context, Next } from "hono"
import { ZodError } from "zod"
import { ContentfulStatusCode } from "hono/utils/http-status"
import { HTTPException } from "hono/http-exception"
import { AuthError, AuthErrorCode, ErrorResponse } from "../types/error.types"

/**
 * Error codes for API errors
 */
export enum ErrorCode {
  // System errors (1xxx)
  INTERNAL_SERVER_ERROR = "SYS001",
  SERVICE_UNAVAILABLE = "SYS002",
  BAD_GATEWAY = "SYS003",
  GATEWAY_TIMEOUT = "SYS004",

  // Request errors (2xxx)
  BAD_REQUEST = "REQ001",
  VALIDATION_ERROR = "REQ002",
  RESOURCE_NOT_FOUND = "REQ003",
  METHOD_NOT_ALLOWED = "REQ004",
  CONFLICT = "REQ005",
  PAYLOAD_TOO_LARGE = "REQ006",

  // Database errors (3xxx)
  DATABASE_ERROR = "DB001",
  CONSTRAINT_VIOLATION = "DB002",
  UNIQUE_VIOLATION = "DB003",
  FOREIGN_KEY_VIOLATION = "DB004",
  TRANSACTION_ERROR = "DB005",

  // Business logic errors (4xxx)
  BUSINESS_RULE_VIOLATION = "BIZ001",
  INVALID_STATE = "BIZ002",
  DEPENDENT_SERVICE_ERROR = "BIZ003",
  FEATURE_DISABLED = "BIZ004",
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code: ErrorCode | string = ErrorCode.INTERNAL_SERVER_ERROR,
    public details?: Record<string, any>
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
export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next()
  } catch (error) {
    console.error("API Error:", error)

    // Format the error response based on the error type
    const errorResponse = formatError(error)

    // Log detailed error information for server-side debugging
    if (errorResponse.status >= 500) {
      console.error("Server Error:", {
        path: c.req.path,
        method: c.req.method,
        error: error instanceof Error ? error.stack : error,
      })
    }

    // Return the formatted error response - convert status to number to satisfy Hono's type system
    return c.json(errorResponse.body, errorResponse.status as any)
  }
}

// Format different error types into a consistent structure
function formatError(error: unknown): {
  status: number
  body: ErrorResponse
} {
  // Handle known error types
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: {
        success: false,
        code: error.code,
        message: error.message,
        details: error.details,
      },
    }
  }

  if (error instanceof AuthError) {
    return {
      status: error.status,
      body: {
        success: false,
        code: error.code,
        message: error.message,
        details: error.details,
      },
    }
  }

  if (error instanceof HTTPException) {
    return {
      status: error.status,
      body: {
        success: false,
        code: mapHttpStatusToErrorCode(error.status),
        message: error.message || getDefaultMessageForStatus(error.status),
        details: error.res?.body ? { body: error.res.body } : undefined,
      },
    }
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    // Check for specific error types based on message or name
    if (error.name === "PrismaClientKnownRequestError") {
      return handlePrismaError(error)
    }

    // Default error response for unknown Error objects
    return {
      status: 500,
      body: {
        success: false,
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: "An unexpected error occurred",
        details:
          process.env.NODE_ENV === "development"
            ? { name: error.name, message: error.message }
            : undefined,
      },
    }
  }

  // Handle unknown error types
  return {
    status: 500,
    body: {
      success: false,
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      details:
        process.env.NODE_ENV === "development"
          ? { error: String(error) }
          : undefined,
    },
  }
}

// Map HTTP status codes to error codes
function mapHttpStatusToErrorCode(status: number): string {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST
    case 401:
      return AuthErrorCode.INVALID_TOKEN // Use auth error code for consistency
    case 403:
      return AuthErrorCode.FORBIDDEN // Use auth error code for consistency
    case 404:
      return ErrorCode.RESOURCE_NOT_FOUND
    case 405:
      return ErrorCode.METHOD_NOT_ALLOWED
    case 409:
      return ErrorCode.CONFLICT
    case 413:
      return ErrorCode.PAYLOAD_TOO_LARGE
    case 422:
      return ErrorCode.VALIDATION_ERROR
    case 500:
      return ErrorCode.INTERNAL_SERVER_ERROR
    case 502:
      return ErrorCode.BAD_GATEWAY
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE
    case 504:
      return ErrorCode.GATEWAY_TIMEOUT
    default:
      return ErrorCode.INTERNAL_SERVER_ERROR
  }
}

// Get default message for HTTP status code
function getDefaultMessageForStatus(status: number): string {
  switch (status) {
    case 400: return "Bad request"
    case 401: return "Unauthorized"
    case 403: return "Forbidden"
    case 404: return "Resource not found"
    case 405: return "Method not allowed"
    case 409: return "Conflict"
    case 413: return "Payload too large"
    case 422: return "Validation error"
    case 500: return "Internal server error"
    case 502: return "Bad gateway"
    case 503: return "Service unavailable"
    case 504: return "Gateway timeout"
    default: return "An error occurred"
  }
}

// Handle Prisma-specific errors
function handlePrismaError(error: Error): { 
  status: number; 
  body: ErrorResponse 
} {
  // Extract Prisma error details (this is a simplified version)
  const details: Record<string, any> = {}

  // Check for common Prisma error patterns in the message
  if (error.message.includes("Unique constraint failed")) {
    return {
      status: 409,
      body: {
        success: false,
        code: ErrorCode.UNIQUE_VIOLATION,
        message: "A record with this data already exists",
        details,
      },
    }
  }

  if (error.message.includes("Foreign key constraint failed")) {
    return {
      status: 400,
      body: {
        success: false,
        code: ErrorCode.FOREIGN_KEY_VIOLATION,
        message: "Referenced record does not exist",
        details,
      },
    }
  }

  // Default database error
  return {
    status: 500,
    body: {
      success: false,
      code: ErrorCode.DATABASE_ERROR,
      message: "Database operation failed",
      details:
        process.env.NODE_ENV === "development"
          ? { error: error.message }
          : undefined,
    },
  }
}

// Main error handler function for route handlers
export const errorHandler = (err: any, c?: Context) => {
  // If context is not provided, return a formatted error object directly
  if (!c) {
    const { status, body } = formatError(err)
    return { status, body }
  }

  // If context is provided, return a JSON response
  const { status, body } = formatError(err)
  return c.json(body, status as any)
}
