"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MetadataPaginationProps {
  currentPage: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function MetadataPagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: MetadataPaginationProps) {
  const pageSizeOptions = [10, 20, 50, 100]

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium">
          {Math.min((currentPage - 1) * pageSize + 1, total)}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(currentPage * pageSize, total)}
        </span>{" "}
        of <span className="font-medium">{total}</span> entries
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
