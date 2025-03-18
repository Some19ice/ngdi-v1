import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_PATHS } from "@/lib/auth/paths"
import { AdminNav } from "./components/admin-nav"
import { UserRole } from "@/lib/auth/constants"
import { AdminBreadcrumb } from "./components/admin-breadcrumb"

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <AdminNav user={user} />
        <div className="mt-6 mb-4">
          <AdminBreadcrumb />
        </div>
        <main className="mt-4 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}
