import { requireAuth } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"
import { AdminDashboardClient } from "./components/admin-dashboard-client"

export const dynamic = "force-dynamic"

// Handle server-side authentication and data fetching
export default async function AdminPage() {
  // Server-side authentication check
  const user = await requireAuth()

  // Check if user is admin
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Admin access required")
  }

  // Render the admin dashboard component instead of redirecting
  return <AdminDashboardClient />
}
