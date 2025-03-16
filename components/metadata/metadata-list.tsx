"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { metadataService } from "@/lib/services/metadata.service"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MetadataItem, MetadataSearchResponse } from "@/types/metadata"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useDebounce } from "@/hooks/use-debounce"

export function MetadataList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const { toast } = useToast()

  // Debounce search input to reduce API calls
  const debouncedSearch = useDebounce(search, 500)
  const debouncedCategory = useDebounce(category, 500)

  const { data, isLoading, isError, error, refetch } =
    useQuery<MetadataSearchResponse>({
      queryKey: [
        "metadata",
        page,
        debouncedSearch,
        debouncedCategory,
        sortBy,
        sortOrder,
      ],
      queryFn: () =>
        metadataService.searchMetadata({
          page,
          limit: 10,
          search: debouncedSearch,
          category: debouncedCategory,
          sortBy: sortBy as any,
          sortOrder,
        }),
      staleTime: 1000 * 60, // 1 minute
    })

  const confirmDelete = (id: string) => {
    setItemToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      await metadataService.deleteMetadata(itemToDelete)
      toast({
        title: "Success",
        description: "Metadata deleted successfully",
      })
      refetch()
    } catch (error) {
      console.error("Metadata deletion failed:", error)
      toast({
        title: "Error",
        description: "Failed to delete metadata. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handleSortChange = (value: string) => {
    // Format is "field:order"
    const [field, order] = value.split(":")
    setSortBy(field)
    setSortOrder(order as "asc" | "desc")
  }

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, debouncedCategory, sortBy, sortOrder])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search metadata..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Input
            placeholder="Filter by category..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select
          value={`${sortBy}:${sortOrder}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt:desc">Newest first</SelectItem>
            <SelectItem value="createdAt:asc">Oldest first</SelectItem>
            <SelectItem value="title:asc">Title (A-Z)</SelectItem>
            <SelectItem value="title:desc">Title (Z-A)</SelectItem>
            <SelectItem value="author:asc">Author (A-Z)</SelectItem>
            <SelectItem value="author:desc">Author (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load metadata. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 rounded-md border p-4"
              >
                <Skeleton className="h-12 w-12" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-10 w-[100px]" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {data?.metadata && data.metadata.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.metadata.map((item: MetadataItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.title}
                      </TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>{item.organization}</TableCell>
                      <TableCell>
                        {formatDate(item.dateFrom)} - {formatDate(item.dateTo)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/metadata/${item.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link href={`/metadata/${item.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(item.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <Search className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="mt-4 text-lg font-semibold">
                  No metadata found
                </h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                  {search || category
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : "Get started by creating your first metadata entry."}
                </p>
                {!search && !category && (
                  <Link href="/metadata/add">
                    <Button>Create Metadata</Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {data?.total && data.total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {data.metadata.length} of {data.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <div className="flex h-9 items-center gap-1.5">
                  {Array.from(
                    { length: Math.min(5, data.totalPages) },
                    (_, i) => {
                      // Logic to show relevant page numbers
                      let pageNum = i + 1
                      if (data.totalPages > 5) {
                        if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= data.totalPages - 2) {
                          pageNum = data.totalPages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    }
                  )}
                </div>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={!data || page >= data.totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              metadata entry and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
