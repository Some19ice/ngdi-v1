"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Download, UploadCloud } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MetadataStatus, ValidationStatus } from "@/types/metadata"

// Categories list
const categories = [
  "All Categories",
  "Vector",
  "Raster",
  "Boundaries",
  "Water Bodies",
  "Education",
  "Elevation",
  "Environment",
  "Geographic Information",
  "Health",
  "Transportation",
  "Utilities",
]

// Status values from the enum
const statuses = ["All Statuses", ...Object.values(MetadataStatus)]

const validationStatuses = [
  "All Validations",
  ...Object.values(ValidationStatus),
]

interface MetadataFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  selectedValidation: string
  setSelectedValidation: (validation: string) => void
  onExport: () => void
  onImport: () => void
}

export function MetadataFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedValidation,
  setSelectedValidation,
  onExport,
  onImport,
}: MetadataFiltersProps) {
  // Ensure we have valid values for all filters
  const safeSearchQuery = searchQuery || ""
  const safeCategory = selectedCategory || "All Categories"
  const safeStatus = selectedStatus || "All Statuses"
  const safeValidation = selectedValidation || "All Validations"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 flex-1 max-w-sm relative">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3" />
            <Input
              placeholder="Search metadata..."
              value={safeSearchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={onImport}>
              <UploadCloud className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={safeCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={safeStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={safeValidation} onValueChange={setSelectedValidation}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Validation" />
            </SelectTrigger>
            <SelectContent>
              {validationStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
