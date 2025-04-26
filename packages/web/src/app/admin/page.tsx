import { requireAuth } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"
import { AdminDashboardClient } from "./components/admin-dashboard-client"

export const dynamic = "force-dynamic"

// Admin page with auth requirements removed
export default async function AdminPage() {
  // Authentication check bypassed
  console.log("Admin page - Authentication bypassed")

  // Create mock admin user
  const user = {
    id: "demo-user-id",
    email: "demo@example.com",
    role: UserRole.ADMIN,
  }

  // Render the admin dashboard component
  return <AdminDashboardClient />
}
