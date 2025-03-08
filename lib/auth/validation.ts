import { z } from "zod"
import { compare, hash } from "bcryptjs"
import { AUTH_CONFIG } from "./config"
import { UserRole } from "./types"

// Password validation schema
export const passwordSchema = z
  .string()
  .min(AUTH_CONFIG.security.passwordMinLength)
  .max(AUTH_CONFIG.security.passwordMaxLength)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

// Session validation schema with enhanced checks
export const sessionSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]),
    organization: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    emailVerified: z.date().nullable(),
    lastLogin: z.date().optional(),
    failedLoginAttempts: z.number().min(0).optional(),
    lastFailedLogin: z.date().optional(),
  }),
  expires: z.string().datetime(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  error: z.string().optional(),
})

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

// Session security utilities
export function isSessionExpired(expires: Date | string): boolean {
  const expiryDate = new Date(expires)
  const now = new Date()
  return now > expiryDate
}

export function calculateSessionExpiry(rememberMe: boolean = false): Date {
  const now = new Date()
  const maxAge = rememberMe
    ? AUTH_CONFIG.session.rememberMeAge
    : AUTH_CONFIG.session.maxAge
  return new Date(now.getTime() + maxAge * 1000)
}

export function shouldRefreshSession(expires: Date | string): boolean {
  const expiryDate = new Date(expires)
  const now = new Date()
  const refreshThreshold = AUTH_CONFIG.cache.refreshThreshold
  return expiryDate.getTime() - now.getTime() <= refreshThreshold
}

export function validateLoginAttempts(
  failedAttempts: number,
  lastFailedLogin?: Date
): { allowed: boolean; remainingTime?: number } {
  if (failedAttempts >= AUTH_CONFIG.security.maxLoginAttempts) {
    if (lastFailedLogin) {
      const blockEnd = new Date(
        lastFailedLogin.getTime() + AUTH_CONFIG.security.rateLimiting.windowMs
      )
      const now = new Date()
      if (now < blockEnd) {
        return {
          allowed: false,
          remainingTime: Math.ceil((blockEnd.getTime() - now.getTime()) / 1000),
        }
      }
    }
  }
  return { allowed: true }
}

export function sanitizeSession(
  session: unknown
): z.infer<typeof sessionSchema> | null {
  try {
    return sessionSchema.parse(session)
  } catch (error) {
    console.error("Session validation failed:", error)
    return null
  }
}

// Token utilities
export function generateToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join("")
}
