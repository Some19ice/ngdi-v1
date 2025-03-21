"use client"

import Link from "next/link"
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { MetadataSearchParams } from "@/types/metadata"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, FileIcon, MapPinIcon, User, Eye } from "lucide-react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface MetadataResultsProps {
  searchResult: any
  searchParams: MetadataSearchParams
  isLoading?: boolean
}

export default function MetadataResults({
  searchResult,
  searchParams,
  isLoading = false,
}: MetadataResultsProps) {
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

  if (!searchResult.success) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="text-muted-foreground">
          {searchResult.error || "Failed to load metadata"}
        </p>
      </div>
    )
  }

  const { metadata, total, currentPage, totalPages } = searchResult.data

  if (metadata.length === 0) {
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

  // Function to build pagination URL
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams()

    if (searchParams.search)
      params.set("search", searchParams.search.toString())
    if (searchParams.category)
      params.set("category", searchParams.category.toString())
    if (searchParams.author)
      params.set("author", searchParams.author.toString())
    if (searchParams.organization)
      params.set("organization", searchParams.organization.toString())
    if (searchParams.dateFrom)
      params.set("dateFrom", searchParams.dateFrom.toString())
    if (searchParams.dateTo)
      params.set("dateTo", searchParams.dateTo.toString())
    if (searchParams.sortBy)
      params.set("sortBy", searchParams.sortBy.toString())
    if (searchParams.sortOrder)
      params.set("sortOrder", searchParams.sortOrder.toString())

    params.set("page", page.toString())

    return `/search?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Found {total} results</p>
      </div>

      <div className="space-y-4">
        {metadata.map((item: any) => (
          <Card
            key={item.id}
            className="overflow-hidden transition-all hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                {item.title || item.dataName}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <User className="w-3 h-3" /> {item.author}, {item.organization}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{item.abstract}</p>

              <div className="flex flex-wrap gap-2">
                {(item.categories || []).map((category: string) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="capitalize"
                  >
                    {category.replace(/_/g, " ")}
                  </Badge>
                ))}
                {item.frameworkType && (
                  <Badge variant="outline">{item.frameworkType}</Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t bg-gray-50 px-6">
              <div className="text-gray-500 text-sm flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> Updated{" "}
                {item.updatedAt
                  ? format(new Date(item.updatedAt), "MMM d, yyyy")
                  : format(new Date(), "MMM d, yyyy")}
              </div>
              <Link href={`/metadata/${item.id}`}>
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

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious href={getPaginationUrl(currentPage - 1)} />
              </PaginationItem>
            )}

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show first page, last page, current page, and pages around current
              let pageToShow = 1 // Default to first page

              if (i === 0) {
                pageToShow = 1
              } else if (i === 4 && totalPages > 4) {
                pageToShow = totalPages
              } else if (totalPages <= 5) {
                pageToShow = i + 1
              } else {
                // For the middle 3 slots in a larger pagination
                if (currentPage <= 3) {
                  pageToShow = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageToShow = totalPages - 4 + i
                } else {
                  pageToShow = currentPage - 1 + i
                }
              }

              // Show ellipsis for gaps
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
      )}
    </div>
  )
}
