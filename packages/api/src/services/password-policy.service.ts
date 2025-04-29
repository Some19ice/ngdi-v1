import { hash } from "bcryptjs"
import { logger } from "../lib/logger"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { SecurityEventType, securityLogService } from "./security-log.service"

/**
 * Password policy validation result
 */
export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Password expiration status
 */
export interface PasswordExpirationStatus {
  isExpired: boolean
  daysUntilExpiration?: number
  requiresChange: boolean
  graceLoginsRemaining?: number
}

/**
 * Simplified password policy service
 *
 * This service provides basic password validation but doesn't enforce
 * complex policies like password history, expiration, etc.
 */
export class PasswordPolicyService {
  /**
   * Validate password strength
   * Simplified version with basic validation
   *
   * @param password The password to validate
   * @param userData Optional user data to check for personal information
   * @returns Validation result with errors if any
   */
  static validatePasswordStrength(
    password: string,
    userData?: { name?: string; email?: string }
  ): PasswordValidationResult {
    const errors: string[] = []

    // Basic length check
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }

    // Basic complexity check
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Check if a password is in the user's password history
   * Simplified version that always returns false
   *
   * @param userId User ID
   * @param newPassword New password to check
   * @returns Whether the password is in the history
   */
  static async isPasswordInHistory(
    userId: string,
    newPassword: string
  ): Promise<boolean> {
    logger.debug(`Checking password history for user ${userId}`)
    return false
  }

  /**
   * Add a password to the user's password history
   * Simplified version that does nothing
   *
   * @param userId User ID
   * @param currentPassword Current password hash to add to history
   */
  static async addPasswordToHistory(
    userId: string,
    currentPassword: string
  ): Promise<void> {
    logger.debug(`Adding password to history for user ${userId}`)
    // No-op in simplified version
  }

  /**
   * Check if a password change is allowed based on minimum age
   * Simplified version that always returns true
   *
   * @param userId User ID
   * @returns Whether password change is allowed
   */
  static async isPasswordChangeAllowed(userId: string): Promise<boolean> {
    logger.debug(`Checking if password change is allowed for user ${userId}`)
    return true
  }

  /**
   * Get password expiration status for a user
   * Simplified version that always returns not expired
   *
   * @param userId User ID
   * @returns Password expiration status
   */
  static async getPasswordExpirationStatus(
    userId: string
  ): Promise<PasswordExpirationStatus> {
    logger.debug(`Getting password expiration status for user ${userId}`)
    return {
      isExpired: false,
      requiresChange: false,
    }
  }

  /**
   * Record a grace login for a user with expired password
   * Simplified version that only logs the event
   *
   * @param userId User ID
   * @param ipAddress IP address
   * @param userAgent User agent
   */
  static async recordGraceLogin(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    logger.debug(`Recording grace login for user ${userId}`)
    await securityLogService.logEvent({
      userId,
      eventType: SecurityEventType.PASSWORD_GRACE_LOGIN,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Change a user's password with policy enforcement
   *
   * @param userId User ID
   * @param newPassword New password
   * @param userData Optional user data for validation
   * @param skipValidation Whether to skip validation (for admin resets)
   */
  static async changePassword(
    userId: string,
    newPassword: string,
    userData?: { name?: string; email?: string },
    skipValidation = false
  ): Promise<void> {
    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          password: true,
          passwordLastChanged: true,
        },
      })

      if (!user) {
        throw new AuthError(AuthErrorCode.USER_NOT_FOUND, "User not found", 404)
      }

      // Combine provided userData with user data from database
      const fullUserData = {
        name: userData?.name || user.name || undefined,
        email: userData?.email || user.email,
      }

      // Validate password strength
      if (!skipValidation) {
        const validationResult = this.validatePasswordStrength(
          newPassword,
          fullUserData
        )
        if (!validationResult.valid) {
          throw new AuthError(
            AuthErrorCode.PASSWORD_POLICY,
            validationResult.errors.join(". "),
            400
          )
        }

        // Check if password change is allowed (minimum age)
        const isChangeAllowed = await this.isPasswordChangeAllowed(userId)
        if (!isChangeAllowed) {
          const minimumAgeDays = passwordPolicyConfig.history.minimumAge
          throw new AuthError(
            AuthErrorCode.PASSWORD_POLICY,
            `Password was changed too recently. Please wait at least ${minimumAgeDays} day(s) between password changes.`,
            400
          )
        }

        // Check if password is in history
        const isInHistory = await this.isPasswordInHistory(userId, newPassword)
        if (isInHistory) {
          throw new AuthError(
            AuthErrorCode.PASSWORD_POLICY,
            `Cannot reuse one of your last ${passwordPolicyConfig.history.rememberCount} passwords.`,
            400
          )
        }
      }

      // Add current password to history
      await this.addPasswordToHistory(userId, user.password)

      // Hash the new password
      const hashedPassword = await hash(newPassword, 12)

      // Calculate new expiration date
      const expirationDate = new Date()
      expirationDate.setDate(
        expirationDate.getDate() +
          passwordPolicyConfig.expiration.expirationDays
      )

      // Update user's password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordLastChanged: new Date(),
          passwordExpiresAt: expirationDate,
          passwordChangeRequired: false,
        },
      })

      // Log security event
      await securityLogService.logEvent({
        userId,
        email: user.email,
        eventType: SecurityEventType.PASSWORD_CHANGED,
        details: {
          changedAt: new Date().toISOString(),
        },
      })
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }

      logger.error("Error changing password:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      })

      throw new AuthError(
        AuthErrorCode.PASSWORD_CHANGE_FAILED,
        "Failed to change password",
        500
      )
    }
  }

  /**
   * Reset a user's password (admin function)
   *
   * @param userId User ID
   * @param requireChange Whether to require password change on next login
   */
  static async resetPassword(
    userId: string,
    requireChange = true
  ): Promise<string> {
    try {
      // Generate a random password
      const tempPassword = this.generateRandomPassword()

      // Hash the password
      const hashedPassword = await hash(tempPassword, 12)

      // Update user's password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordLastChanged: new Date(),
          passwordChangeRequired: requireChange,
        },
      })

      // Log security event
      await securityLogService.logEvent({
        userId,
        eventType: SecurityEventType.PASSWORD_RESET_ADMIN,
        details: {
          resetAt: new Date().toISOString(),
          requireChange,
        },
      })

      return tempPassword
    } catch (error) {
      logger.error("Error resetting password:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      })

      throw new AuthError(
        AuthErrorCode.PASSWORD_RESET_FAILED,
        "Failed to reset password",
        500
      )
    }
  }

  /**
   * Generate a random password that meets policy requirements
   */
  static generateRandomPassword(): string {
    const length = Math.max(passwordPolicyConfig.strength.minLength, 12)
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz"
    const numberChars = "0123456789"
    const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?"

    let password = ""

    // Ensure at least one of each required character type
    if (passwordPolicyConfig.strength.requireUppercase) {
      password += uppercaseChars.charAt(
        Math.floor(Math.random() * uppercaseChars.length)
      )
    }

    if (passwordPolicyConfig.strength.requireLowercase) {
      password += lowercaseChars.charAt(
        Math.floor(Math.random() * lowercaseChars.length)
      )
    }

    if (passwordPolicyConfig.strength.requireNumbers) {
      password += numberChars.charAt(
        Math.floor(Math.random() * numberChars.length)
      )
    }

    if (passwordPolicyConfig.strength.requireSpecialChars) {
      password += specialChars.charAt(
        Math.floor(Math.random() * specialChars.length)
      )
    }

    // Fill the rest of the password with random characters
    const allChars = [
      ...(passwordPolicyConfig.strength.requireUppercase ? uppercaseChars : []),
      ...(passwordPolicyConfig.strength.requireLowercase ? lowercaseChars : []),
      ...(passwordPolicyConfig.strength.requireNumbers ? numberChars : []),
      ...(passwordPolicyConfig.strength.requireSpecialChars
        ? specialChars
        : []),
    ].join("")

    const remainingLength = length - password.length
    for (let i = 0; i < remainingLength; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("")
  }
}

export const passwordPolicyService = new PasswordPolicyService()
