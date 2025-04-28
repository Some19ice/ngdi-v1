"use client"

import { useState } from "react"
import { useApiQuery } from "@/hooks/use-api-query"
import { services } from "@/lib/api/service-registry"
import { ApiDataWrapper } from "@/components/wrappers/api-data-wrapper"
import { PageErrorBoundary } from "@/components/wrappers/page-error-boundary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaginationControl } from "@/components/ui/pagination-control"

/**
 * Example component that demonstrates how to use the API services and error handling
 */
export function MetadataListExample() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Use React Query with our API service
  const { data, isLoading, error, refetch } = useApiQuery(
    ["metadata", page, limit],
    () => services.metadata.getPaginated(page, limit),
    {
      keepPreviousData: true,
    }
  )

  // Alternative approach using ApiDataWrapper
  return (
    <PageErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Metadata List Example</h1>
        <p className="text-muted-foreground">
          This component demonstrates how to use the standardized API services
          with proper error handling.
        </p>

        <ApiDataWrapper
          fetchData={() => services.metadata.getPaginated(page, limit)}
          dependencies={[page, limit]}
        >
          {(data) => (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.data.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge
                          variant={getStatusVariant(item.validationStatus)}
                        >
                          {item.validationStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description || "No description available"}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <PaginationControl
                  currentPage={page}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </ApiDataWrapper>
      </div>
    </PageErrorBoundary>
  )
}

// Helper function to get badge variant based on status
function getStatusVariant(
  status: string
): "default" | "outline" | "secondary" | "destructive" {
  switch (status?.toLowerCase()) {
    case "approved":
      return "default"
    case "pending":
      return "secondary"
    case "rejected":
      return "destructive"
    default:
      return "outline"
  }
}

export default MetadataListExample
