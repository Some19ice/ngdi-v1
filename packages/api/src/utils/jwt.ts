import { SignJWT, jwtVerify, decodeJwt } from "jose"
import { config } from "../config"
import { UserRole } from "../types/auth.types"
import { logger } from "../lib/logger"
import { redisService } from "../services/redis.service"
import {
  securityLogService,
  SecurityEventType,
} from "../services/security-log.service"
import crypto from "crypto"

// Convert string to Uint8Array for jose
const textEncoder = new TextEncoder()
const jwtSecret = textEncoder.encode(config.jwt.secret)
const refreshSecret = textEncoder.encode(config.jwt.refreshSecret) // Use the refresh secret for refresh tokens

// Constants for token security
const TOKEN_VERSION = 1 // Increment this when making breaking changes to token format
const DEFAULT_TOKEN_EXPIRY = "15m" // 15 minutes
const DEFAULT_REFRESH_EXPIRY = "7d" // 7 days

/**
 * JWT payload interface
 */
export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
  jti?: string // JWT ID for token identification
  iat?: number // Issued at timestamp
  exp?: number // Expiration timestamp
  sub?: string // Subject (usually userId)
  iss?: string // Issuer
  aud?: string // Audience
  deviceId?: string // Device identifier
  ipAddress?: string // IP address of the client
  userAgent?: string // User agent of the client
  family?: string // Token family for refresh token rotation
  version?: number // Token version for handling format changes
  sessionId?: string // Session identifier for tracking user sessions
  scope?: string[] // Token scope for permission control
  nonce?: string // Nonce for CSRF protection
  fingerprint?: string // Browser/device fingerprint for additional security
  issuedAt?: string // Human-readable issued at time
  expiresAt?: string // Human-readable expiration time
  [key: string]: unknown
}

/**
 * Token type enum
 */
export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  VERIFICATION = "verification",
  PASSWORD_RESET = "password_reset",
  INVITATION = "invitation",
}

/**
 * Token status enum
 */
export enum TokenStatus {
  VALID = "valid",
  EXPIRED = "expired",
  REVOKED = "revoked",
  INVALID = "invalid",
  SUPERSEDED = "superseded",
}

/**
 * Generate a random JWT ID
 */
export function generateJwtId(): string {
  return crypto.randomUUID()
}

/**
 * Generate a JWT token with enhanced security
 */
export async function generateToken(
  payload: JwtPayload,
  expiresIn = DEFAULT_TOKEN_EXPIRY,
  options: {
    includeJti?: boolean
    audience?: string
    issuer?: string
    type?: TokenType
    sessionId?: string
    scope?: string[]
    nonce?: string
    fingerprint?: string
  } = {}
): Promise<string> {
  try {
    // Add token version to payload
    const enhancedPayload = {
      ...payload,
      version: TOKEN_VERSION,
      type: options.type || TokenType.ACCESS,
    }

    // Add session ID if provided or generate one
    if (options.sessionId || payload.sessionId) {
      enhancedPayload.sessionId = options.sessionId || payload.sessionId
    }

    // Add scope if provided
    if (options.scope || payload.scope) {
      enhancedPayload.scope = options.scope || payload.scope
    }

    // Add nonce if provided
    if (options.nonce || payload.nonce) {
      enhancedPayload.nonce = options.nonce || payload.nonce
    }

    // Add fingerprint if provided
    if (options.fingerprint || payload.fingerprint) {
      enhancedPayload.fingerprint = options.fingerprint || payload.fingerprint
    }

    // Calculate human-readable timestamps
    const now = new Date()
    enhancedPayload.issuedAt = now.toISOString()

    // Calculate expiration time
    let expirationMs: number
    if (typeof expiresIn === "string") {
      // Parse string like "15m", "7d", etc.
      const match = expiresIn.match(/^(\d+)([smhdw])$/)
      if (match) {
        const value = parseInt(match[1])
        const unit = match[2]

        switch (unit) {
          case "s":
            expirationMs = value * 1000
            break
          case "m":
            expirationMs = value * 60 * 1000
            break
          case "h":
            expirationMs = value * 60 * 60 * 1000
            break
          case "d":
            expirationMs = value * 24 * 60 * 60 * 1000
            break
          case "w":
            expirationMs = value * 7 * 24 * 60 * 60 * 1000
            break
          default:
            expirationMs = 15 * 60 * 1000 // Default to 15 minutes
        }
      } else {
        expirationMs = 15 * 60 * 1000 // Default to 15 minutes
      }
    } else if (typeof expiresIn === "number") {
      expirationMs = expiresIn * 1000 // Convert seconds to milliseconds
    } else {
      expirationMs = 15 * 60 * 1000 // Default to 15 minutes
    }

    const expirationDate = new Date(now.getTime() + expirationMs)
    enhancedPayload.expiresAt = expirationDate.toISOString()

    // Create a new JWT with the enhanced payload
    let jwt = new SignJWT(enhancedPayload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setSubject(payload.userId) // Set subject to userId

    // Add JWT ID if requested (helps with token revocation)
    if (options.includeJti !== false) {
      jwt = jwt.setJti(payload.jti || generateJwtId())
    }

    // Set issuer if provided
    if (options.issuer || config.jwt.issuer) {
      jwt = jwt.setIssuer(options.issuer || config.jwt.issuer)
    }

    // Set audience if provided
    if (options.audience || config.jwt.audience) {
      jwt = jwt.setAudience(options.audience || config.jwt.audience)
    }

    // Sign the token
    const token = await jwt.sign(jwtSecret)

    // Log token generation (without sensitive data)
    logger.debug(`Generated ${enhancedPayload.type} token`, {
      userId: payload.userId,
      jti: jwt.payload.jti,
      expiresAt: enhancedPayload.expiresAt,
      sessionId: enhancedPayload.sessionId,
    })

    return token
  } catch (error) {
    logger.error("Error generating token:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: payload.userId,
    })
    throw error
  }
}

/**
 * Generate a refresh token with enhanced security
 */
export async function generateRefreshToken(
  payload: JwtPayload,
  expiresIn = DEFAULT_REFRESH_EXPIRY,
  options: {
    includeJti?: boolean
    audience?: string
    issuer?: string
    family?: string // Token family for refresh token rotation
    sessionId?: string
    scope?: string[]
    nonce?: string
    fingerprint?: string
    previousTokenId?: string // ID of the token being refreshed (for audit trail)
  } = {}
): Promise<string> {
  try {
    // Generate a token family if not provided
    const tokenFamily = options.family || payload.family || generateJwtId()

    // Generate a token ID if not provided
    const tokenId = payload.jti || generateJwtId()

    // Add token version and type to payload
    const enhancedPayload = {
      ...payload,
      version: TOKEN_VERSION,
      type: TokenType.REFRESH,
      family: tokenFamily,
    }

    // Add session ID if provided or generate one
    if (options.sessionId || payload.sessionId) {
      enhancedPayload.sessionId = options.sessionId || payload.sessionId
    }

    // Add scope if provided (typically more limited for refresh tokens)
    if (options.scope || payload.scope) {
      enhancedPayload.scope = options.scope || payload.scope
    }

    // Add nonce if provided
    if (options.nonce || payload.nonce) {
      enhancedPayload.nonce = options.nonce || payload.nonce
    }

    // Add fingerprint if provided
    if (options.fingerprint || payload.fingerprint) {
      enhancedPayload.fingerprint = options.fingerprint || payload.fingerprint
    }

    // Add previous token ID if provided (for audit trail)
    if (options.previousTokenId) {
      enhancedPayload.previousTokenId = options.previousTokenId
    }

    // Calculate human-readable timestamps
    const now = new Date()
    enhancedPayload.issuedAt = now.toISOString()

    // Calculate expiration time
    let expirationMs: number
    if (typeof expiresIn === "string") {
      // Parse string like "15m", "7d", etc.
      const match = expiresIn.match(/^(\d+)([smhdw])$/)
      if (match) {
        const value = parseInt(match[1])
        const unit = match[2]

        switch (unit) {
          case "s":
            expirationMs = value * 1000
            break
          case "m":
            expirationMs = value * 60 * 1000
            break
          case "h":
            expirationMs = value * 60 * 60 * 1000
            break
          case "d":
            expirationMs = value * 24 * 60 * 60 * 1000
            break
          case "w":
            expirationMs = value * 7 * 24 * 60 * 60 * 1000
            break
          default:
            expirationMs = 7 * 24 * 60 * 60 * 1000 // Default to 7 days
        }
      } else {
        expirationMs = 7 * 24 * 60 * 60 * 1000 // Default to 7 days
      }
    } else if (typeof expiresIn === "number") {
      expirationMs = expiresIn * 1000 // Convert seconds to milliseconds
    } else {
      expirationMs = 7 * 24 * 60 * 60 * 1000 // Default to 7 days
    }

    const expirationDate = new Date(now.getTime() + expirationMs)
    enhancedPayload.expiresAt = expirationDate.toISOString()

    // Create a new JWT with the enhanced payload
    let jwt = new SignJWT(enhancedPayload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setSubject(payload.userId) // Set subject to userId

    // Add JWT ID if requested (helps with token revocation)
    if (options.includeJti !== false) {
      jwt = jwt.setJti(tokenId)
    }

    // Set issuer if provided
    if (options.issuer || config.jwt.issuer) {
      jwt = jwt.setIssuer(options.issuer || config.jwt.issuer)
    }

    // Set audience if provided
    if (options.audience || config.jwt.audience) {
      jwt = jwt.setAudience(options.audience || config.jwt.audience)
    }

    // Sign the token with the refresh secret
    const token = await jwt.sign(refreshSecret)

    // Store the token family information for rotation
    await storeTokenFamily(tokenFamily, tokenId, expirationMs / 1000)

    // Log refresh token generation (without sensitive data)
    logger.debug(`Generated refresh token`, {
      userId: payload.userId,
      jti: tokenId,
      family: tokenFamily,
      expiresAt: enhancedPayload.expiresAt,
      sessionId: enhancedPayload.sessionId,
    })

    return token
  } catch (error) {
    logger.error("Error generating refresh token:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: payload.userId,
    })
    throw error
  }
}

/**
 * Verify a JWT token with enhanced security checks
 */
export async function verifyToken(
  token: string,
  options: {
    audience?: string
    issuer?: string
    checkExpiration?: boolean
    checkRevocation?: boolean
    checkFamily?: boolean
    type?: TokenType
  } = {}
): Promise<JwtPayload> {
  try {
    // Verify the token
    const { payload } = await jwtVerify(token, jwtSecret, {
      audience: options.audience || config.jwt.audience,
      issuer: options.issuer || config.jwt.issuer,
    })

    const jwtPayload = payload as JwtPayload

    // Check token version
    if (jwtPayload.version && jwtPayload.version !== TOKEN_VERSION) {
      logger.warn(
        `Token version mismatch: ${jwtPayload.version} vs ${TOKEN_VERSION}`,
        {
          jti: jwtPayload.jti,
          userId: jwtPayload.userId,
        }
      )
      throw new Error("Token version is not supported")
    }

    // Check token type if specified
    if (options.type && jwtPayload.type !== options.type) {
      logger.warn(
        `Token type mismatch: ${jwtPayload.type} vs ${options.type}`,
        {
          jti: jwtPayload.jti,
          userId: jwtPayload.userId,
        }
      )
      throw new Error(
        `Invalid token type: expected ${options.type}, got ${jwtPayload.type}`
      )
    }

    // Check if token is expired (if requested)
    if (options.checkExpiration !== false && payload.exp) {
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp < now) {
        logger.debug(`Token expired: ${jwtPayload.jti}`, {
          jti: jwtPayload.jti,
          userId: jwtPayload.userId,
          exp: payload.exp,
          now,
        })
        throw new Error("Token has expired")
      }
    }

    // Check if token is revoked (if requested)
    if (options.checkRevocation !== false && jwtPayload.jti) {
      const isRevoked = await isTokenRevoked(jwtPayload.jti)

      if (isRevoked) {
        logger.warn(`Revoked token used: ${jwtPayload.jti}`, {
          jti: jwtPayload.jti,
          userId: jwtPayload.userId,
        })
        throw new Error("Token has been revoked")
      }

      // If this is a refresh token, also check if the family is revoked
      if (jwtPayload.type === TokenType.REFRESH && jwtPayload.family) {
        const isFamilyRevoked = await isTokenFamilyRevoked(jwtPayload.family)

        if (isFamilyRevoked) {
          logger.warn(`Revoked token family used: ${jwtPayload.family}`, {
            jti: jwtPayload.jti,
            family: jwtPayload.family,
            userId: jwtPayload.userId,
          })
          throw new Error("Token family has been revoked")
        }
      }
    }

    // Check if token is the latest in its family (for refresh tokens)
    if (
      options.checkFamily !== false &&
      jwtPayload.type === TokenType.REFRESH &&
      jwtPayload.family &&
      jwtPayload.jti
    ) {
      const isLatest = await isLatestFamilyToken(
        jwtPayload.jti,
        jwtPayload.family
      )

      if (!isLatest) {
        logger.warn(`Superseded refresh token used: ${jwtPayload.jti}`, {
          jti: jwtPayload.jti,
          family: jwtPayload.family,
          userId: jwtPayload.userId,
        })
        throw new Error("Refresh token has been superseded")
      }
    }

    return jwtPayload
  } catch (error) {
    logger.error("Token verification failed:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw new Error(`Token verification failed: ${error.message}`)
  }
}

/**
 * Revoke a token by adding it to the blacklist
 */
export async function revokeToken(
  token: string,
  expiresIn: number = config.jwt.expiresIn
): Promise<void> {
  const { redisService } = await import("../services/redis.service")
  if (redisService.isAvailable()) {
    await redisService.blacklistToken(token, expiresIn)
  }
}

/**
 * Revoke all tokens for a user
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  const { redisService } = await import("../services/redis.service")
  if (redisService.isAvailable()) {
    // Add user to a blacklist that will be checked during token verification
    const key = `user_blacklist:${userId}`
    await redisService.set(
      key,
      Date.now().toString(),
      config.jwt.refreshExpiresIn
    )
  }
}

/**
 * Store token family information for refresh token rotation
 */
export async function storeTokenFamily(
  family: string,
  tokenId: string,
  expiresIn: number = config.jwt.refreshExpiresIn
): Promise<void> {
  const { redisService } = await import("../services/redis.service")
  if (redisService.isAvailable()) {
    const key = `token_family:${family}`
    await redisService.set(key, tokenId, expiresIn)
  }
}

/**
 * Verify a refresh token with enhanced security checks
 */
export async function verifyRefreshToken(
  token: string,
  options: {
    audience?: string
    issuer?: string
    checkExpiration?: boolean
    checkRevocation?: boolean
    checkFamily?: boolean
  } = {}
): Promise<JwtPayload> {
  try {
    // Verify the token using the refresh secret
    const { payload } = await jwtVerify(token, refreshSecret, {
      audience: options.audience || config.jwt.audience,
      issuer: options.issuer || config.jwt.issuer,
    })

    const jwtPayload = payload as JwtPayload

    // Check token version
    if (jwtPayload.version && jwtPayload.version !== TOKEN_VERSION) {
      logger.warn(
        `Token version mismatch: ${jwtPayload.version} vs ${TOKEN_VERSION}`,
        {
          jti: jwtPayload.jti,
          userId: jwtPayload.userId,
        }
      )
      throw new Error("Token version is not supported")
    }

    // Check token type
    if (jwtPayload.type !== TokenType.REFRESH) {
      logger.warn(`Invalid token type for refresh: ${jwtPayload.type}`, {
        jti: jwtPayload.jti,
        userId: jwtPayload.userId,
      })
      throw new Error(
        `Invalid token type: expected ${TokenType.REFRESH}, got ${jwtPayload.type}`
      )
    }

    // Check if token is expired (if requested)
    if (options.checkExpiration !== false && payload.exp) {
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp < now) {
        logger.debug(`Refresh token expired: ${jwtPayload.jti}`, {
          jti: jwtPayload.jti,
          userId: jwtPayload.userId,
          exp: payload.exp,
          now,
        })
        throw new Error("Refresh token has expired")
      }
    }

    // Check if token is revoked (if requested)
    if (options.checkRevocation !== false && jwtPayload.jti) {
      const isRevoked = await isTokenRevoked(jwtPayload.jti)

      if (isRevoked) {
        logger.warn(`Revoked refresh token used: ${jwtPayload.jti}`, {
          jti: jwtPayload.jti,
          userId: jwtPayload.userId,
        })
        throw new Error("Refresh token has been revoked")
      }

      // Also check if the family is revoked
      if (jwtPayload.family) {
        const isFamilyRevoked = await isTokenFamilyRevoked(jwtPayload.family)

        if (isFamilyRevoked) {
          logger.warn(`Revoked token family used: ${jwtPayload.family}`, {
            jti: jwtPayload.jti,
            family: jwtPayload.family,
            userId: jwtPayload.userId,
          })
          throw new Error("Token family has been revoked")
        }
      }
    }

    // Check if token is the latest in its family
    if (options.checkFamily !== false && jwtPayload.family && jwtPayload.jti) {
      const isLatest = await isLatestFamilyToken(
        jwtPayload.jti,
        jwtPayload.family
      )

      if (!isLatest) {
        logger.warn(`Superseded refresh token used: ${jwtPayload.jti}`, {
          jti: jwtPayload.jti,
          family: jwtPayload.family,
          userId: jwtPayload.userId,
        })

        // Revoke this token as it's been superseded
        await revokeToken(token, "Token superseded by newer refresh token")

        throw new Error("Refresh token has been superseded")
      }
    }

    return jwtPayload
  } catch (error) {
    logger.error("Refresh token verification failed:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw new Error(`Refresh token verification failed: ${error.message}`)
  }
}
