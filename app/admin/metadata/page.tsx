"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Permissions } from "@/lib/auth/types"
import { UserRole } from "@/lib/auth/constants"
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
  Loader2,
} from "lucide-react"
import { redirect } from "next/navigation"
import { MetadataItem } from "@/types/metadata"

// Define the metadata type with admin fields
interface AdminMetadataItem extends MetadataItem {
  status?: string
  validationStatus?: string
  downloads?: number
  views?: number
  tags?: string[]
}

const categories = [
  "All Categories",
  "Vector",
  "Raster",
  "Boundaries",
  "Water Bodies",
  "Education",
  "Elevation",
  "Environment",
  "Geographic Information",
  "Health",
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
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [selectedStatus, setSelectedStatus] = useState(statuses[0])
  const [selectedValidation, setSelectedValidation] = useState(
    validationStatuses[0]
  )
  const [metadata, setMetadata] = useState<AdminMetadataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch metadata from the API
    const fetchMetadata = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/search/metadata?limit=100", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`Error fetching metadata: ${response.statusText}`)
        }

        const data = await response.json()

        // Transform the data to include admin fields with default values
        const adminMetadata: AdminMetadataItem[] = data.data.metadata.map(
          (item: MetadataItem) => ({
            ...item,
            status: "Published", // Default status
            validationStatus: "Validated", // Default validation status
            downloads: Math.floor(Math.random() * 200), // Random data for demo
            views: Math.floor(Math.random() * 1000), // Random data for demo
            tags: item.dataType ? [item.dataType.toLowerCase()] : [], // Use dataType as tag
          })
        )

        setMetadata(adminMetadata)
        console.log("Fetched metadata:", adminMetadata.length, "items")
      } catch (err) {
        console.error("Failed to fetch metadata:", err)
        setError("Failed to load metadata. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetadata()
  }, [])

  const filteredMetadata = metadata.filter((item) => {
    const matchesSearch = item.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.dataType === selectedCategory
    const matchesStatus =
      selectedStatus === "All Statuses" || item.status === selectedStatus
    const matchesValidation =
      selectedValidation === "All Validations" ||
      item.validationStatus === selectedValidation

    return (
      matchesSearch && matchesCategory && matchesStatus && matchesValidation
    )
  })

  // Function to safely format dates
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "Invalid Date"
    }
  }

  const getStatusColor = (status?: string): string => {
    if (!status) return "bg-gray-500"

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

  const getValidationStatusColor = (status?: string): string => {
    if (!status) return "bg-gray-500"

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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading metadata...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <XCircle className="h-8 w-8 text-destructive mb-4" />
              <p className="text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : filteredMetadata.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FileText className="h-8 w-8 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No metadata found matching your filters.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory(categories[0])
                  setSelectedStatus(statuses[0])
                  setSelectedValidation(validationStatuses[0])
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Validation</TableHead>
                  <TableHead>Date</TableHead>
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
                          Created: {formatDate(item.dateFrom)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {item.organization || "NGDI"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {item.dataType || "Unknown"}
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
                    <TableCell>
                      {formatDate(item.dateTo || item.dateFrom)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>Downloads: {item.downloads || 0}</div>
                        <div>Views: {item.views || 0}</div>
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
                          {can(Permissions.UPDATE_METADATA) && (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
