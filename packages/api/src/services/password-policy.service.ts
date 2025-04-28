import { prisma } from "../lib/prisma"
import { passwordPolicyConfig } from "../config/password-policy.config"
import { hash, compare } from "bcryptjs"
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
 * Password policy service
 * 
 * This service handles password policy enforcement, including:
 * - Password strength validation
 * - Password expiration management
 * - Password history tracking
 * - Password change enforcement
 */
export class PasswordPolicyService {
  /**
   * Validate password strength
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
    const config = passwordPolicyConfig.strength

    // Check length
    if (password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long`)
    }

    if (password.length > config.maxLength) {
      errors.push(`Password must be at most ${config.maxLength} characters long`)
    }

    // Check character requirements
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }

    if (config.requireNumbers && !/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number")
    }

    if (config.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
      errors.push("Password must contain at least one special character")
    }

    // Check for common passwords
    if (config.commonPasswords.includes(password.toLowerCase())) {
      errors.push("Password is too common and easily guessable")
    }

    // Check for personal information
    if (config.rejectPersonalInfo && userData) {
      const personalInfo = [
        userData.name,
        userData.email?.split("@")[0],
      ].filter(Boolean).map(info => info?.toLowerCase())

      for (const info of personalInfo) {
        if (info && info.length > 2 && password.toLowerCase().includes(info)) {
          errors.push("Password must not contain personal information")
          break
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Check if a password is in the user's password history
   * 
   * @param userId User ID
   * @param newPassword New password to check
   * @returns Whether the password is in the history
   */
  static async isPasswordInHistory(
    userId: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      if (!passwordPolicyConfig.history.enabled) {
        return false
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { previousPasswords: true, password: true },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Check current password
      const isCurrentPassword = await compare(newPassword, user.password)
      if (isCurrentPassword) {
        return true
      }

      // Check previous passwords
      const previousPasswords = user.previousPasswords 
        ? (user.previousPasswords as string[]) 
        : []

      for (const prevPassword of previousPasswords) {
        const matches = await compare(newPassword, prevPassword)
        if (matches) {
          return true
        }
      }

      return false
    } catch (error) {
      logger.error("Error checking password history:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      })
      return false
    }
  }

  /**
   * Add a password to the user's password history
   * 
   * @param userId User ID
   * @param currentPassword Current password hash to add to history
   */
  static async addPasswordToHistory(
    userId: string,
    currentPassword: string
  ): Promise<void> {
    try {
      if (!passwordPolicyConfig.history.enabled) {
        return
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { previousPasswords: true },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Get previous passwords
      let previousPasswords = user.previousPasswords 
        ? (user.previousPasswords as string[]) 
        : []

      // Add current password to history
      previousPasswords.push(currentPassword)

      // Keep only the most recent passwords based on config
      if (previousPasswords.length > passwordPolicyConfig.history.rememberCount) {
        previousPasswords = previousPasswords.slice(-passwordPolicyConfig.history.rememberCount)
      }

      // Update user's password history
      await prisma.user.update({
        where: { id: userId },
        data: { previousPasswords },
      })
    } catch (error) {
      logger.error("Error adding password to history:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      })
    }
  }

  /**
   * Check if a password change is allowed based on minimum age
   * 
   * @param userId User ID
   * @returns Whether password change is allowed
   */
  static async isPasswordChangeAllowed(userId: string): Promise<boolean> {
    try {
      if (!passwordPolicyConfig.history.enabled || 
          passwordPolicyConfig.history.minimumAge <= 0) {
        return true
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordLastChanged: true, passwordChangeRequired: true },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Always allow password change if it's required
      if (user.passwordChangeRequired) {
        return true
      }

      // Check if minimum age requirement is met
      const minimumAgeMs = passwordPolicyConfig.history.minimumAge * 24 * 60 * 60 * 1000
      const passwordAge = Date.now() - user.passwordLastChanged.getTime()
      
      return passwordAge >= minimumAgeMs
    } catch (error) {
      logger.error("Error checking if password change is allowed:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      })
      return true // Fail open to allow password changes
    }
  }

  /**
   * Get password expiration status for a user
   * 
   * @param userId User ID
   * @returns Password expiration status
   */
  static async getPasswordExpirationStatus(
    userId: string
  ): Promise<PasswordExpirationStatus> {
    try {
      if (!passwordPolicyConfig.expiration.enabled) {
        return {
          isExpired: false,
          requiresChange: false,
        }
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          passwordExpiresAt: true, 
          passwordChangeRequired: true,
          passwordLastChanged: true,
        },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // If password change is required, return that status
      if (user.passwordChangeRequired) {
        return {
          isExpired: false,
          requiresChange: true,
        }
      }

      // If expiration date is not set, calculate it
      if (!user.passwordExpiresAt) {
        const expirationDate = new Date(user.passwordLastChanged)
        expirationDate.setDate(
          expirationDate.getDate() + passwordPolicyConfig.expiration.expirationDays
        )
        
        // Update the user with the calculated expiration date
        await prisma.user.update({
          where: { id: userId },
          data: { passwordExpiresAt: expirationDate },
        })
        
        const daysUntilExpiration = Math.ceil(
          (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        
        return {
          isExpired: daysUntilExpiration <= 0,
          daysUntilExpiration: Math.max(0, daysUntilExpiration),
          requiresChange: daysUntilExpiration <= 0,
        }
      }

      // Check if password is expired
      const now = new Date()
      const isExpired = user.passwordExpiresAt < now
      
      if (!isExpired) {
        // Calculate days until expiration
        const daysUntilExpiration = Math.ceil(
          (user.passwordExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        return {
          isExpired: false,
          daysUntilExpiration,
          requiresChange: false,
        }
      }
      
      // Password is expired, check for grace logins
      if (passwordPolicyConfig.expiration.allowGraceLogins) {
        // Get grace logins from security logs
        const graceLogins = await securityLogService.countEvents({
          userId,
          eventType: SecurityEventType.PASSWORD_GRACE_LOGIN,
          since: user.passwordExpiresAt,
        })
        
        const graceLoginsRemaining = Math.max(
          0, 
          passwordPolicyConfig.expiration.graceLogins - graceLogins
        )
        
        return {
          isExpired: true,
          requiresChange: true,
          graceLoginsRemaining,
        }
      }
      
      return {
        isExpired: true,
        requiresChange: true,
        graceLoginsRemaining: 0,
      }
    } catch (error) {
      logger.error("Error getting password expiration status:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      })
      
      // Fail open to allow login
      return {
        isExpired: false,
        requiresChange: false,
      }
    }
  }

  /**
   * Record a grace login for a user with expired password
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
    try {
      await securityLogService.logEvent({
        userId,
        eventType: SecurityEventType.PASSWORD_GRACE_LOGIN,
        ipAddress,
        userAgent,
        details: {
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      logger.error("Error recording grace login:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      })
    }
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
        throw new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          "User not found",
          404
        )
      }

      // Combine provided userData with user data from database
      const fullUserData = {
        name: userData?.name || user.name || undefined,
        email: userData?.email || user.email,
      }

      // Validate password strength
      if (!skipValidation) {
        const validationResult = this.validatePasswordStrength(newPassword, fullUserData)
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
        expirationDate.getDate() + passwordPolicyConfig.expiration.expirationDays
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
      password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length))
    }
    
    if (passwordPolicyConfig.strength.requireLowercase) {
      password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length))
    }
    
    if (passwordPolicyConfig.strength.requireNumbers) {
      password += numberChars.charAt(Math.floor(Math.random() * numberChars.length))
    }
    
    if (passwordPolicyConfig.strength.requireSpecialChars) {
      password += specialChars.charAt(Math.floor(Math.random() * specialChars.length))
    }
    
    // Fill the rest of the password with random characters
    const allChars = [
      ...(passwordPolicyConfig.strength.requireUppercase ? uppercaseChars : []),
      ...(passwordPolicyConfig.strength.requireLowercase ? lowercaseChars : []),
      ...(passwordPolicyConfig.strength.requireNumbers ? numberChars : []),
      ...(passwordPolicyConfig.strength.requireSpecialChars ? specialChars : []),
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
