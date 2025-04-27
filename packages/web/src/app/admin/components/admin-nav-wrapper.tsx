"use client"

import { AdminNav } from "./admin-nav"
import { useAdminUser } from "./admin-auth-provider"

export function AdminNavWrapper() {
  // Get the user from the AdminAuthProvider
  const user = useAdminUser()

  return <AdminNav user={user} />
}
