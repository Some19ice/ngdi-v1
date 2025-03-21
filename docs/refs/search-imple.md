# Metadata Search Feature Implementation

This document contains the complete implementation of the metadata search feature including the main page component, search form, and results component.

## Types

### MetadataResult

```typescript
export type MetadataResult = {
  id: string
  title: string
  author: string
  organization: string
  dateUpdated: string
  categories: string[]
  description: string
}
```

## Search Form Component

### Imports

```typescript
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Search, XCircle } from "lucide-react"
```

### Form Schema

```typescript
const formSchema = z.object({
  keyword: z.string().optional(),
  author: z.string().optional(),
  organization: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  categories: z.array(z.string()).optional(),
  dataTypes: z.array(z.string()).optional(),
})
```

### Categories and Data Types

```typescript
const categories = [
  { value: "boundaries", label: "Boundaries" },
  { value: "transportation", label: "Transportation" },
  { value: "hydrography", label: "Hydrography" },
  { value: "elevation", label: "Elevation" },
  { value: "land_cover", label: "Land Cover" },
  { value: "geology", label: "Geology" },
  { value: "climate", label: "Climate" },
  { value: "socioeconomic", label: "Socioeconomic" },
  { value: "utilities", label: "Utilities" },
]

const dataTypes = [
  { id: "vector", label: "Vector Data" },
  { id: "raster", label: "Raster Data" },
  { id: "tabular", label: "Tabular Data" },
]
```

### Search Form Component

```typescript
type SearchFormProps = {
  onSearch: (data: any) => void
}

export const MetadataSearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: "",
      author: "",
      organization: "",
      dateFrom: "",
      dateTo: "",
      categories: [],
      dataTypes: [],
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    onSearch(data)
  })

  const resetForm = () => {
    form.reset({
      keyword: "",
      author: "",
      organization: "",
      dateFrom: "",
      dateTo: "",
      categories: [],
      dataTypes: [],
    })
    onSearch({})
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Search Filters</h2>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="keyword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keyword Search</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Search by title, description..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input placeholder="Author name" {...field} />
                </FormControl>
                <FormMessage />
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
                  <Input placeholder="Organization name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date From</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date To</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="categories"
            render={() => (
              <FormItem>
                <div className="mb-2">
                  <FormLabel>Categories</FormLabel>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <FormField
                      key={category.value}
                      control={form.control}
                      name="categories"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={category.value}
                            className="flex items-center space-x-1 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        category.value,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== category.value
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {category.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataTypes"
            render={() => (
              <FormItem>
                <div className="mb-2">
                  <FormLabel>Data Types</FormLabel>
                </div>
                <div className="flex flex-wrap gap-6">
                  {dataTypes.map((type) => (
                    <FormField
                      key={type.id}
                      control={form.control}
                      name="dataTypes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={type.id}
                            className="flex items-center space-x-1 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(type.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        type.id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== type.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {type.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex items-center gap-2">
              <Search className="w-4 h-4" /> Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Reset
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
```

## Search Results Component

### Imports

```typescript
import { Link } from "react-router-dom"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Eye, User } from "lucide-react"
```

### Results Component

```typescript
type SearchResultsProps = {
  results: MetadataResult[]
  isLoading: boolean
}

export const MetadataSearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <Card key={item}>
            <CardHeader className="pb-2">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-gray-500 mb-4">No results found</div>
          <p className="text-gray-400 text-sm">
            Try adjusting your search criteria or removing some filters
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-2">
        Found {results.length} results
      </div>

      {results.map((result) => (
        <Card
          key={result.id}
          className="overflow-hidden transition-all hover:shadow-md"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{result.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <User className="w-3 h-3" /> {result.author},{" "}
              {result.organization}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{result.description}</p>

            <div className="flex flex-wrap gap-2">
              {result.categories.map((category) => (
                <Badge key={category} variant="outline" className="capitalize">
                  {category.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t bg-gray-50 px-6">
            <div className="text-gray-500 text-sm flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Updated {result.dateUpdated}
            </div>
            <Link to={`/metadata/view/${result.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Eye className="w-3 h-3" /> View
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
```

## Main Page Component

### Imports

```typescript
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { PlusCircle } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
```

### Metadata Search Page Component

```typescript
const MetadataSearch = () => {
  const [searchResults, setSearchResults] = useState<MetadataResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 10
  const navigate = useNavigate()
  const { toast } = useToast()

  // Initial data load
  useEffect(() => {
    fetchMetadata({})
  }, [currentPage])

  /**
   * Fetch metadata from Supabase with optional search filters
   */
  const fetchMetadata = async (searchParams: any) => {
    setIsSearching(true)
    setError(null)

    try {
      let query = supabase
        .from("metadata")
        .select(
          "id, title, author, organization, date_updated, categories, description",
          { count: "exact" }
        )

      // Apply filters based on search parameters
      if (searchParams.keyword) {
        query = query.or(
          `title.ilike.%${searchParams.keyword}%,description.ilike.%${searchParams.keyword}%`
        )
      }

      if (searchParams.author) {
        query = query.ilike("author", `%${searchParams.author}%`)
      }

      if (searchParams.organization) {
        query = query.ilike("organization", `%${searchParams.organization}%`)
      }

      if (searchParams.dateFrom) {
        query = query.gte("date_from", searchParams.dateFrom)
      }

      if (searchParams.dateTo) {
        query = query.lte("date_to", searchParams.dateTo)
      }

      if (searchParams.categories && searchParams.categories.length > 0) {
        query = query.overlaps("categories", searchParams.categories)
      }

      if (searchParams.dataTypes && searchParams.dataTypes.length > 0) {
        query = query.overlaps("data_types", searchParams.dataTypes)
      }

      // Add pagination
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      const { data, count, error } = await query
        .order("date_updated", { ascending: false })
        .range(from, to)

      if (error) throw error

      // Transform data to match the expected format
      const formattedResults = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        author: item.author,
        organization: item.organization,
        dateUpdated: new Date(item.date_updated).toISOString().split("T")[0],
        categories: item.categories || [],
        description: item.description || "",
      }))

      setSearchResults(formattedResults)
      setTotalCount(count || 0)
    } catch (error: any) {
      console.error("Error fetching metadata:", error)
      setError("Failed to fetch metadata. Please try again.")
      toast({
        title: "Error",
        description: "Failed to fetch metadata. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  /**
   * Handle search form submission
   */
  const handleSearch = (searchParams: any) => {
    setCurrentPage(1) // Reset to first page on new search
    fetchMetadata(searchParams)
  }

  /**
   * Handle pagination
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Search Metadata</h1>

            <Button
              onClick={() => navigate("/metadata/add")}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add New Metadata
            </Button>
          </div>

          <p className="text-gray-600 mb-8">
            Search for geospatial metadata by title, category, date range, or
            other attributes.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <MetadataSearchForm onSearch={handleSearch} />
            </div>

            <div className="lg:col-span-8">
              {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                  {error}
                </div>
              ) : (
                <>
                  <MetadataSearchResults
                    results={searchResults}
                    isLoading={isSearching}
                  />

                  {totalPages > 1 && !isSearching && (
                    <div className="mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                handlePageChange(Math.max(1, currentPage - 1))
                              }
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>

                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                              // Show first page, last page, current page, and pages adjacent to current
                              return (
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1
                              )
                            })
                            .map((page, index, array) => {
                              // Add ellipsis if there are gaps
                              const prevPage = array[index - 1]
                              const showEllipsis =
                                prevPage && page - prevPage > 1

                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && (
                                    <PaginationItem>
                                      <span className="px-4 py-2">...</span>
                                    </PaginationItem>
                                  )}
                                  <PaginationItem>
                                    <PaginationLink
                                      isActive={page === currentPage}
                                      onClick={() => handlePageChange(page)}
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                </React.Fragment>
                              )
                            })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                handlePageChange(
                                  Math.min(totalPages, currentPage + 1)
                                )
                              }
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default MetadataSearch
```
```