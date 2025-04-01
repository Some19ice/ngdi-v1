"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  SlidersHorizontal,
  MapPinIcon,
  X,
  CheckSquare,
} from "lucide-react"
import { MetadataSearchParams } from "@/types/metadata"

interface AdvancedFiltersProps {
  searchParams: MetadataSearchParams
  onApplyFilters: (filters: any) => void
}

export default function AdvancedFilters({
  searchParams,
  onApplyFilters,
}: AdvancedFiltersProps) {
  const router = useRouter()

  // Filter states
  const [qualityRange, setQualityRange] = useState([0, 100])
  const [validationStatus, setValidationStatus] = useState<string[]>([])
  const [fileFormats, setFileFormats] = useState<string[]>([])
  const [updateFrequency, setUpdateFrequency] = useState<string>("")
  const [hasDownloadUrl, setHasDownloadUrl] = useState(false)
  const [hasApiEndpoint, setHasApiEndpoint] = useState(false)
  const [bboxCoordinates, setBboxCoordinates] = useState({
    minLat: "",
    minLng: "",
    maxLat: "",
    maxLng: "",
  })

  // Map mini-preview for spatial filtering
  const mapPreviewRef = useRef<HTMLDivElement>(null)
  const [mapInitialized, setMapInitialized] = useState(false)
  const mapRef = useRef<any>(null)
  const bboxRectRef = useRef<any>(null)

  // Initialize mini map for spatial filtering
  useEffect(() => {
    let mapInitialized = false

    const initializeMap = async () => {
      if (mapInitialized || !mapPreviewRef.current) return

      try {
        // Dynamically import Leaflet
        if (typeof window !== "undefined") {
          // Explicitly add the Leaflet CSS
          const linkEl = document.createElement("link")
          linkEl.rel = "stylesheet"
          linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          linkEl.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          linkEl.crossOrigin = ""
          document.head.appendChild(linkEl)

          // Wait for CSS to load
          await new Promise((resolve) => setTimeout(resolve, 100))

          // Import Leaflet dynamically
          const L = await import("leaflet")

          // Create map instance
          mapRef.current = L.map(mapPreviewRef.current).setView(
            [9.082, 8.6753],
            6
          )
          setMapInitialized(true)

          // Add OpenStreetMap tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(mapRef.current)

          // Create bounding box if coordinates exist
          updateBoundingBox()

          // Add click handler for setting bbox
          mapRef.current.on("click", handleMapClick)
        }
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    if (typeof window !== "undefined") {
      initializeMap()
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // The dependencies are not included because handleMapClick and updateBoundingBox
  // should not cause the map to reinitialize on every state change

  // Handling map click for bbox creation
  const [bboxCorner, setBboxCorner] = useState<number>(0)
  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng

    if (bboxCorner === 0) {
      // First click - set min coordinates
      setBboxCoordinates({
        minLat: lat.toFixed(6),
        minLng: lng.toFixed(6),
        maxLat: "",
        maxLng: "",
      })
      setBboxCorner(1)
    } else {
      // Second click - set max coordinates
      setBboxCoordinates((prev) => ({
        ...prev,
        maxLat: lat.toFixed(6),
        maxLng: lng.toFixed(6),
      }))
      setBboxCorner(0)

      // Update the bounding box visually
      updateBoundingBox()
    }
  }

  // Update visual bounding box rectangle
  const updateBoundingBox = () => {
    if (!mapRef.current || !bboxCoordinates.minLat || !bboxCoordinates.maxLat)
      return

    // Remove existing rectangle
    if (bboxRectRef.current) {
      mapRef.current.removeLayer(bboxRectRef.current)
    }

    // Create new rectangle if we have all coordinates
    if (
      bboxCoordinates.minLat &&
      bboxCoordinates.minLng &&
      bboxCoordinates.maxLat &&
      bboxCoordinates.maxLng
    ) {
      try {
        // Create rectangle
        import("leaflet")
          .then((L) => {
            // Create bounds with proper typing
            const southWest = L.latLng(
              parseFloat(bboxCoordinates.minLat),
              parseFloat(bboxCoordinates.minLng)
            )
            const northEast = L.latLng(
              parseFloat(bboxCoordinates.maxLat),
              parseFloat(bboxCoordinates.maxLng)
            )
            const bounds = L.latLngBounds(southWest, northEast)

            bboxRectRef.current = L.rectangle(bounds, {
              color: "#2563eb",
              weight: 2,
              fillOpacity: 0.2,
            }).addTo(mapRef.current)

            // Fit map to the bounds
            mapRef.current.fitBounds(bounds)
          })
          .catch((err) => {
            console.error("Error loading Leaflet for bounding box:", err)
          })
      } catch (error) {
        console.error("Error creating bounding box:", error)
      }
    }
  }

  // Clear bounding box
  const clearBoundingBox = () => {
    if (bboxRectRef.current && mapRef.current) {
      mapRef.current.removeLayer(bboxRectRef.current)
      bboxRectRef.current = null
    }

    setBboxCoordinates({
      minLat: "",
      minLng: "",
      maxLat: "",
      maxLng: "",
    })
    setBboxCorner(0)
  }

  // Apply advanced filters
  const handleApplyFilters = () => {
    const advancedFilters: any = {}

    // Quality filters
    if (qualityRange[0] > 0 || qualityRange[1] < 100) {
      advancedFilters.minQuality = qualityRange[0]
      advancedFilters.maxQuality = qualityRange[1]
    }

    // Validation status
    if (validationStatus.length > 0) {
      advancedFilters.validationStatus = validationStatus
    }

    // File formats
    if (fileFormats.length > 0) {
      advancedFilters.fileFormats = fileFormats
    }

    // Update frequency
    if (updateFrequency) {
      advancedFilters.updateFrequency = updateFrequency
    }

    // Download URL and API endpoint flags
    if (hasDownloadUrl) {
      advancedFilters.hasDownloadUrl = true
    }

    if (hasApiEndpoint) {
      advancedFilters.hasApiEndpoint = true
    }

    // Bounding box coordinates
    if (
      bboxCoordinates.minLat &&
      bboxCoordinates.minLng &&
      bboxCoordinates.maxLat &&
      bboxCoordinates.maxLng
    ) {
      advancedFilters.bbox = {
        minLat: parseFloat(bboxCoordinates.minLat),
        minLng: parseFloat(bboxCoordinates.minLng),
        maxLat: parseFloat(bboxCoordinates.maxLat),
        maxLng: parseFloat(bboxCoordinates.maxLng),
      }
    }

    // Pass up the filters
    onApplyFilters(advancedFilters)
  }

  // Reset all filters
  const resetFilters = () => {
    setQualityRange([0, 100])
    setValidationStatus([])
    setFileFormats([])
    setUpdateFrequency("")
    setHasDownloadUrl(false)
    setHasApiEndpoint(false)
    clearBoundingBox()
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Advanced Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Advanced Search Filters</DrawerTitle>
          <DrawerDescription>
            Apply more specific filters to refine your search results.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 py-2">
          <Accordion type="multiple" className="w-full">
            {/* Spatial Filtering Section */}
            <AccordionItem value="spatial">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  Spatial Filtering
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-4">
                  <div className="bg-muted p-2 rounded-md text-sm text-muted-foreground">
                    Click on the map to set a rectangular bounding box. First
                    click sets the southwest corner, second click sets the
                    northeast corner.
                  </div>

                  {/* Mini map for bounding box selection */}
                  <div
                    className="h-[200px] w-full relative"
                    ref={mapPreviewRef}
                  >
                    {!mapInitialized && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Coordinate display */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-xs">SW Latitude</Label>
                      <Input
                        value={bboxCoordinates.minLat}
                        onChange={(e) =>
                          setBboxCoordinates({
                            ...bboxCoordinates,
                            minLat: e.target.value,
                          })
                        }
                        placeholder="Min Latitude"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">SW Longitude</Label>
                      <Input
                        value={bboxCoordinates.minLng}
                        onChange={(e) =>
                          setBboxCoordinates({
                            ...bboxCoordinates,
                            minLng: e.target.value,
                          })
                        }
                        placeholder="Min Longitude"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">NE Latitude</Label>
                      <Input
                        value={bboxCoordinates.maxLat}
                        onChange={(e) =>
                          setBboxCoordinates({
                            ...bboxCoordinates,
                            maxLat: e.target.value,
                          })
                        }
                        placeholder="Max Latitude"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">NE Longitude</Label>
                      <Input
                        value={bboxCoordinates.maxLng}
                        onChange={(e) =>
                          setBboxCoordinates({
                            ...bboxCoordinates,
                            maxLng: e.target.value,
                          })
                        }
                        placeholder="Max Longitude"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearBoundingBox}
                    className="mt-2"
                  >
                    <X className="w-3 h-3 mr-1" /> Clear Bounding Box
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Quality and Status Section */}
            <AccordionItem value="quality">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Quality & Status
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-4">
                  {/* Quality Slider */}
                  <div>
                    <div className="flex justify-between">
                      <Label>Data Quality Range</Label>
                      <div className="text-sm text-muted-foreground">
                        {qualityRange[0]}% - {qualityRange[1]}%
                      </div>
                    </div>
                    <Slider
                      value={qualityRange}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={setQualityRange}
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  {/* Validation Status */}
                  <div>
                    <Label>Validation Status</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["Validated", "Pending", "Failed"].map((status) => (
                        <div
                          className="flex items-center space-x-2"
                          key={status}
                        >
                          <Checkbox
                            id={`status-${status}`}
                            checked={validationStatus.includes(status)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setValidationStatus([
                                  ...validationStatus,
                                  status,
                                ])
                              } else {
                                setValidationStatus(
                                  validationStatus.filter((s) => s !== status)
                                )
                              }
                            }}
                          />
                          <Label
                            htmlFor={`status-${status}`}
                            className="text-sm cursor-pointer"
                          >
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Technical Specifications */}
            <AccordionItem value="technical">
              <AccordionTrigger className="text-base font-medium">
                Technical Specifications
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-4">
                  {/* File Formats */}
                  <div>
                    <Label>File Formats</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["GeoJSON", "Shapefile", "GeoTIFF", "CSV", "KML"].map(
                        (format) => (
                          <div
                            className="flex items-center space-x-2"
                            key={format}
                          >
                            <Checkbox
                              id={`format-${format}`}
                              checked={fileFormats.includes(format)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFileFormats([...fileFormats, format])
                                } else {
                                  setFileFormats(
                                    fileFormats.filter((f) => f !== format)
                                  )
                                }
                              }}
                            />
                            <Label
                              htmlFor={`format-${format}`}
                              className="text-sm cursor-pointer"
                            >
                              {format}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Update Frequency */}
                  <div>
                    <Label>Update Frequency</Label>
                    <Select
                      value={updateFrequency}
                      onValueChange={setUpdateFrequency}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any frequency</SelectItem>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Bi-Annually">Bi-Annually</SelectItem>
                        <SelectItem value="Annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Availability Options */}
            <AccordionItem value="availability">
              <AccordionTrigger className="text-base font-medium">
                Availability Options
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-4">
                  {/* Availability Toggles */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="download-url">Has Download URL</Label>
                    <Switch
                      id="download-url"
                      checked={hasDownloadUrl}
                      onCheckedChange={setHasDownloadUrl}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="api-endpoint">Has API Endpoint</Label>
                    <Switch
                      id="api-endpoint"
                      checked={hasApiEndpoint}
                      onCheckedChange={setHasApiEndpoint}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DrawerFooter className="border-t">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={resetFilters} className="flex-1">
              Reset Filters
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="flex-1 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Apply Filters
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
