"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserRole } from "@/lib/auth/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Loader2,
  MoreHorizontal,
  Eye,
  UserCog,
  Shield,
  Briefcase,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// User interface
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

// Pagination interface
interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UsersTableProps {
  initialUsers: User[]
  initialTotal: number
  authToken: string
}

export function UsersTable({
  initialUsers,
  initialTotal,
  authToken,
}: UsersTableProps) {
  const router = useRouter()

  // Convert dates to strings for consistent handling
  const formattedInitialUsers = initialUsers.map((user) => ({
    ...user,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : user.createdAt,
    updatedAt:
      user.updatedAt instanceof Date
        ? user.updatedAt.toISOString()
        : user.updatedAt,
  }))

  // State for users data
  const [users, setUsers] = useState<User[]>(formattedInitialUsers)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [manuallyFetched, setManuallyFetched] = useState(true)

  // State for filters
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (isLoadingUsers) {
      return
    }

    setIsLoadingUsers(true)

    try {
      // Build query params
      const params = new URLSearchParams()
      params.append("page", pagination.page.toString())
      params.append("limit", pagination.limit.toString())

      if (search) {
        params.append("search", search)
      }

      if (roleFilter && roleFilter !== "all") {
        params.append("role", roleFilter)
      }

      // Use the main API server route
      const url = `/api/admin/users?${params.toString()}`

      // Fetch users with auth token
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch users")
      }

      // Update state
      setUsers(data.data.users || data.data)

      // Handle pagination data based on API response format
      if (data.data.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...data.data.pagination,
        }))
      } else if (data.data.total !== undefined) {
        setPagination((prev) => ({
          ...prev,
          total: data.data.total,
          totalPages: Math.ceil(data.data.total / pagination.limit),
        }))
      }

      setManuallyFetched(true)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch users"
      )
    } finally {
      setIsLoadingUsers(false)
    }
  }, [
    isLoadingUsers,
    pagination.page,
    pagination.limit,
    search,
    roleFilter,
    authToken,
  ])

  // Only fetch when filters change, not on initial load since we have server data
  useEffect(() => {
    if (search || roleFilter !== "all" || pagination.page > 1) {
      fetchUsers()
    }
  }, [search, roleFilter, pagination.page, fetchUsers])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
    fetchUsers()
  }

  // Update user role
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setIsUpdatingRole(true)
    try {
      // Use the main API server route with PUT method
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to update user role")
      }

      // Update users list
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      )

      toast.success("User role updated successfully")
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to update user role"
      )
    } finally {
      setIsUpdatingRole(false)
    }
  }

  // Get role badge color
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "destructive"
      case UserRole.NODE_OFFICER:
        return "default"
      default:
        return "secondary"
    }
  }

  // Format date
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={fetchUsers} disabled={isLoadingUsers}>
          {isLoadingUsers ? "Loading..." : "Refresh Users"}
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
        <div className="w-full md:w-[200px]">
          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
              <SelectItem value={UserRole.NODE_OFFICER}>
                Node Officer
              </SelectItem>
              <SelectItem value={UserRole.USER}>User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          {isLoadingUsers ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              {manuallyFetched
                ? "No users found."
                : "Click 'Refresh Users' to load the user list."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name || "—"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.organization || "—"}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              // View user details
                              router.push(`/admin/users/${user.id}`)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <UserCog className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateUserRole(user.id, UserRole.ADMIN)
                                  }
                                  disabled={user.role === UserRole.ADMIN}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateUserRole(
                                      user.id,
                                      UserRole.NODE_OFFICER
                                    )
                                  }
                                  disabled={user.role === UserRole.NODE_OFFICER}
                                >
                                  <Briefcase className="mr-2 h-4 w-4" />
                                  Node Officer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateUserRole(user.id, UserRole.USER)
                                  }
                                  disabled={user.role === UserRole.USER}
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  User
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {users.length > 0 && pagination.totalPages > 1 && (
          <CardFooter className="flex justify-between items-center py-4">
            <div className="text-sm text-muted-foreground">
              Showing {users.length} of {pagination.total} users
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoadingUsers}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={
                  pagination.page === pagination.totalPages || isLoadingUsers
                }
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
