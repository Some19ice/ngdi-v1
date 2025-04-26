import { SignJWT, jwtVerify } from "jose"
import { config } from "../config"
import { UserRole } from "../types/auth.types"

// Convert string to Uint8Array for jose
const textEncoder = new TextEncoder()
const jwtSecret = textEncoder.encode(config.jwt.secret)
const refreshSecret = textEncoder.encode(config.jwt.refreshSecret) // Use the refresh secret for refresh tokens

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
  [key: string]: unknown
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
  expiresIn = config.jwt.expiresIn,
  options: {
    includeJti?: boolean
    audience?: string
    issuer?: string
  } = {}
): Promise<string> {
  // Create a new JWT with the payload
  let jwt = new SignJWT({ ...payload })
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

  return token
}

/**
 * Generate a refresh token with enhanced security
 */
export async function generateRefreshToken(
  payload: JwtPayload,
  expiresIn = config.jwt.refreshExpiresIn,
  options: {
    includeJti?: boolean
    audience?: string
    issuer?: string
    family?: string // Token family for refresh token rotation
  } = {}
): Promise<string> {
  // Create a new JWT with the payload
  let jwt = new SignJWT({
    ...payload,
    // Add token family if provided (for refresh token rotation)
    family: options.family || payload.family || generateJwtId(),
  })
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

  // Sign the token with the refresh secret
  const token = await jwt.sign(refreshSecret)

  return token
}

/**
 * Verify a JWT token with enhanced security checks
 */
export async function verifyToken(
  token: string,
  options: {
    audience?: string
    issuer?: string
    checkBlacklist?: boolean
  } = {}
): Promise<JwtPayload> {
  try {
    // Check if token is blacklisted
    if (options.checkBlacklist !== false) {
      const { redisService } = await import("../services/redis.service")
      if (
        redisService.isAvailable() &&
        (await redisService.isTokenBlacklisted(token))
      ) {
        throw new Error("Token has been revoked")
      }
    }

    // Verify the token
    const { payload } = await jwtVerify(token, jwtSecret, {
      // Add additional verification options
      issuer: options.issuer || config.jwt.issuer,
      audience: options.audience || config.jwt.audience,
    })

    return payload as unknown as JwtPayload
  } catch (error) {
    console.error("Token verification error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Invalid token")
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

export async function verifyRefreshToken(
  token: string,
  options: {
    audience?: string
    issuer?: string
    checkBlacklist?: boolean
    checkFamily?: boolean
  } = {}
): Promise<JwtPayload> {
  try {
    // Check if token is blacklisted
    if (options.checkBlacklist !== false) {
      const { redisService } = await import("../services/redis.service")
      if (
        redisService.isAvailable() &&
        (await redisService.isTokenBlacklisted(token))
      ) {
        throw new Error("Refresh token has been revoked")
      }
    }

    // Verify the token
    const { payload } = await jwtVerify(token, refreshSecret, {
      // Add additional verification options
      issuer: options.issuer || config.jwt.issuer,
      audience: options.audience || config.jwt.audience,
    })

    // Check if the token family has been revoked (for refresh token rotation)
    if (options.checkFamily !== false && payload.family) {
      const { redisService } = await import("../services/redis.service")
      if (redisService.isAvailable()) {
        const familyKey = `token_family:${payload.family}`
        const latestTokenId = await redisService.get(familyKey)

        // If we have a record of this family but with a different token ID,
        // it means this token has been superseded by a newer one
        if (latestTokenId && latestTokenId !== payload.jti) {
          // Blacklist this token as it's been superseded
          await redisService.blacklistToken(token)
          throw new Error("Refresh token has been superseded")
        }
      }
    }

    return payload as unknown as JwtPayload
  } catch (error) {
    console.error("Refresh token verification error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Invalid refresh token")
  }
}
