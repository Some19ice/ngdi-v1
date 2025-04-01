"use client"

import { useState, useEffect, Suspense } from "react"
import { redirect, useSearchParams, useRouter } from "next/navigation"
import { useAuthSession } from "@/hooks/use-auth-session"
import {
  MetadataStatus,
  ValidationStatus,
  AdminMetadataItem,
} from "@/types/metadata"
import { UserRole } from "@/lib/auth/constants"
import { useToast } from "@/components/ui/use-toast"
import {
  deleteMetadata,
  validateMetadata,
  exportMetadata,
  importMetadata,
} from "./actions"
import { getAdminMetadata } from "@/app/actions/metadata"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Import subcomponents
import { MetadataFilters } from "./components/MetadataFilters"
import { MetadataTable } from "./components/MetadataTable"
import { MetadataPagination } from "./components/MetadataPagination"

export default function MetadataPage() {
  const { user, isAdmin, hasRole } = useAuthSession()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // If not authenticated or not admin, redirect to login
  useEffect(() => {
    if (!user) {
      router.push("/auth/signin?callbackUrl=/admin/metadata")
      return
    }

    if (user.role !== UserRole.ADMIN) {
      router.push("/unauthorized")
      return
    }
  }, [user, router])

  // Get search parameters from URL (with null safety)
  const pageParam = searchParams?.get("page") ?? null
  const limitParam = searchParams?.get("limit") ?? null
  const searchParam = searchParams?.get("search") ?? null
  const categoryParam = searchParams?.get("category") ?? null
  const statusParam = searchParams?.get("status") ?? null
  const validationParam = searchParams?.get("validation") ?? null

  // Set up state
  const [searchQuery, setSearchQuery] = useState(searchParam || "")
  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || "All Categories"
  )
  const [selectedStatus, setSelectedStatus] = useState(
    statusParam || "All Statuses"
  )
  const [selectedValidation, setSelectedValidation] = useState(
    validationParam || "All Validations"
  )
  const [metadata, setMetadata] = useState<AdminMetadataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(pageParam ? parseInt(pageParam) : 1)
  const [pageSize, setPageSize] = useState(
    limitParam ? parseInt(limitParam) : 10
  )
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Function to update the URL with search parameters
  const updateSearchParams = (
    params: Record<string, string | number | null>
  ) => {
    const url = new URL(window.location.href)

    // Update existing search params
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        url.searchParams.delete(key)
      } else {
        url.searchParams.set(key, value.toString())
      }
    })

    // Replace the URL without reloading the page
    router.replace(url.pathname + url.search, { scroll: false })
  }

  // Function to fetch metadata with current filters
  const fetchMetadata = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Call the server action to get data
      const result = await getAdminMetadata({
        page,
        limit: pageSize,
        search: searchQuery,
        category: selectedCategory === "All Categories" ? "" : selectedCategory,
        status: selectedStatus === "All Statuses" ? "" : selectedStatus,
        validationStatus:
          selectedValidation === "All Validations" ? "" : selectedValidation,
      })

      // Type-safe handling of the returned data
      if (result && Array.isArray(result.metadata)) {
        setMetadata(result.metadata as AdminMetadataItem[])
        setTotal(result.total || 0)
        setTotalPages(result.totalPages || 1)
      } else {
        console.error("Invalid data format returned:", result)
        setMetadata([])
        setTotal(0)
        setTotalPages(1)
        setError("Invalid response format. Please try again.")
      }

      // Update URL parameters
      updateSearchParams({
        page,
        limit: pageSize,
        search: searchQuery || null,
        category:
          selectedCategory === "All Categories" ? null : selectedCategory,
        status: selectedStatus === "All Statuses" ? null : selectedStatus,
        validation:
          selectedValidation === "All Validations" ? null : selectedValidation,
      })
    } catch (err) {
      console.error("Failed to fetch metadata:", err)
      setError("Failed to load metadata. Please try again later.")
      setMetadata([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch metadata when filters change
  useEffect(() => {
    fetchMetadata()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedValidation,
  ])

  // Render loading state if user not loaded yet
  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p>Loading authentication...</p>
      </div>
    )
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1) // Reset to first page when changing page size
  }

  // Handle filter clearing
  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All Categories")
    setSelectedStatus("All Statuses")
    setSelectedValidation("All Validations")
    setPage(1)
  }

  // Handle metadata validation
  const handleValidate = async (id: string) => {
    try {
      const result = await validateMetadata(id)

      if (result.success) {
        toast({
          title: "Metadata validated",
          description: "The metadata has been successfully validated.",
          variant: "default",
        })

        fetchMetadata() // Refresh the list
      } else {
        toast({
          title: "Validation failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error validating metadata:", err)
      toast({
        title: "Validation failed",
        description:
          "An unexpected error occurred while validating the metadata.",
        variant: "destructive",
      })
    }
  }

  // Handle metadata deletion
  const handleDelete = async (id: string) => {
    try {
      const result = await deleteMetadata(id)

      if (result.success) {
        toast({
          title: "Metadata deleted",
          description: "The metadata has been successfully deleted.",
          variant: "default",
        })

        fetchMetadata() // Refresh the list
      } else {
        toast({
          title: "Deletion failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error deleting metadata:", err)
      toast({
        title: "Deletion failed",
        description:
          "An unexpected error occurred while deleting the metadata.",
        variant: "destructive",
      })
    }
  }

  // Handle metadata export
  const handleExport = async () => {
    try {
      const result = await exportMetadata()

      if (result.success) {
        // In a real app, this would download a CSV file
        const itemCount =
          result.data && Array.isArray(result.data) ? result.data.length : 0

        toast({
          title: "Export successful",
          description: `Exported ${itemCount} metadata items`,
          variant: "default",
        })
      } else {
        toast({
          title: "Export failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error exporting metadata:", err)
      toast({
        title: "Export failed",
        description:
          "An unexpected error occurred while exporting the metadata.",
        variant: "destructive",
      })
    }
  }

  // Handle metadata import
  const handleImport = async () => {
    try {
      // In a real app, this would open a file picker
      const result = await importMetadata({})

      if (result.success) {
        toast({
          title: "Import successful",
          description: "The metadata has been successfully imported.",
          variant: "default",
        })

        fetchMetadata() // Refresh the list
      } else {
        toast({
          title: "Import failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error importing metadata:", err)
      toast({
        title: "Import failed",
        description:
          "An unexpected error occurred while importing the metadata.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Metadata Management</CardTitle>
          <CardDescription>
            Review and manage all metadata entries in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetadataFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedValidation={selectedValidation}
            setSelectedValidation={setSelectedValidation}
            onExport={handleExport}
            onImport={handleImport}
          />

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">{error}</div>
          ) : (
            <>
              <MetadataTable
                metadata={metadata}
                isLoading={false}
                error={null}
                onValidate={handleValidate}
                onDelete={handleDelete}
                onClearFilters={handleClearFilters}
              />
              <MetadataPagination
                currentPage={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
