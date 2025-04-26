"use client"

// Import the dynamic configuration
import { dynamic } from "./page-config"
import { useState, useEffect, Suspense } from "react"
import { redirect, useRouter } from "next/navigation"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { adminGet } from "@/lib/api/admin-fetcher"
import { mockMetadataData } from "@/lib/mock/admin-data"
import { MOCK_ADMIN_USER } from "@/lib/auth/mock"

// Import subcomponents
import { MetadataFilters } from "./components/MetadataFilters"
import { MetadataTable } from "./components/MetadataTable"
import { MetadataPagination } from "./components/MetadataPagination"
import { SearchParamsWrapper } from "./components/SearchParamsWrapper"

export default function MetadataPage() {
  // Use mock admin user instead of auth session
  const user = MOCK_ADMIN_USER
  const isAdmin = user.role === UserRole.ADMIN
  const hasRole = (role: string) => role === UserRole.ADMIN

  const { toast } = useToast()
  const router = useRouter()

  // We'll use a client component with Suspense boundary for search params
  // Initial values will be set and then updated when the client component mounts
  const initialPageParam = null
  const initialLimitParam = null
  const initialSearchParam = null
  const initialCategoryParam = null
  const initialStatusParam = null
  const initialValidationParam = null

  // Set up state
  const [searchQuery, setSearchQuery] = useState(initialSearchParam || "")
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategoryParam || "All Categories"
  )
  const [selectedStatus, setSelectedStatus] = useState(
    initialStatusParam || "All Statuses"
  )
  const [selectedValidation, setSelectedValidation] = useState(
    initialValidationParam || "All Validations"
  )
  const [metadata, setMetadata] = useState<AdminMetadataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(
    initialPageParam ? parseInt(initialPageParam) : 1
  )
  const [pageSize, setPageSize] = useState(
    initialLimitParam ? parseInt(initialLimitParam) : 10
  )
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [useMockData, setUseMockData] = useState(false)

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

      try {
        // Call the API server using admin fetcher
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
        const url = `${apiUrl}/api/admin/metadata`
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
          ...(searchQuery && { search: searchQuery }),
          ...(selectedCategory !== "All Categories" && {
            category: selectedCategory,
          }),
          ...(selectedStatus !== "All Statuses" && { status: selectedStatus }),
          ...(selectedValidation !== "All Validations" && {
            validationStatus: selectedValidation,
          }),
        })

        const result = await adminGet(`${url}?${params.toString()}`)

        // Type-safe handling of the returned data
        if (result?.success && result.data) {
          setMetadata(result.data.metadata)
          setTotal(result.data.total || 0)
          setTotalPages(result.data.totalPages || 1)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Using mock metadata data:", error)
        setUseMockData(true)

        // Format the mock data to match AdminMetadataItem
        const mockItems: AdminMetadataItem[] = mockMetadataData.metadata.map(
          (item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            status: item.status as MetadataStatus,
            validationStatus:
              Math.random() > 0.7
                ? ValidationStatus.Validated
                : Math.random() > 0.4
                  ? ValidationStatus.Pending
                  : ValidationStatus.Failed,
            createdBy: item.createdBy,
            organization: item.organization,
            createdAt: item.createdAt.toString(),
            updatedAt: item.createdAt.toString(),
            viewCount: item.viewCount,
            downloadCount: item.downloadCount,
            // Additional required fields for AdminMetadataItem
            downloads: item.downloadCount,
            views: item.viewCount,
            tags: [item.category, "sample", "mock-data"],
            dateFrom: "2023-01-01",
            // Optional fields
            lastModified: item.createdAt.toString(),
            modifiedBy: item.createdBy,
          })
        )

        setMetadata(mockItems)
        setTotal(mockMetadataData.total)
        setTotalPages(mockMetadataData.totalPages)
        setError("Using mock metadata data for demonstration")
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
      setError("Failed to load metadata. Using mock data instead.")

      // Use mock data as fallback
      setUseMockData(true)
      const mockItems: AdminMetadataItem[] = mockMetadataData.metadata.map(
        (item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          status: item.status as MetadataStatus,
          validationStatus:
            Math.random() > 0.7
              ? ValidationStatus.Validated
              : Math.random() > 0.4
                ? ValidationStatus.Pending
                : ValidationStatus.Failed,
          createdBy: item.createdBy,
          organization: item.organization,
          createdAt: item.createdAt.toString(),
          updatedAt: item.createdAt.toString(),
          viewCount: item.viewCount,
          downloadCount: item.downloadCount,
          // Additional required fields for AdminMetadataItem
          downloads: item.downloadCount,
          views: item.viewCount,
          tags: [item.category, "sample", "mock-data"],
          dateFrom: "2023-01-01",
          // Optional fields
          lastModified: item.createdAt.toString(),
          modifiedBy: item.createdBy,
        })
      )

      setMetadata(mockItems)
      setTotal(mockMetadataData.total)
      setTotalPages(mockMetadataData.totalPages)
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
        toast({
          title: "Export successful",
          description: "Metadata has been successfully exported.",
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
  const handleImport = () => {
    try {
      // Open a file picker
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".csv"

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        try {
          const result = await importMetadata(file)

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
        } catch (importErr) {
          console.error("Error importing metadata:", importErr)
          toast({
            title: "Import failed",
            description:
              "An unexpected error occurred while importing the metadata.",
            variant: "destructive",
          })
        }
      }

      input.click()
    } catch (err) {
      console.error("Error opening file picker:", err)
      toast({
        title: "Import failed",
        description: "Failed to open file selector.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Wrap the search params in a Suspense boundary */}
      <Suspense fallback={null}>
        <SearchParamsWrapper
          setSearchQuery={setSearchQuery}
          setSelectedCategory={setSelectedCategory}
          setSelectedStatus={setSelectedStatus}
          setSelectedValidation={setSelectedValidation}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      </Suspense>

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
