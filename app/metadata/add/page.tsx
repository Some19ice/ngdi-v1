import { Suspense } from "react"
import { requireRole } from "@/lib/auth"
import { MetadataForm } from "./components/metadata-form"
import LoadingSpinner from "@/components/loading-spinner"
import { UserRole } from "@prisma/client"

export const metadata = {
  title: "Add Metadata",
  description: "Add new metadata entry",
}

export default async function AddMetadataPage() {
  // Check for required role
  await requireRole([UserRole.ADMIN, UserRole.NODE_OFFICER])

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MetadataForm />
    </Suspense>
  )
}
