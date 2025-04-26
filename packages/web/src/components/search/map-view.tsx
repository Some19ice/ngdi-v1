"use client"

import { useRef, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Eye,
  Download,
  Maximize2Icon,
  MinimizeIcon,
  LayersIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MapViewProps {
  metadata: any[]
  isLoading: boolean
}

export default function MapView({ metadata, isLoading }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState<any>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [mapLibLoaded, setMapLibLoaded] = useState(false)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any>([])

  // Dynamically load Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return

    // Only load once
    if (mapLibLoaded) return

    const loadLeaflet = async () => {
      try {
        // Load CSS
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        link.crossOrigin = ""
        document.head.appendChild(link)

        // Wait for CSS to load
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Load JS and initialize map
        const L = await import("leaflet")

        if (!mapContainerRef.current) return

        // Initialize map
        if (!mapRef.current) {
          mapRef.current = L.map(mapContainerRef.current).setView(
            [9.082, 8.6753],
            6
          ) // Nigeria center

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors",
          }).addTo(mapRef.current)

          setMapLibLoaded(true)
          setMapLoaded(true)
        }
      } catch (error) {
        console.error("Error loading Leaflet:", error)
      }
    }

    loadLeaflet()
  }, [mapLibLoaded])

  // Add markers when metadata or map changes
  useEffect(() => {
    if (
      !mapLoaded ||
      !mapLibLoaded ||
      isLoading ||
      !metadata ||
      !mapRef.current
    )
      return

    const addMarkers = async () => {
      try {
        // Load the Leaflet library using dynamic import
        const L = await import("leaflet")

        // Clear existing markers
        if (markersRef.current.length) {
          markersRef.current.forEach((marker: any) => {
            if (mapRef.current) mapRef.current.removeLayer(marker)
          })
          markersRef.current = []
        }

        // Add markers for metadata items
        metadata.forEach((item) => {
          // Skip if no coordinates
          if (!item.minLatitude || !item.minLongitude) return

          try {
            // Calculate center of item's bounding box
            const lat =
              (item.minLatitude + item.maxLatitude) / 2 || item.minLatitude
            const lng =
              (item.minLongitude + item.maxLongitude) / 2 || item.minLongitude

            const marker = L.marker([lat, lng]).addTo(mapRef.current)

            marker.on("click", () => {
              setSelectedMarker(item)
            })

            // Store marker for cleanup
            markersRef.current.push(marker)
          } catch (error) {
            console.error("Error adding marker:", error)
          }
        })

        // Fit bounds if we have markers
        if (markersRef.current.length > 0) {
          const group = L.featureGroup(markersRef.current)
          mapRef.current.fitBounds(group.getBounds(), {
            padding: [50, 50],
          })
        }
      } catch (error) {
        console.error("Error loading Leaflet for markers:", error)
      }
    }

    addMarkers()
  }, [metadata, mapLoaded, mapLibLoaded, isLoading])

  // Handle fullscreen toggle
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize()
    }
  }, [fullscreen])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "relative",
        fullscreen ? "fixed inset-0 z-50 bg-background" : "h-[600px] w-full"
      )}
    >
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      ) : !mapLibLoaded ? (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p>Loading map...</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapContainerRef} className="h-full w-full" />

          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8 shadow-lg bg-background text-foreground hover:bg-background/90"
                    onClick={() => setFullscreen(!fullscreen)}
                  >
                    {fullscreen ? (
                      <MinimizeIcon className="h-4 w-4" />
                    ) : (
                      <Maximize2Icon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{fullscreen ? "Exit fullscreen" : "Fullscreen"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8 shadow-lg bg-background text-foreground hover:bg-background/90"
                  >
                    <LayersIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Map layers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {selectedMarker && (
            <Card className="absolute bottom-4 left-4 w-80 z-[400] shadow-lg">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">
                    {selectedMarker.title || selectedMarker.dataName}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {selectedMarker.abstract}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {selectedMarker.categories
                      ?.slice(0, 2)
                      .map((category: string) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="text-xs"
                        >
                          {category.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    {(selectedMarker.categories?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedMarker.categories.length - 2} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Download className="h-3 w-3 mr-1" />
                      <span className="text-xs">Download</span>
                    </Button>

                    <Link href={`/metadata/${selectedMarker.id}`}>
                      <Button size="sm" className="h-7 px-2">
                        <Eye className="h-3 w-3 mr-1" />
                        <span className="text-xs">View Details</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
