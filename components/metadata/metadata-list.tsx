"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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
import {
  MetadataItem,
  MetadataListResponse,
  MetadataSearchResponse,
} from "@/types/metadata"
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

interface MetadataListProps {
  initialMetadata: MetadataItem[]
  initialTotal: number
  authToken?: string
}

export function MetadataList({
  initialMetadata = [],
  initialTotal = 0,
  authToken,
}: MetadataListProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [manuallyFetched, setManuallyFetched] = useState(false)
  const { toast } = useToast()

  // Add debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [debouncedCategory, setDebouncedCategory] = useState(category)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Debounce category input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategory(category)
    }, 500)

    return () => clearTimeout(timer)
  }, [category])

  // Update query when debounced values change
  useEffect(() => {
    if (manuallyFetched) {
      setManuallyFetched(false)
      return
    }

    setPage(1)
  }, [debouncedSearch, debouncedCategory])

  // Fetch metadata directly if we have filters or need to refresh
  const fetchMetadata = useCallback(
    async (params: {
      page: number
      limit: number
      search?: string
      category?: string
      sortBy: string
      sortOrder: "asc" | "desc"
    }): Promise<MetadataListResponse> => {
      try {
        // Use the API directly if we have an auth token
        if (authToken) {
          console.log("Fetching metadata with auth token", {
            url: `/api/search/metadata`,
            params,
            authTokenLength: authToken.length,
          })

          const response = await fetch(
            `/api/search/metadata?${new URLSearchParams({
              page: params.page.toString(),
              limit: params.limit.toString(),
              ...(params.search ? { search: params.search } : {}),
              ...(params.category ? { category: params.category } : {}),
              sortBy: params.sortBy,
              sortOrder: params.sortOrder,
            })}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          )

          if (!response.ok) {
            const errorText = await response.text().catch(() => "Unknown error")
            console.error("Metadata fetch error:", {
              status: response.status,
              statusText: response.statusText,
              errorText,
            })
            throw new Error(
              `Failed to fetch metadata: ${response.status} ${response.statusText} - ${errorText}`
            )
          }

          const result = await response.json()
          return result.data
        }

        // Fall back to the service if no auth token
        console.log("Fetching metadata with service (no auth token)", params)
        const result = await metadataService.searchMetadata(params)
        return {
          metadata: result.metadata,
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        }
      } catch (error) {
        console.error("Error fetching metadata:", error)
        throw error
      }
    },
    [authToken]
  )

  // Use React Query for data fetching
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "metadata",
      page,
      debouncedSearch,
      debouncedCategory,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      fetchMetadata({
        page,
        limit: 10,
        search: debouncedSearch,
        category: debouncedCategory,
        sortBy,
        sortOrder,
      }),
    initialData:
      initialMetadata && initialTotal
        ? {
            metadata: initialMetadata,
            total: initialTotal,
            currentPage: 1,
            totalPages: Math.ceil(initialTotal / 10),
          }
        : undefined,
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
    setManuallyFetched(true)
  }

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
                    <TableHead>Cloud Cover</TableHead>
                    <TableHead>Production Date</TableHead>
                    <TableHead>Abstract</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.metadata.map((item: MetadataItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/metadata/${item.id}`}
                          className="hover:underline text-primary"
                        >
                          {item.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {item.cloudCoverPercentage || "N/A"}
                      </TableCell>
                      <TableCell>{formatDate(item.dateFrom)}</TableCell>
                      <TableCell>
                        {item.abstract || "No abstract available"}
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
                  onClick={() => {
                    setPage(page - 1)
                    setManuallyFetched(true)
                  }}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <div className="flex h-9 items-center gap-1.5">
                  {Array.from(
                    { length: Math.min(5, data.totalPages || 1) },
                    (_, i) => {
                      // Logic to show relevant page numbers
                      let pageNum = i + 1
                      if ((data.totalPages || 1) > 5) {
                        if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= (data.totalPages || 1) - 2) {
                          pageNum = (data.totalPages || 1) - 4 + i
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
                          onClick={() => {
                            setPage(pageNum)
                            setManuallyFetched(true)
                          }}
                        >
                          {pageNum}
                        </Button>
                      )
                    }
                  )}
                </div>
                <Button
                  onClick={() => {
                    setPage(page + 1)
                    setManuallyFetched(true)
                  }}
                  disabled={!data || page >= (data.totalPages || 1)}
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
