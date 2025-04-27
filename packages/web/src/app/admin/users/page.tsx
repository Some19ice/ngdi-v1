// Import dynamic configuration
import { dynamic } from "./page-config"
import { UserRole } from "@/lib/auth/constants"
import { UsersTable } from "./components/users-table"
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
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_PATHS } from "@/lib/auth/paths"

// Use exact interface from UsersTable component
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

// Function to get user data from API
async function fetchUsers(
  authToken?: string
): Promise<{ users: User[]; total: number }> {
  try {
    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

    // Fetch users from API
    const response = await fetch(`${apiUrl}/admin/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      users: data.data.users || [],
      total: data.data.total || 0,
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    // Return empty array on error
    return { users: [], total: 0 }
  }
}

export default async function UsersPage() {
  // Check for authentication
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("auth_token")

  // If no auth cookie, redirect to login
  if (!authCookie) {
    redirect(AUTH_PATHS.SIGNIN)
  }

  // Fetch users data from API
  const { users, total } = await fetchUsers(authCookie.value)

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
            authToken={authCookie.value}
          />
        </CardContent>
      </Card>
    </div>
  )
}
