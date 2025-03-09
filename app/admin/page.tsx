"use client"

import { UserRole } from "@/lib/auth/constants"
import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import Link from "next/link"

export default function AdminPage() {
  const { userRole, session, isAdmin, user } = useAuth()

  useEffect(() => {
    // Add debugging information
    console.log("Admin Page - Current user:", user)
    console.log("Admin Page - User role:", userRole)
    console.log("Admin Page - Is admin:", isAdmin)
    console.log("Admin Page - Session:", session)
    console.log("Admin Page - UserRole.ADMIN:", UserRole.ADMIN)
    console.log("Admin Page - Comparison:", userRole === UserRole.ADMIN)
  }, [user, userRole, isAdmin, session])

  // Temporarily bypass the ProtectedRoute component for debugging
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Admin content here */}
        <div className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Welcome, {session?.user?.email?.split("@")[0] || "Admin"}
          </h2>
          <p className="text-muted-foreground">Role: {userRole}</p>
          <p className="text-muted-foreground">
            Is Admin: {isAdmin ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin-debug"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go to Admin Debug Page
        </Link>
      </div>
    </div>
  )
}
