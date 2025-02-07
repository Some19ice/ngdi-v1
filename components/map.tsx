"use client"

import { useEffect, useRef, useState } from "react"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import XYZ from "ol/source/XYZ"
import { fromLonLat } from "ol/proj"
import LayerGroup from "ol/layer/Group"
import "ol/ol.css"
import { Card, CardContent } from "./ui/card"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

interface MapProps {
  center?: [number, number] // [longitude, latitude]
  zoom?: number
  className?: string
}

// Define base layers
const baseLayers = {
  osm: new TileLayer({
    source: new OSM(),
    title: "OpenStreetMap",
  }),
  satellite: new TileLayer({
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attributions: "Esri, Maxar, Earthstar Geographics",
    }),
    title: "Satellite",
  }),
  terrain: new TileLayer({
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
      attributions: "Esri, USGS, NOAA",
    }),
    title: "Terrain",
  }),
}

// Define overlay layers
const overlayLayers = {
  transportation: new TileLayer({
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
      attributions: "Esri",
    }),
    title: "Transportation",
    visible: false,
  }),
  boundaries: new TileLayer({
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      attributions: "Esri",
    }),
    title: "Boundaries",
    visible: false,
  }),
}

export function MapComponent({
  center = [8.6753, 9.082], // Default center of Nigeria [longitude, latitude]
  zoom = 6,
  className = "",
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const [baseLayer, setBaseLayer] = useState<keyof typeof baseLayers>("osm")
  const [overlays, setOverlays] = useState({
    transportation: false,
    boundaries: false,
  })

  useEffect(() => {
    if (!mapRef.current) return

    // Create layer groups
    const baseLayerGroup = new LayerGroup({
      layers: Object.values(baseLayers),
    })

    const overlayLayerGroup = new LayerGroup({
      layers: Object.values(overlayLayers),
    })

    // Create map instance
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayerGroup, overlayLayerGroup],
      view: new View({
        center: fromLonLat(center),
        zoom: zoom,
      }),
    })

    mapInstanceRef.current = map

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined)
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom])

  // Handle base layer change
  useEffect(() => {
    if (!mapInstanceRef.current) return

    Object.entries(baseLayers).forEach(([key, layer]) => {
      layer.setVisible(key === baseLayer)
    })
  }, [baseLayer])

  // Handle overlay changes
  useEffect(() => {
    if (!mapInstanceRef.current) return

    Object.entries(overlayLayers).forEach(([key, layer]) => {
      layer.setVisible(overlays[key as keyof typeof overlays])
    })
  }, [overlays])

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`w-full h-[600px] rounded-lg overflow-hidden ${className}`}
      />

      <Card className="absolute top-4 right-4 w-64">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Base Layer</Label>
            <Select
              value={baseLayer}
              onValueChange={(value: keyof typeof baseLayers) =>
                setBaseLayer(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select base layer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="osm">OpenStreetMap</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Overlays</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="transportation">Transportation</Label>
                <Switch
                  id="transportation"
                  checked={overlays.transportation}
                  onCheckedChange={(checked) =>
                    setOverlays((prev) => ({
                      ...prev,
                      transportation: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="boundaries">Boundaries</Label>
                <Switch
                  id="boundaries"
                  checked={overlays.boundaries}
                  onCheckedChange={(checked) =>
                    setOverlays((prev) => ({ ...prev, boundaries: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
