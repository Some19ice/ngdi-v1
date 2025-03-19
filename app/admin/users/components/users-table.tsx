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

// Component props
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
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })

  // Fetch users from API
  const fetchUsers = useCallback(
    async (page = 1, search = "", role: string = "all") => {
      setLoading(true)
      try {
        // Build query params
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
        })

        if (search) {
          params.append("search", search)
        }

        if (role && role !== "all") {
          params.append("role", role)
        }

        // Use the main API server directly
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://ngdi-api.vercel.app"}/api/admin/users?${params.toString()}`
        console.log("[DEBUG] Fetching users from:", apiUrl)

        // Call API server
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.error(
            `API error (${response.status}): ${response.statusText}`
          )
          throw new Error(`Error fetching users: ${response.statusText}`)
        }

        const result = await response.json()
        if (result.success && result.data) {
          setUsers(result.data.users)
          setPagination({
            page: result.data.page,
            limit: result.data.limit,
            total: result.data.total,
            totalPages: result.data.totalPages,
          })
        } else {
          console.error("Invalid API response format:", result)
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        toast.error("Failed to fetch users")
      } finally {
        setLoading(false)
      }
    },
    [authToken, pagination.limit]
  )

  // Initial fetch
  useEffect(() => {
    if (initialUsers.length === 0) {
      fetchUsers()
    }
  }, [fetchUsers, initialUsers.length])

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(1, searchQuery, roleFilter)
  }

  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    fetchUsers(1, searchQuery, value)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchUsers(page, searchQuery, roleFilter)
  }

  // Update user role
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://ngdi-api.vercel.app"}/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      )

      if (!response.ok) {
        console.error(`API error (${response.status}): ${response.statusText}`)
        throw new Error(`Error updating role: ${response.statusText}`)
      }

      const result = await response.json()
      if (result.success) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        )
        toast.success("User role updated successfully")
      } else {
        console.error("Invalid API response format:", result)
        throw new Error(result.message || "Failed to update user role")
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    } finally {
      setLoading(false)
    }
  }

  // Role badge styling helper
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case UserRole.NODE_OFFICER:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Format date helper
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Render pagination controls
  const renderPagination = () => {
    const pages = []
    const { page, totalPages } = pagination

    // Always show first page
    pages.push(
      <Button
        key="first"
        variant={page === 1 ? "secondary" : "outline"}
        size="sm"
        onClick={() => handlePageChange(1)}
        disabled={page === 1 || loading}
      >
        1
      </Button>
    )

    // Show ellipsis if needed
    if (page > 3) {
      pages.push(
        <Button key="ellipsis1" variant="outline" size="sm" disabled>
          ...
        </Button>
      )
    }

    // Show current page and neighbors
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      if (i > 1 && i < totalPages) {
        pages.push(
          <Button
            key={i}
            variant={page === i ? "secondary" : "outline"}
            size="sm"
            onClick={() => handlePageChange(i)}
            disabled={loading}
          >
            {i}
          </Button>
        )
      }
    }

    // Show ellipsis if needed
    if (page < totalPages - 2) {
      pages.push(
        <Button key="ellipsis2" variant="outline" size="sm" disabled>
          ...
        </Button>
      )
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(
        <Button
          key="last"
          variant={page === totalPages ? "secondary" : "outline"}
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages || loading}
        >
          {totalPages}
        </Button>
      )
    }

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * pagination.limit + 1}-
          {Math.min(page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} users
        </div>
        <div className="flex gap-1">{pages}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-sm items-center space-x-2"
          >
            <Input
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="sr-only">Search</span>
            </Button>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Filter by role:
          </span>
          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="NODE_OFFICER">Node Officer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    "No users found."
                  )}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "N/A"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getRoleBadgeVariant(user.role)}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.organization || "N/A"}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          aria-label="Open menu"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            // View user details
                            router.push(`/admin/users/${user.id}`)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <UserCog className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                disabled={user.role === UserRole.ADMIN}
                                onClick={() =>
                                  updateUserRole(user.id, UserRole.ADMIN)
                                }
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={user.role === UserRole.NODE_OFFICER}
                                onClick={() =>
                                  updateUserRole(user.id, UserRole.NODE_OFFICER)
                                }
                              >
                                <Briefcase className="mr-2 h-4 w-4" />
                                Node Officer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={user.role === UserRole.USER}
                                onClick={() =>
                                  updateUserRole(user.id, UserRole.USER)
                                }
                              >
                                <User className="mr-2 h-4 w-4" />
                                Regular User
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="pt-4">{renderPagination()}</div>
    </div>
  )
}
