import { Metadata } from "next"
import { DocumentationLayout } from "@/components/documentation/layout"
import { DocCard } from "@/components/documentation/doc-card"

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export const metadata: Metadata = {
  title: "Search NGDI Documentation",
  description: "Search through NGDI documentation and resources",
}

// Mock search functionality
const mockSearchResults = (query: string) => {
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

  // Simple search - in a real app would connect to a search provider
  return allDocs.filter(
    (doc) =>
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.description.toLowerCase().includes(query.toLowerCase())
  )
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const results = query ? mockSearchResults(query) : []

  return (
    <DocumentationLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Search Results
        </h1>
        <p className="text-muted-foreground mb-8">
          {results.length} results for &quot;{query}&quot;
        </p>

        {results.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <h2 className="text-xl font-medium mb-2">No results found</h2>
            <p className="text-muted-foreground">
              We couldn&apos;t find any NGDI documentation matching your search.
              Try using different keywords.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((result, index) => (
              <DocCard
                key={index}
                title={result.title}
                description={result.description}
                href={result.href}
                className="h-auto"
              />
            ))}
          </div>
        )}
      </div>
    </DocumentationLayout>
  )
}
