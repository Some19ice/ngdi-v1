/**
 * Password policy configuration
 * 
 * This file contains the configuration for password policies.
 */

export const passwordPolicyConfig = {
  /**
   * Password strength requirements
   */
  strength: {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    // List of common passwords to reject
    commonPasswords: [
      "password", "123456", "qwerty", "admin", "welcome", 
      "password123", "admin123", "letmein", "welcome1"
    ],
    // Reject passwords containing these personal information patterns
    rejectPersonalInfo: true,
  },

  /**
   * Password expiration settings
   */
  expiration: {
    // Whether to enable password expiration
    enabled: true,
    // Number of days after which passwords expire
    expirationDays: 90,
    // Number of days before expiration to start warning the user
    warningDays: 14,
    // Whether to allow grace logins after expiration
    allowGraceLogins: true,
    // Number of grace logins allowed after expiration
    graceLogins: 3,
  },

  /**
   * Password history settings
   */
  history: {
    // Whether to enable password history
    enabled: true,
    // Number of previous passwords to remember
    rememberCount: 5,
    // Minimum age of password in days before it can be changed again
    minimumAge: 1,
  },

  /**
   * Account lockout settings for failed password attempts
   */
  lockout: {
    // Whether to enable account lockout
    enabled: true,
    // Number of failed attempts before lockout
    maxAttempts: 5,
    // Lockout duration in minutes
    lockoutDuration: 15,
    // Whether to use progressive lockout (increasing duration)
    progressive: true,
    // Multiplier for progressive lockout
    progressiveMultiplier: 2,
    // Maximum number of progressive steps
    maxProgressiveSteps: 3,
  },

  /**
   * Password reset settings
   */
  reset: {
    // Whether to force password change on first login
    forceChangeOnFirstLogin: true,
    // Whether to force password change after reset
    forceChangeAfterReset: true,
    // Token expiration time in hours
    tokenExpirationHours: 24,
  },
}

export type PasswordPolicyConfig = typeof passwordPolicyConfig
