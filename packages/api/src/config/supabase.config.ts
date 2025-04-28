/**
 * Supabase configuration for the API package
 * This file contains configuration for Supabase integration
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

export const supabaseConfig = {
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
}
