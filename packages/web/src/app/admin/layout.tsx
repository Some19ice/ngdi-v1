import { redirect } from "next/navigation"
import { AUTH_PATHS } from "@/lib/auth/paths"
import { AdminNavWrapper } from "./components/admin-nav-wrapper"
import { UserRole } from "@/lib/auth/constants"
import { AdminBreadcrumbWrapper } from "./components/admin-breadcrumb-wrapper"
import AdminPrefetcher from "@/components/admin/AdminPrefetcher"
import Script from "next/script"
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
          <AdminNavWrapper
            user={{
              id: "demo-user-id",
              email: "demo@example.com",
              role: UserRole.ADMIN,
            }}
          />
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
