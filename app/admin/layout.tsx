import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_PATHS } from "@/lib/auth/paths"
import { AdminNavWrapper } from "./components/admin-nav-wrapper"
import { UserRole } from "@/lib/auth/constants"
import { AdminBreadcrumbWrapper } from "./components/admin-breadcrumb-wrapper"
import { cookies } from "next/headers"
import AdminPrefetcher from "@/components/admin/AdminPrefetcher"
import Script from "next/script"

async function getUser() {
  try {
    const headersList = headers()
    const user = {
      id: headersList.get("x-user-id") || "demo-user-id",
      email: headersList.get("x-user-email") || "demo@example.com",
      role: headersList.get("x-user-role") || UserRole.ADMIN,
    }

    // Also check cookies for debugging
    const authToken = cookies().get("auth_token")?.value

    console.log("Admin Layout - Auth info:", {
      hasAuthCookie: !!authToken,
      authCookieLength: authToken ? authToken.length : 0,
      userFromHeaders: user,
    })

    return user
  } catch (error) {
    console.error("Error getting user from headers:", error)
    // Return demo user as fallback
    return {
      id: "demo-user-id",
      email: "demo@example.com",
      role: UserRole.ADMIN,
    }
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
  console.log("Admin Layout - Authentication bypassed for admin routes")

  // Always create a mock admin user if one doesn't exist
  const adminUser = {
    id: user.id || "demo-user-id",
    email: user.email || "demo@example.com",
    role: UserRole.ADMIN,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Initialize mock API */}
      <Script id="init-mock-api" strategy="afterInteractive">
        {`
          // Initialize mock admin API
          try {
            const { MockAdminApi } = require('@/lib/api/mock-admin-api');
            MockAdminApi.init();
            console.log("Admin mock API initialized successfully");
          } catch (error) {
            console.error("Failed to initialize mock API:", error);
          }
        `}
      </Script>

      <AdminPrefetcher />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <AdminNavWrapper user={adminUser} />
        <div className="mt-6 mb-4">
          <AdminBreadcrumbWrapper />
        </div>
        <main className="mt-4 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}
