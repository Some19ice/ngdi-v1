import { ProtectedRoute } from "./protected-route"

export function AdminRoute({ children }: { children: React.ReactNode }) {
  // For demo purposes, directly pass children to ProtectedRoute
  return <ProtectedRoute>{children}</ProtectedRoute>
}
