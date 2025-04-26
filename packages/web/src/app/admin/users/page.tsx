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
import { mockUsersData } from "@/lib/mock/admin-data"

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

// Mock function to get user data
async function fetchUsers(): Promise<{ users: User[]; total: number }> {
  // Format mock data to match required interface
  const formattedUsers = mockUsersData.users.map((u) => ({
    id: u.id,
    email: u.email,
    name: `${u.firstName} ${u.lastName}`,
    // Cast role to UserRole since we know our mock data uses valid roles
    role: u.role as UserRole,
    organization: u.organization,
    department: null,
    createdAt: u.createdAt,
    updatedAt: u.createdAt,
  }))

  return {
    // Explicitly cast to User[] since we've ensured compatibility
    users: formattedUsers as User[],
    total: mockUsersData.total,
  }
}

export default async function UsersPage() {
  // Use mock admin user
  const user = {
    id: "demo-user-id",
    email: "admin@example.com",
    role: UserRole.ADMIN,
  }

  // Fetch mock users data
  const { users, total } = await fetchUsers()

  // Mock auth token
  const authToken = "mock-auth-token-for-demo-purposes"

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

      <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
        <p>
          <strong>Note:</strong> Using mock data for demonstration purposes.
        </p>
      </div>
    </div>
  )
}
