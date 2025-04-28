import { UserRole } from "./constants"

export const AUTH_CONFIG = {
  // Routes that require authentication
  protectedRoutes: [
    "/dashboard",
    "/profile",
    "/metadata",
    "/search",
    "/map",
    "/news",
    "/gallery",
  ],

  // Routes that require admin role
  adminRoutes: [
    "/admin",
    "/settings/admin",
  ],

  // Routes that require node officer role
  nodeOfficerRoutes: [
    "/node",
    "/metadata/create",
    "/metadata/edit",
  ],

  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    updateAge: 4 * 60 * 60, // Refresh every 4 hours
    rememberMeAge: 30 * 24 * 60 * 60, // 30 days for remember me
  },

  security: {
    passwordMinLength: 12, // Increased from 8
    passwordMaxLength: 100,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60, // 15 minutes in seconds
    jwtMaxAge: 24 * 60 * 60, // Reduced to 24 hours
    refreshTokenMaxAge: 7 * 24 * 60 * 60, // Reduced to 7 days
    csrfTokenMaxAge: 1 * 60 * 60, // Reduced to 1 hour
    passwordRequirements: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    rateLimiting: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
  },

  cookies: {
    prefix: "sb",
    path: "/",
    domain: undefined, // Let Supabase handle the domain automatically
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    httpOnly: true,
    maxAge: 24 * 60 * 60, // 24 hours
  },

  roles: {
    default: UserRole.USER,
    available: Object.values(UserRole),
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/auth/new-user",
    unauthorized: "/auth/unauthorized",
  },

  events: {
    maxLogRetention: 30 * 24 * 60 * 60, // 30 days
    logKeys: {
      signIn: "auth:logs:signin",
      signOut: "auth:logs:signout",
      passwordReset: "auth:logs:password-reset",
      profileUpdate: "auth:logs:profile-update",
      verificationRequest: "auth:logs:verification",
    },
  },

  urls: {
    baseUrl: process.env.NEXTAUTH_URL,
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
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    signOut: "/auth/signout",
    verifyEmail: "/auth/verify",
    resetPassword: "/auth/reset-password",
    callback: "/auth/callback",
    error: "/auth/error",
    default: "/",
  },

  cache: {
    permissionDuration: 5 * 60 * 1000, // 5 minutes
    sessionDuration: 30 * 1000, // Reduced to 30 seconds for faster updates
    refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  },

  logging: {
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
    maxRetention: 30 * 24 * 60 * 60, // 30 days
    sensitiveFields: ["password", "token", "secret"],
    events: {
      signIn: true,
      signOut: true,
      passwordReset: true,
      emailVerification: true,
      profileUpdate: true,
      error: true,
    },
  },

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
} as const

export type AuthConfig = typeof AUTH_CONFIG
