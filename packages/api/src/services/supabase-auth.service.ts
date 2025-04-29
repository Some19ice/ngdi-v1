import { supabaseAdmin } from '../lib/supabase-admin'
import { AuthError, AuthErrorCode } from '../types/error.types'
import { logger } from '../lib/logger'
// import { securityLogService, SecurityEventType } from './security-log.service' // Removed SecurityEventType
import { UserRole } from '../types/auth.types'
import { prisma } from '../lib/prisma'
// Removed crypto import
// Removed Redis client import

/**
 * Interface for token validation result
 */
export interface TokenValidationResult {
  isValid: boolean
  userId?: string
  email?: string
  role?: string
  // exp is not reliably available from Supabase getUser
  error?: string
}

/**
 * Interface for user data (simplified if needed)
 */
export interface UserData {
  id: string
  email: string
  role: string
  emailVerified: Date | null
  name?: string | null
  organization?: string | null
  department?: string | null
  phone?: string | null
  // Potentially remove other custom fields if User model is simplified
}

/**
 * Simplified Supabase Auth Service
 * Provides core authentication and authorization using Supabase Auth
 */
export class SupabaseAuthService {
  /**
   * Validate a JWT token from Supabase Auth
   * @param token JWT token to validate
   * @returns Token validation result
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      // Basic validation
      if (!token || token.trim() === '') {
        return { isValid: false, error: 'Empty token provided' }
      }

      // Validate the token with Supabase
      const { data, error } = await supabaseAdmin.auth.getUser(token)

      if (error || !data.user) {
        // Basic logging for failure
        logger.warn('Token validation failed:', {
          error: error?.message || 'Invalid token or user not found',
          // Avoid logging token fragments in simplified version
        })

        return {
          isValid: false,
          error: error?.message || 'Invalid token',
        }
      }

      // Get user role from metadata
      const role = data.user.user_metadata?.role || UserRole.USER

      return {
        isValid: true,
        userId: data.user.id,
        email: data.user.email || '',
        role,
      }
    } catch (error) {
      logger.error('Token validation error:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })

      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error during token validation',
      }
    }
  }

  /**
   * Get user data from Supabase Auth and potentially Prisma
   * @param userId User ID
   * @returns User data or null if user not found
   */
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      // Get user from Supabase
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (error || !data.user) {
        logger.warn('Error getting user data from Supabase:', {
          error: error?.message || 'User not found',
          userId,
        })
        return null
      }

      // Get additional user data from Prisma if the User model still exists
      let additionalData = {}
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            // Include only essential fields kept in Prisma User model
            organization: true,
            department: true,
            phone: true,
            // Remove fields like 'requiresVerification' if they were removed from schema
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
        ...additionalData, // Merge essential fields from Prisma
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
   * Check if a user exists in Supabase and optionally if they are active in Prisma
   * @param userId User ID
   * @returns True if user exists and (optionally) is active, false otherwise
   */
  async validateUser(userId: string): Promise<boolean> {
    try {
      // Check if user exists in Supabase
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (error || !data.user) {
        logger.warn(`User validation failed: User ${userId} not found in Supabase.`, { error: error?.message })
        return false
      }

      // Optional: Check if user is active in Prisma, if 'active' field remains
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { active: true },
        })

        // If we check Prisma and the user is explicitly inactive, fail validation
        if (dbUser && dbUser.active === false) {
          logger.warn(`User validation failed: User ${userId} is marked as inactive in database.`)
          return false
        }
        // If user exists in Prisma and is active (or no active field), pass
        // If user doesn't exist in Prisma, still pass (rely on Supabase existence) unless strict coupling is required
      } catch (dbError) {
        logger.warn('Could not check user active status in database:', {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          userId,
        })
        // Continue validation based only on Supabase existence if DB check fails
      }

      // If we reached here, the user exists in Supabase and is not explicitly inactive in Prisma (if checked)
      return true
    } catch (error) {
      logger.error('Error validating user existence:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId,
      })
      return false
    }
  }

  /**
   * Revoke a user's token(s)
   * @param userId User ID
   * @param refreshToken Refresh token to revoke (optional, if provided, revokes only this token)
   * @returns True if successful, false otherwise
   */
  async revokeToken(userId: string, refreshToken?: string): Promise<boolean> {
    try {
      // If a specific refresh token is provided, revoke only that token
      if (refreshToken) {
        const { error } = await supabaseAdmin.auth.admin.revokeRefreshToken(refreshToken)
        if (error) {
          logger.error('Error revoking specific refresh token:', {
            error: error.message,
            userId,
          })
          return false
        }
        logger.info(`Revoked specific refresh token for user ${userId}.`)
        return true
      }

      // If no specific token is provided, sign out the user (revokes all sessions)
      const { error } = await supabaseAdmin.auth.admin.signOut(userId)
      if (error) {
        logger.error('Error signing out user (revoking all sessions):', {
          error: error.message,
          userId,
        })
        return false
      }
      logger.info(`Signed out user ${userId}, revoking all sessions.`)
      return true
    } catch (error) {
      logger.error('Error during token revocation process:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId,
      })
      return false
    }
  }

  // --- Removed Custom Logic Sections ---
  // Removed logValidationFailure method
  // Removed trackAuthEvent and related suspicious activity methods
  // Removed trackToken method
  // Removed rateLimiter private member and rateLimit method
  // Removed sessionMonitor private member and related methods
  // Removed deviceFingerprinting private member and related methods
  // Removed tokenRotation private member and related methods
}

// Export a singleton instance
export const supabaseAuthService = new SupabaseAuthService()
