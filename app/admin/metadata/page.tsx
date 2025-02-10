"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { UserRole, Permissions } from "@/lib/auth/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  Download,
  UploadCloud,
  Building2,
  Calendar,
  Tag,
} from "lucide-react"
import { redirect } from "next/navigation"

// Mock data - replace with actual API call
const mockMetadata = [
  {
    id: "1",
    title: "Nigeria Administrative Boundaries",
    category: "Boundaries",
    organization: "Federal Ministry of Environment",
    author: "John Doe",
    status: "Published",
    validationStatus: "Validated",
    dateCreated: "2024-02-01",
    lastUpdated: "2024-02-05",
    downloads: 156,
    views: 1245,
    tags: ["administrative", "boundaries", "nigeria"],
  },
  {
    id: "2",
    title: "Lagos State Water Bodies",
    category: "Water Bodies",
    organization: "Lagos State Ministry of Environment",
    author: "Jane Smith",
    status: "Draft",
    validationStatus: "Pending",
    dateCreated: "2024-02-03",
    lastUpdated: "2024-02-03",
    downloads: 0,
    views: 15,
    tags: ["water", "lagos", "hydrology"],
  },
  {
    id: "3",
    title: "National Healthcare Facilities",
    category: "Health",
    organization: "Federal Ministry of Health",
    author: "Mike Johnson",
    status: "Under Review",
    validationStatus: "Failed",
    dateCreated: "2024-01-28",
    lastUpdated: "2024-02-04",
    downloads: 45,
    views: 367,
    tags: ["health", "facilities", "healthcare"],
  },
]

const categories = [
  "All Categories",
  "Boundaries",
  "Water Bodies",
  "Education",
  "Elevation",
  "Environment",
  "Geographic Information",
  "Health",
  "Imagery/Earthly Observations",
  "Transportation",
  "Utilities",
]

const statuses = ["All Statuses", "Published", "Draft", "Under Review"]
const validationStatuses = ["All Validations", "Validated", "Pending", "Failed"]

export default function MetadataPage() {
  const { user, can } = useAuth()

  if (!user) {
    redirect("/login")
  }

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [selectedValidation, setSelectedValidation] =
    useState("All Validations")
  const [metadata] = useState(mockMetadata)

  const filteredMetadata = metadata.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.category === selectedCategory
    const matchesStatus =
      selectedStatus === "All Statuses" || item.status === selectedStatus
    const matchesValidation =
      selectedValidation === "All Validations" ||
      item.validationStatus === selectedValidation

    return (
      matchesSearch && matchesCategory && matchesStatus && matchesValidation
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-ngdi-green-500"
      case "Draft":
        return "bg-yellow-500"
      case "Under Review":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case "Validated":
        return "bg-ngdi-green-500"
      case "Pending":
        return "bg-yellow-500"
      case "Failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search metadata..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <UploadCloud className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedValidation}
            onValueChange={setSelectedValidation}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Validation" />
            </SelectTrigger>
            <SelectContent>
              {validationStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Metadata</CardTitle>
          <CardDescription>
            View and manage all metadata entries across organizations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validation</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMetadata.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {item.dateCreated}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {item.organization}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {item.category}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(item.status)}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getValidationStatusColor(
                        item.validationStatus
                      )}
                    >
                      {item.validationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>Downloads: {item.downloads}</div>
                      <div>Views: {item.views}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        {can(Permissions.UPDATE_METADATA) && (
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {can(Permissions.VALIDATE_METADATA) && (
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Validate
                          </DropdownMenuItem>
                        )}
                        {can(Permissions.DELETE_METADATA) && (
                          <DropdownMenuItem className="text-destructive">
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
        </CardContent>
      </Card>
    </div>
  )
}
