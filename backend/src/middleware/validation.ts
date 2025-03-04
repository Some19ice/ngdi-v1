import { Context, Next } from 'hono';
import { z } from 'zod';
import { ApiError, ErrorCode } from './error-handler';

/**
 * Middleware to validate request body against a Zod schema
 */
export const validateBody = <T extends z.ZodType>(schema: T) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      
      // Attach validated data to context
      c.set('validatedBody', validatedData);
      
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(
          'Validation error',
          400,
          ErrorCode.VALIDATION_ERROR,
          error.format()
        );
      }
      
      throw new ApiError(
        'Invalid request body',
        400,
        ErrorCode.BAD_REQUEST
      );
    }
  };
};

/**
 * Middleware to validate query parameters against a Zod schema
 */
export const validateQuery = <T extends z.ZodType>(schema: T) => {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validatedData = schema.parse(query);
      
      // Attach validated data to context
      c.set('validatedQuery', validatedData);
      
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(
          'Validation error',
          400,
          ErrorCode.VALIDATION_ERROR,
          error.format()
        );
      }
      
      throw new ApiError(
        'Invalid query parameters',
        400,
        ErrorCode.BAD_REQUEST
      );
    }
  };
};

/**
 * Middleware to validate URL parameters against a Zod schema
 */
export const validateParams = <T extends z.ZodType>(schema: T) => {
  return async (c: Context, next: Next) => {
    try {
      const params = c.req.param();
      const validatedData = schema.parse(params);
      
      // Attach validated data to context
      c.set('validatedParams', validatedData);
      
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(
          'Validation error',
          400,
          ErrorCode.VALIDATION_ERROR,
          error.format()
        );
      }
      
      throw new ApiError(
        'Invalid URL parameters',
        400,
        ErrorCode.BAD_REQUEST
      );
    }
  };
}; 