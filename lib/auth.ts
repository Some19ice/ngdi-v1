import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/auth-options"
import { UserRole } from "@prisma/client"

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
