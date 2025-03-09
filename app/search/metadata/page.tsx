import { Suspense } from "react"
import { Metadata } from "next"
import { searchMetadata } from "@/app/actions/metadata"
import MetadataSearchForm from "@/components/metadata/search-form"
import MetadataResults from "@/components/metadata/results"
import { MetadataSearchParams } from "@/types/metadata"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Metadata Search | NGDI Portal",
  description: "Search and browse geospatial metadata in the NGDI Portal",
}

interface SearchPageProps {
  searchParams: MetadataSearchParams
}

export default async function MetadataSearchPage({
  searchParams,
}: SearchPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page.toString()) : 1
  const limit = searchParams.limit
    ? parseInt(searchParams.limit.toString())
    : 10

  const searchResult = await searchMetadata({
    page,
    limit,
    search: searchParams.search || "",
    category: searchParams.category || "",
    dateFrom: searchParams.dateFrom || "",
    dateTo: searchParams.dateTo || "",
    sortBy: searchParams.sortBy || "createdAt",
    sortOrder: (searchParams.sortOrder as "asc" | "desc") || "desc",
  })

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Metadata Search</h1>
        <p className="text-muted-foreground">
          Search and browse geospatial metadata in the NGDI Portal
        </p>
      </div>

      <MetadataSearchForm searchParams={searchParams} />

      <Suspense fallback={<SearchResultsSkeleton />}>
        <MetadataResults
          searchResult={searchResult}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-40 w-full rounded-md" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  )
}
