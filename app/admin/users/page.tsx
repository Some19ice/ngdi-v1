"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/use-session"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  UserPlus,
  Search,
  Filter,
  Loader2,
  MoreHorizontal,
  Eye,
  UserCog,
  Shield,
  Briefcase,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AuthLoading } from "@/components/ui/auth-loading"
import { getRoleDisplayName } from "@/lib/auth/constants"
import { toast } from "sonner"
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

// User interface
interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  organization: string | null
  department: string | null
  createdAt: string
  updatedAt: string
}

// Pagination interface
interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function UsersPage() {
  console.log("Component rendering")
  const router = useRouter()
  const { user, isLoading, hasRole } = useSession()
  console.log("Session state:", {
    user,
    isLoading,
    hasRole: hasRole?.(UserRole.ADMIN),
  })

  // State for users data
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [manuallyFetched, setManuallyFetched] = useState(false)

  // State for filters
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // Check if user is admin
  useEffect(() => {
    console.log("Auth check effect running", { isLoading, user })
    if (!isLoading && user && !hasRole?.(UserRole.ADMIN)) {
      console.log("Redirecting to unauthorized - not admin")
      router.push("/unauthorized")
    }
  }, [user, isLoading, hasRole, router])

  // Fetch users
  const fetchUsers = async () => {
    if (isLoadingUsers) {
      console.log("Skipping fetch - already loading")
      return
    }

    console.log("Fetching users...")
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

      const url = `/api/admin/users?${params.toString()}`
      console.log("Fetching from:", url)

      // Fetch users
      const response = await fetch(url)
      console.log("Response status:", response.status)

      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users")
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch users")
      }

      // Update state
      console.log("Setting users:", data.data.users.length)
      setUsers(data.data.users)
      setPagination((prev) => ({
        ...prev,
        ...data.data.pagination,
      }))
      console.log("Users set successfully")
      setManuallyFetched(true)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch users"
      )
    } finally {
      console.log("Setting isLoadingUsers to false")
      setIsLoadingUsers(false)
    }
  }

  // Manual fetch button handler
  const handleManualFetch = () => {
    fetchUsers()
  }

  // Fetch users when component mounts
  useEffect(() => {
    console.log("Data fetch effect running", {
      isLoading,
      user,
      hasAdminRole: hasRole?.(UserRole.ADMIN),
    })
    if (!isLoading && user && hasRole?.(UserRole.ADMIN)) {
      console.log("Calling fetchUsers from effect")
      fetchUsers()
    }
  }, [isLoading, user, hasRole]) // Remove fetchUsers from dependencies

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
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user role")
      }

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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Render component
  console.log("Before render - state:", {
    isLoading,
    isLoadingUsers,
    usersLength: users.length,
    pagination,
    manuallyFetched,
  })

  // Show loading state
  if (isLoading) {
    return (
      <AuthLoading
        message="Checking permissions"
        description="Please wait while we verify your access rights..."
      />
    )
  }

  // Show nothing if not authenticated or not admin
  if (!user || !hasRole(UserRole.ADMIN)) {
    return null
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() =>
              console.log("Current state:", { isLoadingUsers, users })
            }
          >
            Debug State
          </Button>
          <Button onClick={handleManualFetch} disabled={isLoadingUsers}>
            {isLoadingUsers ? "Loading..." : "Refresh Users"}
          </Button>
        </div>
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
