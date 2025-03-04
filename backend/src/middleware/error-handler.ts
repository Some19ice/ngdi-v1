import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { config } from '../config/env';

/**
 * Error codes for API responses
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  BAD_REQUEST = 'BAD_REQUEST',
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  status: number;
  message: string;
  code: string;
  details?: unknown;
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, status = 500, code = ErrorCode.INTERNAL_SERVER_ERROR, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err);

  // Default error response
  let response: ErrorResponse = {
    status: 500,
    message: 'Internal Server Error',
    code: ErrorCode.INTERNAL_SERVER_ERROR,
  };

  // Handle different error types
  if (err instanceof ApiError) {
    response = {
      status: err.status,
      message: err.message,
      code: err.code,
      details: err.details,
    };
  } else if (err instanceof HTTPException) {
    response = {
      status: err.status,
      message: err.message,
      code: ErrorCode.BAD_REQUEST,
    };
  } else if (err instanceof ZodError) {
    response = {
      status: 400,
      message: 'Validation Error',
      code: ErrorCode.VALIDATION_ERROR,
      details: err.format(),
    };
  }

  // In production, don't expose error details for 500 errors
  if (config.server.isProduction && response.status === 500) {
    response.details = undefined;
  }

  return c.json(response, response.status);
};

/**
 * Middleware to catch errors in async route handlers
 */
export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof Error) {
      return errorHandler(error, c);
    }
    
    // Handle unknown errors
    return errorHandler(new Error('Unknown error occurred'), c);
  }
}; 