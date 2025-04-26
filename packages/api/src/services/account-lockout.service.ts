import { prisma } from "../lib/prisma"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { securityLogService, SecurityEventType } from "./security-log.service"

/**
 * Configuration for account lockout
 */
interface LockoutConfig {
  // Maximum number of failed attempts before locking the account
  maxAttempts: number
  // Duration of the lockout in seconds
  lockoutDuration: number
  // Time window in seconds to reset failed attempts counter
  resetWindow: number
}

// Default lockout configuration
const DEFAULT_LOCKOUT_CONFIG: LockoutConfig = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60, // 15 minutes
  resetWindow: 60 * 60, // 1 hour
}

/**
 * Service to handle account lockout after failed login attempts
 */
export class AccountLockoutService {
  private config: LockoutConfig

  constructor(config: Partial<LockoutConfig> = {}) {
    this.config = { ...DEFAULT_LOCKOUT_CONFIG, ...config }
  }

  /**
   * Check if an account is locked
   */
  async isAccountLocked(email: string): Promise<boolean> {
    try {
      // Check if user exists and is locked
      const user = await prisma.user.findUnique({
        where: { email },
        select: { locked: true, lockedUntil: true },
      })

      if (!user) {
        return false
      }

      // If account is locked but lock time has expired, unlock it
      if (user.locked && user.lockedUntil && user.lockedUntil < new Date()) {
        await this.unlockAccount(email)
        return false
      }

      return user.locked
    } catch (error) {
      console.error("Error checking account lock status:", error)
      return false
    }
  }

  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // Get current time
      const now = new Date()

      // Update user's failed attempts
      const user = await prisma.user.findUnique({
        where: { email },
        select: { failedAttempts: true, lastFailedAttempt: true },
      })

      if (user) {
        // Check if we should reset the counter based on the reset window
        const shouldReset =
          user.lastFailedAttempt &&
          now.getTime() - user.lastFailedAttempt.getTime() >
            this.config.resetWindow * 1000

        // Calculate new attempt count
        const newAttemptCount = shouldReset ? 1 : user.failedAttempts + 1

        // Update user record
        await prisma.user.update({
          where: { email },
          data: {
            failedAttempts: newAttemptCount,
            lastFailedAttempt: now,
            // Lock account if max attempts reached
            locked: newAttemptCount >= this.config.maxAttempts,
            lockedUntil:
              newAttemptCount >= this.config.maxAttempts
                ? new Date(now.getTime() + this.config.lockoutDuration * 1000)
                : null,
          },
        })

        // If account is now locked, log it
        if (newAttemptCount >= this.config.maxAttempts) {
          console.warn(
            `Account ${email} locked after ${newAttemptCount} failed attempts`
          )

          // Log security event
          await securityLogService.logEvent({
            email,
            eventType: SecurityEventType.ACCOUNT_LOCKED,
            ipAddress,
            userAgent,
            details: {
              reason: "Too many failed login attempts",
              attempts: newAttemptCount,
              lockDuration: this.config.lockoutDuration,
            },
          })
        }
      }

      // Also record in FailedLogin table for analytics
      await prisma.failedLogin.upsert({
        where: { email },
        update: {
          attempts: {
            increment: 1,
          },
          ipAddress,
          userAgent,
          lastAttempt: now,
          lockedUntil:
            (user?.failedAttempts || 0) + 1 >= this.config.maxAttempts
              ? new Date(now.getTime() + this.config.lockoutDuration * 1000)
              : null,
        },
        create: {
          email,
          attempts: 1,
          ipAddress,
          userAgent,
          firstAttempt: now,
          lastAttempt: now,
        },
      })
    } catch (error) {
      console.error("Error recording failed login attempt:", error)
    }
  }

  /**
   * Reset failed attempts counter after successful login
   */
  async resetFailedAttempts(email: string): Promise<void> {
    try {
      // Update user record
      await prisma.user.update({
        where: { email },
        data: {
          failedAttempts: 0,
          lastFailedAttempt: null,
          locked: false,
          lockedUntil: null,
        },
      })

      // Update FailedLogin record
      await prisma.failedLogin.update({
        where: { email },
        data: {
          attempts: 0,
          resetAt: new Date(),
          lockedUntil: null,
        },
      })
    } catch (error) {
      console.error("Error resetting failed attempts:", error)
    }
  }

  /**
   * Unlock an account manually
   */
  async unlockAccount(email: string): Promise<void> {
    try {
      // Update user record
      await prisma.user.update({
        where: { email },
        data: {
          failedAttempts: 0,
          locked: false,
          lockedUntil: null,
        },
      })

      // Update FailedLogin record
      await prisma.failedLogin.update({
        where: { email },
        data: {
          attempts: 0,
          resetAt: new Date(),
          lockedUntil: null,
        },
      })

      console.log(`Account ${email} unlocked`)

      // Log security event
      await securityLogService.logEvent({
        email,
        eventType: SecurityEventType.ACCOUNT_UNLOCKED,
        details: {
          reason: "Manual unlock",
        },
      })
    } catch (error) {
      console.error("Error unlocking account:", error)
    }
  }

  /**
   * Check account status and throw error if locked
   */
  async checkAccountStatus(email: string): Promise<void> {
    const isLocked = await this.isAccountLocked(email)

    if (isLocked) {
      // Get lock expiration time
      const user = await prisma.user.findUnique({
        where: { email },
        select: { lockedUntil: true },
      })

      const lockedUntil = user?.lockedUntil

      throw new AuthError(
        AuthErrorCode.ACCOUNT_LOCKED,
        "Account is locked due to too many failed login attempts",
        403,
        {
          lockedUntil: lockedUntil?.toISOString(),
          remainingSeconds: lockedUntil
            ? Math.max(
                0,
                Math.floor(
                  (lockedUntil.getTime() - new Date().getTime()) / 1000
                )
              )
            : this.config.lockoutDuration,
        }
      )
    }
  }
}

// Export singleton instance with default config
export const accountLockoutService = new AccountLockoutService()
