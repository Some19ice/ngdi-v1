import { Suspense } from "react"
import { Metadata } from "next"
import { requireNodeOfficer } from "@/lib/auth"
import { api } from "@/lib/api-client"
import { MetadataListWrapper } from "@/components/metadata/metadata-list-wrapper"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cookies } from "next/headers"
import { MetadataItem } from "@/types/metadata"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"

export const metadata: Metadata = {
  title: "My Metadata | NGDI Portal",
  description: "View and manage your metadata records",
}

export const dynamic = "force-dynamic"

// Try to get metadata directly from the database
async function getMetadataFromDatabase(userId: string) {
  try {
    console.log("Attempting to fetch metadata directly from database")

    // Query the database directly using fields that exist in the schema
    const metadata = await prisma.metadata.findMany({
      where: {
        OR: [
          { userId: userId },
          // Add other fields based on actual schema
        ],
      },
      orderBy: { createdAt: "desc" },
    })

    console.log(
      `Found ${metadata.length} metadata items in database for user ${userId}`
    )
    return metadata
  } catch (dbError) {
    console.error("Error fetching from database:", dbError)
    return null
  }
}

async function getUserMetadata(userId: string) {
  // First attempt: Try to get directly from database
  const dbMetadata = await getMetadataFromDatabase(userId)
  if (dbMetadata && dbMetadata.length > 0) {
    return dbMetadata
  }

  try {
    // Get auth token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get("auth_token")?.value

    if (!authToken) {
      console.error("No auth token found in cookies")
      return []
    }

    // Second attempt: use the search metadata endpoint
    try {
      console.log("Attempting to fetch metadata via /api/metadata/search")
      const searchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/metadata/search?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData && (searchData.items || searchData.metadata)) {
          const items = searchData.items || searchData.metadata || []
          console.log(`Found ${items.length} items via search endpoint`)
          return items
        }
      }
    } catch (searchError) {
      console.error("Error using search endpoint:", searchError)
    }

    // Third attempt: try with a different API path structure
    try {
      console.log("Attempting to fetch metadata via alternative API path")
      const alternativeResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/metadata`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      if (alternativeResponse.ok) {
        const alternativeData = await alternativeResponse.json()
        console.log(
          "Alternative API response structure:",
          Object.keys(alternativeData)
        )

        // Handle different response structures
        let alternativeItems = []
        if (alternativeData.items && Array.isArray(alternativeData.items)) {
          alternativeItems = alternativeData.items
        } else if (
          alternativeData.metadata &&
          Array.isArray(alternativeData.metadata)
        ) {
          alternativeItems = alternativeData.metadata
        } else if (Array.isArray(alternativeData)) {
          alternativeItems = alternativeData
        }

        if (alternativeItems.length > 0) {
          // Filter metadata by the current user
          const filteredItems = alternativeItems.filter(
            (item: any) =>
              item.createdBy === userId ||
              item.userId === userId ||
              (item.owner && item.owner === userId)
          )

          console.log(
            `Found ${filteredItems.length} metadata records via alternative API`
          )
          return filteredItems
        }
      }
    } catch (alternativeError) {
      console.error("Error using alternative API path:", alternativeError)
    }

    // Final attempt: fall back to direct metadata API endpoint
    console.log("Attempting to fetch metadata via direct API")
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/metadata`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    )

    if (!response.ok) {
      console.error(
        `Metadata API failed: ${response.status} ${response.statusText}`
      )
      // If all attempts fail, return empty result
      return []
    }

    // Parse response
    const data = await response.json()
    console.log("API response structure:", Object.keys(data))

    // Handle different response structures
    let items = []
    if (data.items && Array.isArray(data.items)) {
      items = data.items
    } else if (data.metadata && Array.isArray(data.metadata)) {
      items = data.metadata
    } else if (Array.isArray(data)) {
      items = data
    }

    if (items.length === 0) {
      console.log("No metadata items found in response")
      return []
    }

    // Filter metadata by the current user
    const filteredItems = items.filter(
      (item: any) =>
        // Check various possible user ID fields
        item.createdBy === userId ||
        item.userId === userId ||
        item.createdById === userId ||
        (item.owner && item.owner === userId)
    )

    console.log(
      `Found ${filteredItems.length} metadata records for user ${userId}`
    )
    return filteredItems
  } catch (error) {
    console.error("Error fetching user metadata:", error)
    return []
  }
}

export default async function MyMetadataPage() {
  // Ensure user is authenticated and is a node officer
  const user = await requireNodeOfficer()

  // Fetch metadata created by this user
  let metadataItems = []
  let errorMessage = ""

  try {
    metadataItems = await getUserMetadata(user.id)
  } catch (error) {
    console.error("Failed to load metadata:", error)
    errorMessage =
      "There was a problem loading your metadata. Please try again later."
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Metadata</h1>
          <p className="text-muted-foreground">
            Manage metadata records you have created
          </p>
        </div>
        <div>
          <Link
            href="/metadata/add"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Metadata
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Metadata Records</CardTitle>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Suspense fallback={<LoadingSpinner />}>
            {metadataItems.length > 0 ? (
              <MetadataListWrapper
                initialMetadata={metadataItems}
                initialTotal={metadataItems.length}
              />
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  No metadata records found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You haven&apos;t created any metadata records yet. Get started
                  by adding your first metadata record.
                </p>
                <Link
                  href="/metadata/add"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Metadata
                </Link>
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
