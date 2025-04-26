import { Next } from "hono"
import { Context } from "../types/hono.types"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { prisma } from "../lib/prisma"
import { hasPermission, hasAllPermissions, hasAnyPermission, logPermissionCheck } from "../utils/permissions"

/**
 * Middleware to check if a user has a specific permission
 */
export function requirePermission(action: string, subject: string) {
  return async (c: Context, next: Next) => {
    const user = c.get("user")
    
    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      )
    }
    
    // Get client information for logging
    const clientInfo = {
      ipAddress: c.req.header("x-forwarded-for") || 
                 c.req.header("x-real-ip") || 
                 c.req.header("cf-connecting-ip") ||
                 "unknown",
      userAgent: c.req.header("user-agent") || "unknown"
    }
    
    // Get resource information if available
    const resourceId = c.req.param("id")
    const resource = resourceId ? { id: resourceId } : undefined
    
    // Check permission
    const result = await hasPermission(user, action, subject, resource)
    
    // Log the permission check
    await logPermissionCheck(
      user,
      action,
      subject,
      resource,
      result.granted,
      clientInfo.ipAddress,
      clientInfo.userAgent
    )
    
    if (!result.granted) {
      throw new AuthError(
        AuthErrorCode.FORBIDDEN,
        result.reason || "Insufficient permissions",
        403
      )
    }
    
    await next()
  }
}

/**
 * Middleware to check if a user has all of the specified permissions
 */
export function requireAllPermissions(permissions: { action: string; subject: string }[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user")
    
    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      )
    }
    
    // Get client information for logging
    const clientInfo = {
      ipAddress: c.req.header("x-forwarded-for") || 
                 c.req.header("x-real-ip") || 
                 c.req.header("cf-connecting-ip") ||
                 "unknown",
      userAgent: c.req.header("user-agent") || "unknown"
    }
    
    // Get resource information if available
    const resourceId = c.req.param("id")
    const resource = resourceId ? { id: resourceId } : undefined
    
    // Check permissions
    const result = await hasAllPermissions(user, permissions, resource)
    
    // Log the permission check
    await logPermissionCheck(
      user,
      "multiple",
      "permissions",
      { permissions, resource },
      result.granted,
      clientInfo.ipAddress,
      clientInfo.userAgent
    )
    
    if (!result.granted) {
      throw new AuthError(
        AuthErrorCode.FORBIDDEN,
        result.reason || "Insufficient permissions",
        403
      )
    }
    
    await next()
  }
}

/**
 * Middleware to check if a user has any of the specified permissions
 */
export function requireAnyPermission(permissions: { action: string; subject: string }[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user")
    
    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      )
    }
    
    // Get client information for logging
    const clientInfo = {
      ipAddress: c.req.header("x-forwarded-for") || 
                 c.req.header("x-real-ip") || 
                 c.req.header("cf-connecting-ip") ||
                 "unknown",
      userAgent: c.req.header("user-agent") || "unknown"
    }
    
    // Get resource information if available
    const resourceId = c.req.param("id")
    const resource = resourceId ? { id: resourceId } : undefined
    
    // Check permissions
    const result = await hasAnyPermission(user, permissions, resource)
    
    // Log the permission check
    await logPermissionCheck(
      user,
      "multiple",
      "permissions",
      { permissions, resource },
      result.granted,
      clientInfo.ipAddress,
      clientInfo.userAgent
    )
    
    if (!result.granted) {
      throw new AuthError(
        AuthErrorCode.FORBIDDEN,
        result.reason || "Insufficient permissions",
        403
      )
    }
    
    await next()
  }
}

/**
 * Middleware to check if a user can access their own resource
 */
export function requireOwnership(subject: string, getUserIdFromResource: (c: Context) => Promise<string>) {
  return async (c: Context, next: Next) => {
    const user = c.get("user")
    
    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      )
    }
    
    // Admin users can access any resource
    if (user.role === 'ADMIN') {
      await next()
      return
    }
    
    // Get the resource owner's user ID
    const resourceUserId = await getUserIdFromResource(c)
    
    // Check if the user is the owner
    if (user.id !== resourceUserId) {
      throw new AuthError(
        AuthErrorCode.FORBIDDEN,
        "You can only access your own resources",
        403
      )
    }
    
    await next()
  }
}

/**
 * Middleware to check if a user has activity-based permissions
 * This checks if the user has performed specific actions recently
 */
export function requireActivity(action: string, subject: string, lookbackHours: number = 24) {
  return async (c: Context, next: Next) => {
    const user = c.get("user")
    
    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      )
    }
    
    // Admin users can access any resource
    if (user.role === 'ADMIN') {
      await next()
      return
    }
    
    // Calculate the lookback time
    const lookbackTime = new Date()
    lookbackTime.setHours(lookbackTime.getHours() - lookbackHours)
    
    // Check if the user has performed the action recently
    const recentActivity = await prisma.activityLog.findFirst({
      where: {
        userId: user.id,
        action,
        subject,
        createdAt: {
          gte: lookbackTime
        }
      }
    })
    
    if (!recentActivity) {
      throw new AuthError(
        AuthErrorCode.FORBIDDEN,
        `You must have performed ${action} on ${subject} in the last ${lookbackHours} hours`,
        403
      )
    }
    
    await next()
  }
}
