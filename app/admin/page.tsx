import { requireAuth } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"
import { Card } from "@/components/ui/card"
import { AdminDashboardClient } from "./components/admin-dashboard-client"

// Handle server-side authentication and data fetching
export default async function AdminPage() {
  // Server-side authentication check
  const user = await requireAuth()

  // Check if user is admin
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Admin access required")
  }

  // Pass necessary data to client component
  return (
    <div className="p-6">
      <AdminDashboardClient />
    </div>
  )
}
