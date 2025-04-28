import { prisma } from "../lib/prisma"

/**
 * Security event types for logging
 */
export enum SecurityEventType {
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGOUT = "LOGOUT",
  PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS",
  PASSWORD_RESET_FAILURE = "PASSWORD_RESET_FAILURE",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  ACCOUNT_UNLOCKED = "ACCOUNT_UNLOCKED",
  TOKEN_REFRESH = "TOKEN_REFRESH",
  TOKEN_REFRESHED = "TOKEN_REFRESHED", // New event for successful token rotation
  TOKEN_REVOKED = "TOKEN_REVOKED",
  TOKEN_VALIDATION_FAILURE = "TOKEN_VALIDATION_FAILURE",
  TOKEN_VALIDATION_SUCCESS = "TOKEN_VALIDATION_SUCCESS",
  TOKEN_FAMILY_REVOKED = "TOKEN_FAMILY_REVOKED", // New event for revoking a token family
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  REGISTRATION = "REGISTRATION",
  PROFILE_UPDATE = "PROFILE_UPDATE",
  PERMISSION_CHANGE = "PERMISSION_CHANGE",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  CSRF_VIOLATION = "CSRF_VIOLATION",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  IP_BANNED = "IP_BANNED",
  IP_UNBANNED = "IP_UNBANNED",
}

/**
 * Security log entry interface
 */
interface SecurityLogEntry {
  userId?: string
  email?: string
  eventType: SecurityEventType
  ipAddress?: string
  userAgent?: string
  deviceId?: string
  details?: Record<string, any>
}

/**
 * Service for logging security-related events
 */
export class SecurityLogService {
  /**
   * Log a security event
   */
  async logEvent(entry: SecurityLogEntry): Promise<void> {
    try {
      // Log to database if available
      if (prisma) {
        // Check if we have a SecurityLog model
        // If not, just log to console
        try {
          // @ts-ignore - SecurityLog model might not exist yet
          await prisma.securityLog.create({
            data: {
              userId: entry.userId,
              email: entry.email,
              eventType: entry.eventType,
              ipAddress: entry.ipAddress,
              userAgent: entry.userAgent,
              deviceId: entry.deviceId,
              details: entry.details ? JSON.stringify(entry.details) : null,
            },
          })
        } catch (error) {
          // If model doesn't exist, log to console
          console.warn(
            "SecurityLog model not available, logging to console only"
          )
          this.logToConsole(entry)
        }
      } else {
        // Fallback to console logging
        this.logToConsole(entry)
      }
    } catch (error) {
      // Ensure logging errors don't break the application
      console.error("Error logging security event:", error)
      this.logToConsole(entry)
    }
  }

  /**
   * Log a security event to the console
   */
  private logToConsole(entry: SecurityLogEntry): void {
    const timestamp = new Date().toISOString()
    const userInfo = entry.userId
      ? `User: ${entry.userId}`
      : entry.email
        ? `Email: ${entry.email}`
        : "Anonymous"
    const location = entry.ipAddress ? `IP: ${entry.ipAddress}` : ""
    const device = entry.deviceId
      ? `Device: ${entry.deviceId}`
      : entry.userAgent
        ? `UA: ${entry.userAgent}`
        : ""

    console.log(
      `[SECURITY] ${timestamp} | ${entry.eventType} | ${userInfo} | ${location} | ${device}`
    )

    if (entry.details) {
      console.log(`[SECURITY] Details:`, entry.details)
    }
  }

  /**
   * Log a successful login
   */
  async logLoginSuccess(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string,
    deviceId?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      email,
      eventType: SecurityEventType.LOGIN_SUCCESS,
      ipAddress,
      userAgent,
      deviceId,
    })
  }

  /**
   * Log a failed login attempt
   */
  async logLoginFailure(
    email: string,
    ipAddress?: string,
    userAgent?: string,
    reason?: string
  ): Promise<void> {
    await this.logEvent({
      email,
      eventType: SecurityEventType.LOGIN_FAILURE,
      ipAddress,
      userAgent,
      details: reason ? { reason } : undefined,
    })
  }

  /**
   * Log a logout event
   */
  async logLogout(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      email,
      eventType: SecurityEventType.LOGOUT,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Log an account lockout
   */
  async logAccountLocked(
    userId: string,
    email: string,
    reason: string,
    ipAddress?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      email,
      eventType: SecurityEventType.ACCOUNT_LOCKED,
      ipAddress,
      details: { reason },
    })
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    email?: string,
    userId?: string,
    activityType?: string,
    ipAddress?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      userId,
      email,
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      ipAddress,
      details: {
        activityType,
        ...details,
      },
    })
  }

  /**
   * Log a CSRF violation
   */
  async logCsrfViolation(
    ipAddress?: string,
    userAgent?: string,
    path?: string
  ): Promise<void> {
    await this.logEvent({
      eventType: SecurityEventType.CSRF_VIOLATION,
      ipAddress,
      userAgent,
      details: { path },
    })
  }

  /**
   * Log a rate limit exceeded event
   */
  async logRateLimitExceeded(
    ipAddress: string,
    path: string,
    method: string
  ): Promise<void> {
    await this.logEvent({
      eventType: SecurityEventType.RATE_LIMIT_EXCEEDED,
      ipAddress,
      details: { path, method },
    })
  }

  /**
   * Log an IP ban event
   */
  async logIpBanned(
    ipAddress: string,
    reason: string,
    duration?: number,
    adminUserId?: string
  ): Promise<void> {
    await this.logEvent({
      eventType: SecurityEventType.IP_BANNED,
      ipAddress,
      userId: adminUserId,
      details: {
        reason,
        duration,
        bannedAt: new Date().toISOString(),
        expiresAt: duration
          ? new Date(Date.now() + duration * 1000).toISOString()
          : "never",
      },
    })
  }

  /**
   * Log an IP unban event
   */
  async logIpUnbanned(
    ipAddress: string,
    reason?: string,
    adminUserId?: string
  ): Promise<void> {
    await this.logEvent({
      eventType: SecurityEventType.IP_UNBANNED,
      ipAddress,
      userId: adminUserId,
      details: {
        reason,
        unbannedAt: new Date().toISOString(),
      },
    })
  }

  /**
   * Log a token refresh event
   */
  async logTokenRefresh(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string,
    deviceId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      userId,
      email,
      eventType: SecurityEventType.TOKEN_REFRESHED,
      ipAddress,
      userAgent,
      deviceId,
      details: {
        refreshedAt: new Date().toISOString(),
        ...details,
      },
    })
  }

  /**
   * Log a token revocation event
   */
  async logTokenRevocation(
    userId: string,
    tokenId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: SecurityEventType.TOKEN_REVOKED,
      ipAddress,
      userAgent,
      details: {
        tokenId,
        reason,
        revokedAt: new Date().toISOString(),
      },
    })
  }

  /**
   * Log a token family revocation event
   */
  async logTokenFamilyRevocation(
    userId: string,
    family: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: SecurityEventType.TOKEN_FAMILY_REVOKED,
      ipAddress,
      userAgent,
      details: {
        family,
        reason,
        revokedAt: new Date().toISOString(),
      },
    })
  }
}

// Export singleton instance
export const securityLogService = new SecurityLogService()
