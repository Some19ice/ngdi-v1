"use client"

import { useState } from "react"
import { MapComponent } from "@/components/map/map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SearchResult {
  lat: string
  lon: string
  display_name: string
}

export default function MapPage() {
  const [center, setCenter] = useState<[number, number]>([8.6753, 9.082]) // [longitude, latitude]
  const [zoom, setZoom] = useState(6)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a search query",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    try {
      // Add "Nigeria" to the search query to focus results
      const query = encodeURIComponent(`${searchQuery}, Nigeria`)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ng`
      )

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const results = (await response.json()) as SearchResult[]

      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
          variant: "destructive",
        })
        return
      }

      const result = results[0]
      // Update map position (note: Nominatim returns [lat, lon] but we need [lon, lat])
      setCenter([parseFloat(result.lon), parseFloat(result.lat)])
      setZoom(12) // Zoom in to show the location better

      toast({
        title: "Location found",
        description: result.display_name,
      })
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Interactive Map</h1>
        <p className="text-muted-foreground mt-2">
          Explore Nigeria&apos;s geospatial data infrastructure
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSearching}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Map Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Zoom Level</label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Coordinates</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Longitude"
                    value={center[0]}
                    onChange={(e) =>
                      setCenter([Number(e.target.value), center[1]])
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Latitude"
                    value={center[1]}
                    onChange={(e) =>
                      setCenter([center[0], Number(e.target.value)])
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <MapComponent
              center={center}
              zoom={zoom}
              className="rounded-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
