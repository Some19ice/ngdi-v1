"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { type NewsFilters } from "./types"

interface NewsFiltersProps {
  filters: NewsFilters
  onChange: (filters: NewsFilters) => void
}

export function NewsFilters({ filters, onChange }: NewsFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(localFilters)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [localFilters, onChange])

  const handleReset = () => {
    const resetFilters: NewsFilters = {
      search: "",
      category: undefined,
      status: undefined,
      visibility: undefined,
      dateRange: undefined,
    }
    setLocalFilters(resetFilters)
    onChange(resetFilters)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Input
        placeholder="Search news..."
        value={localFilters.search || ""}
        onChange={(e) =>
          setLocalFilters({ ...localFilters, search: e.target.value })
        }
        className="w-full sm:w-[300px]"
      />
      <Select
        value={localFilters.category}
        onValueChange={(value) =>
          setLocalFilters({ ...localFilters, category: value })
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GENERAL">General</SelectItem>
          <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
          <SelectItem value="UPDATE">Update</SelectItem>
          <SelectItem value="ALERT">Alert</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={localFilters.status}
        onValueChange={(value) =>
          setLocalFilters({ ...localFilters, status: value })
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="PUBLISHED">Published</SelectItem>
          <SelectItem value="ARCHIVED">Archived</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={localFilters.visibility}
        onValueChange={(value) =>
          setLocalFilters({ ...localFilters, visibility: value })
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PUBLIC">Public</SelectItem>
          <SelectItem value="PRIVATE">Private</SelectItem>
          <SelectItem value="ROLE_BASED">Role Based</SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left sm:w-[240px]",
              !localFilters.dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {localFilters.dateRange ? (
              format(localFilters.dateRange.from, "LLL dd, y")
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: localFilters.dateRange?.from,
              to: localFilters.dateRange?.to,
            }}
            onSelect={(range) =>
              setLocalFilters({
                ...localFilters,
                dateRange:
                  range?.from && range?.to
                    ? { from: range.from, to: range.to }
                    : undefined,
              })
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {Object.values(localFilters).some((v) => v !== undefined) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Reset filters</span>
        </Button>
      )}
    </div>
  )
}
