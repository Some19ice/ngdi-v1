import { Context, Next } from 'hono';
import { ApiError, ErrorCode } from './error-handler';
import { verifyToken } from '../utils/jwt';
import { UserRole } from '../types/auth.types';

/**
 * Middleware to verify JWT token and attach user to context
 */
export const authenticate = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(
      'Authentication required', 
      401, 
      ErrorCode.AUTHENTICATION_ERROR
    );
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const payload = await verifyToken(token);
    
    // Attach user to context
    c.set('user', payload);
    
    await next();
  } catch (error) {
    throw new ApiError(
      'Invalid or expired token', 
      401, 
      ErrorCode.AUTHENTICATION_ERROR
    );
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (requiredRoles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      throw new ApiError(
        'Authentication required', 
        401, 
        ErrorCode.AUTHENTICATION_ERROR
      );
    }
    
    if (!requiredRoles.includes(user.role)) {
      throw new ApiError(
        'Insufficient permissions', 
        403, 
        ErrorCode.AUTHORIZATION_ERROR
      );
    }
    
    await next();
  };
};

/**
 * Middleware to check if user is accessing their own resource
 * or has admin privileges
 */
export const authorizeOwnerOrAdmin = (userIdParam: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    const resourceUserId = c.req.param(userIdParam);
    
    if (!user) {
      throw new ApiError(
        'Authentication required', 
        401, 
        ErrorCode.AUTHENTICATION_ERROR
      );
    }
    
    // Allow if user is admin or the owner of the resource
    if (user.role === UserRole.ADMIN || user.id === resourceUserId) {
      await next();
      return;
    }
    
    throw new ApiError(
      'Insufficient permissions', 
      403, 
      ErrorCode.AUTHORIZATION_ERROR
    );
  };
}; 