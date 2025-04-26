"use client"

import Link from "next/link"
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MetadataSearchParams } from "@/types/metadata"
import { Badge } from "@/components/ui/badge"
import {
  CalendarIcon,
  User,
  Eye,
  Map,
  Share2,
  Download,
  Bookmark,
  Mail,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MetadataResultsProps {
  results: Array<{
    id: string
    title: string
    description: string
    created_at: string
    updated_at: string
    bbox: number[]
    topics: string[]
    resource_type: string
    organization: string
    quality_score: number
    validation_status: string
  }>
  searchParams?: MetadataSearchParams
  isLoading?: boolean
  viewMode?: string
}

export default function MetadataResultsList({
  results,
  searchParams = {},
  isLoading = false,
  viewMode = "list",
}: MetadataResultsProps) {
  // Add state for share functionality
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareSearchUrl, setShareSearchUrl] = useState<boolean>(false)

  // Handle share functionality
  const handleShare = (id: string) => {
    const url = `${window.location.origin}/metadata/${id}`
    // Copy to clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => {
        // Show temporary message
        setShareUrl(id)
        setTimeout(() => setShareUrl(null), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err)
      })
  }

  // Handle share search functionality
  const handleShareSearch = () => {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}`
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShareSearchUrl(true)
        setTimeout(() => setShareSearchUrl(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy search URL: ", err)
      })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <Card key={item}>
            <CardHeader className="pb-2">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (!results.length) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No Results</h3>
        <p className="text-muted-foreground">
          No results found. Try adjusting your search criteria.
        </p>
      </div>
    )
  }

  // Render map view if selected
  if (viewMode === "map") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Found {results.length} results
          </p>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleShareSearch}
          >
            <Share2 className="w-3 h-3" /> Share search
          </Button>
        </div>

        {shareSearchUrl && (
          <div className="bg-green-100 text-green-800 text-center py-2 px-4 rounded-md text-sm">
            Search URL copied to clipboard! You can now share it with others.
          </div>
        )}

        <div className="border rounded-md shadow-sm p-4 bg-muted/30 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-muted-foreground/60"
            >
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
              <line x1="9" x2="9" y1="3" y2="18"></line>
              <line x1="15" x2="15" y1="6" y2="21"></line>
            </svg>
            <h3 className="text-lg font-medium mb-2">Map View</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              The map view would display search results geographically. This
              requires integration with a mapping library like Leaflet or
              Mapbox.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Full implementation requires backend support for spatial queries.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Default list view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Found {results.length} results
        </p>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleShareSearch}
        >
          <Share2 className="w-3 h-3" /> Share search
        </Button>
      </div>

      {shareSearchUrl && (
        <div className="bg-green-100 text-green-800 text-center py-2 px-4 rounded-md text-sm">
          Search URL copied to clipboard! You can now share it with others.
        </div>
      )}

      <div className="space-y-4">
        {results.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden transition-all hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <User className="w-3 h-3" /> {item.organization}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{item.description}</p>

              <div className="flex flex-wrap gap-2">
                {(item.topics || []).map((topic: string) => (
                  <Badge key={topic} variant="outline" className="capitalize">
                    {topic.replace(/_/g, " ")}
                  </Badge>
                ))}
                <Badge variant="outline">{item.resource_type}</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t bg-gray-50 px-6">
              <div className="text-gray-500 text-sm flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> Updated{" "}
                {format(new Date(item.updated_at), "MMM d, yyyy")}
              </div>

              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 h-8 w-8 p-0 justify-center"
                        aria-label="View on map"
                      >
                        <Map className="w-4 h-4 text-blue-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View on map</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 h-8 w-8 p-0 justify-center"
                        aria-label="Download metadata"
                      >
                        <Download className="w-4 h-4 text-green-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download metadata</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 h-8 w-8 p-0 justify-center"
                        aria-label="Save for later"
                      >
                        <Bookmark className="w-4 h-4 text-amber-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save for later</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 h-8 w-8 p-0 justify-center"
                      aria-label="Share"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Share2 className="w-4 h-4 text-violet-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleShare(item.id)}>
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={`mailto:?subject=NGDI Portal Metadata: ${item.title}&body=Check out this metadata on NGDI Portal: /metadata/${item.id}`}
                        className="cursor-pointer"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Share via Email
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link href={`/metadata/${item.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 ml-2"
                  >
                    <Eye className="w-3 h-3" /> View
                  </Button>
                </Link>
              </div>
            </CardFooter>
            {shareUrl === item.id && (
              <div className="absolute bottom-0 left-0 right-0 bg-green-100 text-green-800 text-center py-1 text-sm">
                Link copied to clipboard!
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
