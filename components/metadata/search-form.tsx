"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { MetadataSearchParams } from "@/types/metadata"
import {
  TextSearchField,
  SelectSearchField,
  tooltips,
  descriptions,
} from "@/components/search/SearchFormBase"

const formSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface MetadataSearchFormProps {
  searchParams: MetadataSearchParams
}

// Category options for metadata search
const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "geodeticData", label: "Geodetic Data" },
  { value: "topographicData", label: "Topographic Data" },
  { value: "cadastralData", label: "Cadastral Data" },
  { value: "administrativeBoundaries", label: "Administrative Boundaries" },
  { value: "hydrographicData", label: "Hydrographic Data" },
  { value: "landUseLandCover", label: "Land Use/Land Cover" },
  { value: "geologicalData", label: "Geological Data" },
  { value: "demographicData", label: "Demographic Data" },
  { value: "digitalImagery", label: "Digital Imagery" },
  { value: "transportationData", label: "Transportation Data" },
  { value: "governmentData", label: "Government Data" },
  { value: "urbanPlanning", label: "Urban Planning" },
  { value: "censusData", label: "Census Data" },
  { value: "disasterManagement", label: "Disaster Management" },
  { value: "infrastructureData", label: "Infrastructure Data" },
  { value: "environmentData", label: "Environmental Data" },
  { value: "agriculturalData", label: "Agricultural Data" },
  { value: "elevation", label: "Elevation Data" },
]

// Sort options for metadata search
const sortByOptions = [
  { value: "createdAt", label: "Date Created" },
  { value: "dataName", label: "Data Name" },
  { value: "productionDate", label: "Production Date" },
]

// Sort order options
const sortOrderOptions = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
]

export default function MetadataSearchForm({
  searchParams,
}: MetadataSearchFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: searchParams.search || "",
      category: searchParams.category || "all",
      dateFrom: searchParams.dateFrom || "",
      dateTo: searchParams.dateTo || "",
      sortBy: searchParams.sortBy || "createdAt",
      sortOrder: (searchParams.sortOrder as "asc" | "desc") || "desc",
    },
  })

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsPending(true)

      // Build the query string
      const params = new URLSearchParams()

      if (values.search) params.set("search", values.search)
      if (values.category) params.set("category", values.category)
      if (values.dateFrom) params.set("dateFrom", values.dateFrom)
      if (values.dateTo) params.set("dateTo", values.dateTo)
      if (values.sortBy) params.set("sortBy", values.sortBy)
      if (values.sortOrder) params.set("sortOrder", values.sortOrder)

      // Reset to page 1 when search criteria change
      params.set("page", "1")

      // Navigate to the search page with the new params
      router.push(`/search/metadata?${params.toString()}`)
      setIsPending(false)
    },
    [router]
  )

  const handleReset = () => {
    form.reset({
      search: "",
      category: "all",
      dateFrom: "",
      dateTo: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    })
    router.push("/search/metadata")
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextSearchField
                control={form.control}
                name="search"
                label="Search"
                tooltip={tooltips.keyword}
                placeholder="E.g., flood map, soil analysis, Lagos population"
                description={descriptions.keyword}
              />

              <SelectSearchField
                control={form.control}
                name="category"
                label="Category"
                tooltip={tooltips.category}
                placeholder="Select a category"
                description={descriptions.category}
                options={categoryOptions}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextSearchField
                control={form.control}
                name="dateFrom"
                label="From Date"
                tooltip={tooltips.dateRange}
                placeholder="YYYY-MM-DD"
                description="Start date for metadata creation"
              />

              <TextSearchField
                control={form.control}
                name="dateTo"
                label="To Date"
                tooltip={tooltips.dateRange}
                placeholder="YYYY-MM-DD"
                description="End date for metadata creation"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectSearchField
                control={form.control}
                name="sortBy"
                label="Sort By"
                tooltip={tooltips.sortBy}
                placeholder="Sort by"
                description={descriptions.sortBy}
                options={sortByOptions}
              />

              <SelectSearchField
                control={form.control}
                name="sortOrder"
                label="Sort Order"
                tooltip={tooltips.sortOrder}
                placeholder="Sort order"
                description={descriptions.sortOrder}
                options={sortOrderOptions}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="w-full sm:w-auto"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Search
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
