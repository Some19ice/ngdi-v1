"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, FileIcon, MapPinIcon, TagIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { MetadataItem } from "@/types/metadata"
import { getCookie } from "@/lib/utils"

const searchFormSchema = z.object({
  keyword: z.string().optional(),
  dataType: z.string().optional(),
  organization: z.string().optional(),
  dateRange: z
    .custom<DateRange>()
    .optional()
    .transform((val) => (!val?.from ? undefined : val)),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

const dataTypes = [
  { value: "vector", label: "Vector" },
  { value: "raster", label: "Raster" },
  { value: "boundary", label: "Boundary" },
  { value: "water-bodies", label: "Water Bodies" },
  { value: "education", label: "Education" },
  { value: "elevation", label: "Elevation" },
  { value: "environment", label: "Environment" },
  { value: "geographic", label: "Geographic Information" },
  { value: "health", label: "Health" },
  { value: "transportation", label: "Transportation" },
  { value: "utilities", label: "Utilities" },
]

function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<MetadataItem[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [authToken, setAuthToken] = useState<string>("")

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      keyword: searchParams?.get("keyword") || "",
      dataType: searchParams?.get("dataType") || "",
      organization: searchParams?.get("organization") || "",
      dateRange: undefined,
    },
  })

  // Get auth token on component mount
  useEffect(() => {
    const token = getCookie("auth_token")
    if (token) {
      setAuthToken(token)
    }
  }, [])

  // Load initial results based on URL parameters
  useEffect(() => {
    if (!authToken) return // Wait for auth token to be available

    const page = parseInt(searchParams?.get("page") || "1", 10)
    setCurrentPage(page)

    const initialSearch = {
      keyword: searchParams?.get("keyword") || "",
      dataType: searchParams?.get("dataType") || "",
      organization: searchParams?.get("organization") || "",
      dateRange: undefined as DateRange | undefined,
    }

    if (searchParams?.get("dateFrom")) {
      initialSearch.dateRange = {
        from: new Date(searchParams.get("dateFrom") as string),
        to: searchParams?.get("dateTo")
          ? new Date(searchParams.get("dateTo") as string)
          : undefined,
      }
    }

    fetchSearchResults(initialSearch, page)
  }, [searchParams, authToken])

  async function fetchSearchResults(data: SearchFormValues, page: number = 1) {
    if (!authToken) return // Don't fetch without auth token

    setIsLoading(true)

    try {
      // Prepare search parameters
      const searchParams = new URLSearchParams()
      searchParams.set("page", page.toString())
      searchParams.set("limit", "9") // Show 9 items per page

      if (data.keyword) searchParams.set("search", data.keyword)
      if (data.dataType && data.dataType !== "all")
        searchParams.set("category", data.dataType)
      if (data.organization) searchParams.set("organization", data.organization)
      if (data.dateRange?.from) {
        searchParams.set("dateFrom", data.dateRange.from.toISOString())
      }
      if (data.dateRange?.to) {
        searchParams.set("dateTo", data.dateRange.to.toISOString())
      }

      console.log("Fetching search results:", {
        url: `/api/search/metadata?${searchParams.toString()}`,
        hasAuthToken: !!authToken,
        authTokenLength: authToken.length,
      })

      // Fetch data from API with auth token
      const response = await fetch(
        `/api/search/metadata?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Search results:", {
        success: result.success,
        total: result.data?.total,
        metadataCount: result.data?.metadata?.length,
      })

      setSearchResults(result.data.metadata || [])
      setTotalResults(result.data.total || 0)
      setTotalPages(result.data.totalPages || 1)
      setCurrentPage(result.data.currentPage || 1)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
      setTotalResults(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(data: SearchFormValues) {
    // Update URL with search params
    const params = new URLSearchParams()
    if (data.keyword) params.set("keyword", data.keyword)
    if (data.dataType) params.set("dataType", data.dataType)
    if (data.organization) params.set("organization", data.organization)
    if (data.dateRange?.from) {
      params.set("dateFrom", data.dateRange.from.toISOString())
    }
    if (data.dateRange?.to) {
      params.set("dateTo", data.dateRange.to.toISOString())
    }
    params.set("page", "1") // Reset to first page on new search

    router.push(`/search?${params.toString()}`)

    // Fetch results
    fetchSearchResults(data, 1)
  }

  // Function to build pagination URL
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set("page", page.toString())
    return `/search?${params.toString()}`
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Search Geospatial Data</h1>
        <p className="text-muted-foreground">
          Search through Nigeria&apos;s geospatial data infrastructure using
          various criteria.
        </p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keyword Search</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Search by name, ID, type..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {dataTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Filter by organization..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Range</FormLabel>
                    <FormControl>
                      <DatePickerWithRange
                        date={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || !authToken}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Search Results</h2>
          {searchResults.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {searchResults.length} of {totalResults} results
            </p>
          )}
        </div>

        {isLoading ? (
          <SearchResultsSkeleton />
        ) : !authToken ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-6">
              Please log in to search metadata records.
            </p>
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-6">
              No results found. Try adjusting your search criteria.
            </p>

            <div className="max-w-2xl mx-auto bg-muted/30 p-4 rounded-lg border border-border">
              <h3 className="font-medium mb-2">Search Tips:</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>
                  Try searching for general terms like &quot;water&quot;,
                  &quot;boundary&quot;, or &quot;education&quot;
                </li>
                <li>Filter by data type using the dropdown menu</li>
                <li>
                  If searching by organization, try using common abbreviations
                  (e.g., &quot;NGDI&quot;)
                </li>
                <li>
                  Use the date range filter to narrow results by time period
                </li>
                <li>Check if there are any metadata records in the system</li>
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="font-medium mb-4">Sample Search Categories:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {dataTypes.slice(0, 6).map((type) => (
                  <Button
                    key={type.value}
                    variant="outline"
                    onClick={() => {
                      form.setValue("dataType", type.value)
                      form.handleSubmit(onSubmit)()
                    }}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((result) => (
                <Card
                  key={result.id}
                  className="overflow-hidden flex flex-col h-full"
                >
                  <div className="aspect-video relative bg-muted">
                    <div className="flex items-center justify-center w-full h-40 bg-secondary/20">
                      <FileIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <Badge className="absolute top-2 right-2">
                      {result.dataType || "Unknown"}
                    </Badge>
                  </div>

                  <div className="p-4 flex-grow space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {result.title}
                    </h3>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPinIcon className="mr-2 h-4 w-4" />
                      <span>Nigeria</span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <TagIcon className="mr-2 h-4 w-4" />
                      <span>{result.organization || "NGDI"}</span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {result.abstract || "No description available"}
                    </p>
                  </div>

                  <div className="p-4 pt-0 mt-auto">
                    <Button asChild className="w-full">
                      <Link href={`/metadata/${result.id}`}>View Details</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Pagination className="mt-8">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={getPaginationUrl(currentPage - 1)}
                    />
                  </PaginationItem>
                )}

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageToShow = i + 1

                  if (totalPages > 5) {
                    if (i === 0) {
                      pageToShow = 1
                    } else if (i === 4) {
                      pageToShow = totalPages
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i
                    } else {
                      pageToShow = currentPage - 1 + i
                    }
                  }

                  if (
                    (pageToShow > 2 && currentPage > 3 && i === 1) ||
                    (pageToShow < totalPages - 1 &&
                      currentPage < totalPages - 2 &&
                      i === 3)
                  ) {
                    return (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }

                  return (
                    <PaginationItem key={pageToShow}>
                      <PaginationLink
                        href={getPaginationUrl(pageToShow)}
                        isActive={pageToShow === currentPage}
                      >
                        {pageToShow}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext href={getPaginationUrl(currentPage + 1)} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </>
        )}
      </div>
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
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchForm />
    </Suspense>
  )
}
