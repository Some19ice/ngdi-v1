"use client"

import { MetadataForm } from "@/components/metadata/metadata-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { metadataService } from "@/lib/services/metadata.service"
import { useRouter } from "next/navigation"
import { MetadataRequest } from "@/types/metadata"

export default function NewMetadataPage() {
  const router = useRouter()

  const handleSubmit = async (data: MetadataRequest) => {
    await metadataService.createMetadata(data)
    router.push("/metadata")
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <MetadataForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}
