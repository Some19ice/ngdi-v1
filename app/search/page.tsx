import { Suspense } from "react"
import { Metadata } from "next"
import { searchMetadata } from "@/app/actions/metadata"
import MetadataSearchForm from "@/components/metadata/search-form"
import MetadataResults from "@/components/metadata/results"
import { MetadataSearchParams } from "@/types/metadata"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Search Geospatial Data | NGDI Portal",
  description: "Search for geospatial metadata across the NGDI Portal",
}

// Search results skeleton component for loading state
function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex flex-wrap gap-2 pt-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface SearchPageProps {
  searchParams: MetadataSearchParams
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page.toString()) : 1
  const limit = searchParams.limit ? parseInt(searchParams.limit.toString()) : 9

  // Process array parameters
  const categories = searchParams.categories
    ? Array.isArray(searchParams.categories)
      ? searchParams.categories
      : [searchParams.categories]
    : []

  const dataTypes = searchParams.dataTypes
    ? Array.isArray(searchParams.dataTypes)
      ? searchParams.dataTypes
      : [searchParams.dataTypes]
    : []

  // Determine if we should show latest added results
  const showLatest =
    !searchParams.search &&
    !searchParams.author &&
    !searchParams.organization &&
    categories.length === 0 &&
    dataTypes.length === 0 &&
    !searchParams.dateFrom &&
    !searchParams.dateTo

  // If no search criteria and no sort specified, default to showing latest
  const sortBy = showLatest ? "createdAt" : searchParams.sortBy || "createdAt"
  const sortOrder = showLatest
    ? "desc"
    : (searchParams.sortOrder as "asc" | "desc") || "desc"

  const searchResult = await searchMetadata({
    page,
    limit,
    search: searchParams.search || "",
    category: searchParams.category || "",
    author: searchParams.author || "",
    organization: searchParams.organization || "",
    categories,
    dataTypes,
    dateFrom: searchParams.dateFrom || "",
    dateTo: searchParams.dateTo || "",
    sortBy,
    sortOrder,
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">
        Search for geospatial metadata by title, category, date range, or other
        attributes.
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Search Filters - Left Column */}
        <div className="lg:col-span-4">
          <MetadataSearchForm searchParams={searchParams} />
        </div>

        {/* Results - Right Column */}
        <div className="lg:col-span-8">
          <Suspense fallback={<SearchResultsSkeleton />}>
            <MetadataResults
              searchResult={searchResult}
              searchParams={searchParams}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
