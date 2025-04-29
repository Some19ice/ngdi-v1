import { UserRole } from "./constants"
import {
  authConfigSchema,
  validateAuthConfig,
  createSensitiveValue,
} from "./config-schema"

/**
 * Consolidated Supabase Auth Configuration
 * This file contains all configuration related to Supabase authentication
 */
const authConfig = {
  /**
   * Routes configuration
   */
  routes: {
    /**
     * Routes that require authentication
     */
    protected: [
      "/dashboard",
      "/profile",
      "/metadata",
      "/search",
      "/map",
      "/news",
      "/gallery",
    ],

    /**
     * Routes that require admin role
     */
    admin: [
      "/admin",
      "/admin/analytics",
      "/admin/users",
      "/admin/settings",
      "/admin/metadata",
      "/admin/organizations",
      "/settings/admin",
    ],

    /**
     * Routes that require node officer role
     */
    nodeOfficer: [
      "/node",
      "/metadata/create",
      "/metadata/edit",
      "/metadata/add",
    ],

    /**
     * Debug routes that bypass middleware protection
     */
    debug: ["/admin-debug", "/test-middleware", "/api/auth-debug"],
  },

  /**
   * Session configuration
   */
  session: {
    /**
     * Maximum age of the session in seconds
     */
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds

    /**
     * How often to update the session in seconds
     */
    updateAge: 4 * 60 * 60, // Refresh every 4 hours

    /**
     * Maximum age of the session when "remember me" is checked
     */
    rememberMeAge: 30 * 24 * 60 * 60, // 30 days for remember me
  },

  /**
   * Security configuration
   */
  security: {
    /**
     * Minimum password length
     */
    passwordMinLength: 12,

    /**
     * Maximum password length
     */
    passwordMaxLength: 100,

    /**
     * Maximum login attempts before account lockout
     */
    maxLoginAttempts: 5,

    /**
     * Lockout duration in seconds
     */
    lockoutDuration: 15 * 60, // 15 minutes in seconds

    /**
     * JWT token maximum age in seconds
     */
    jwtMaxAge: 24 * 60 * 60, // 24 hours

    /**
     * Refresh token maximum age in seconds
     */
    refreshTokenMaxAge: 7 * 24 * 60 * 60, // 7 days

    /**
     * CSRF token maximum age in seconds
     */
    csrfTokenMaxAge: 1 * 60 * 60, // 1 hour

    /**
     * Password requirements
     */
    passwordRequirements: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },

    /**
     * Rate limiting configuration
     */
    rateLimiting: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
  },

  /**
   * Cookie configuration
   */
  cookies: {
    /**
     * Prefix for auth cookies
     */
    prefix: "sb",

    /**
     * Path for auth cookies
     */
    path: "/",

    /**
     * Domain for auth cookies
     */
    domain: undefined, // Let Supabase handle the domain automatically

    /**
     * Whether cookies should be secure (HTTPS only)
     */
    secure: process.env.NODE_ENV === "production",

    /**
     * SameSite policy for cookies
     */
    sameSite: "lax" as const,

    /**
     * Whether cookies should be HTTP only
     */
    httpOnly: true,

    /**
     * Maximum age of cookies in seconds
     */
    maxAge: 24 * 60 * 60, // 24 hours
  },

  /**
   * Role configuration
   */
  roles: {
    /**
     * Default role for new users
     */
    default: UserRole.USER,

    /**
     * Available roles
     */
    available: Object.values(UserRole),
  },

  /**
   * Page paths configuration
   */
  pages: {
    /**
     * Sign in page path
     */
    signIn: "/auth/signin",

    /**
     * Sign out page path
     */
    signOut: "/auth/signout",

    /**
     * Error page path
     */
    error: "/auth/error",

    /**
     * Verification request page path
     */
    verifyRequest: "/auth/verify",

    /**
     * New user page path
     */
    newUser: "/auth/new-user",

    /**
     * Unauthorized page path
     */
    unauthorized: "/auth/unauthorized",
  },

  /**
   * Event logging configuration
   */
  events: {
    /**
     * Maximum log retention in seconds
     */
    maxLogRetention: 30 * 24 * 60 * 60, // 30 days

    /**
     * Log keys for different events
     */
    logKeys: {
      signIn: "auth:logs:signin",
      signOut: "auth:logs:signout",
      passwordReset: "auth:logs:password-reset",
      profileUpdate: "auth:logs:profile-update",
      verificationRequest: "auth:logs:verification",
    },
  },

  /**
   * URL configuration
   */
  urls: {
    /**
     * Base URL for the application
     */
    baseUrl: process.env.NEXTAUTH_URL,

    /**
     * Allowed redirect paths
     */
    allowedRedirects: [
      "/metadata",
      "/profile",
      "/admin",
      "/settings",
      "/search",
      "/map",
      "/news",
      "/gallery",
    ],

    /**
     * Sign in URL
     */
    signIn: "/auth/signin",

    /**
     * Sign up URL
     */
    signUp: "/auth/signup",

    /**
     * Sign out URL
     */
    signOut: "/auth/signout",

    /**
     * Verify email URL
     */
    verifyEmail: "/auth/verify",

    /**
     * Reset password URL
     */
    resetPassword: "/auth/reset-password",

    /**
     * Callback URL
     */
    callback: "/auth/callback",

    /**
     * Error URL
     */
    error: "/auth/error",

    /**
     * Default URL
     */
    default: "/",
  },

  /**
   * Cache configuration
   */
  cache: {
    /**
     * Permission cache duration in milliseconds
     */
    permissionDuration: 5 * 60 * 1000, // 5 minutes

    /**
     * Session cache duration in milliseconds
     */
    sessionDuration: 30 * 1000, // 30 seconds for faster updates

    /**
     * Refresh threshold in milliseconds
     */
    refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  },

  /**
   * Logging configuration
   */
  logging: {
    /**
     * Log level
     */
    level: process.env.NODE_ENV === "production" ? "error" : "debug",

    /**
     * Maximum log retention in seconds
     */
    maxRetention: 30 * 24 * 60 * 60, // 30 days

    /**
     * Sensitive fields to redact from logs
     */
    sensitiveFields: ["password", "token", "secret"],

    /**
     * Events to log
     */
    events: {
      signIn: true,
      signOut: true,
      passwordReset: true,
      emailVerification: true,
      profileUpdate: true,
      error: true,
    },
  },

  /**
   * Supabase configuration
   */
  supabase: {
    /**
     * Supabase URL
     */
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,

    /**
     * Supabase anonymous key
     */
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    /**
     * Supabase service role key
     */
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  /**
   * Provider configuration
   */
  providers: {
    /**
     * Google provider configuration
     */
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },

    /**
     * Email provider configuration
     */
    email: {
      from: process.env.SMTP_FROM || "noreply@ngdi.gov.ng",
      maxTokenAge: 24 * 60 * 60, // 24 hours
    },
  },
}

/**
 * Validate the auth configuration at runtime
 * This ensures that the configuration is valid and matches the expected schema
 */
export const supabaseAuthConfig = validateAuthConfig(authConfig)

/**
 * Type definition for the auth configuration
 */
export type SupabaseAuthConfig = typeof supabaseAuthConfig

/**
 * Get a sensitive value from the configuration
 * This function is used to safely access sensitive values like tokens and keys
 * @param value The sensitive value to get
 * @returns The sensitive value as a branded type
 */
export function getSensitiveValue(
  value: string | undefined
): string | undefined {
  if (!value) return undefined
  return createSensitiveValue(value)
}
