import { MetadataList } from "@/components/metadata/metadata-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function MetadataPage() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Metadata Management</CardTitle>
          <Link href="/metadata/new">
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
