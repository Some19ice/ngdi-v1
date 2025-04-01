import * as jose from "jose"
import { UserRole } from "@prisma/client"

/**
 * Interface for token validation results
 */
export interface TokenValidationResult {
  isValid: boolean
  userId?: string
  email?: string
  role?: UserRole
  error?: string
  exp?: number
}

/**
 * Cache for token validation results to reduce repeated validation
 */
interface CachedValidation {
  token: string
  result: TokenValidationResult
  timestamp: number
}

const validationCache: CachedValidation[] = []
const MAX_CACHE_SIZE = 100
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Clean expired entries from the validation cache
 */
function cleanCache() {
  const now = Date.now()
  const validEntries = validationCache.filter(
    (entry) => now - entry.timestamp < CACHE_TTL
  )

  if (validEntries.length < validationCache.length) {
    validationCache.length = 0
    validationCache.push(...validEntries)
  }
}

/**
 * Get cached validation result for a token
 */
export function getCachedValidation(token: string): TokenValidationResult | null {
  cleanCache()
  const entry = validationCache.find((e) => e.token === token)
  return entry ? entry.result : null
}

/**
 * Store validation result in cache
 */
export function cacheValidationResult(token: string, result: TokenValidationResult) {
  cleanCache()

  // Remove oldest entry if at capacity
  if (validationCache.length >= MAX_CACHE_SIZE) {
    validationCache.shift()
  }

  validationCache.push({
    token,
    result,
    timestamp: Date.now(),
  })
}

/**
 * Quick validation of JWT token (synchronous)
 * This performs basic validation without cryptographic verification
 */
export function quickValidateToken(token: string): TokenValidationResult {
  try {
    // Check cache first
    const cachedResult = getCachedValidation(token)
    if (cachedResult) {
      return cachedResult
    }

    // Basic validation
    if (!token || token.trim() === "") {
      const result = { isValid: false, error: "Empty token provided" }
      cacheValidationResult(token, result)
      return result
    }

    // Check token format
    if (!token.includes(".") || token.split(".").length !== 3) {
      const result = {
        isValid: false,
        error: "Invalid token format (not a JWT)",
      }
      cacheValidationResult(token, result)
      return result
    }

    // Decode the token without verification (fast operation)
    try {
      const decoded = jose.decodeJwt(token)

      // Check expiration
      const currentTime = Math.floor(Date.now() / 1000)
      if (decoded.exp && decoded.exp < currentTime) {
        const result = { 
          isValid: false, 
          error: "Token expired",
          exp: decoded.exp
        }
        cacheValidationResult(token, result)
        return result
      }

      // Extract user information
      const userId =
        typeof decoded.sub === "string"
          ? decoded.sub
          : typeof decoded.userId === "string"
            ? decoded.userId
            : ""

      if (!userId) {
        const result = { isValid: false, error: "Missing user ID in token" }
        cacheValidationResult(token, result)
        return result
      }

      const email = typeof decoded.email === "string" ? decoded.email : "unknown"
      
      // Normalize role
      let role: UserRole | undefined
      const roleValue = decoded.role as string
      
      if (roleValue) {
        const upperRole = roleValue.toUpperCase()
        if (Object.values(UserRole).includes(upperRole as UserRole)) {
          role = upperRole as UserRole
        } else {
          role = UserRole.USER
        }
      } else {
        role = UserRole.USER
      }

      const result = {
        isValid: true,
        userId,
        email,
        role,
        exp: decoded.exp as number,
      }

      cacheValidationResult(token, result)
      return result
    } catch (error) {
      const result = {
        isValid: false,
        error: `JWT decode error: ${error instanceof Error ? error.message : String(error)}`,
      }
      cacheValidationResult(token, result)
      return result
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
} 