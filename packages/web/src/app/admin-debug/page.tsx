import { requireAuth } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"
import { AdminDebugContent } from "./components/admin-debug-content"

export default async function AdminDebugPage() {
  // Server-side authentication check
  const user = await requireAuth()

  // Check if user is admin
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Admin access required")
  }

  // Ensure the role is properly typed as UserRole from constants
  const typedUser = {
    ...user,
    role: user.role as UserRole,
  }

  return <AdminDebugContent user={typedUser} />
}
