"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MetadataSearchParams } from "@/types/metadata"

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

export default function MetadataSearchForm({
  searchParams,
}: MetadataSearchFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: searchParams.search || "",
      category: searchParams.category || "",
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
      router.push(`/metadata?${params.toString()}`)
      setIsPending(false)
    },
    [router]
  )

  const handleReset = () => {
    form.reset({
      search: "",
      category: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    })
    router.push("/metadata")
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Search by name or description..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        <SelectItem value="geodeticData">
                          Geodetic Data
                        </SelectItem>
                        <SelectItem value="topographicData">
                          Topographic Data
                        </SelectItem>
                        <SelectItem value="cadastralData">
                          Cadastral Data
                        </SelectItem>
                        <SelectItem value="administrativeBoundaries">
                          Administrative Boundaries
                        </SelectItem>
                        <SelectItem value="hydrographicData">
                          Hydrographic Data
                        </SelectItem>
                        <SelectItem value="landUseLandCover">
                          Land Use/Land Cover
                        </SelectItem>
                        <SelectItem value="geologicalData">
                          Geological Data
                        </SelectItem>
                        <SelectItem value="demographicData">
                          Demographic Data
                        </SelectItem>
                        <SelectItem value="digitalImagery">
                          Digital Imagery
                        </SelectItem>
                        <SelectItem value="transportationData">
                          Transportation Data
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sortBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort By</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="createdAt">Date Created</SelectItem>
                        <SelectItem value="dataName">Data Name</SelectItem>
                        <SelectItem value="productionDate">
                          Production Date
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
