import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminDashboardClient } from "./components/admin-dashboard-client"
import { AUTH_PATHS } from "@/lib/auth/paths"

export const dynamic = "force-dynamic"

// Admin page with proper authentication
export default async function AdminPage() {
  // Check for authentication cookie - await the cookies() function
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("auth_token")

  // If no auth cookie, redirect to login
  if (!authCookie) {
    redirect(AUTH_PATHS.SIGNIN)
  }

  // Render the admin dashboard component
  return <AdminDashboardClient />
}
