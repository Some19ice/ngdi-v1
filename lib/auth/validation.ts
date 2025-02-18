import { z } from "zod"
import { compare, hash } from "bcryptjs"

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

// Session validation schema
export const sessionSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
    role: z.enum(["ADMIN", "MODERATOR", "USER"]),
    organization: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
  }),
  expires: z.string().datetime(),
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
export function isSessionExpired(expires: Date): boolean {
  return new Date() > new Date(expires)
}

export function calculateSessionExpiry(rememberMe: boolean = false): Date {
  const now = new Date()
  // 30 days for remember me, 24 hours for regular session
  const expiryDays = rememberMe ? 30 : 1
  return new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000)
}

// Token utilities
export function generateToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join("")
}
