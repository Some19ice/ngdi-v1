import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { createTransport } from "nodemailer"
import { Adapter } from "next-auth/adapters"
import { UserRole } from "@prisma/client"

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
  debug: process.env.NODE_ENV !== "production", // Enable debug mode in development
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" 
          ? ".vercel.app" 
          : undefined
      }
    }
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/verify-request",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isValid = await compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
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
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.organization = token.organization as string | null
        session.user.department = token.department as string | null
        session.user.createdAt = token.createdAt as Date | null
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at * 1000,
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token)
    },
  },
}
