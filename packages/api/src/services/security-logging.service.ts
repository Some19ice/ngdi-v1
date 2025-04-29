import { createClient } from '@supabase/supabase-js'
import { supabaseAuthConfig } from "../config/supabase-auth.config"

/**
 * Security event types for logging
 */
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  SIGNUP_SUCCESS = 'signup_success',
  SIGNUP_FAILURE = 'signup_failure',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  PASSWORD_RESET_FAILURE = 'password_reset_failure',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  PERMISSION_DENIED = 'permission_denied',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}

/**
 * Interface for security log entry
 */
export interface SecurityLogEntry {
  event_type: SecurityEventType
  user_id?: string
  email?: string
  ip_address?: string
  user_agent?: string
  details?: Record<string, any>
  created_at?: string
}

/**
 * Service for logging security events
 */
export class SecurityLoggingService {
  private supabase = createClient(
    supabaseAuthConfig.url,
    supabaseAuthConfig.serviceRoleKey
  )

  /**
   * Log a security event
   * @param entry Security log entry
   * @returns Promise with the result of the log operation
   */
  async logSecurityEvent(entry: SecurityLogEntry): Promise<any> {
    try {
      // Add timestamp if not provided
      if (!entry.created_at) {
        entry.created_at = new Date().toISOString()
      }

      // Insert the log entry into the security_logs table
      const { data, error } = await this.supabase
        .from("security_logs")
        .insert([entry])

      if (error) {
        console.error("Error logging security event:", error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error("Exception logging security event:", error)
      return { success: false, error }
    }
  }

  /**
   * Get security logs for a specific user
   * @param userId User ID
   * @param limit Maximum number of logs to return
   * @returns Promise with the security logs
   */
  async getUserSecurityLogs(userId: string, limit = 100): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from("security_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching user security logs:", error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error("Exception fetching user security logs:", error)
      return { success: false, error }
    }
  }

  /**
   * Get all security logs with filtering options
   * @param options Filter options
   * @returns Promise with the security logs
   */
  async getSecurityLogs(options: {
    eventType?: SecurityEventType
    userId?: string
    email?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<any> {
    try {
      let query = this.supabase
        .from("security_logs")
        .select("*")
        .order("created_at", { ascending: false })

      if (options.eventType) {
        query = query.eq("event_type", options.eventType)
      }

      if (options.userId) {
        query = query.eq("user_id", options.userId)
      }

      if (options.email) {
        query = query.eq("email", options.email)
      }

      if (options.startDate) {
        query = query.gte("created_at", options.startDate)
      }

      if (options.endDate) {
        query = query.lte("created_at", options.endDate)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        )
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching security logs:", error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error("Exception fetching security logs:", error)
      return { success: false, error }
    }
  }
}

// Export a singleton instance
export const securityLoggingService = new SecurityLoggingService()
