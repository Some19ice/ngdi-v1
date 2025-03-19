import { requireAuth } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"
import { UsersTable } from "./components/users-table"
import { cookies } from "next/headers"
import { Users as UsersIcon, PlusCircle, Search, Filter } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  organization: string | null
  department: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

async function fetchUsers(): Promise<{ users: User[]; total: number }> {
  try {
    // Get auth token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get("auth_token")?.value

    if (!authToken) {
      console.error("[SERVER] No auth token found in cookies")
      throw new Error("Authentication required")
    }

    // Use our proxy route instead of direct API call
    const url = `/api/admin/users?page=1&limit=10`
    console.log("[SERVER] Fetching users from proxy:", url)

    // Using the server-side fetch to call our proxy route
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[SERVER] API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      throw new Error(`Failed to fetch users: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("[SERVER] API response:", result)

    if (result.success && result.data) {
      return {
        users: result.data.users,
        total: result.data.total,
      }
    }

    console.error("[SERVER] Invalid API response format:", result)
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("[SERVER] Error fetching users:", error)
    return { users: [], total: 0 }
  }
}

export default async function UsersPage() {
  // Server-side authentication check
  const user = await requireAuth()

  // Check if user is admin
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Admin access required")
  }

  // Fetch initial users data from the API server
  const { users, total } = await fetchUsers()

  // Get auth token to pass to client for subsequent requests
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth_token")?.value || ""

  // Log auth token for debugging
  console.log(
    "[SERVER] Auth token from cookies:",
    authToken ? "Present" : "Missing"
  )
  if (!authToken) {
    console.warn(
      "[SERVER] No auth token in cookies, client authentication will fail"
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <UsersIcon className="h-6 w-6 text-ngdi-green-600" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users, roles, and permissions
              </CardDescription>
            </div>
            <Button
              asChild
              className="bg-ngdi-green-600 hover:bg-ngdi-green-700"
            >
              <Link href="/admin/users/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New User
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <UsersTable
            initialUsers={users}
            initialTotal={total}
            authToken={authToken}
          />
        </CardContent>
      </Card>
    </div>
  )
}
