import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { compare } from "bcryptjs"
import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { UserRole } from "@/lib/auth/types"
import { Adapter } from "next-auth/adapters"
import { checkAuthRateLimit, resetRateLimit } from "@/lib/redis"

// Rate limiting map
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

// Helper to check rate limits
function isRateLimited(email: string): boolean {
  const now = Date.now()
  const attempt = loginAttempts.get(email)

  if (!attempt) {
    loginAttempts.set(email, { count: 1, lastAttempt: now })
    return false
  }

  // Reset count if outside window
  if (now - attempt.lastAttempt > AUTH_CONFIG.security.lockoutDuration * 1000) {
    loginAttempts.set(email, { count: 1, lastAttempt: now })
    return false
  }

  // Increment count
  attempt.count++
  attempt.lastAttempt = now
  loginAttempts.set(email, attempt)

  return attempt.count > AUTH_CONFIG.security.maxLoginAttempts
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: AUTH_CONFIG.session.maxAge,
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Always allow OAuth sign in
      if (account?.provider !== "credentials") {
        return true
      }

      // For credentials, ensure email is verified
      if (!user.emailVerified) {
        throw new Error("EmailNotVerified")
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("InvalidCredentials")
        }

        // Check rate limiting
        const isAllowed = await checkAuthRateLimit(credentials.email)
        if (!isAllowed) {
          throw new Error("TooManyRequests")
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              emailVerified: true,
              organization: true,
              department: true,
              phone: true,
              image: true,
              createdAt: true,
            },
          })

          if (!user || !user.password) {
            throw new Error("InvalidCredentials")
          }

          const isValidPassword = await compare(
            credentials.password,
            user.password
          )

          if (!isValidPassword) {
            throw new Error("InvalidCredentials")
          }

          // Reset rate limit on successful login
          await resetRateLimit(credentials.email)

          return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            role: user.role as UserRole,
            emailVerified: user.emailVerified,
            organization: user.organization || null,
            department: user.department || null,
            phone: user.phone || null,
            image: user.image || null,
            createdAt: user.createdAt,
          }
        } catch (error) {
          if (error instanceof Error) {
            if (
              error.message === "InvalidCredentials" ||
              error.message === "TooManyRequests"
            ) {
              throw error
            }
          }
          console.error("Auth error:", error)
          throw new Error("InternalServerError")
        }
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      // Ensure user has a role
      if (!user.role) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.USER },
        })
      }
    },
  },
}
