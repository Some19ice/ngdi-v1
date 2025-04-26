import { Suspense } from "react"
import { notFound } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MetadataForm } from "../../add/components/metadata-form"
import { LoadingSpinner } from "@/components/loading-spinner"
import { UserRole } from "@prisma/client"
import { transformApiToFormModel } from "@/lib/transformers/metadata"
import { MetadataRequest } from "@/types/metadata"

export const metadata = {
  title: "Edit NGDI Metadata",
  description: "Edit existing NGDI metadata entry",
}

interface EditMetadataPageProps {
  params: {
    id: string
  }
}

export default async function EditMetadataPage({
  params,
}: EditMetadataPageProps) {
  // Check for required role
  await requireRole([UserRole.ADMIN, UserRole.NODE_OFFICER])

  // Fetch the metadata
  const metadataRecord = await prisma.metadata.findUnique({
    where: { id: params.id },
  })

  if (!metadataRecord) {
    notFound()
  }

  // Convert Prisma model to MetadataRequest format
  const apiData: MetadataRequest = {
    title: metadataRecord.title,
    author: metadataRecord.author || "",
    organization: metadataRecord.organization || "",
    dateFrom: metadataRecord.dateFrom || "",
    dateTo: metadataRecord.dateTo || "",
    abstract: metadataRecord.abstract || "",
    purpose: metadataRecord.purpose || "",
    thumbnailUrl: metadataRecord.thumbnailUrl || "",
    imageName: metadataRecord.imageName || "",
    frameworkType: metadataRecord.frameworkType || "",
    categories: metadataRecord.categories || [],
    coordinateSystem: metadataRecord.coordinateSystem || "",
    projection: metadataRecord.projection || "",
    scale: metadataRecord.scale || 0,
    resolution: metadataRecord.resolution || undefined,
    coordinateUnit: "DD",
    minLatitude: 0,
    minLongitude: 0,
    maxLatitude: 0,
    maxLongitude: 0,
    accuracyLevel: metadataRecord.accuracyLevel || "",
    completeness: metadataRecord.completeness || undefined,
    consistencyCheck: metadataRecord.consistencyCheck || undefined,
    validationStatus: metadataRecord.validationStatus || undefined,
    fileFormat: metadataRecord.fileFormat || "",
    fileSize: metadataRecord.fileSize
      ? Number(metadataRecord.fileSize)
      : undefined,
    numFeatures: metadataRecord.numFeatures || undefined,
    softwareReqs: metadataRecord.softwareReqs || undefined,
    updateCycle: metadataRecord.updateCycle || "",
    lastUpdate: metadataRecord.lastUpdate?.toISOString() || undefined,
    nextUpdate: metadataRecord.nextUpdate?.toISOString() || undefined,
    distributionFormat: metadataRecord.distributionFormat || "",
    accessMethod: metadataRecord.accessMethod || "",
    downloadUrl: metadataRecord.downloadUrl || undefined,
    apiEndpoint: metadataRecord.apiEndpoint || undefined,
    licenseType: metadataRecord.licenseType || "",
    usageTerms: metadataRecord.usageTerms || "",
    attributionRequirements: metadataRecord.attributionRequirements || "",
    accessRestrictions: metadataRecord.accessRestrictions || [],
    contactPerson: metadataRecord.contactPerson || "",
    email: metadataRecord.email || "",
    department: metadataRecord.department || undefined,
  }

  // Transform API model to form data structure
  const initialFormData = transformApiToFormModel(apiData)

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MetadataForm initialData={initialFormData} metadataId={params.id} />
    </Suspense>
  )
}
