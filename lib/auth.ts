import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/auth-options"
import { UserRole } from "@prisma/client"
import { NextAuthOptions } from "next-auth"
import { createClient } from "@supabase/supabase-js"
import SupabaseProvider from "next-auth/providers/supabase"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role as UserRole)) {
    redirect("/unauthorized")
  }

  return user
}

export function isAdmin(user: { role: string }) {
  return user.role === "ADMIN"
}

export function isModerator(user: { role: string }) {
  return user.role === "MODERATOR" || user.role === "ADMIN"
}

export const authOptions: NextAuthOptions = {
  providers: [
    SupabaseProvider({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          access_token: account.access_token,
          token_type: account.token_type,
          provider_token: account.provider_token,
          id: user.id,
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
        session.user.access_token = token.access_token as string
        session.user.token_type = token.token_type as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Add a helper function for Supabase client
export function getSupabase() {
  return supabase
}
