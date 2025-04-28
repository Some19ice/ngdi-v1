import { redisService } from "./redis.service"
import { securityLogService } from "./security-log.service"
import { logger } from "../lib/logger"

/**
 * Service for managing IP bans
 */
export class IpBanService {
  private readonly banKeyPrefix = "banned:ip:"
  private readonly violationKeyPrefix = "violations:ip:"
  
  /**
   * Ban an IP address
   * 
   * @param ip IP address to ban
   * @param reason Reason for the ban
   * @param duration Duration in seconds (undefined for permanent)
   * @param adminUserId ID of admin who initiated the ban
   */
  async banIp(
    ip: string,
    reason: string,
    duration?: number,
    adminUserId?: string
  ): Promise<boolean> {
    try {
      if (!redisService.isAvailable()) {
        logger.error("Cannot ban IP: Redis not available")
        return false
      }
      
      const banKey = `${this.banKeyPrefix}${ip}`
      const banData = JSON.stringify({
        reason,
        bannedAt: Date.now(),
        expiresAt: duration ? Date.now() + duration * 1000 : null,
        adminUserId
      })
      
      // Store ban in Redis with optional expiry
      if (duration) {
        await redisService.set(banKey, banData, duration)
      } else {
        await redisService.set(banKey, banData)
      }
      
      // Log the ban
      await securityLogService.logIpBanned(ip, reason, duration, adminUserId)
      
      logger.info(`IP ${ip} banned`, {
        ip,
        reason,
        duration,
        adminUserId
      })
      
      return true
    } catch (error) {
      logger.error("Error banning IP:", {
        error: error instanceof Error ? error.message : String(error),
        ip
      })
      return false
    }
  }
  
  /**
   * Unban an IP address
   * 
   * @param ip IP address to unban
   * @param reason Reason for the unban
   * @param adminUserId ID of admin who initiated the unban
   */
  async unbanIp(
    ip: string,
    reason?: string,
    adminUserId?: string
  ): Promise<boolean> {
    try {
      if (!redisService.isAvailable()) {
        logger.error("Cannot unban IP: Redis not available")
        return false
      }
      
      const banKey = `${this.banKeyPrefix}${ip}`
      
      // Check if IP is banned
      const banData = await redisService.get(banKey)
      if (!banData) {
        logger.warn(`Attempted to unban IP ${ip} that is not banned`)
        return false
      }
      
      // Remove ban
      await redisService.del(banKey)
      
      // Log the unban
      await securityLogService.logIpUnbanned(ip, reason, adminUserId)
      
      logger.info(`IP ${ip} unbanned`, {
        ip,
        reason,
        adminUserId
      })
      
      return true
    } catch (error) {
      logger.error("Error unbanning IP:", {
        error: error instanceof Error ? error.message : String(error),
        ip
      })
      return false
    }
  }
  
  /**
   * Check if an IP is banned
   * 
   * @param ip IP address to check
   * @returns Ban information if banned, null if not
   */
  async checkIpBan(ip: string): Promise<{
    banned: boolean
    reason?: string
    bannedAt?: number
    expiresAt?: number | null
  }> {
    try {
      if (!redisService.isAvailable()) {
        logger.error("Cannot check IP ban: Redis not available")
        return { banned: false }
      }
      
      const banKey = `${this.banKeyPrefix}${ip}`
      const banData = await redisService.get(banKey)
      
      if (!banData) {
        return { banned: false }
      }
      
      try {
        const banInfo = JSON.parse(banData)
        return {
          banned: true,
          reason: banInfo.reason,
          bannedAt: banInfo.bannedAt,
          expiresAt: banInfo.expiresAt
        }
      } catch (parseError) {
        // If data is not JSON, assume it's a simple ban flag
        return { banned: true }
      }
    } catch (error) {
      logger.error("Error checking IP ban:", {
        error: error instanceof Error ? error.message : String(error),
        ip
      })
      return { banned: false }
    }
  }
  
  /**
   * Record a violation for an IP address
   * May trigger automatic ban if threshold is exceeded
   * 
   * @param ip IP address
   * @param violationType Type of violation
   * @param details Additional details
   */
  async recordViolation(
    ip: string,
    violationType: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      if (!redisService.isAvailable()) {
        logger.error("Cannot record violation: Redis not available")
        return
      }
      
      const violationKey = `${this.violationKeyPrefix}${ip}`
      
      // Get current violations
      const violationsData = await redisService.get(violationKey)
      let violations = violationsData ? JSON.parse(violationsData) : []
      
      // Add new violation
      violations.push({
        type: violationType,
        timestamp: Date.now(),
        details
      })
      
      // Keep only last 100 violations
      if (violations.length > 100) {
        violations = violations.slice(-100)
      }
      
      // Store updated violations with 7-day expiry
      await redisService.set(
        violationKey,
        JSON.stringify(violations),
        60 * 60 * 24 * 7 // 7 days
      )
      
      // Check for auto-ban conditions
      await this.checkAutoBanConditions(ip, violations)
    } catch (error) {
      logger.error("Error recording violation:", {
        error: error instanceof Error ? error.message : String(error),
        ip
      })
    }
  }
  
  /**
   * Check if auto-ban conditions are met
   * 
   * @param ip IP address
   * @param violations List of violations
   */
  private async checkAutoBanConditions(
    ip: string,
    violations: Array<{
      type: string
      timestamp: number
      details?: Record<string, any>
    }>
  ): Promise<void> {
    try {
      // Check if already banned
      const banStatus = await this.checkIpBan(ip)
      if (banStatus.banned) {
        return
      }
      
      const now = Date.now()
      const oneHour = 60 * 60 * 1000
      const oneDay = 24 * oneHour
      
      // Count recent violations
      const lastHourViolations = violations.filter(
        v => now - v.timestamp < oneHour
      ).length
      
      const lastDayViolations = violations.filter(
        v => now - v.timestamp < oneDay
      ).length
      
      // Auto-ban conditions
      if (lastHourViolations >= 20) {
        // Ban for 24 hours if 20+ violations in the last hour
        await this.banIp(
          ip,
          "Automatic ban: Excessive violations in the last hour",
          60 * 60 * 24
        )
      } else if (lastDayViolations >= 50) {
        // Ban for 3 days if 50+ violations in the last day
        await this.banIp(
          ip,
          "Automatic ban: Excessive violations in the last day",
          60 * 60 * 24 * 3
        )
      }
    } catch (error) {
      logger.error("Error checking auto-ban conditions:", {
        error: error instanceof Error ? error.message : String(error),
        ip
      })
    }
  }
  
  /**
   * Get all banned IPs
   * 
   * @returns List of banned IPs with details
   */
  async getAllBannedIps(): Promise<Array<{
    ip: string
    reason?: string
    bannedAt?: number
    expiresAt?: number | null
  }>> {
    try {
      if (!redisService.isAvailable()) {
        logger.error("Cannot get banned IPs: Redis not available")
        return []
      }
      
      const keys = await redisService.keys(`${this.banKeyPrefix}*`)
      const result = []
      
      for (const key of keys) {
        const ip = key.replace(this.banKeyPrefix, "")
        const banData = await redisService.get(key)
        
        if (banData) {
          try {
            const banInfo = JSON.parse(banData)
            result.push({
              ip,
              reason: banInfo.reason,
              bannedAt: banInfo.bannedAt,
              expiresAt: banInfo.expiresAt
            })
          } catch (parseError) {
            // If data is not JSON, add with minimal info
            result.push({ ip })
          }
        }
      }
      
      return result
    } catch (error) {
      logger.error("Error getting banned IPs:", {
        error: error instanceof Error ? error.message : String(error)
      })
      return []
    }
  }
}

// Export singleton instance
export const ipBanService = new IpBanService()
