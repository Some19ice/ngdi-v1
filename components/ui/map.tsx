"use client"

import { useEffect } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in Leaflet with Next.js
useEffect(() => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/images/marker-icon-2x.png",
    iconUrl: "/images/marker-icon.png",
    shadowUrl: "/images/marker-shadow.png",
  })
}, [])

interface MapProps {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    position: [number, number]
    title: string
    description?: string
  }>
  className?: string
}

export function Map({
  center = [9.082, 8.6753], // Default center of Nigeria
  zoom = 6,
  markers = [],
  className = "",
}: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`w-full h-[400px] rounded-lg ${className}`}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker, index) => (
        <Marker key={index} position={marker.position}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{marker.title}</h3>
              {marker.description && <p>{marker.description}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
