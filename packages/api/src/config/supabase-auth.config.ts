/**
 * Supabase Auth configuration for the API package
 * This file contains configuration for Supabase Auth integration
 */

// Validate required environment variables
const validateConfig = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // For development, allow placeholder values
  if (process.env.NODE_ENV === "development") {
    return {
      url: url || "https://placeholder-project.supabase.co",
      serviceRoleKey: serviceRoleKey || "placeholder-service-role-key",
    }
  }

  // For production, require actual values
  const hasUrl = !!url
  const hasServiceRoleKey = !!serviceRoleKey

  if (!hasUrl || !hasServiceRoleKey) {
    console.error(
      "Missing Supabase configuration. Please check your environment variables.",
      {
        url: hasUrl,
        serviceRoleKey: hasServiceRoleKey,
      }
    )
  }

  return {
    url: hasUrl,
    serviceRoleKey: hasServiceRoleKey,
  }
}

const configValidation = validateConfig()

/**
 * Supabase Auth configuration
 */
export const supabaseAuthConfig = {
  /**
   * Supabase URL from environment variables
   */
  url:
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder-project.supabase.co",

  /**
   * Supabase anonymous key from environment variables
   */
  anonKey:
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-anon-key",

  /**
   * Supabase service role key from environment variables
   * This key has admin privileges and should only be used server-side
   */
  serviceRoleKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key",

  /**
   * JWT configuration
   */
  jwt: {
    /**
     * Audience for JWT tokens
     */
    audience: process.env.SUPABASE_JWT_AUDIENCE || "authenticated",

    /**
     * Issuer for JWT tokens
     */
    issuer:
      process.env.SUPABASE_JWT_ISSUER || process.env.NEXT_PUBLIC_SUPABASE_URL,
  },

  /**
   * Auth configuration
   */
  auth: {
    /**
     * Default user role for new users
     */
    defaultRole: "user",

    /**
     * Available user roles
     */
    roles: ["admin", "node_officer", "user"],

    /**
     * Cookie configuration
     */
    cookies: {
      /**
       * Name prefix for auth cookies
       */
      prefix: "ngdi_auth",

      /**
       * Domain for auth cookies
       */
      domain: process.env.COOKIE_DOMAIN,

      /**
       * Path for auth cookies
       */
      path: "/",

      /**
       * Whether cookies should be secure (HTTPS only)
       */
      secure: process.env.NODE_ENV === "production",

      /**
       * SameSite policy for cookies
       */
      sameSite: "lax",

      /**
       * Whether cookies should be HTTP only
       */
      httpOnly: true,
    },
  },

  /**
   * Security configuration
   */
  security: {
    /**
     * Rate limiting configuration
     */
    rateLimit: {
      /**
       * Login rate limit
       */
      login: {
        /**
         * Maximum number of attempts
         */
        maxAttempts: 5,
        
        /**
         * Window in milliseconds
         */
        windowMs: 15 * 60 * 1000, // 15 minutes
      },
      
      /**
       * Registration rate limit
       */
      register: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
      },
      
      /**
       * Password reset rate limit
       */
      passwordReset: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
      },
      
      /**
       * Email verification rate limit
       */
      emailVerification: {
        maxAttempts: 5,
        windowMs: 60 * 60 * 1000, // 1 hour
      },
      
      /**
       * Global rate limit for all auth endpoints
       */
      global: {
        maxAttempts: 20,
        windowMs: 60 * 60 * 1000, // 1 hour
      },
    },
    
    /**
     * Token validation configuration
     */
    tokenValidation: {
      /**
       * Whether to check token expiration
       */
      checkExpiration: true,
      
      /**
       * Whether to check token revocation
       */
      checkRevocation: true,
    },
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
     * Events to log
     */
    events: {
      login: true,
      logout: true,
      register: true,
      passwordReset: true,
      emailVerification: true,
      tokenRefresh: true,
      error: true,
    },
    
    /**
     * Sensitive fields to redact from logs
     */
    sensitiveFields: ["password", "token", "refreshToken"],
  },
}

/**
 * Type definition for the Supabase Auth configuration
 */
export type SupabaseAuthConfig = typeof supabaseAuthConfig

/**
 * Flag to check if Supabase is properly configured
 */
export const isSupabaseConfigured = !!(
  supabaseAuthConfig.url &&
  supabaseAuthConfig.url !== "https://placeholder-project.supabase.co" &&
  supabaseAuthConfig.serviceRoleKey &&
  supabaseAuthConfig.serviceRoleKey !== "placeholder-service-role-key"
)
