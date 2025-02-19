import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { createTransport } from "nodemailer"
import { Adapter } from "next-auth/adapters"
import { UserRole } from "@/lib/auth/types"
import { JWT } from "next-auth/jwt"
import { checkAuthRateLimit } from "@/lib/auth/rate-limit"
import {
  passwordSchema,
  verifyPassword,
  calculateSessionExpiry,
} from "@/lib/auth/validation"
import { redis } from "@/lib/redis"

// Add type for the session
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: UserRole
      organization?: string | null
      department?: string | null
      createdAt?: Date | null
      image?: string | null
    }
    expires: string
  }

  interface User {
    role: UserRole
    organization?: string | null
    department?: string | null
    createdAt?: Date | null
  }
}

function html(params: { url: string; host: string | undefined }) {
  const { url, host } = params

  const escapedHost = host?.replace(/\./g, "&#8203;.")

  return `
    <body>
      <div style="background-color: #f6f9fc; padding: 40px 0;">
        <div style="max-width: 560px; margin: 0 auto; background-color: white; border-radius: 5px; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #32325d; font-size: 24px; margin: 0;">
              Sign in to NGDI Portal
            </h1>
          </div>
          <div style="padding: 20px 0;">
            <p style="color: #525f7f; font-size: 16px; line-height: 24px; margin: 0;">
              Click the button below to sign in to your account on ${escapedHost}.
            </p>
          </div>
          <div style="padding: 20px 0; text-align: center;">
            <a href="${url}" style="background-color: #5469d4; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; display: inline-block;">
              Sign in
            </a>
          </div>
          <div style="padding: 20px 0;">
            <p style="color: #525f7f; font-size: 14px; line-height: 24px; margin: 0;">
              If you did not request this email, you can safely ignore it.
            </p>
          </div>
        </div>
      </div>
    </body>
  `
}

function text({ url, host }: { url: string; host: string | undefined }) {
  return `Sign in to ${host}\n${url}\n\n`
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.DEBUG === "true" && process.env.NODE_ENV === "development",
  logger: {
    error(code, ...message) {
      console.error(code, ...message)
    },
    warn(code, ...message) {
      console.warn(code, ...message)
    },
    debug(code, ...message) {
      if (process.env.DEBUG === "true") {
        console.debug(code, ...message)
      }
    },
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/verify-request",
    error: "/auth/error",
    newUser: "/auth/new-user",
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser) {
        // Set default role for new users with correct format
        await prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.USER },
        })

        // Update the user object to reflect the new role
        user.role = UserRole.USER
      }

      // Log sign in attempt
      await redis.lpush(
        "auth:logs",
        JSON.stringify({
          event: "signIn",
          userId: user.id,
          role: user.role,
          provider: account?.provider,
          timestamp: new Date().toISOString(),
        })
      )
    },
    async signOut({ session }) {
      // Log sign out
      await redis.lpush(
        "auth:logs",
        JSON.stringify({
          event: "signOut",
          userId: session?.user?.id,
          timestamp: new Date().toISOString(),
        })
      )
    },
  },
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER || {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.SMTP_FROM || "noreply@ngdi.gov.ng",
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const transport = createTransport(provider.server)
        const result = await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: "Sign in to NGDI Portal",
          text: text({ url, host: process.env.NEXTAUTH_URL }),
          html: html({ url, host: process.env.NEXTAUTH_URL }),
        })
        const failed = result.rejected.concat(result.pending).filter(Boolean)
        if (failed.length) {
          throw new Error("Failed to send verification email")
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // Check rate limit
        const rateLimitResult = await checkAuthRateLimit(credentials.email)
        if (!rateLimitResult.success) {
          throw new Error("Too many attempts. Please try again later.")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        // Validate password complexity for new passwords
        try {
          passwordSchema.parse(credentials.password)
        } catch (error) {
          throw new Error("Password does not meet security requirements")
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        )

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        // Only check email verification in production
        if (process.env.NODE_ENV === "production" && !user.emailVerified) {
          throw new Error("Please verify your email first")
        }

        return {
          id: user.id,
          email: user.email || "",
          name: user.name || "",
          role: user.role as UserRole,
          image: user.image || null,
          emailVerified: user.emailVerified || null,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.organization = token.organization as string | null
        session.user.department = token.department as string | null
        session.user.createdAt = token.createdAt as Date | null

        // Add session expiry based on remember me
        const rememberMe = token.rememberMe as boolean | undefined
        session.expires = calculateSessionExpiry(rememberMe).toISOString()
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Ensure role is always set
        token.role = user.role ?? UserRole.USER
        token.organization = user.organization
        token.department = user.department
        token.createdAt = user.createdAt
      }

      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : undefined
      }

      // Check token expiration
      if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
        try {
          const refreshedToken = await refreshAccessToken(token)
          return {
            ...refreshedToken,
            error: undefined,
          }
        } catch (error) {
          return {
            ...token,
            error: "RefreshAccessTokenError",
          }
        }
      }

      return token
    },
  },
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    // Add refresh token logic here if needed
    // For now, just return the token with an error
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}
