import { redirect } from "next/navigation"
import { AUTH_PATHS } from "@/lib/auth/paths"
import { AdminNavWrapper } from "./components/admin-nav-wrapper"
import { AdminBreadcrumbWrapper } from "./components/admin-breadcrumb-wrapper"
import AdminPrefetcher from "@/components/admin/AdminPrefetcher"
// Import dynamic configuration
import { dynamic } from "./page-config"
// Import the AdminAuthProvider
import { AdminAuthProvider } from "./components/admin-auth-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use the AdminAuthProvider to provide the user to all admin pages
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminPrefetcher />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <AdminNavWrapper />
          <div className="mt-6 mb-4">
            <AdminBreadcrumbWrapper />
          </div>
          <main className="mt-4 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthProvider>
  )
}
