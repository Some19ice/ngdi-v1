"use client"

import { useState, useEffect, useCallback, memo, useMemo } from "react"
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
import { useDebounce, useThrottle } from "@/lib/optimization/memo-utils"
import { DeferredRender } from "@/components/ui/deferred-render"
import { withMemo } from "@/lib/optimization/with-memo"
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor"

interface MetadataListProps {
  initialMetadata: MetadataItem[]
  initialTotal: number
  authToken?: string
}

function MetadataListComponent({
  initialMetadata = [],
  initialTotal = 0,
  authToken,
}: MetadataListProps) {
  // Add performance monitoring
  usePerformanceMonitor("MetadataList")

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [manuallyFetched, setManuallyFetched] = useState(false)
  const { toast } = useToast()

  // Use the debounce hook from our optimization utilities
  const debouncedSearch = useDebounce(search, 500)
  const debouncedCategory = useDebounce(category, 500)

  // Update query when debounced values change
  useEffect(() => {
    if (manuallyFetched) {
      setManuallyFetched(false)
      return
    }

    setPage(1)
  }, [debouncedSearch, debouncedCategory, manuallyFetched])

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
          if (process.env.NODE_ENV === "development") {
            console.log("Fetching metadata with auth token", {
              url: `/api/search/metadata`,
              params,
              authTokenLength: authToken.length,
            })
          }

          const queryParams = new URLSearchParams({
            page: params.page.toString(),
            limit: params.limit.toString(),
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
          })

          // Only add search and category if they have values
          if (params.search) queryParams.append("search", params.search)
          if (params.category && params.category !== "all")
            queryParams.append("category", params.category)

          const response = await fetch(`/api/search/metadata?${queryParams}`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })

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
        if (process.env.NODE_ENV === "development") {
          console.log("Fetching metadata with service (no auth token)", params)
        }

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

  // Use React Query for data fetching with memoized query key
  const queryKey = useMemo(
    () => [
      "metadata",
      page,
      debouncedSearch,
      debouncedCategory,
      sortBy,
      sortOrder,
    ],
    [page, debouncedSearch, debouncedCategory, sortBy, sortOrder]
  )

  // Memoize the query function to prevent unnecessary re-renders
  const queryFn = useCallback(
    () =>
      fetchMetadata({
        page,
        limit: 10,
        search: debouncedSearch,
        category: debouncedCategory,
        sortBy,
        sortOrder,
      }),
    [fetchMetadata, page, debouncedSearch, debouncedCategory, sortBy, sortOrder]
  )

  // Memoize the initial data
  const initialData = useMemo(
    () =>
      initialMetadata && initialTotal
        ? {
            metadata: initialMetadata,
            total: initialTotal,
            currentPage: 1,
            totalPages: Math.ceil(initialTotal / 10),
          }
        : undefined,
    [initialMetadata, initialTotal]
  )

  // Use React Query for data fetching
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn,
    initialData,
  })

  // Memoize handlers to prevent unnecessary re-renders
  const confirmDelete = useCallback((id: string) => {
    setItemToDelete(id)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleDelete = useCallback(async () => {
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
  }, [itemToDelete, refetch, toast])

  const handleSortChange = useCallback((value: string) => {
    // Format is "field:order"
    const [field, order] = value.split(":")
    setSortBy(field)
    setSortOrder(order as "asc" | "desc")
    setManuallyFetched(true)
  }, [])

  // Memoize the search input handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value)
    },
    []
  )

  // Memoize the category change handler
  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value)
  }, [])

  // Memoize the pagination handlers
  const handlePrevPage = useCallback(() => {
    setPage(page - 1)
    setManuallyFetched(true)
  }, [page])

  const handleNextPage = useCallback(() => {
    setPage(page + 1)
    setManuallyFetched(true)
  }, [page])

  const handlePageClick = useCallback((pageNum: number) => {
    setPage(pageNum)
    setManuallyFetched(true)
  }, [])

  // Render the component
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, type..."
              value={search}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="vector">Vector</SelectItem>
              <SelectItem value="raster">Raster</SelectItem>
              <SelectItem value="housing">Housing</SelectItem>
              <SelectItem value="boundary">Boundary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select
          value={`${sortBy}:${sortOrder}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="productionDate:desc">Newest first</SelectItem>
            <SelectItem value="productionDate:asc">Oldest first</SelectItem>
            <SelectItem value="dataName:asc">Name (A-Z)</SelectItem>
            <SelectItem value="dataName:desc">Name (Z-A)</SelectItem>
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
            {/* Memoize the loading skeletons */}
            {useMemo(
              () =>
                Array.from({ length: 5 }).map((_, i) => (
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
                )),
              []
            )}
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
                    <TableHead>Type</TableHead>
                    <TableHead>Cloud Cover</TableHead>
                    <TableHead>Production Date</TableHead>
                    <TableHead>Abstract</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {useMemo(() => {
                    // Memoize the table rows to prevent unnecessary re-renders
                    return data.metadata.map((item: MetadataItem) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/metadata/${item.id}`}
                            className="hover:underline text-primary"
                          >
                            {item.title}
                          </Link>
                        </TableCell>
                        <TableCell>{item.dataType || "Unknown"}</TableCell>
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
                    ))
                  }, [data.metadata, confirmDelete])}
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
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <div className="flex h-9 items-center gap-1.5">
                  {useMemo(() => {
                    // Memoize the pagination buttons to prevent unnecessary re-renders
                    return Array.from(
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
                            onClick={() => handlePageClick(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      }
                    )
                  }, [data.totalPages, page])}
                </div>
                <Button
                  onClick={handleNextPage}
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

// Apply memoization to the component
export const MetadataList = withMemo(MetadataListComponent)