"use client"

import {
  FormControl,
  FormDescription,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"
import { ReactNode } from "react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

// Custom FormLabel with tooltip component
export function LabelWithTooltip({
  label,
  tooltip,
}: {
  label: string
  tooltip: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <FormLabel>{label}</FormLabel>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

// Reusable text field with tooltip
export function TextSearchField({
  control,
  name,
  label,
  tooltip,
  placeholder,
  description,
}: {
  control: any
  name: string
  label: string
  tooltip: string
  placeholder: string
  description: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <LabelWithTooltip label={label} tooltip={tooltip} />
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormDescription className="text-xs text-muted-foreground">
            {description}
          </FormDescription>
        </FormItem>
      )}
    />
  )
}

// Reusable select field with tooltip
export function SelectSearchField<T extends string>({
  control,
  name,
  label,
  tooltip,
  placeholder,
  description,
  options,
}: {
  control: any
  name: string
  label: string
  tooltip: string
  placeholder: string
  description: string
  options: { value: T; label: string }[]
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <LabelWithTooltip label={label} tooltip={tooltip} />
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription className="text-xs text-muted-foreground">
            {description}
          </FormDescription>
        </FormItem>
      )}
    />
  )
}

// Reusable date range field with tooltip
export function DateRangeSearchField({
  control,
  name,
  label,
  tooltip,
  description,
}: {
  control: any
  name: string
  label: string
  tooltip: string
  description: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <LabelWithTooltip label={label} tooltip={tooltip} />
          <FormControl>
            <DatePickerWithRange date={field.value} onChange={field.onChange} />
          </FormControl>
          <FormDescription className="text-xs text-muted-foreground">
            {description}
          </FormDescription>
        </FormItem>
      )}
    />
  )
}

// Common tooltip texts that can be reused
export const tooltips = {
  keyword:
    "Search across titles, descriptions, and other fields. Try terms like 'flood map', 'Lagos', 'population census', or 'boundary'.",
  dataType:
    "Filter results by data type category. Each type represents a specific form of geospatial information.",
  organization:
    "Filter by the organization that created or maintains the dataset. Try acronyms like 'NGDI' or full organization names.",
  dateRange:
    "Filter datasets by creation or update date. Useful for finding recently added or historical data within a specific time period.",
  category:
    "Filter results by the fundamental dataset category. Useful when looking for specific types of geospatial data.",
  sortBy:
    "Choose how to order your search results. Sort by date created to see newest entries first, or alphabetically by name.",
  sortOrder:
    "Set the direction of sorting. Descending shows newest first when sorting by date.",
}

// Common description texts
export const descriptions = {
  keyword: "Enter specific terms to find relevant geospatial datasets",
  dataType: "Narrow results to a specific data format or category",
  organization: "Find datasets from specific organizations or departments",
  dateRange: "Limit results to a specific time period",
  category: "Filter by dataset category",
  sortBy: "Choose how results are ordered",
  sortOrder: "Set ascending or descending order",
}
