"use client"

import { useState } from "react"
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
  { value: "water-bodies", label: "Water Bodies" },
  { value: "boundaries", label: "Boundaries" },
  { value: "education", label: "Education" },
  { value: "elevation", label: "Elevation" },
  { value: "environment", label: "Environment" },
  { value: "geographic", label: "Geographic Information" },
  { value: "health", label: "Health" },
  { value: "imagery", label: "Imagery/Earthly Observations" },
  { value: "transportation", label: "Transportation" },
  { value: "utilities", label: "Utilities" },
]

// Mock data for search results
const mockSearchResults = [
  {
    id: "1",
    title: "Nigeria Administrative Boundaries",
    description:
      "Administrative boundaries for Nigeria including states and local government areas",
    dataType: "boundaries",
    organization: "National Geospatial Data Infrastructure",
    createdAt: "2023-05-15T10:30:00Z",
    thumbnailUrl: "/images/sample-map-1.jpg",
    location: "Nigeria",
  },
  {
    id: "2",
    title: "Water Resources Map of Nigeria",
    description:
      "Comprehensive mapping of water resources across Nigeria including rivers, lakes, and groundwater sources",
    dataType: "water-bodies",
    organization: "Ministry of Water Resources",
    createdAt: "2023-06-22T14:45:00Z",
    thumbnailUrl: "/images/sample-map-2.jpg",
    location: "Nigeria",
  },
  {
    id: "3",
    title: "Educational Facilities Distribution",
    description:
      "Distribution of educational facilities across Nigeria including primary, secondary, and tertiary institutions",
    dataType: "education",
    organization: "Ministry of Education",
    createdAt: "2023-07-10T09:15:00Z",
    thumbnailUrl: null,
    location: "Nigeria",
  },
]

function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState(mockSearchResults)
  const [totalResults, setTotalResults] = useState(42)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(5)

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      keyword: searchParams?.get("keyword") || "",
      dataType: searchParams?.get("dataType") || "",
      organization: searchParams?.get("organization") || "",
      dateRange: undefined,
    },
  })

  async function onSubmit(data: SearchFormValues) {
    setIsLoading(true)

    try {
      // In a real implementation, this would be an API call
      console.log("Search criteria:", data)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

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

      router.push(`/search?${params.toString()}`)

      // Filter mock results based on search criteria
      let filteredResults = [...mockSearchResults]
      if (data.dataType) {
        filteredResults = filteredResults.filter(
          (item) => item.dataType === data.dataType
        )
      }
      if (data.keyword) {
        const keyword = data.keyword.toLowerCase()
        filteredResults = filteredResults.filter(
          (item) =>
            item.title.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword)
        )
      }
      if (data.organization) {
        const org = data.organization.toLowerCase()
        filteredResults = filteredResults.filter((item) =>
          item.organization.toLowerCase().includes(org)
        )
      }

      setSearchResults(filteredResults)
      setTotalResults(filteredResults.length + 39) // Mock total for pagination demo
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
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
                      <Input placeholder="Search by keyword..." {...field} />
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No results found. Try adjusting your search criteria.
            </p>
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
                    {result.thumbnailUrl ? (
                      <Image
                        src={result.thumbnailUrl}
                        alt={result.title}
                        width={400}
                        height={300}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-40 bg-secondary/20">
                        <FileIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2">
                      {dataTypes.find((t) => t.value === result.dataType)
                        ?.label || result.dataType}
                    </Badge>
                  </div>

                  <div className="p-4 flex-grow space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {result.title}
                    </h3>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPinIcon className="mr-2 h-4 w-4" />
                      <span>{result.location}</span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <TagIcon className="mr-2 h-4 w-4" />
                      <span>{result.organization}</span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {result.description}
                    </p>
                  </div>

                  <div className="p-4 pt-0 mt-auto">
                    <Button asChild className="w-full">
                      <Link href={`/data/${result.id}`}>View Details</Link>
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
