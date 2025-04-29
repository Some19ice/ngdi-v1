/**
 * Zod validation schema for auth configuration
 * This ensures runtime type safety for configuration values
 */

import { z } from "zod"
import { UserRole } from "./constants"

/**
 * Branded type for sensitive values
 */
export type SensitiveValue = string & { readonly _brand: unique symbol }

/**
 * Create a branded type for sensitive values
 */
export function createSensitiveValue(value: string): SensitiveValue {
  return value as SensitiveValue
}

/**
 * Route configuration schema
 */
export const routesSchema = z.object({
  protected: z.array(z.string().startsWith("/")),
  admin: z.array(z.string().startsWith("/")),
  nodeOfficer: z.array(z.string().startsWith("/")),
  debug: z.array(z.string().startsWith("/")).optional(),
})

/**
 * Session configuration schema
 */
export const sessionSchema = z.object({
  maxAge: z.number().int().positive(),
  updateAge: z.number().int().positive(),
  rememberMeAge: z.number().int().positive(),
})

/**
 * Password requirements schema
 */
export const passwordRequirementsSchema = z.object({
  minLength: z.number().int().min(8),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
})

/**
 * Rate limiting configuration schema
 */
export const rateLimitingSchema = z.object({
  maxAttempts: z.number().int().positive(),
  windowMs: z.number().int().positive(),
})

/**
 * Security configuration schema
 */
export const securitySchema = z.object({
  passwordMinLength: z.number().int().min(8),
  passwordMaxLength: z.number().int().min(12),
  maxLoginAttempts: z.number().int().positive(),
  lockoutDuration: z.number().int().positive(),
  jwtMaxAge: z.number().int().positive(),
  refreshTokenMaxAge: z.number().int().positive(),
  csrfTokenMaxAge: z.number().int().positive(),
  passwordRequirements: passwordRequirementsSchema,
  rateLimiting: rateLimitingSchema,
})

/**
 * Cookie configuration schema
 */
export const cookiesSchema = z.object({
  prefix: z.string(),
  path: z.string(),
  domain: z.string().optional(),
  secure: z.boolean(),
  sameSite: z.enum(["strict", "lax", "none"]),
  httpOnly: z.boolean(),
  maxAge: z.number().int().positive(),
})

/**
 * Role configuration schema
 */
export const rolesSchema = z.object({
  default: z.nativeEnum(UserRole),
  available: z.array(z.nativeEnum(UserRole)),
})

/**
 * Pages configuration schema
 */
export const pagesSchema = z.object({
  signIn: z.string().startsWith("/"),
  signOut: z.string().startsWith("/"),
  error: z.string().startsWith("/"),
  verifyRequest: z.string().startsWith("/"),
  newUser: z.string().startsWith("/"),
  unauthorized: z.string().startsWith("/"),
})

/**
 * Event logging configuration schema
 */
export const eventsSchema = z.object({
  maxLogRetention: z.number().int().positive(),
  logKeys: z.record(z.string(), z.string()),
})

/**
 * URL configuration schema
 */
export const urlsSchema = z.object({
  baseUrl: z.string().url().optional(),
  allowedRedirects: z.array(z.string().startsWith("/")),
  signIn: z.string().startsWith("/"),
  signUp: z.string().startsWith("/"),
  signOut: z.string().startsWith("/"),
  verifyEmail: z.string().startsWith("/"),
  resetPassword: z.string().startsWith("/"),
  callback: z.string().startsWith("/"),
  error: z.string().startsWith("/"),
  default: z.string().startsWith("/"),
})

/**
 * Cache configuration schema
 */
export const cacheSchema = z.object({
  permissionDuration: z.number().int().positive(),
  sessionDuration: z.number().int().positive(),
  refreshThreshold: z.number().int().positive(),
})

/**
 * Logging configuration schema
 */
export const loggingSchema = z.object({
  level: z.enum(["error", "warn", "info", "debug"]),
  maxRetention: z.number().int().positive(),
  sensitiveFields: z.array(z.string()),
  events: z.record(z.string(), z.boolean()),
})

/**
 * Supabase configuration schema
 */
export const supabaseSchema = z.object({
  url: z.string().url().optional(),
  anonKey: z.string().optional(),
  serviceKey: z.string().optional(),
})

/**
 * Provider configuration schema
 */
export const providersSchema = z.object({
  google: z.object({
    enabled: z.boolean(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
  }),
  email: z.object({
    from: z.string().email(),
    maxTokenAge: z.number().int().positive(),
  }),
})

/**
 * Complete auth configuration schema
 */
export const authConfigSchema = z.object({
  routes: routesSchema,
  session: sessionSchema,
  security: securitySchema,
  cookies: cookiesSchema,
  roles: rolesSchema,
  pages: pagesSchema,
  events: eventsSchema,
  urls: urlsSchema,
  cache: cacheSchema,
  logging: loggingSchema,
  supabase: supabaseSchema,
  providers: providersSchema,
})

/**
 * Type for the auth configuration
 */
export type AuthConfig = z.infer<typeof authConfigSchema>

/**
 * Validate the auth configuration
 * @param config The configuration to validate
 * @returns The validated configuration
 * @throws If the configuration is invalid
 */
export function validateAuthConfig(config: unknown): AuthConfig {
  return authConfigSchema.parse(config)
}
