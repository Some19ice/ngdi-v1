"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  CalendarIcon,
  FileIcon,
  InfoIcon,
  MapPinIcon,
  TagIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { MetadataItem } from "@/types/metadata"
import { getCookie } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  TextSearchField,
  SelectSearchField,
  DateRangeSearchField,
  tooltips,
  descriptions,
} from "@/components/search/SearchFormBase"

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
  { value: "Vector", label: "Vector" },
  { value: "Raster", label: "Raster" },
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

// Custom FormLabel with tooltip component
function LabelWithTooltip({
  label,
  tooltip,
}: {
  label: string
  tooltip: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <FormLabel>{label}</FormLabel>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

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
      dataType: searchParams?.get("dataType") || "all",
      organization: searchParams?.get("organization") || "",
      dateRange: undefined,
    },
  })

  // Define fetchSearchResults before using it in useEffect
  const fetchSearchResults = useCallback(
    async (data: SearchFormValues, page: number = 1) => {
      setIsLoading(true)

      try {
        // Prepare search parameters
        const searchParams = new URLSearchParams()
        searchParams.set("page", page.toString())
        searchParams.set("limit", "9") // Show 9 items per page

        // Add search term and ensure it's properly formatted
        if (data.keyword && data.keyword.trim()) {
          const cleanKeyword = data.keyword.trim()
          searchParams.set("search", cleanKeyword)
          console.log(`Adding search term: "${cleanKeyword}"`)
        }

        // Add category filter
        if (data.dataType && data.dataType !== "all") {
          // For Vector and Raster, include a hint to use frameworkType filter
          if (data.dataType === "Vector" || data.dataType === "Raster") {
            searchParams.set("frameworkType", data.dataType)
          }
          searchParams.set("category", data.dataType)
          console.log(
            `Adding category filter: ${data.dataType} (original value: ${data.dataType})`
          )
        }

        // Add organization filter
        if (data.organization && data.organization.trim()) {
          searchParams.set("organization", data.organization.trim())
          console.log(`Adding organization filter: ${data.organization}`)
        }

        // Add date filters
        if (data.dateRange?.from) {
          const dateFrom = data.dateRange.from.toISOString()
          searchParams.set("dateFrom", dateFrom)
          console.log(`Adding date from: ${dateFrom}`)
        }

        if (data.dateRange?.to) {
          const dateTo = data.dateRange.to.toISOString()
          searchParams.set("dateTo", dateTo)
          console.log(`Adding date to: ${dateTo}`)
        }

        const apiUrl = `/api/search/metadata?${searchParams.toString()}`

        // Get the latest token before making the request
        const currentToken =
          getCookie("auth_token") ||
          localStorage.getItem("auth_token") ||
          authToken

        console.log("Fetching search results:", {
          url: apiUrl,
          hasAuthToken: !!currentToken,
          authTokenLength: currentToken?.length,
          params: Object.fromEntries(searchParams.entries()),
          dataTypeValue: data.dataType,
        })

        // Fetch data from API with auth token if available
        const response = await fetch(apiUrl, {
          headers: currentToken
            ? { Authorization: `Bearer ${currentToken}` }
            : undefined,
        })

        if (!response.ok) {
          console.error("API error response:", {
            status: response.status,
            statusText: response.statusText,
          })
          throw new Error(`Search failed: ${response.statusText}`)
        }

        const result = await response.json()
        console.log("Search API response:", {
          success: result.success,
          total: result.data?.total || 0,
          metadataCount: result.data?.metadata?.length || 0,
          firstItem: result.data?.metadata?.[0]
            ? {
                id: result.data.metadata[0].id,
                title: result.data.metadata[0].title,
              }
            : "none",
          metadata: result.data?.metadata?.slice(0, 2) || [], // Show first 2 items for debug
        })

        setSearchResults(result.data?.metadata || [])
        setTotalResults(result.data?.total || 0)
        setTotalPages(result.data?.totalPages || 1)
        setCurrentPage(result.data?.currentPage || 1)
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
        setTotalResults(0)
        setTotalPages(1)
      } finally {
        setIsLoading(false)
      }
    },
    [authToken]
  )

  // Get auth token on component mount
  useEffect(() => {
    const getToken = () => {
      // Track if we've set a token to avoid duplicates
      let hasSetToken = false

      // Try to get token from cookie
      const token = getCookie("auth_token")

      if (token) {
        console.log("Auth token from cookie:", {
          hasToken: true,
          tokenLength: token.length,
        })
        setAuthToken(token)
        return // Exit early if token found
      }

      // If no token in cookie, check localStorage as fallback
      try {
        const storedToken = localStorage.getItem("auth_token")
        if (storedToken) {
          console.log("Auth token from localStorage:", {
            hasToken: true,
            tokenLength: storedToken.length,
          })
          setAuthToken(storedToken)
          return // Exit early if token found
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error)
      }

      // If still no token, try to get it from API directly
      console.log(
        "No token found in cookie or localStorage, trying API auth check"
      )
      fetch("/api/auth/check", {
        credentials: "include", // Important: include cookies in the request
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Auth check response:", {
            success: !!data,
            authenticated: data?.authenticated,
            hasUser: !!data?.user,
          })

          if (data?.authenticated && data?.user) {
            // After successful auth, check for cookies again
            setTimeout(() => {
              const cookieToken = getCookie("auth_token")
              if (cookieToken) {
                console.log("Auth token from cookie after auth check:", {
                  hasToken: true,
                  tokenLength: cookieToken.length,
                })
                setAuthToken(cookieToken)
              }
            }, 100) // Small delay to allow cookies to be set
          }
        })
        .catch((error) => {
          console.error("Error fetching auth session:", error)
        })
    }

    getToken()

    // Set up an interval to periodically check for token changes
    // Use a longer interval to reduce duplicate checks
    const tokenCheckInterval = setInterval(getToken, 10000)

    return () => clearInterval(tokenCheckInterval)
  }, [])

  // Immediately execute search on component mount
  useEffect(() => {
    // Run a search with empty parameters to show all results
    fetchSearchResults(
      {
        keyword: "",
        dataType: "all",
        organization: "",
        dateRange: undefined,
      },
      1
    )
  }, [fetchSearchResults])

  // Load initial results based on URL parameters
  useEffect(() => {
    const page = parseInt(searchParams?.get("page") || "1", 10)
    setCurrentPage(page)

    const initialSearch = {
      keyword: searchParams?.get("keyword") || "",
      dataType: searchParams?.get("dataType") || "all",
      organization: searchParams?.get("organization") || "",
      dateRange: undefined as DateRange | undefined,
    }

    // Debug the initial search parameters
    console.log("Initial search parameters:", initialSearch)

    if (searchParams?.get("dateFrom")) {
      initialSearch.dateRange = {
        from: new Date(searchParams.get("dateFrom") as string),
        to: searchParams?.get("dateTo")
          ? new Date(searchParams.get("dateTo") as string)
          : undefined,
      }
    }

    fetchSearchResults(initialSearch, page)
  }, [searchParams, fetchSearchResults])

  async function onSubmit(data: SearchFormValues) {
    // Debug log
    console.log("Search form submitted with:", {
      keyword: data.keyword || "(empty)",
      dataType: data.dataType || "(all)",
      organization: data.organization || "(none)",
      dateRange: data.dateRange
        ? {
            from: data.dateRange.from?.toISOString(),
            to: data.dateRange.to?.toISOString(),
          }
        : "(none)",
    })

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

    const searchUrl = `/search?${params.toString()}`
    console.log("Navigating to:", searchUrl)
    router.push(searchUrl)

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
              <TextSearchField
                control={form.control}
                name="keyword"
                label="Keyword Search"
                tooltip={tooltips.keyword}
                placeholder="Search by name, ID, type..."
                description={descriptions.keyword}
              />

              <SelectSearchField
                control={form.control}
                name="dataType"
                label="Data Type"
                tooltip={tooltips.dataType}
                placeholder="Select data type"
                description={descriptions.dataType}
                options={[{ value: "all", label: "All types" }, ...dataTypes]}
              />

              <TextSearchField
                control={form.control}
                name="organization"
                label="Organization"
                tooltip={tooltips.organization}
                placeholder="Filter by organization..."
                description={descriptions.organization}
              />

              <DateRangeSearchField
                control={form.control}
                name="dateRange"
                label="Date Range"
                tooltip={tooltips.dateRange}
                description={descriptions.dateRange}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
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
                    {authToken ? (
                      <Button asChild className="w-full">
                        <Link href={`/metadata/${result.id}`}>
                          View Details
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href="/login?returnUrl=/search">
                          Log in to view details
                        </Link>
                      </Button>
                    )}
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
