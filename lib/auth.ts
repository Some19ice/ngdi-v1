import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/auth-options"
import { UserRole } from "@prisma/client"
import { NextAuthOptions } from "next-auth"
import { createClient } from "@supabase/supabase-js"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Initialize Supabase client (only for storage/database, not auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin?error=Please sign in to continue")
  }

  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()

  if (!user.role || !allowedRoles.includes(user.role as UserRole)) {
    redirect("/unauthorized?error=Insufficient permissions")
  }

  return user
}

export function isAdmin(user: { role?: string }) {
  return user?.role === UserRole.ADMIN
}

export function isModerator(user: { role?: string }) {
  return user?.role === UserRole.MODERATOR || isAdmin(user)
}

// Add a helper function for Supabase client (for storage/database operations only)
export function getSupabase() {
  return supabase
}

export async function validateSession() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Check if session is expired
  const sessionExpiry = new Date(session.expires)
  if (sessionExpiry < new Date()) {
    return null
  }

  // Verify user still exists
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      emailVerified: true,
    },
  })

  if (!user) {
    return null
  }

  return {
    ...session,
    user: {
      ...session.user,
      role: user.role,
    },
  }
}
