import { Suspense } from "react"
import { Metadata } from "next"
import { requireNodeOfficer } from "@/lib/auth"
import { api } from "@/lib/api-client"
import { MetadataList } from "@/components/metadata/metadata-list"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const metadata: Metadata = {
  title: "My Metadata | NGDI Portal",
  description: "View and manage your metadata records",
}

async function getUserMetadata(userId: string) {
  try {
    // Here we'll fetch metadata records created by the current user
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/metadata?userId=${userId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`)
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error("Error fetching user metadata:", error)
    return []
  }
}

export default async function MyMetadataPage() {
  // Ensure user is authenticated and is a node officer
  const user = await requireNodeOfficer()

  // Fetch metadata created by this user
  const metadataItems = await getUserMetadata(user.id)

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Metadata</h1>
          <p className="text-muted-foreground">
            Manage metadata records you have created
          </p>
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        {metadataItems.length > 0 ? (
          <MetadataList
            initialMetadata={metadataItems}
            initialTotal={metadataItems.length}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">
              No metadata records found
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t created any metadata records yet.
            </p>
            <a
              href="/metadata/add"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create New Metadata
            </a>
          </div>
        )}
      </Suspense>
    </div>
  )
}
