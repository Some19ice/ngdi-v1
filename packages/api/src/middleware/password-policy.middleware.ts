import { Next } from "hono"
import { Context } from "../types/hono.types"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { logger } from "../lib/logger"
import { passwordPolicyService } from "../services/password-policy.service"
import { securityLogService, SecurityEventType } from "../services/security-log.service"

/**
 * Middleware to enforce password expiration policy
 * 
 * This middleware checks if a user's password is expired and blocks access
 * to protected routes if a password change is required.
 */
export async function requireValidPassword(c: Context, next: Next) {
  try {
    // Get user from context (set by auth middleware)
    const user = c.get("user")

    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      )
    }

    // Check if password change is required
    if (user.passwordChangeRequired) {
      logger.info(`Access blocked - password change required: ${user.email}`, {
        userId: user.id,
        email: user.email,
      })
      
      throw new AuthError(
        AuthErrorCode.PASSWORD_CHANGE_REQUIRED,
        "Password change is required. Please update your password before proceeding.",
        403,
        {
          requiresPasswordChange: true,
          email: user.email,
        }
      )
    }

    // Check password expiration status
    const expirationStatus = await passwordPolicyService.getPasswordExpirationStatus(user.id)
    
    if (expirationStatus.isExpired) {
      // If grace logins are allowed and available
      if (expirationStatus.graceLoginsRemaining && expirationStatus.graceLoginsRemaining > 0) {
        // Record a grace login
        await passwordPolicyService.recordGraceLogin(
          user.id,
          c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
          c.req.header("user-agent")
        )
        
        // Set warning in context
        c.set("passwordExpired", true)
        c.set("graceLoginsRemaining", expirationStatus.graceLoginsRemaining - 1)
        
        // Allow access but proceed to next middleware
        await next()
        return
      }
      
      // No grace logins remaining, block access
      logger.info(`Access blocked - password expired: ${user.email}`, {
        userId: user.id,
        email: user.email,
      })
      
      // Log security event
      await securityLogService.logEvent({
        userId: user.id,
        email: user.email,
        eventType: SecurityEventType.PASSWORD_EXPIRED,
        ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
        userAgent: c.req.header("user-agent"),
        details: {
          timestamp: new Date().toISOString(),
        },
      })
      
      throw new AuthError(
        AuthErrorCode.PASSWORD_EXPIRED,
        "Your password has expired. Please reset your password to continue.",
        403,
        {
          passwordExpired: true,
          email: user.email,
        }
      )
    }
    
    // If password is about to expire, set warning in context
    if (expirationStatus.daysUntilExpiration !== undefined && 
        expirationStatus.daysUntilExpiration <= 14) {
      c.set("passwordExpirationWarning", true)
      c.set("daysUntilExpiration", expirationStatus.daysUntilExpiration)
    }

    // Password is valid, proceed
    await next()
  } catch (error) {
    // Pass AuthError instances up the chain
    if (error instanceof AuthError) {
      throw error
    }

    // Handle other errors
    logger.error("Password policy middleware error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    throw new AuthError(
      AuthErrorCode.SERVER_ERROR,
      "Password policy check failed",
      500
    )
  }
}
