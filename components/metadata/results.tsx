"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
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
import { CalendarIcon, FileIcon, MapPinIcon } from "lucide-react"

interface MetadataResultsProps {
  searchResult: any
  searchParams: MetadataSearchParams
}

export default function MetadataResults({
  searchResult,
  searchParams,
}: MetadataResultsProps) {
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
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria
        </p>
      </div>
    )
  }

  // Function to build pagination URL
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams()

    if (searchParams.search)
      params.set("search", searchParams.search.toString())
    if (searchParams.category)
      params.set("category", searchParams.category.toString())
    if (searchParams.dateFrom)
      params.set("dateFrom", searchParams.dateFrom.toString())
    if (searchParams.dateTo)
      params.set("dateTo", searchParams.dateTo.toString())
    if (searchParams.sortBy)
      params.set("sortBy", searchParams.sortBy.toString())
    if (searchParams.sortOrder)
      params.set("sortOrder", searchParams.sortOrder.toString())

    params.set("page", page.toString())

    return `/metadata?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {metadata.length} of {total} results
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metadata.map((item: any) => (
          <Card key={item.id} className="overflow-hidden flex flex-col h-full">
            <div className="aspect-video relative bg-muted">
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.dataName}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-secondary/20">
                  <FileIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <Badge className="absolute top-2 right-2">{item.dataType}</Badge>
            </div>

            <CardContent className="pt-6 flex-grow">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {item.dataName}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>
                    {format(new Date(item.productionDate), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPinIcon className="mr-2 h-4 w-4" />
                  <span>
                    {item.state}, {item.country}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                {item.abstract}
              </p>
            </CardContent>

            <CardFooter className="pt-0">
              <Button asChild className="w-full">
                <Link href={`/metadata/${item.id}`}>View Details</Link>
              </Button>
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
