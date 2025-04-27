import { apiClient } from "@/lib/api-client"

export interface GalleryItem {
  id: string
  title: string
  imageUrl: string
  thumbnail: string
  category: string
  organization: string
  location: string
  date: string
  tags: string[]
  downloads: number
  views: number
}

/**
 * Fetch gallery items from the API
 * @returns Array of gallery items
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    // TODO: Replace with actual API call when endpoint is available
    // return await apiClient.get('/api/gallery')
    
    // Temporary implementation until API endpoint is available
    return [
      {
        id: "1",
        title: "Satellite Imagery of Lagos Coastline",
        imageUrl: "https://example.com/lagos-coastline.jpg",
        thumbnail: "https://example.com/lagos-coastline-thumb.jpg",
        category: "Satellite Imagery",
        organization: "National Space Research and Development Agency",
        location: "Lagos",
        date: "2024-02-01",
        tags: ["coastal", "satellite", "lagos"],
        downloads: 156,
        views: 1245,
      },
      {
        id: "2",
        title: "Abuja Master Plan Map",
        imageUrl: "https://example.com/abuja-map.jpg",
        thumbnail: "https://example.com/abuja-map-thumb.jpg",
        category: "Maps",
        organization: "Federal Capital Territory Administration",
        location: "Abuja",
        date: "2024-01-15",
        tags: ["urban", "planning", "abuja"],
        downloads: 234,
        views: 890,
      },
      {
        id: "3",
        title: "Nigeria Vegetation Cover Analysis",
        imageUrl: "https://example.com/vegetation.jpg",
        thumbnail: "https://example.com/vegetation-thumb.jpg",
        category: "Environmental",
        organization: "Federal Ministry of Environment",
        location: "Nigeria",
        date: "2024-01-20",
        tags: ["vegetation", "environment", "analysis"],
        downloads: 89,
        views: 567,
      },
    ]
  } catch (error) {
    console.error("Error fetching gallery items:", error)
    return []
  }
}

/**
 * Get available gallery categories
 * @returns Array of category names
 */
export async function getGalleryCategories(): Promise<string[]> {
  try {
    // TODO: Replace with actual API call when endpoint is available
    // return await apiClient.get('/api/gallery/categories')
    
    // Temporary implementation until API endpoint is available
    return [
      "All Categories",
      "Satellite Imagery",
      "Maps",
      "Environmental",
      "Infrastructure",
      "Topographic",
      "Thematic",
    ]
  } catch (error) {
    console.error("Error fetching gallery categories:", error)
    return ["All Categories"]
  }
}
