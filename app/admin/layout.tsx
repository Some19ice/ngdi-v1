import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_PATHS } from "@/lib/auth/paths"
import { AdminNav } from "./components/admin-nav"
import { UserRole } from "@/lib/auth/constants"

async function getUser() {
  const headersList = headers()
  return {
    id: headersList.get("x-user-id"),
    email: headersList.get("x-user-email"),
    role: headersList.get("x-user-role"),
  }
}

// Helper function to normalize role for comparison
function isAdminRole(role: string | null): boolean {
  if (!role) return false

  // Case-insensitive comparison for ADMIN role
  return (
    role.toUpperCase() === UserRole.ADMIN ||
    role === "0" || // Some systems use numeric role codes
    role === "admin" ||
    role === "Admin"
  )
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  
  console.log("Admin Layout - User from headers:", user)

  if (!user.id || !user.role) {
    console.log("Admin Layout - No user ID or role, redirecting to signin")
    redirect(AUTH_PATHS.SIGNIN)
  }

  if (!isAdminRole(user.role)) {
    console.log(
      `Admin Layout - User role "${user.role}" is not admin, redirecting to unauthorized`
    )
    redirect(AUTH_PATHS.UNAUTHORIZED)
  }

  console.log("Admin Layout - User is admin, rendering admin layout")

  return (
    <div className="container mx-auto py-8">
      <AdminNav user={user} />
      <main className="mt-8">{children}</main>
    </div>
  )
}
