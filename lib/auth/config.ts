import { UserRole } from "@prisma/client"

export const AUTH_CONFIG = {
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  security: {
    passwordMinLength: 8,
    passwordMaxLength: 100,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60, // 15 minutes
    jwtMaxAge: 60 * 60 * 24 * 30, // 30 days
    refreshTokenMaxAge: 60 * 60 * 24 * 90, // 90 days
    csrfTokenMaxAge: 60 * 60 * 24, // 24 hours
  },

  cookies: {
    prefix: "ngdi_auth",
    path: "/",
    domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  },

  providers: {
    google: {
      authorizationParams: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code",
      },
    },
    email: {
      from: process.env.SMTP_FROM || "noreply@ngdi.gov.ng",
      maxTokenAge: 24 * 60 * 60, // 24 hours
    },
  },

  roles: {
    default: UserRole.USER,
    elevated: [UserRole.ADMIN, UserRole.NODE_OFFICER],
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
    allowedRedirects: ["/metadata", "/profile", "/admin", "/settings"],
  },

  cache: {
    permissionDuration: 5 * 60 * 1000, // 5 minutes
    sessionDuration: 60 * 1000, // 1 minute
  },
} as const

export type AuthConfig = typeof AUTH_CONFIG
