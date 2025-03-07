import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { type NextAuthOptions, User, Session, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { createTransport } from "nodemailer"
import { Adapter } from "next-auth/adapters"
import { UserRole } from "@/lib/auth/types"
import { JWT } from "next-auth/jwt"
import { checkAuthRateLimit, resetRateLimit } from "./rate-limit"
import { redis } from "@/lib/redis"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { v4 as uuidv4 } from "uuid"
import { RequestInternal } from "next-auth"
import { User as PrismaUser } from "@prisma/client"

// Define the base user type that matches our database schema
interface BaseUser {
  id: string
  email: string
  name: string
  role: UserRole
  organization: string | null
  department: string | null
  phone: string | null
  createdAt: Date | null
  emailVerified: Date | null
  image: string | null
}

// Update Session type to include error field
declare module "next-auth" {
  interface Session extends DefaultSession {
    user:
      | (BaseUser & {
          accessToken: string | null
          deviceId: string | null
        })
      | null
    expires: string
    error?: "RefreshAccessTokenError" | "SessionError"
    accessToken: string | null
  }

  interface User extends BaseUser {}
}

// Add type for JWT
declare module "next-auth/jwt" {
  interface JWT extends Omit<BaseUser, "image"> {
    picture: string | null
    accessToken: string | null
    refreshToken: string | null
    accessTokenExpires?: number
    deviceId: string | null
    error?: "RefreshAccessTokenError"
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
    maxAge: AUTH_CONFIG.session.maxAge,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, ...message) {
      console.error(code, ...message)
    },
    warn(code, ...message) {
      console.warn(code, ...message)
    },
    debug(code, ...message) {
      console.debug(code, ...message)
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
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
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
      // Ensure user has a role
      if (!user.role || isNewUser) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.USER },
        })
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
    async signOut({ session, token }) {
      // Invalidate session in Redis
      if (session?.user?.id && token?.deviceId) {
        await redis.del(`session:${session.user.id}:${token.deviceId}`)
      }

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
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Ensure user has required fields
        if (!user?.email) {
          console.error("Sign in failed: No email provided")
          return false
        }

        // For credentials provider
        if (credentials) {
          return true // Already validated in authorize callback
        }

        // For OAuth providers
        if (account && profile) {
          // Ensure user has a role
          if (!user.role) {
            await prisma.user.update({
              where: { email: user.email },
              data: { role: UserRole.USER },
            })
          }
          return true
        }

        // For email provider
        if (email) {
          return true
        }

        return false
      } catch (error) {
        console.error("Sign in error:", error)
        return false
      }
    },

    async session({ session, token, user }) {
      try {
        // Validate token existence and required fields
        if (!token) {
          throw new Error("No token available")
        }

        // Ensure required token fields exist
        if (!token.id || !token.email) {
          console.warn("Invalid token structure:", token)
          return {
            expires: new Date(Date.now()).toISOString(),
            user: null,
            error: "SessionError",
          } as Session
        }

        const updatedSession: Session = {
          expires:
            session.expires ||
            new Date(
              Date.now() + AUTH_CONFIG.session.maxAge * 1000
            ).toISOString(),
          user: {
            id: token.id,
            email: token.email,
            name: token.name || "",
            role: (token.role as UserRole) || UserRole.USER,
            organization: token.organization || null,
            department: token.department || null,
            phone: token.phone || null,
            createdAt: token.createdAt || null,
            emailVerified: token.emailVerified || null,
            image: token.picture || null,
            deviceId: token.deviceId || null,
            accessToken: token.accessToken || null,
          },
          accessToken: token.accessToken || null,
        }

        // Handle refresh token errors
        if (token.error === "RefreshAccessTokenError") {
          updatedSession.error = "RefreshAccessTokenError"
        }

        return updatedSession
      } catch (error) {
        console.error("Session callback error:", error)
        return {
          expires: new Date(Date.now()).toISOString(),
          user: null,
          error: "SessionError",
        } as Session
      }
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (account && user) {
        const deviceId = uuidv4()
        return {
          id: user.id,
          email: user.email,
          name: user.name || "",
          role: (user.role ?? UserRole.USER) as UserRole,
          picture: user.image ?? null,
          deviceId,
          accessToken: account.access_token ?? null,
          refreshToken: account.refresh_token ?? null,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
          organization: user.organization ?? null,
          department: user.department ?? null,
          phone: user.phone ?? null,
          createdAt: user.createdAt ?? null,
          emailVerified: user.emailVerified ?? null,
        }
      }

      // Handle session update
      if (trigger === "update" && session) {
        return { ...token, ...session }
      }

      // Return previous token if access token has not expired
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token
      }

      // Refresh token if expired
      return refreshAccessToken(token)
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
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // Check rate limiting
        const isAllowed = await checkAuthRateLimit(credentials.email)
        if (!isAllowed) {
          throw new Error("TooManyRequests")
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user || !user.password) {
            throw new Error("InvalidCredentials")
          }

          const isValid = await compare(credentials.password, user.password)
          if (!isValid) {
            throw new Error("InvalidCredentials")
          }

          // Reset rate limit on successful login
          await resetRateLimit(credentials.email)

          return {
            id: user.id,
            email: user.email,
            name: user.name || "Unknown User",
            role: user.role,
            image: user.image || "",
            organization: user.organization || "",
            department: user.department || "",
            phone: user.phone || "",
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
          } as User
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === "TooManyRequests") {
              throw error
            }
            if (error.message === "InvalidCredentials") {
              throw error
            }
          }
          console.error("Auth error:", error)
          throw new Error("InternalServerError")
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
      async profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name || "",
          role: UserRole.USER,
          organization: null,
          department: null,
          phone: null,
          createdAt: new Date(),
          emailVerified: profile.email_verified ? new Date() : null,
          image: profile.picture ?? null,
        }
      },
    }),
  ],
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    // This function should implement the token refresh logic for your OAuth provider
    // For Google, you would use the refresh token to get a new access token
    // For simplicity, we're just returning the token with an extended expiry

    return {
      ...token,
      accessTokenExpires: Date.now() + 3600 * 1000, // Extend by 1 hour
      // Ensure the refresh token is not reused if it's a one-time use token
      // refreshToken: undefined, // Uncomment if your provider uses one-time refresh tokens
    }
  } catch (error) {
    console.error("Error refreshing access token:", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}
