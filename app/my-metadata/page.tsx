import { Suspense } from "react"
import { Metadata } from "next"
import { requireNodeOfficer } from "@/lib/auth"
import { api } from "@/lib/api-client"
import { MetadataList } from "@/components/metadata/metadata-list"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cookies } from "next/headers"
import { MetadataItem } from "@/types/metadata"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export const metadata: Metadata = {
  title: "My Metadata | NGDI Portal",
  description: "View and manage your metadata records",
}

async function getUserMetadata(userId: string) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get("auth_token")?.value

    if (!authToken) {
      console.error("No auth token found in cookies")
      return []
    }

    // Try to fetch user's metadata with auth token
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
      throw new Error(`Failed to fetch metadata: ${response.statusText}`)
    }

    // Filter metadata to show only those created by this user
    const data = await response.json()
    if (!Array.isArray(data.items)) {
      console.error("API returned unexpected data format:", data)
      return []
    }

    // Filter metadata by the current user
    const userMetadata = data.items.filter(
      (item: any) =>
        // Check various possible user ID fields
        item.createdBy === userId ||
        item.userId === userId ||
        item.createdById === userId ||
        (item.owner && item.owner === userId)
    )

    console.log(
      `Found ${userMetadata.length} metadata records for user ${userId}`
    )
    return userMetadata
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
          <Suspense fallback={<LoadingSpinner />}>
            {metadataItems.length > 0 ? (
              <MetadataList
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
