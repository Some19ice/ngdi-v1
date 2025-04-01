"use client"

import { useState } from "react"
import { useAuthSession } from "@/hooks/use-auth-session"
import {
  MetadataStatus,
  ValidationStatus,
  AdminMetadataItem,
} from "@/types/metadata"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Eye,
  Pencil,
  CheckCircle,
  XCircle,
  Trash2,
  MoreHorizontal,
  Loader2,
  FileText,
  Calendar,
  Building2,
  Tag,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface MetadataTableProps {
  metadata: AdminMetadataItem[]
  isLoading: boolean
  error: string | null
  onValidate: (id: string) => void
  onDelete: (id: string) => void
  onClearFilters: () => void
}

export function MetadataTable({
  metadata,
  isLoading,
  error,
  onValidate,
  onDelete,
  onClearFilters,
}: MetadataTableProps) {
  const { hasRole, isAdmin } = useAuthSession()
  const router = useRouter()
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  // Function to safely format dates
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "Invalid Date"
    }
  }

  // Function to safely get status colors
  const getStatusColor = (status?: MetadataStatus | string): string => {
    if (!status) return "bg-gray-500"

    switch (status) {
      case MetadataStatus.Published:
        return "bg-ngdi-green-500"
      case MetadataStatus.Draft:
        return "bg-yellow-500"
      case MetadataStatus.UnderReview:
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  // Function to safely get validation status colors
  const getValidationStatusColor = (
    status?: ValidationStatus | string
  ): string => {
    if (!status) return "bg-gray-500"

    switch (status) {
      case ValidationStatus.Validated:
        return "bg-ngdi-green-500"
      case ValidationStatus.Pending:
        return "bg-yellow-500"
      case ValidationStatus.Failed:
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleView = (id: string) => {
    router.push(`/metadata/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/metadata/edit/${id}`)
  }

  const handleValidate = (id: string) => {
    onValidate(id)
  }

  const confirmDelete = (id: string) => {
    setSelectedItemId(id)
    setOpenConfirmDelete(true)
  }

  const handleDelete = () => {
    if (selectedItemId) {
      onDelete(selectedItemId)
      setOpenConfirmDelete(false)
      setSelectedItemId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading metadata...</p>
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  if (metadata.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FileText className="h-8 w-8 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No metadata found matching your filters.
        </p>
        <Button variant="outline" className="mt-4" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <>
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
          {metadata.map((item) => (
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
                  className={getValidationStatusColor(item.validationStatus)}
                >
                  {item.validationStatus}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(item.dateTo || item.dateFrom)}</TableCell>
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
                    <DropdownMenuItem onClick={() => handleView(item.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => handleValidate(item.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Validate
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => confirmDelete(item.id)}
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

      <Dialog open={openConfirmDelete} onOpenChange={setOpenConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this metadata? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
