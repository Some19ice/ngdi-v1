import { Metadata } from "next"
import { DocumentationLayout } from "@/components/documentation/layout"
import { DocCard } from "@/components/documentation/doc-card"
import { searchDocumentation } from "@/lib/api/documentation"

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export const metadata: Metadata = {
  title: "Search NGDI Documentation",
  description: "Search through NGDI documentation and resources",
}

interface DocumentationSearchResult {
  title: string
  description: string
  href: string
}

async function getSearchResults(
  query: string
): Promise<DocumentationSearchResult[]> {
  if (!query) return []

  try {
    // Use the API client to search documentation
    const results = await searchDocumentation(query)
    return results
  } catch (error) {
    console.error("Error searching documentation:", error)
    return []
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const results = await getSearchResults(query)

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
