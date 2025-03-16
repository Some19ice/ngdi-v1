import { MetadataList } from "@/components/metadata/metadata-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"
import { cookies } from "next/headers"
import { metadataServerService } from "@/lib/server/metadata.server"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { MetadataItem } from "@/types/metadata"

export default async function MetadataPage() {
  // Check for required role
  await requireRole(["ADMIN", "NODE_OFFICER"])

  let metadata: MetadataItem[] = []
  let total = 0
  let error = null

  try {
    console.log("Fetching initial metadata data server-side")

    // Fetch initial metadata data server-side
    const result = await metadataServerService.searchMetadata({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    })

    console.log("Server-side metadata fetch result:", {
      metadataCount: result.metadata.length,
      total: result.total,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    })

    metadata = result.metadata
    total = result.total
  } catch (err) {
    console.error("Error fetching initial metadata:", err)
    error = err instanceof Error ? err.message : "Failed to load metadata"
  }

  // Get auth token to pass to client for subsequent requests
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth_token")?.value || ""

  console.log("Auth token status:", {
    hasToken: !!authToken,
    tokenLength: authToken?.length,
  })

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Metadata Management</CardTitle>
          <Link href="/metadata/add">
            <Button>Create New</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <MetadataList
            initialMetadata={metadata}
            initialTotal={total}
            authToken={authToken}
          />
        </CardContent>
      </Card>
    </div>
  )
} 