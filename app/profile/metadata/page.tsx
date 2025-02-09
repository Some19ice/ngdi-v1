"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { UserRole, Permissions } from "@/lib/auth/types"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"

// Mock data - replace with actual API call
const mockMetadata = [
  {
    id: "1",
    title: "Nigeria Administrative Boundaries",
    category: "Boundaries",
    status: "Published",
    updatedAt: "2024-02-05",
  },
  {
    id: "2",
    title: "Lagos State Water Bodies",
    category: "Water Bodies",
    status: "Draft",
    updatedAt: "2024-02-04",
  },
  {
    id: "3",
    title: "National Healthcare Facilities",
    category: "Health",
    status: "Under Review",
    updatedAt: "2024-02-03",
  },
]

export default function MetadataPage() {
  const router = useRouter()
  const { user, can } = useAuth({
    // TODO: Replace with actual user data
    user: {
      id: "1",
      email: "user@example.com",
      role: UserRole.ADMIN,
      organizationId: "1",
    },
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [metadata] = useState(mockMetadata)

  const filteredMetadata = metadata.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleView = (id: string) => {
    router.push(`/metadata/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/metadata/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    // TODO: Implement delete functionality
    console.log("Delete metadata:", id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "text-ngdi-green-500"
      case "Draft":
        return "text-yellow-500"
      case "Under Review":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search metadata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {can(Permissions.CREATE_METADATA) && (
          <Button asChild>
            <Link href="/metadata/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Metadata
            </Link>
          </Button>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMetadata.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => handleView(item.id)}
              >
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <span className={getStatusColor(item.status)}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>{item.updatedAt}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(item.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {can(Permissions.UPDATE_METADATA) && (
                        <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {can(Permissions.DELETE_METADATA) && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item.id)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
