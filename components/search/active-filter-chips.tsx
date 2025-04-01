"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { MetadataSearchParams } from "@/types/metadata"
import { format } from "date-fns"

interface ActiveFilterChipsProps {
  searchParams: MetadataSearchParams
}

export default function ActiveFilterChips({
  searchParams,
}: ActiveFilterChipsProps) {
  const router = useRouter()

  // Helper function to remove a filter and update the URL
  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams()

    // Copy all current search params except the one being removed
    Object.entries(searchParams).forEach(([paramKey, paramValue]) => {
      if (paramKey === key) {
        // For array params (categories, dataTypes), remove specific value
        if (Array.isArray(paramValue) && value) {
          const newValues = paramValue.filter((v) => v !== value)
          newValues.forEach((v) => params.append(paramKey, v))
        } else if (
          typeof paramValue === "string" &&
          value &&
          paramValue !== value
        ) {
          // Keep the param if it's not the specific value we're removing
          params.set(paramKey, paramValue)
        }
        // If we're removing the entire param or it matches exactly, don't add it back
      } else if (paramKey !== "page") {
        // Copy all other params except page (reset to page 1)
        if (Array.isArray(paramValue)) {
          paramValue.forEach((v) => params.append(paramKey, v))
        } else if (paramValue) {
          params.set(paramKey, paramValue.toString())
        }
      }
    })

    // Reset to page 1 when filters change
    params.set("page", "1")

    // Navigate to the updated URL
    router.push(`/search?${params.toString()}`)
  }

  // Function to get a user-friendly label for a filter
  const getFilterLabel = (key: string, value: string) => {
    switch (key) {
      case "search":
        return `Keyword: ${value}`
      case "author":
        return `Author: ${value}`
      case "organization":
        return `Organization: ${value}`
      case "dateFrom":
        return `From: ${format(new Date(value), "PP")}`
      case "dateTo":
        return `To: ${format(new Date(value), "PP")}`
      case "categories":
        // Format category names for display
        return value
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
      case "dataTypes":
        // Map dataType values to friendly names
        const dataTypeMap: Record<string, string> = {
          vector: "Vector Data",
          raster: "Raster Data",
          tabular: "Tabular Data",
        }
        return dataTypeMap[value] || value
      case "sortBy":
      case "sortOrder":
        // Don't show chips for sort options
        return null
      default:
        return `${key}: ${value}`
    }
  }

  // Count active filters
  const activeFilterCount = Object.entries(searchParams).reduce(
    (count, [key, value]) => {
      if (
        ["search", "author", "organization", "dateFrom", "dateTo"].includes(
          key
        ) &&
        value
      ) {
        return count + 1
      }
      if (
        (key === "categories" || key === "dataTypes") &&
        Array.isArray(value)
      ) {
        return count + value.length
      }
      return count
    },
    0
  )

  if (activeFilterCount === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">Active filters:</span>

        {searchParams.search && (
          <Badge variant="secondary" className="flex items-center gap-1 pl-3">
            {getFilterLabel("search", searchParams.search.toString())}
            <X
              className="w-3 h-3 ml-1 cursor-pointer"
              onClick={() => removeFilter("search")}
            />
          </Badge>
        )}

        {searchParams.author && (
          <Badge variant="secondary" className="flex items-center gap-1 pl-3">
            {getFilterLabel("author", searchParams.author.toString())}
            <X
              className="w-3 h-3 ml-1 cursor-pointer"
              onClick={() => removeFilter("author")}
            />
          </Badge>
        )}

        {searchParams.organization && (
          <Badge variant="secondary" className="flex items-center gap-1 pl-3">
            {getFilterLabel(
              "organization",
              searchParams.organization.toString()
            )}
            <X
              className="w-3 h-3 ml-1 cursor-pointer"
              onClick={() => removeFilter("organization")}
            />
          </Badge>
        )}

        {searchParams.dateFrom && (
          <Badge variant="secondary" className="flex items-center gap-1 pl-3">
            {getFilterLabel("dateFrom", searchParams.dateFrom.toString())}
            <X
              className="w-3 h-3 ml-1 cursor-pointer"
              onClick={() => removeFilter("dateFrom")}
            />
          </Badge>
        )}

        {searchParams.dateTo && (
          <Badge variant="secondary" className="flex items-center gap-1 pl-3">
            {getFilterLabel("dateTo", searchParams.dateTo.toString())}
            <X
              className="w-3 h-3 ml-1 cursor-pointer"
              onClick={() => removeFilter("dateTo")}
            />
          </Badge>
        )}

        {/* Handle array parameters */}
        {searchParams.categories &&
          (Array.isArray(searchParams.categories)
            ? searchParams.categories
            : [searchParams.categories]
          ).map((category) => (
            <Badge
              key={`category-${category}`}
              variant="secondary"
              className="flex items-center gap-1 pl-3"
            >
              {getFilterLabel("categories", category)}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => removeFilter("categories", category)}
              />
            </Badge>
          ))}

        {searchParams.dataTypes &&
          (Array.isArray(searchParams.dataTypes)
            ? searchParams.dataTypes
            : [searchParams.dataTypes]
          ).map((dataType) => (
            <Badge
              key={`dataType-${dataType}`}
              variant="secondary"
              className="flex items-center gap-1 pl-3"
            >
              {getFilterLabel("dataTypes", dataType)}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => removeFilter("dataTypes", dataType)}
              />
            </Badge>
          ))}

        {activeFilterCount > 0 && (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => router.push("/search")}
          >
            Clear all filters
            <X className="w-3 h-3 ml-1" />
          </Badge>
        )}
      </div>
    </div>
  )
}
