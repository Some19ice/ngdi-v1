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
  return user?.role === "ADMIN"
}

export function isModerator(user: { role?: string }) {
  return user?.role === "MODERATOR" || isAdmin(user)
}

// Add a helper function for Supabase client
export function getSupabase() {
  return supabase
}
