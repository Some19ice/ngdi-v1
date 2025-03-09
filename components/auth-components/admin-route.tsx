import { ProtectedRoute } from "./protected-route"
import { UserRole } from "@/lib/auth/constants"

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>{children}</ProtectedRoute>
  )
}
