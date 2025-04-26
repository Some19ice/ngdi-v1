import { jwtVerify, decodeJwt } from "jose"
import { config } from "../config"
import { JwtPayload } from "../utils/jwt"
import { redisService } from "./redis.service"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { prisma } from "../lib/prisma"
import { securityLogService, SecurityEventType } from "./security-log.service"

// Convert string to Uint8Array for jose
const textEncoder = new TextEncoder()
const jwtSecret = textEncoder.encode(config.jwt.secret)
const refreshSecret = textEncoder.encode(config.jwt.refreshSecret)

// Simple in-memory cache for token validation results
const tokenCache = new Map<
  string,
  {
    userId: string
    email: string
    role: string
    expiry: number
    timestamp: number
  }
>()

// Cache expiration time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000

/**
 * Token validation result interface
 */
export interface TokenValidationResult {
  isValid: boolean
  userId?: string
  email?: string
  role?: string
  exp?: number
  error?: string
  details?: Record<string, any>
}

/**
 * Token validation service
 * Provides unified token validation logic for the application
 */
export class TokenValidationService {
  /**
   * Validate an access token with full security checks
   */
  async validateAccessToken(
    token: string,
    options: {
      audience?: string
      issuer?: string
      checkBlacklist?: boolean
      logFailures?: boolean
      clientInfo?: {
        ipAddress?: string
        userAgent?: string
        deviceId?: string
      }
    } = {}
  ): Promise<TokenValidationResult> {
    try {
      // Check cache first for performance
      const cachedResult = this.getCachedValidation(token)
      if (cachedResult) {
        return {
          isValid: true,
          userId: cachedResult.userId,
          email: cachedResult.email,
          role: cachedResult.role,
          exp: cachedResult.expiry
        }
      }

      // Perform quick validation first (faster)
      const quickResult = this.quickValidateToken(token)
      if (!quickResult.isValid) {
        // Log validation failure if requested
        if (options.logFailures && options.clientInfo) {
          await this.logValidationFailure(
            token,
            quickResult.error || "Unknown error",
            options.clientInfo
          )
        }
        return quickResult
      }

      // Check if token is blacklisted
      if (options.checkBlacklist !== false && redisService.isAvailable()) {
        const isBlacklisted = await redisService.isTokenBlacklisted(token)
        if (isBlacklisted) {
          // Log validation failure if requested
          if (options.logFailures && options.clientInfo) {
            await this.logValidationFailure(
              token,
              "Token has been revoked",
              options.clientInfo
            )
          }
          return {
            isValid: false,
            error: "Token has been revoked"
          }
        }
      }

      // Verify the token with full cryptographic validation
      const { payload } = await jwtVerify(token, jwtSecret, {
        issuer: options.issuer || config.jwt.issuer,
        audience: options.audience || config.jwt.audience
      })

      const jwtPayload = payload as unknown as JwtPayload

      // Cache the successful validation result
      this.cacheValidationResult(token, jwtPayload)

      return {
        isValid: true,
        userId: jwtPayload.userId,
        email: jwtPayload.email,
        role: jwtPayload.role,
        exp: jwtPayload.exp
      }
    } catch (error) {
      // Log validation failure if requested
      if (options.logFailures && options.clientInfo) {
        await this.logValidationFailure(
          token,
          error instanceof Error ? error.message : "Unknown error",
          options.clientInfo
        )
      }

      console.error("Token validation error:", error)
      
      // Return appropriate error based on the type
      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          return {
            isValid: false,
            error: "Token has expired"
          }
        }
        return {
          isValid: false,
          error: error.message
        }
      }
      
      return {
        isValid: false,
        error: "Invalid token"
      }
    }
  }

  /**
   * Validate a refresh token with full security checks
   */
  async validateRefreshToken(
    token: string,
    options: {
      audience?: string
      issuer?: string
      checkBlacklist?: boolean
      checkFamily?: boolean
      logFailures?: boolean
      clientInfo?: {
        ipAddress?: string
        userAgent?: string
        deviceId?: string
      }
    } = {}
  ): Promise<TokenValidationResult> {
    try {
      // Perform quick validation first (faster)
      const quickResult = this.quickValidateToken(token)
      if (!quickResult.isValid) {
        // Log validation failure if requested
        if (options.logFailures && options.clientInfo) {
          await this.logValidationFailure(
            token,
            quickResult.error || "Unknown error",
            options.clientInfo,
            true
          )
        }
        return quickResult
      }

      // Check if token is blacklisted
      if (options.checkBlacklist !== false && redisService.isAvailable()) {
        const isBlacklisted = await redisService.isTokenBlacklisted(token)
        if (isBlacklisted) {
          // Log validation failure if requested
          if (options.logFailures && options.clientInfo) {
            await this.logValidationFailure(
              token,
              "Refresh token has been revoked",
              options.clientInfo,
              true
            )
          }
          return {
            isValid: false,
            error: "Refresh token has been revoked"
          }
        }
      }

      // Verify the token with full cryptographic validation
      const { payload } = await jwtVerify(token, refreshSecret, {
        issuer: options.issuer || config.jwt.issuer,
        audience: options.audience || config.jwt.audience
      })

      const jwtPayload = payload as unknown as JwtPayload

      // Check if the token family has been revoked (for refresh token rotation)
      if (options.checkFamily !== false && jwtPayload.family && redisService.isAvailable()) {
        const familyKey = `token_family:${jwtPayload.family}`
        const latestTokenId = await redisService.get(familyKey)
        
        // If we have a record of this family but with a different token ID,
        // it means this token has been superseded by a newer one
        if (latestTokenId && latestTokenId !== jwtPayload.jti) {
          // Log validation failure if requested
          if (options.logFailures && options.clientInfo) {
            await this.logValidationFailure(
              token,
              "Refresh token has been superseded",
              options.clientInfo,
              true
            )
          }
          
          // Blacklist this token as it's been superseded
          await redisService.blacklistToken(token)
          
          return {
            isValid: false,
            error: "Refresh token has been superseded"
          }
        }
      }

      return {
        isValid: true,
        userId: jwtPayload.userId,
        email: jwtPayload.email,
        role: jwtPayload.role,
        exp: jwtPayload.exp,
        details: {
          family: jwtPayload.family,
          jti: jwtPayload.jti
        }
      }
    } catch (error) {
      // Log validation failure if requested
      if (options.logFailures && options.clientInfo) {
        await this.logValidationFailure(
          token,
          error instanceof Error ? error.message : "Unknown error",
          options.clientInfo,
          true
        )
      }

      console.error("Refresh token validation error:", error)
      
      // Return appropriate error based on the type
      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          return {
            isValid: false,
            error: "Refresh token has expired"
          }
        }
        return {
          isValid: false,
          error: error.message
        }
      }
      
      return {
        isValid: false,
        error: "Invalid refresh token"
      }
    }
  }

  /**
   * Quick validation of JWT token (synchronous)
   * This performs basic validation without cryptographic verification
   */
  quickValidateToken(token: string): TokenValidationResult {
    try {
      // Basic validation
      if (!token || token.trim() === "") {
        return { isValid: false, error: "Empty token provided" }
      }

      // Check token format
      if (!token.includes(".") || token.split(".").length !== 3) {
        return {
          isValid: false,
          error: "Invalid token format (not a JWT)"
        }
      }

      // Decode the token without verification (fast operation)
      try {
        const decoded = decodeJwt(token)

        // Check expiration
        const currentTime = Math.floor(Date.now() / 1000)
        if (decoded.exp && decoded.exp < currentTime) {
          return { 
            isValid: false, 
            error: "Token expired",
            exp: decoded.exp
          }
        }

        // Extract user information
        const userId =
          typeof decoded.sub === "string"
            ? decoded.sub
            : typeof decoded.userId === "string"
              ? decoded.userId
              : ""

        if (!userId) {
          return { isValid: false, error: "Missing user ID in token" }
        }

        return { 
          isValid: true,
          userId,
          email: typeof decoded.email === "string" ? decoded.email : undefined,
          role: typeof decoded.role === "string" ? decoded.role : undefined,
          exp: typeof decoded.exp === "number" ? decoded.exp : undefined
        }
      } catch (decodeError) {
        return { isValid: false, error: "Failed to decode token" }
      }
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : "Unknown validation error" 
      }
    }
  }

  /**
   * Get cached validation result
   */
  private getCachedValidation(
    token: string
  ): { userId: string; email: string; role: string; expiry: number } | null {
    const cached = tokenCache.get(token)
    
    if (!cached) {
      return null
    }
    
    // Check if cache entry is expired
    const now = Date.now()
    if (now - cached.timestamp > CACHE_EXPIRY) {
      tokenCache.delete(token)
      return null
    }
    
    // Check if token itself is expired
    const currentTime = Math.floor(now / 1000)
    if (cached.expiry < currentTime) {
      tokenCache.delete(token)
      return null
    }
    
    return cached
  }

  /**
   * Cache validation result
   */
  private cacheValidationResult(token: string, payload: JwtPayload): void {
    try {
      // Only cache if we have the necessary information
      if (payload.userId && payload.exp) {
        tokenCache.set(token, {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          expiry: payload.exp,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      // If caching fails, just log and continue (non-critical)
      console.warn("Failed to cache token validation result:", error)
    }
  }

  /**
   * Log token validation failure
   */
  private async logValidationFailure(
    token: string,
    reason: string,
    clientInfo: {
      ipAddress?: string
      userAgent?: string
      deviceId?: string
    },
    isRefreshToken: boolean = false
  ): Promise<void> {
    try {
      // Try to extract user info from token without verification
      let userId: string | undefined
      let email: string | undefined
      
      try {
        const decoded = decodeJwt(token)
        userId = decoded.sub?.toString() || decoded.userId?.toString()
        email = decoded.email?.toString()
      } catch (error) {
        // Ignore decode errors
      }
      
      // Log the validation failure
      await securityLogService.logEvent({
        userId,
        email,
        eventType: SecurityEventType.TOKEN_VALIDATION_FAILURE,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        deviceId: clientInfo.deviceId,
        details: {
          reason,
          isRefreshToken,
          tokenFragment: token.length > 10 ? `${token.substring(0, 10)}...` : token
        }
      })
    } catch (error) {
      // Ensure logging errors don't break the application
      console.error("Error logging token validation failure:", error)
    }
  }

  /**
   * Validate a user exists and is active
   */
  async validateUser(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, locked: true }
      })
      
      // User must exist and not be locked
      return !!user && !user.locked
    } catch (error) {
      console.error("User validation error:", error)
      return false
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(header: string): string {
    if (!header) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "No authorization header provided",
        401
      )
    }
    
    const [type, token] = header.split(" ")
    
    if (type !== "Bearer" || !token) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "Invalid authorization header format",
        401
      )
    }
    
    return token
  }

  /**
   * Get token from request (header or cookie)
   */
  getTokenFromRequest(c: any): string {
    // Try to get from Authorization header first
    const authHeader = c.req.header("Authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return this.extractTokenFromHeader(authHeader)
    }
    
    // If not in header, try to get from cookies
    const cookieHeader = c.req.raw.headers.get("cookie")
    if (cookieHeader) {
      const cookies = cookieHeader.split(";")
      
      // Try multiple possible cookie names
      const possibleCookieNames = ["auth_token", "accessToken", "token"]
      
      for (const cookieName of possibleCookieNames) {
        const authCookie = cookies.find((cookie) =>
          cookie.trim().startsWith(`${cookieName}=`)
        )
        
        if (authCookie) {
          return authCookie.split("=")[1]
        }
      }
    }
    
    throw new AuthError(
      AuthErrorCode.INVALID_TOKEN,
      "No authentication token found",
      401
    )
  }
}

// Export singleton instance
export const tokenValidationService = new TokenValidationService()
