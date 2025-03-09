import { MetadataList } from "@/components/metadata/metadata-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"

export default async function MetadataPage() {
  // Check for required role
  await requireRole(["ADMIN", "NODE_OFFICER"])

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
          <MetadataList />
        </CardContent>
      </Card>
    </div>
  )
} 