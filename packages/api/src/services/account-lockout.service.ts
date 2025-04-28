import { prisma } from "../lib/prisma"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { securityLogService, SecurityEventType } from "./security-log.service"
import { redisService } from "./redis.service"
import { logger } from "../lib/logger"

/**
 * Configuration for account lockout
 */
interface LockoutConfig {
  // Maximum number of failed attempts before locking the account
  maxAttempts: number
  // Base duration of the lockout in seconds
  lockoutDuration: number
  // Time window in seconds to reset failed attempts counter
  resetWindow: number
  // Whether to use progressive lockout durations
  progressive: boolean
  // Multiplier for progressive lockout durations
  progressiveMultiplier: number
  // Maximum number of progressive steps
  maxProgressiveSteps: number
  // Whether to notify the user about lockouts
  notifyUser: boolean
  // Whether to use Redis for distributed lockout tracking
  useRedis: boolean
  // Whether to track IP addresses for suspicious activity
  trackIpAddresses: boolean
  // Maximum number of accounts that can be locked from a single IP before the IP is flagged
  maxLockedAccountsPerIp: number
}

// Default lockout configuration
const DEFAULT_LOCKOUT_CONFIG: LockoutConfig = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60, // 15 minutes
  resetWindow: 60 * 60, // 1 hour
  progressive: true,
  progressiveMultiplier: 2,
  maxProgressiveSteps: 3,
  notifyUser: true,
  useRedis: true,
  trackIpAddresses: true,
  maxLockedAccountsPerIp: 3,
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
   * Calculate progressive lockout duration based on previous lockouts
   */
  private async calculateLockoutDuration(email: string): Promise<number> {
    if (!this.config.progressive) {
      return this.config.lockoutDuration
    }

    try {
      // Get previous lockout count from Redis or database
      let lockoutCount = 0
      const redisKey = `lockout:count:${email}`

      if (this.config.useRedis && redisService.isAvailable()) {
        const count = await redisService.get(redisKey)
        lockoutCount = count ? parseInt(count, 10) : 0
      } else {
        // Fallback to database
        const failedLogin = await prisma.failedLogin.findUnique({
          where: { email },
          select: { lockoutCount: true },
        })
        lockoutCount = failedLogin?.lockoutCount || 0
      }

      // Calculate progressive duration (capped at maxProgressiveSteps)
      const step = Math.min(lockoutCount, this.config.maxProgressiveSteps)
      const duration =
        this.config.lockoutDuration *
        Math.pow(this.config.progressiveMultiplier, step)

      logger.debug(`Progressive lockout duration for ${email}`, {
        email,
        lockoutCount,
        step,
        baseDuration: this.config.lockoutDuration,
        calculatedDuration: duration,
      })

      return duration
    } catch (error) {
      logger.error("Error calculating lockout duration:", {
        error: error instanceof Error ? error.message : String(error),
        email,
      })
      return this.config.lockoutDuration
    }
  }

  /**
   * Track IP address for suspicious activity
   */
  private async trackIpAddress(
    ipAddress: string,
    email: string
  ): Promise<void> {
    if (
      !this.config.trackIpAddresses ||
      !ipAddress ||
      ipAddress === "unknown"
    ) {
      return
    }

    try {
      if (this.config.useRedis && redisService.isAvailable()) {
        const redisKey = `ip:locked-accounts:${ipAddress}`

        // Add email to set of locked accounts for this IP
        await redisService.sadd(redisKey, email)

        // Set expiry if not already set
        const ttl = await redisService.ttl(redisKey)
        if (ttl < 0) {
          await redisService.expire(redisKey, 7 * 24 * 60 * 60) // 7 days
        }

        // Check if this IP has locked too many accounts
        const lockedAccounts = await redisService.smembers(redisKey)
        if (lockedAccounts.length >= this.config.maxLockedAccountsPerIp) {
          logger.warn(`IP address ${ipAddress} has locked too many accounts`, {
            ipAddress,
            lockedAccounts,
            threshold: this.config.maxLockedAccountsPerIp,
          })

          // Log suspicious activity
          await securityLogService.logSuspiciousActivity(
            undefined,
            undefined,
            "MULTIPLE_ACCOUNT_LOCKOUTS",
            ipAddress,
            {
              lockedAccounts,
              count: lockedAccounts.length,
            }
          )
        }
      }
    } catch (error) {
      logger.error("Error tracking IP address:", {
        error: error instanceof Error ? error.message : String(error),
        ipAddress,
        email,
      })
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
        select: {
          id: true,
          failedAttempts: true,
          lastFailedAttempt: true,
          lockoutCount: true,
        },
      })

      if (user) {
        // Check if we should reset the counter based on the reset window
        const shouldReset =
          user.lastFailedAttempt &&
          now.getTime() - user.lastFailedAttempt.getTime() >
            this.config.resetWindow * 1000

        // Calculate new attempt count
        const newAttemptCount = shouldReset ? 1 : user.failedAttempts + 1

        // Check if this attempt will cause a lockout
        const willLock = newAttemptCount >= this.config.maxAttempts

        // Calculate lockout duration if needed
        let lockoutDuration = this.config.lockoutDuration
        let newLockoutCount = user.lockoutCount || 0

        if (willLock) {
          // Increment lockout count
          newLockoutCount += 1

          // Calculate progressive duration
          lockoutDuration = await this.calculateLockoutDuration(email)

          // Store updated lockout count in Redis
          if (this.config.useRedis && redisService.isAvailable()) {
            await redisService.set(
              `lockout:count:${email}`,
              newLockoutCount.toString(),
              60 * 60 * 24 * 30 // 30 days
            )
          }

          // Track IP address if available
          if (ipAddress) {
            await this.trackIpAddress(ipAddress, email)
          }
        }

        // Update user record
        await prisma.user.update({
          where: { email },
          data: {
            failedAttempts: newAttemptCount,
            lastFailedAttempt: now,
            // Lock account if max attempts reached
            locked: willLock,
            lockedUntil: willLock
              ? new Date(now.getTime() + lockoutDuration * 1000)
              : null,
            lockoutCount: willLock ? { increment: 1 } : undefined,
          },
        })

        // If account is now locked, log it
        if (willLock) {
          logger.warn(
            `Account ${email} locked after ${newAttemptCount} failed attempts`,
            {
              email,
              attempts: newAttemptCount,
              lockoutDuration,
              ipAddress,
              userAgent,
              lockoutCount: newLockoutCount,
            }
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
              lockDuration: lockoutDuration,
              lockoutCount: newLockoutCount,
              progressive: this.config.progressive,
            },
          })

          // Send notification if enabled
          if (this.config.notifyUser && user.id) {
            await this.sendLockoutNotification(email, lockoutDuration)
          }
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
              ? new Date(
                  now.getTime() +
                    (await this.calculateLockoutDuration(email)) * 1000
                )
              : null,
          lockoutCount:
            (user?.failedAttempts || 0) + 1 >= this.config.maxAttempts
              ? { increment: 1 }
              : undefined,
        },
        create: {
          email,
          attempts: 1,
          ipAddress,
          userAgent,
          firstAttempt: now,
          lastAttempt: now,
          lockoutCount: 0,
        },
      })
    } catch (error) {
      logger.error("Error recording failed login attempt:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        email,
        ipAddress,
      })
    }
  }

  /**
   * Send notification to user about account lockout
   */
  private async sendLockoutNotification(
    email: string,
    lockoutDuration: number
  ): Promise<void> {
    try {
      // This is a placeholder for sending an email notification
      // In a real implementation, you would call an email service
      logger.info(`Sending lockout notification to ${email}`, {
        email,
        lockoutDuration,
      })

      // TODO: Implement actual email sending
      // await emailService.sendLockoutNotification(email, lockoutDuration)
    } catch (error) {
      logger.error("Error sending lockout notification:", {
        error: error instanceof Error ? error.message : String(error),
        email,
      })
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

      // Clear Redis data if enabled
      if (this.config.useRedis && redisService.isAvailable()) {
        // We don't reset the lockout count on successful login
        // This ensures progressive lockouts still work for repeat offenders

        logger.debug(`Reset failed attempts for ${email}`)
      }
    } catch (error) {
      logger.error("Error resetting failed attempts:", {
        error: error instanceof Error ? error.message : String(error),
        email,
      })
    }
  }

  /**
   * Unlock an account manually
   */
  async unlockAccount(email: string, adminUserId?: string): Promise<void> {
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

      // Clear Redis data if enabled
      if (this.config.useRedis && redisService.isAvailable()) {
        // We don't reset the lockout count on manual unlock
        // This ensures progressive lockouts still work for repeat offenders

        // But we do clear any active lockout
        await redisService.del(`lockout:active:${email}`)
      }

      logger.info(`Account ${email} unlocked`, {
        email,
        adminUserId,
      })

      // Log security event
      await securityLogService.logEvent({
        email,
        userId: adminUserId,
        eventType: SecurityEventType.ACCOUNT_UNLOCKED,
        details: {
          reason: adminUserId ? "Admin unlock" : "Manual unlock",
          adminUserId,
        },
      })
    } catch (error) {
      logger.error("Error unlocking account:", {
        error: error instanceof Error ? error.message : String(error),
        email,
      })
    }
  }

  /**
   * Get account lockout history
   */
  async getLockoutHistory(email: string): Promise<{
    lockoutCount: number
    lastLockout?: Date
    currentLockoutEnds?: Date
    isLocked: boolean
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          locked: true,
          lockedUntil: true,
          lockoutCount: true,
        },
      })

      if (!user) {
        return {
          lockoutCount: 0,
          isLocked: false,
        }
      }

      const failedLogin = await prisma.failedLogin.findUnique({
        where: { email },
        select: {
          lockoutCount: true,
          lastLockout: true,
        },
      })

      return {
        lockoutCount: user.lockoutCount || failedLogin?.lockoutCount || 0,
        lastLockout: failedLogin?.lastLockout,
        currentLockoutEnds: user.lockedUntil,
        isLocked: user.locked,
      }
    } catch (error) {
      logger.error("Error getting lockout history:", {
        error: error instanceof Error ? error.message : String(error),
        email,
      })

      return {
        lockoutCount: 0,
        isLocked: false,
      }
    }
  }

  /**
   * Check account status and throw error if locked
   */
  async checkAccountStatus(email: string): Promise<void> {
    const isLocked = await this.isAccountLocked(email)

    if (isLocked) {
      // Get lock expiration time and history
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          lockedUntil: true,
          lockoutCount: true,
          failedAttempts: true,
        },
      })

      const lockedUntil = user?.lockedUntil
      const now = new Date()
      const remainingSeconds = lockedUntil
        ? Math.max(
            0,
            Math.floor((lockedUntil.getTime() - now.getTime()) / 1000)
          )
        : this.config.lockoutDuration

      // Format a user-friendly unlock time
      const unlockTime = lockedUntil
        ? new Date(lockedUntil)
        : new Date(now.getTime() + this.config.lockoutDuration * 1000)

      const formattedUnlockTime = unlockTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })

      // Get a user-friendly message based on lockout count
      let message = "Account is locked due to too many failed login attempts"
      if (user?.lockoutCount && user.lockoutCount > 1) {
        message = `Account is locked due to repeated failed login attempts (${user.lockoutCount} lockouts)`
      }

      // Log the lockout check
      logger.info(`Account lockout check for ${email}`, {
        email,
        isLocked,
        lockedUntil: lockedUntil?.toISOString(),
        remainingSeconds,
        lockoutCount: user?.lockoutCount || 0,
        failedAttempts: user?.failedAttempts || 0,
      })

      throw new AuthError(AuthErrorCode.ACCOUNT_LOCKED, message, 403, {
        lockedUntil: lockedUntil?.toISOString(),
        remainingSeconds,
        formattedUnlockTime,
        lockoutCount: user?.lockoutCount || 0,
        failedAttempts: user?.failedAttempts || 0,
        progressive: this.config.progressive,
        unlockInstructions:
          "Please try again later or contact support if you need immediate assistance.",
      })
    }
  }
}

// Export singleton instance with default config
export const accountLockoutService = new AccountLockoutService()
