import { supabaseAdmin } from '../lib/supabase-admin'
import { AuthError, AuthErrorCode } from '../types/error.types'
import { logger } from '../lib/logger'
import { securityLogService, SecurityEventType } from './security-log.service'
import { UserRole } from '../types/auth.types'
import { prisma } from '../lib/prisma'

/**
 * Interface for token validation result
 */
export interface TokenValidationResult {
  isValid: boolean
  userId?: string
  email?: string
  role?: string
  exp?: number
  error?: string
}

/**
 * Interface for user data
 */
export interface UserData {
  id: string
  email: string
  role: string
  emailVerified: Date | null
  name?: string | null
  organization?: string | null
  department?: string | null
  [key: string]: any
}

/**
 * Supabase Auth Service
 * Provides authentication and authorization functionality using Supabase Auth
 */
export class SupabaseAuthService {
  /**
   * Validate a JWT token from Supabase Auth
   * @param token JWT token to validate
   * @param options Validation options
   * @returns Token validation result
   */
  async validateToken(
    token: string,
    options: {
      logFailures?: boolean
      clientInfo?: {
        ipAddress?: string
        userAgent?: string
        deviceId?: string
      }
    } = {}
  ): Promise<TokenValidationResult> {
    try {
      // Basic validation
      if (!token || token.trim() === '') {
        return { isValid: false, error: 'Empty token provided' }
      }

      // Validate the token with Supabase
      const { data, error } = await supabaseAdmin.auth.getUser(token)

      if (error || !data.user) {
        // Log validation failure if requested
        if (options.logFailures && options.clientInfo) {
          await this.logValidationFailure(
            token,
            error?.message || 'Invalid token',
            options.clientInfo
          )
        }

        return {
          isValid: false,
          error: error?.message || 'Invalid token',
        }
      }

      // Get user role from metadata
      const role = data.user.user_metadata?.role || UserRole.USER

      // Get email verification status
      const emailVerified = data.user.email_confirmed_at
        ? new Date(data.user.email_confirmed_at)
        : null

      return {
        isValid: true,
        userId: data.user.id,
        email: data.user.email || '',
        role,
        // Supabase doesn't expose token expiration directly, so we can't return it
      }
    } catch (error) {
      // Log validation failure if requested
      if (options.logFailures && options.clientInfo) {
        await this.logValidationFailure(
          token,
          error instanceof Error ? error.message : 'Unknown error',
          options.clientInfo
        )
      }

      logger.error('Token validation error:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })

      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get user data from Supabase Auth
   * @param userId User ID
   * @returns User data or null if user not found
   */
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      // Get user from Supabase
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (error || !data.user) {
        logger.error('Error getting user data from Supabase:', {
          error: error?.message || 'User not found',
          userId,
        })
        return null
      }

      // Get additional user data from database if needed
      let additionalData = {}
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            organization: true,
            department: true,
            phone: true,
            // Add any other fields you need
          },
        })

        if (dbUser) {
          additionalData = dbUser
        }
      } catch (dbError) {
        logger.warn('Error getting additional user data from database:', {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          userId,
        })
        // Continue without additional data
      }

      // Get user role from metadata
      const role = data.user.user_metadata?.role || UserRole.USER

      // Get email verification status
      const emailVerified = data.user.email_confirmed_at
        ? new Date(data.user.email_confirmed_at)
        : null

      return {
        id: data.user.id,
        email: data.user.email || '',
        role,
        emailVerified,
        name: data.user.user_metadata?.name || null,
        ...additionalData,
      }
    } catch (error) {
      logger.error('Error getting user data:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId,
      })
      return null
    }
  }

  /**
   * Log token validation failure
   * @param token Token that failed validation
   * @param reason Reason for validation failure
   * @param clientInfo Client information
   */
  private async logValidationFailure(
    token: string,
    reason: string,
    clientInfo: {
      ipAddress?: string
      userAgent?: string
      deviceId?: string
    }
  ): Promise<void> {
    try {
      await securityLogService.logEvent({
        eventType: SecurityEventType.TOKEN_VALIDATION_FAILURE,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        deviceId: clientInfo.deviceId,
        details: {
          reason,
          // Don't log the full token for security reasons
          tokenFragment: token.length > 10 ? `${token.substring(0, 10)}...` : 'invalid',
        },
      })
    } catch (error) {
      logger.error('Error logging token validation failure:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      // Don't throw, just log the error
    }
  }

  /**
   * Check if a user exists and is active
   * @param userId User ID
   * @returns True if user exists and is active, false otherwise
   */
  async validateUser(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (error || !data.user) {
        return false
      }

      // Check if user is banned or inactive in your database if needed
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { active: true },
        })

        if (dbUser && dbUser.active === false) {
          return false
        }
      } catch (dbError) {
        logger.warn('Error checking user active status in database:', {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          userId,
        })
        // Continue without checking active status
      }

      return true
    } catch (error) {
      logger.error('Error validating user:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId,
      })
      return false
    }
  }
}

// Export a singleton instance
export const supabaseAuthService = new SupabaseAuthService()
