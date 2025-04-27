import { apiClient } from "@/lib/api-client"

export interface DocumentationSearchResult {
  title: string
  description: string
  href: string
}

/**
 * Search documentation content
 * @param query Search query string
 * @returns Array of documentation search results
 */
export async function searchDocumentation(
  query: string
): Promise<DocumentationSearchResult[]> {
  try {
    // Define the documentation content for searching
    // In a production environment, this would be fetched from a CMS or search service
    const allDocs = [
      {
        title: "About NGDI",
        description:
          "Learn about the National Geospatial Data Infrastructure project, its mission, and impact.",
        href: "/documentation/about-ngdi",
      },
      {
        title: "NGDI User Guide",
        description:
          "Everything you need to know to use the NGDI platform effectively.",
        href: "/documentation/user-guide",
      },
      {
        title: "Administrative Boundaries Data",
        description:
          "Access comprehensive mapping of Nigeria's administrative divisions.",
        href: "/documentation/data-resources#featured-datasets",
      },
      {
        title: "Finding Data on NGDI",
        description:
          "Learn how to search for and access geospatial data through the NGDI platform.",
        href: "/documentation/user-guide#finding-data",
      },
      {
        title: "NGDI Data Quality Standards",
        description:
          "Information about how we ensure consistency and reliability in our data.",
        href: "/documentation/data-resources#data-quality",
      },
    ]

    // Simple search implementation
    // In a production environment, this would use a proper search API
    return allDocs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.description.toLowerCase().includes(query.toLowerCase())
    )

    // TODO: Replace with actual API call when search endpoint is available
    // return await apiClient.get(`/api/documentation/search?q=${encodeURIComponent(query)}`)
  } catch (error) {
    console.error("Error searching documentation:", error)
    return []
  }
}
