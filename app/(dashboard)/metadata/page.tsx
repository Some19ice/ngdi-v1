import { MetadataList } from "@/components/metadata/metadata-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"
import { cookies } from "next/headers"
import { metadataService } from "@/lib/services/metadata.service"

export default async function MetadataPage() {
  // Check for required role
  await requireRole(["ADMIN", "NODE_OFFICER"])

  // Fetch initial metadata data server-side
  const result = await metadataService.searchMetadata({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  // Get auth token to pass to client for subsequent requests
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth_token")?.value || ""

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
          <MetadataList
            initialMetadata={result.metadata}
            initialTotal={result.total}
            authToken={authToken}
          />
        </CardContent>
      </Card>
    </div>
  )
} 