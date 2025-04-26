"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { UserRole } from "@/lib/auth/constants"

// Define the user type
interface AdminUser {
  id: string
  email: string
  role: string
}

// Create a context for the admin user
const AdminUserContext = createContext<AdminUser | null>(null)

// Hook to use the admin user
export function useAdminUser() {
  const context = useContext(AdminUserContext)
  if (!context) {
    throw new Error("useAdminUser must be used within an AdminAuthProvider")
  }
  return context
}

// Provider component
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser>({
    id: "demo-user-id",
    email: "demo@example.com",
    role: UserRole.ADMIN,
  })

  useEffect(() => {
    // In a real app, we would fetch the user from the API
    // For now, we'll just use the demo user
    console.log("AdminAuthProvider - Using demo user")
  }, [])

  return (
    <AdminUserContext.Provider value={user}>
      {children}
    </AdminUserContext.Provider>
  )
}
