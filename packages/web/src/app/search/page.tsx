import { Metadata } from "next"
import MetadataSearchForm from "@/components/metadata/search-form"
import MetadataResultsList from "@/components/metadata/results"
import { MetadataSearchParams } from "@/types/metadata"
import Link from "next/link"
import Script from "next/script"
import { prisma } from "@/lib/prisma"
// Import dynamic configuration
import { dynamic } from "./page-config"

export const metadata: Metadata = {
  title: "Search - NGDI Portal",
  description: "Search for geospatial metadata records in the NGDI Portal",
}

function serializeParams(
  params: Record<string, string | string[] | undefined>
) {
  return Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = Array.isArray(value) ? value : String(value)
      }
      return acc
    },
    {} as Record<string, string | string[]>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  // Create a serializable version of the search parameters
  const serializedParams = serializeParams(searchParams)

  // Extract search parameters from URL query
  // Using both q and search to support different parameter names
  const searchQuery =
    typeof searchParams.search === "string"
      ? searchParams.search
      : typeof searchParams.q === "string"
        ? searchParams.q
        : ""

  const searchParamsObj: MetadataSearchParams = {
    q: searchQuery,
    page:
      typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1,
    limit:
      typeof searchParams.limit === "string"
        ? parseInt(searchParams.limit)
        : 10,
    sortBy:
      typeof searchParams.sortBy === "string"
        ? searchParams.sortBy
        : "relevance",
    viewMode:
      typeof searchParams.viewMode === "string" &&
      (searchParams.viewMode === "list" || searchParams.viewMode === "map")
        ? (searchParams.viewMode as "list" | "map")
        : "list",
  }

  // Build database query
  const where: any = {}

  // Add search term filter
  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { dataName: { contains: searchQuery, mode: "insensitive" } },
      { abstract: { contains: searchQuery, mode: "insensitive" } },
      { purpose: { contains: searchQuery, mode: "insensitive" } },
    ]
  }

  // Add author filter if present
  if (
    typeof searchParams.author === "string" &&
    searchParams.author.trim() !== ""
  ) {
    where.author = {
      contains: searchParams.author,
      mode: "insensitive",
    }
  }

  // Add category filter if present
  if (searchParams.categories) {
    const categories = Array.isArray(searchParams.categories)
      ? searchParams.categories
      : [searchParams.categories]

    // Only add if there are actual categories (excluding "all")
    const validCategories = categories.filter((cat) => cat !== "all")
    if (validCategories.length > 0) {
      where.categories = {
        hasSome: validCategories,
      }
    }
  }

  // Add data type filter if present
  if (searchParams.dataTypes) {
    const dataTypes = Array.isArray(searchParams.dataTypes)
      ? searchParams.dataTypes
      : [searchParams.dataTypes]

    if (dataTypes.length > 0) {
      where.dataType = {
        in: dataTypes,
        mode: "insensitive",
      }
    }
  }

  // Add organization filter if present
  if (
    typeof searchParams.organization === "string" &&
    searchParams.organization.trim() !== ""
  ) {
    where.organization = {
      contains: searchParams.organization,
      mode: "insensitive",
    }
  }

  // Add date filters if present
  if (
    typeof searchParams.dateFrom === "string" &&
    searchParams.dateFrom.trim() !== ""
  ) {
    where.productionDate = {
      gte: searchParams.dateFrom,
    }
  }

  if (
    typeof searchParams.dateTo === "string" &&
    searchParams.dateTo.trim() !== ""
  ) {
    if (where.productionDate) {
      where.productionDate.lte = searchParams.dateTo
    } else {
      where.productionDate = {
        lte: searchParams.dateTo,
      }
    }
  }

  // Sort parameters
  const sortOrder = searchParams.sortOrder === "asc" ? "asc" : "desc"
  const sortField =
    typeof searchParams.sortBy === "string"
      ? searchParams.sortBy === "relevance"
        ? "createdAt"
        : searchParams.sortBy
      : "createdAt"

  // Fetch real metadata from the database
  const skip = ((searchParamsObj.page || 1) - 1) * (searchParamsObj.limit || 10)
  const take = searchParamsObj.limit || 10

  console.log("Search query:", {
    searchQuery,
    where,
    sortBy: sortField,
    sortOrder,
    skip,
    take,
  })

  const [results, total] = await Promise.all([
    prisma.metadata.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortField as string]: sortOrder,
      },
      select: {
        id: true,
        title: true,
        dataName: true,
        abstract: true,
        purpose: true,
        organization: true,
        categories: true,
        productionDate: true,
        updatedAt: true,
        createdAt: true,
        validationStatus: true,
        cloudCoverPercentage: true,
        minLatitude: true,
        minLongitude: true,
        maxLatitude: true,
        maxLongitude: true,
        dataType: true,
        fileFormat: true,
      },
    }),
    prisma.metadata.count({ where }),
  ])

  // Transform the data to match the expected format for MetadataResultsList
  const formattedResults = results.map((item) => ({
    id: item.id,
    title: item.dataName || item.title,
    description: item.abstract || "",
    created_at: item.createdAt.toISOString(),
    updated_at: item.updatedAt.toISOString(),
    bbox: [
      item.minLongitude || 0,
      item.minLatitude || 0,
      item.maxLongitude || 0,
      item.maxLatitude || 0,
    ],
    topics: item.categories,
    resource_type: item.dataType || "dataset",
    organization: item.organization || "Unknown",
    quality_score: 75, // Default quality score
    validation_status: item.validationStatus || "pending",
  }))

  const isViewMode = (mode: "list" | "map"): boolean => {
    return searchParamsObj.viewMode === mode
  }

  // Determine if there are any search parameters active
  const hasActiveSearch =
    searchQuery ||
    searchParams.author ||
    searchParams.organization ||
    searchParams.categories ||
    searchParams.dataTypes ||
    searchParams.dateFrom ||
    searchParams.dateTo ||
    searchParams.sortBy ||
    searchParams.page !== undefined ||
    searchParams.limit !== undefined ||
    searchParams.viewMode !== undefined

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Search Geospatial Data</h1>
        <p className="text-muted-foreground">
          Find authoritative geospatial datasets and services from across
          Nigeria.
        </p>
      </div>

      {/* Hydration data for client-side JavaScript */}
      <script
        id="search-hydration-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            searchParams: serializedParams,
            total,
          }),
        }}
      />

      {/* Grid layout with filters on left and results on right */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left sidebar with filters */}
        <div className="md:col-span-1">
          <div className="sticky top-4 space-y-6">
            <div className="border rounded-md p-4 bg-white shadow-sm">
              <h2 className="text-lg font-medium mb-4">Search Filters</h2>
              <MetadataSearchForm initialQ={searchQuery} />
            </div>

            {/* Saved searches and advanced filters */}
            <div className="border rounded-md p-4 bg-white shadow-sm">
              <h2 className="text-sm font-medium mb-3">Saved & Advanced</h2>
              <div className="space-y-2">
                <div id="saved-searches-container">
                  {/* This will be hydrated by client-side JS */}
                </div>
                <div id="advanced-filters-container">
                  {/* This will be hydrated by client-side JS */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side with results */}
        <div className="md:col-span-3">
          {/* Controls and filters bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* View toggle */}
              <div id="view-toggle-container" className="h-9">
                {/* This will be hydrated by client-side JS */}
              </div>

              {/* Mobile advanced filters */}
              <div id="advanced-filters-mobile-container" className="sm:hidden">
                {/* This will be hydrated by client-side JS */}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Results count */}
              <div className="text-sm text-muted-foreground ml-auto">
                {total > 0 ? (
                  <>
                    Showing {formattedResults.length} of {total} results
                  </>
                ) : (
                  <>No results found</>
                )}
              </div>
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveSearch && (
            <div className="mb-4 flex flex-wrap gap-2">
              <Link
                href="/search"
                className="text-sm text-primary underline hover:text-primary/80 flex items-center gap-1 mr-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                Clear all filters
              </Link>

              {/* Display active filters as badges */}
              {searchQuery && (
                <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1">
                  Search: {searchQuery}
                </div>
              )}

              {typeof searchParams.organization === "string" &&
                searchParams.organization.trim() !== "" && (
                  <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1">
                    Organization: {searchParams.organization}
                  </div>
                )}

              {typeof searchParams.author === "string" &&
                searchParams.author.trim() !== "" && (
                  <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1">
                    Author: {searchParams.author}
                  </div>
                )}

              {searchParams.categories &&
                (Array.isArray(searchParams.categories)
                  ? searchParams.categories
                      .filter((c) => c !== "all")
                      .map((category) => (
                        <div
                          key={category}
                          className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1"
                        >
                          Category: {category}
                        </div>
                      ))
                  : searchParams.categories !== "all" && (
                      <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1">
                        Category: {searchParams.categories}
                      </div>
                    ))}
            </div>
          )}

          {/* Conditional rendering based on view mode */}
          {isViewMode("list") ? (
            <MetadataResultsList
              results={formattedResults}
              searchParams={searchParamsObj}
              viewMode="list"
            />
          ) : isViewMode("map") ? (
            <MetadataResultsList
              results={formattedResults}
              searchParams={searchParamsObj}
              viewMode="map"
            />
          ) : (
            <MetadataResultsList
              results={formattedResults}
              searchParams={searchParamsObj}
              viewMode="list"
            />
          )}
        </div>
      </div>

      {/* Client-side hydration script */}
      <Script src="/scripts/search-hydration.js" strategy="afterInteractive" />
    </main>
  )
}
