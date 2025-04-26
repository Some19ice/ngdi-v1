"use client"

import { useRouter } from "next/navigation"
import { LayoutListIcon, MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MetadataSearchParams } from "@/types/metadata"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ViewToggleProps {
  currentView: string
  searchParams: MetadataSearchParams
}

export default function ViewToggle({
  currentView,
  searchParams,
}: ViewToggleProps) {
  const router = useRouter()

  // Set view mode and update URL
  const setViewMode = (mode: string) => {
    // Skip if already in this mode
    if (mode === currentView) return

    // Build the query string preserving existing parameters
    const params = new URLSearchParams()

    // Copy existing parameters
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "viewMode") {
        // Skip the old viewMode
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v))
        } else if (value) {
          params.set(key, value.toString())
        }
      }
    })

    // Add the new view mode
    params.set("viewMode", mode)

    // Navigate to the updated URL
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="flex items-center border rounded-md overflow-hidden bg-background">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentView === "list" ? "default" : "ghost"}
              size="sm"
              className="px-3 h-9 rounded-none"
              onClick={() => setViewMode("list")}
            >
              <LayoutListIcon className="w-4 h-4 mr-2" />
              <span className="sr-only sm:not-sr-only">List View</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Display results as a list</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentView === "map" ? "default" : "ghost"}
              size="sm"
              className="px-3 h-9 rounded-none"
              onClick={() => setViewMode("map")}
            >
              <MapIcon className="w-4 h-4 mr-2" />
              <span className="sr-only sm:not-sr-only">Map View</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Display results on a map</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
