import { requireAuth } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"
import Link from "next/link"
import { Card } from "@/components/ui/card"

export default async function AdminPage() {
  // Server-side authentication check
  const user = await requireAuth()

  // Check if user is admin
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Admin access required")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Admin content here */}
        <Card className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Welcome, {user.email?.split("@")[0] || "Admin"}
          </h2>
          <p className="text-muted-foreground">Role: {user.role}</p>
          <p className="text-muted-foreground">
            Is Admin: {user.role === UserRole.ADMIN ? "Yes" : "No"}
          </p>
        </Card>
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
