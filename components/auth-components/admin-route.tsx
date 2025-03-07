import { ProtectedRoute } from "./protected-route"
import { UserRole } from "@/lib/auth/types"

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>{children}</ProtectedRoute>
  )
}
