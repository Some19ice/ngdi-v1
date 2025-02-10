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

const searchFormSchema = z.object({
  keyword: z.string().optional(),
  dataType: z.string().optional(),
  organization: z.string().optional(),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
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

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchResults, setSearchResults] = useState([])

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      keyword: searchParams.get("keyword") || "",
      dataType: searchParams.get("dataType") || "",
      organization: searchParams.get("organization") || "",
    },
  })

  async function onSubmit(data: SearchFormValues) {
    // TODO: Implement actual search functionality
    console.log(data)
  }

  return (
    <div className="container mx-auto space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Search Metadata</h1>
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
              <Button type="submit">Search</Button>
            </div>
          </form>
        </Form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Search Results</h2>
        {/* TODO: Add search results display */}
        <div className="grid gap-4">
          {searchResults.length === 0 ? (
            <p className="text-muted-foreground">
              No results found. Try adjusting your search criteria.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
