import { Context } from "hono"
import { ZodError } from "zod"
import { HTTPException } from "hono/http-exception"
import { AuthError, AuthErrorCode, ErrorResponse } from "../types/error.types"
import { ErrorCode, ApiError } from "../middleware/error-handler"
import { logger } from "../lib/logger"

/**
 * Centralized error handling service for the API
 */
export class ErrorHandlingService {
  /**
   * Format different error types into a consistent structure
   */
  static formatError(error: unknown): {
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
          code: this.mapHttpStatusToErrorCode(error.status),
          message: error.message || this.getDefaultMessageForStatus(error.status),
          details: error.res?.body ? { body: error.res.body } : undefined,
        },
      }
    }

    if (error instanceof ZodError) {
      const formattedError = this.formatZodError(error)
      return {
        status: 400,
        body: {
          success: false,
          code: ErrorCode.VALIDATION_ERROR,
          message: formattedError.message,
          details: { errors: formattedError.errors },
        },
      }
    }

    // Handle generic Error objects
    if (error instanceof Error) {
      // Check for specific error types based on message or name
      if (error.name === "PrismaClientKnownRequestError") {
        return this.handlePrismaError(error)
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

  /**
   * Handle errors in route handlers
   */
  static handleError(err: unknown, c?: Context) {
    // Log the error
    if (err instanceof Error) {
      logger.error("API Error:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
        path: c?.req.path,
        method: c?.req.method,
      })
    } else {
      logger.error("API Error (non-Error object):", {
        error: String(err),
        path: c?.req.path,
        method: c?.req.method,
      })
    }

    // If context is not provided, return a formatted error object directly
    if (!c) {
      const { status, body } = this.formatError(err)
      return { status, body }
    }

    // If context is provided, return a JSON response
    const { status, body } = this.formatError(err)
    return c.json(body, status as any)
  }

  /**
   * Global error middleware for Hono
   */
  static errorMiddleware = async (c: Context, next: Next) => {
    try {
      await next()
    } catch (error) {
      // Log the error
      if (error instanceof Error) {
        logger.error("API Error:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
          path: c.req.path,
          method: c.req.method,
        })
      } else {
        logger.error("API Error (non-Error object):", {
          error: String(error),
          path: c.req.path,
          method: c.req.method,
        })
      }

      // Format the error response based on the error type
      const errorResponse = this.formatError(error)

      // Log detailed error information for server-side debugging
      if (errorResponse.status >= 500) {
        logger.error("Server Error:", {
          path: c.req.path,
          method: c.req.method,
          error: error instanceof Error ? error.stack : error,
        })
      }

      // Return the formatted error response
      return c.json(errorResponse.body, errorResponse.status as any)
    }
  }

  /**
   * Format Zod validation errors
   */
  private static formatZodError(error: ZodError) {
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
   * Handle Prisma-specific errors
   */
  private static handlePrismaError(error: Error): {
    status: number
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

  /**
   * Map HTTP status codes to error codes
   */
  private static mapHttpStatusToErrorCode(status: number): string {
    switch (status) {
      case 400:
        return ErrorCode.BAD_REQUEST
      case 401:
        return AuthErrorCode.INVALID_TOKEN
      case 403:
        return AuthErrorCode.FORBIDDEN
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

  /**
   * Get default message for HTTP status code
   */
  private static getDefaultMessageForStatus(status: number): string {
    switch (status) {
      case 400:
        return "Bad Request"
      case 401:
        return "Unauthorized"
      case 403:
        return "Forbidden"
      case 404:
        return "Resource Not Found"
      case 405:
        return "Method Not Allowed"
      case 409:
        return "Conflict"
      case 413:
        return "Payload Too Large"
      case 422:
        return "Validation Error"
      case 500:
        return "Internal Server Error"
      case 502:
        return "Bad Gateway"
      case 503:
        return "Service Unavailable"
      case 504:
        return "Gateway Timeout"
      default:
        return "An error occurred"
    }
  }
}

// Export a singleton instance for convenience
export const errorHandler = ErrorHandlingService.handleError.bind(ErrorHandlingService)
export const errorMiddleware = ErrorHandlingService.errorMiddleware.bind(ErrorHandlingService)
