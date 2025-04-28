/**
 * Rate limiting configuration
 *
 * This file contains standardized rate limiting settings for different types of endpoints.
 * Using these configurations ensures consistent rate limiting across the application.
 */

export const rateLimitConfig = {
  /**
   * Authentication rate limits
   */
  auth: {
    /**
     * Login rate limits
     */
    login: {
      windowSeconds: 300, // 5 minutes
      maxRequests: 5, // 5 attempts
      keyPrefix: "rate:login:",
      message: "Too many login attempts. Please try again later.",
      skipSuccessfulRequests: true, // Don't count successful logins against the limit
      progressive: true, // Enable progressive rate limiting
      progressiveMultiplier: 2, // Double the window each time
      maxProgressiveSteps: 3, // Up to 8x the original window (5min -> 10min -> 20min -> 40min)
      trackFailedAttempts: true, // Track failed attempts for account lockout
    },

    /**
     * Registration rate limits
     */
    register: {
      windowSeconds: 3600, // 1 hour
      maxRequests: 3, // 3 attempts
      keyPrefix: "rate:register:",
      message: "Too many registration attempts. Please try again later.",
      progressive: true, // Enable progressive rate limiting
      progressiveMultiplier: 2, // Double the window each time
      maxProgressiveSteps: 2, // Up to 4x the original window (1h -> 2h -> 4h)
    },

    /**
     * Password reset request rate limits
     */
    forgotPassword: {
      windowSeconds: 3600, // 1 hour
      maxRequests: 3, // 3 attempts
      keyPrefix: "rate:forgot:",
      message: "Too many password reset requests. Please try again later.",
      progressive: true, // Enable progressive rate limiting
    },

    /**
     * Password reset confirmation rate limits
     */
    resetPassword: {
      windowSeconds: 3600, // 1 hour
      maxRequests: 5, // 5 attempts
      keyPrefix: "rate:reset:",
      message: "Too many password reset attempts. Please try again later.",
      progressive: true, // Enable progressive rate limiting
    },

    /**
     * Token refresh rate limits
     */
    refreshToken: {
      windowSeconds: 300, // 5 minutes
      maxRequests: 10, // 10 attempts
      keyPrefix: "rate:refresh:",
      message: "Too many token refresh attempts. Please try again later.",
    },

    /**
     * Email verification rate limits
     */
    verifyEmail: {
      windowSeconds: 3600, // 1 hour
      maxRequests: 10, // 10 attempts
      keyPrefix: "rate:verify:",
      message: "Too many verification attempts. Please try again later.",
    },

    /**
     * Resend verification email rate limits
     */
    resendVerification: {
      windowSeconds: 3600, // 1 hour
      maxRequests: 3, // 3 attempts
      keyPrefix: "rate:resend-verify:",
      message: "Too many verification email requests. Please try again later.",
      progressive: true, // Enable progressive rate limiting
      progressiveMultiplier: 2, // Double the window each time
      maxProgressiveSteps: 2, // Up to 4x the original window (1h -> 2h -> 4h)
    },

    /**
     * Global auth rate limits
     */
    global: {
      windowSeconds: 60, // 1 minute
      maxRequests: 30, // 30 requests per minute
      keyPrefix: "rate:auth-global:",
      message: "Too many requests. Please try again later.",
    },
  },

  /**
   * API rate limits
   */
  api: {
    /**
     * Standard API rate limits
     */
    standard: {
      windowSeconds: 60, // 1 minute
      maxRequests: 60, // 60 requests per minute (1 req/sec)
      keyPrefix: "rate:api-standard:",
      message: "Rate limit exceeded. Please slow down your requests.",
    },

    /**
     * Sensitive API rate limits (for endpoints that might be expensive)
     */
    sensitive: {
      windowSeconds: 60, // 1 minute
      maxRequests: 20, // 20 requests per minute
      keyPrefix: "rate:api-sensitive:",
      message:
        "Rate limit exceeded for sensitive operation. Please try again later.",
    },

    /**
     * Search API rate limits
     */
    search: {
      windowSeconds: 60, // 1 minute
      maxRequests: 30, // 30 requests per minute
      keyPrefix: "rate:api-search:",
      message: "Search rate limit exceeded. Please try again later.",
    },

    /**
     * Global API rate limits
     */
    global: {
      windowSeconds: 60, // 1 minute
      maxRequests: 120, // 120 requests per minute (2 req/sec)
      keyPrefix: "rate:api-global:",
      message: "Global rate limit exceeded. Please slow down your requests.",
    },
  },

  /**
   * Admin API rate limits
   */
  admin: {
    /**
     * Standard admin API rate limits
     */
    standard: {
      windowSeconds: 60, // 1 minute
      maxRequests: 120, // 120 requests per minute (2 req/sec)
      keyPrefix: "rate:admin-standard:",
      message: "Admin rate limit exceeded. Please slow down your requests.",
    },
  },
}

export default rateLimitConfig
