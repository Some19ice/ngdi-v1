import { UserRole } from "./constants"

export interface ProtectedRoute {
  path: string
  roles: UserRole[]
}

export const protectedRoutes: ProtectedRoute[] = [
  {
    path: "/metadata",
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER],
  },
  {
    path: "/profile",
    roles: [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
  },
  {
    path: "/search",
    roles: [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
  },
  {
    path: "/map",
    roles: [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
  },
  {
    path: "/news",
    roles: [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
  },
  {
    path: "/gallery",
    roles: [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
  },
]

export const AUTH_CONFIG = {
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    updateAge: 4 * 60 * 60, // Refresh every 4 hours
    strategy: "jwt" as const,
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
    prefix: "ngdi_auth",
    path: "/",
    domain: undefined, // Let NextAuth handle the domain automatically
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    httpOnly: true,
    maxAge: 24 * 60 * 60, // 24 hours
  },

  providers: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    email: {
      from: process.env.SMTP_FROM || "noreply@ngdi.gov.ng",
      maxTokenAge: 24 * 60 * 60, // 24 hours
    },
  },

  roles: {
    default: UserRole.USER,
    available: Object.values(UserRole),
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/verify-request",
    newUser: "/auth/new-user",
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
