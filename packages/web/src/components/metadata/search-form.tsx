"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { MetadataSearchParams } from "@/types/metadata"
import { Search, XCircle, CalendarIcon, ChevronDown } from "lucide-react"
import {
  TextSearchField,
  SelectSearchField,
  tooltips,
  descriptions,
  LabelWithTooltip,
} from "@/components/search/SearchFormBase"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

const formSchema = z.object({
  keyword: z.string().optional(),
  author: z.string().optional(),
  organization: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  categories: z.array(z.string()).optional(),
  dataTypes: z.array(z.string()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface MetadataSearchFormProps {
  initialQ?: string
}

// Group categories for better organization
const categoryGroups = [
  {
    name: "Boundaries and Administration",
    items: [
      { value: "boundaries", label: "Boundaries" },
      { value: "administrativeBoundaries", label: "Administrative Boundaries" },
      { value: "cadastralData", label: "Cadastral Data" },
    ],
  },
  {
    name: "Geography and Environment",
    items: [
      { value: "elevation", label: "Elevation" },
      { value: "land_cover", label: "Land Cover" },
      { value: "geology", label: "Geology" },
      { value: "climate", label: "Climate" },
      { value: "hydrography", label: "Hydrography" },
    ],
  },
  {
    name: "Infrastructure and Society",
    items: [
      { value: "transportation", label: "Transportation" },
      { value: "utilities", label: "Utilities" },
      { value: "socioeconomic", label: "Socioeconomic" },
      { value: "demographicData", label: "Demographic Data" },
    ],
  },
  {
    name: "Technical Data",
    items: [
      { value: "geodeticData", label: "Geodetic Data" },
      { value: "topographicData", label: "Topographic Data" },
      { value: "digitalImagery", label: "Digital Imagery" },
    ],
  },
]

// Flattened category options for compatibility
const categoryOptions = [
  { value: "all", label: "All Categories" },
  ...categoryGroups.flatMap((group) => group.items),
]

// Data type options
const dataTypeOptions = [
  { id: "vector", label: "Vector Data" },
  { id: "raster", label: "Raster Data" },
  { id: "tabular", label: "Tabular Data" },
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

// Common search suggestions
const searchSuggestions = [
  "Boundaries",
  "Population",
  "Land use",
  "Hydrography",
  "Transportation network",
  "Administrative regions",
  "Census data",
  "Flood map",
  "Elevation model",
  "Road network",
  "Utilities",
  "Satellite imagery",
  "Lagos",
  "Abuja",
  "Rivers",
  "Environmental data",
]

export default function MetadataSearchForm({ initialQ = "" }: MetadataSearchFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] =
    useState(searchSuggestions)
  const [inputValue, setInputValue] = useState(initialQ || "")

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue) {
      const filtered = searchSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(inputValue.toString().toLowerCase())
      )
      setFilteredSuggestions(filtered)
    } else {
      setFilteredSuggestions(searchSuggestions)
    }
  }, [inputValue])

  // Add click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".search-suggestion-container")) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: initialQ || "",
      author: "",
      organization: "",
      dateFrom: "",
      dateTo: "",
      categories: [],
      dataTypes: [],
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  })

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    form.setValue("keyword", suggestion)
    setInputValue(suggestion)
    setShowSuggestions(false)
  }

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsPending(true)

      // Build the query string
      const params = new URLSearchParams()

      if (values.keyword) params.set("search", values.keyword)
      if (values.author) params.set("author", values.author)
      if (values.organization) params.set("organization", values.organization)
      if (values.dateFrom) params.set("dateFrom", values.dateFrom)
      if (values.dateTo) params.set("dateTo", values.dateTo)
      if (values.categories && values.categories.length > 0) {
        values.categories.forEach((category) => {
          params.append("categories", category)
        })
      }
      if (values.dataTypes && values.dataTypes.length > 0) {
        values.dataTypes.forEach((dataType) => {
          params.append("dataTypes", dataType)
        })
      }
      if (values.sortBy) params.set("sortBy", values.sortBy)
      if (values.sortOrder) params.set("sortOrder", values.sortOrder)

      // Reset to page 1 when search criteria change
      params.set("page", "1")

      // Navigate to the search page with the new params
      router.push(`/search?${params.toString()}`)
      setIsPending(false)
    },
    [router]
  )

  const handleReset = () => {
    form.reset({
      keyword: "",
      author: "",
      organization: "",
      dateFrom: "",
      dateTo: "",
      categories: [],
      dataTypes: [],
      sortBy: "createdAt",
      sortOrder: "desc",
    })
    router.push("/search")
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Search Filters</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Search Fields */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem className="relative">
                    <LabelWithTooltip
                      label="Keyword Search"
                      tooltip={tooltips.keyword}
                    />
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Search by title, description..."
                          {...field}
                          value={inputValue}
                          onChange={(e) => {
                            field.onChange(e)
                            setInputValue(e.target.value)
                            setShowSuggestions(true)
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          className="w-full"
                        />
                        {showSuggestions && inputValue && (
                          <div
                            className="absolute top-full left-0 right-0 bg-white shadow-md rounded-md border border-input z-50 mt-1 max-h-60 overflow-y-auto search-suggestion-container"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <Command>
                              <CommandList>
                                <CommandGroup heading="Suggestions">
                                  {filteredSuggestions.length === 0 ? (
                                    <CommandEmpty>
                                      No suggestions found
                                    </CommandEmpty>
                                  ) : (
                                    filteredSuggestions.map((suggestion) => (
                                      <CommandItem
                                        key={suggestion}
                                        onSelect={() =>
                                          handleSelectSuggestion(suggestion)
                                        }
                                        className="cursor-pointer hover:bg-muted"
                                      >
                                        {suggestion}
                                      </CommandItem>
                                    ))
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </div>
                        )}
                      </div>
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
                    <LabelWithTooltip
                      label="Author"
                      tooltip="Filter by the author who created the dataset"
                    />
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
                    <LabelWithTooltip
                      label="Organization"
                      tooltip={tooltips.organization}
                    />
                    <FormControl>
                      <Input placeholder="Organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            {/* Date Range */}
            <div>
              <h3 className="text-sm font-medium mb-3">Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateFrom"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>From</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : ""
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateTo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>To</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : ""
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Categories & Data Types in Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="categories">
                <AccordionTrigger className="text-sm font-medium">
                  <LabelWithTooltip
                    label="Categories"
                    tooltip="Filter by specific dataset categories"
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 mt-2">
                    {categoryGroups.map((group) => (
                      <div key={group.name} className="space-y-1">
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">
                          {group.name}
                        </h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {group.items.map((category) => (
                            <FormField
                              key={category.value}
                              control={form.control}
                              name="categories"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        category.value
                                      )}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...(field.value || []),
                                              category.value,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) =>
                                                  value !== category.value
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {category.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dataTypes">
                <AccordionTrigger className="text-sm font-medium">
                  <LabelWithTooltip
                    label="Data Types"
                    tooltip={tooltips.dataType}
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {dataTypeOptions.map((type) => (
                      <FormField
                        key={type.id}
                        control={form.control}
                        name="dataTypes"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
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
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {type.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator className="my-4" />

            {/* Sort Options */}
            <div>
              <h3 className="text-sm font-medium mb-3">Sort Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sortBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort By</FormLabel>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {sortByOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {sortOrderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1 flex items-center gap-2 justify-center"
              >
                <XCircle className="w-4 h-4" /> Reset
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 flex items-center gap-2 justify-center"
              >
                {isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
