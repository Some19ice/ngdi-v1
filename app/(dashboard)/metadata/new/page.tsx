"use client"

import { MetadataForm } from "@/app/metadata/add/components/metadata-form"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function NewMetadataPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-10">
      <Card className="p-6">
        <MetadataForm />
      </Card>
    </div>
  )
}
