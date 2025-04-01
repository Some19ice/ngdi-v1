import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMetadataById } from "@/app/actions/metadata"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, FileText, Globe, MapPin } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cookies } from "next/headers"
import Image from "next/image"

// Function to get the current user ID from the auth token
async function getCurrentUserId(): Promise<string | null> {
  const authToken = cookies().get("auth_token")?.value

  if (!authToken) {
    return null
  }

  // In a real implementation, you would decode and validate the token
  return null
}

// Function to get the current user role
async function getCurrentUserRole(): Promise<string | null> {
  // In a real implementation, you would decode and validate the token
  return "USER"
}

// Helper function to check if a URL is external
function isExternalUrl(url: string): boolean {
  if (!url) return false
  return url.startsWith("http://") || url.startsWith("https://")
}

interface MetadataPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: MetadataPageProps): Promise<Metadata> {
  const result = await getMetadataById(params.id)

  if (!result.success || !result.data) {
    return {
      title: "Metadata Not Found",
    }
  }

  const metadata = result.data

  return {
    title: `${metadata.title || "Metadata"} - Details`,
    description: metadata.abstract?.substring(0, 160) || "Metadata details",
  }
}

export default async function MetadataPage({ params }: MetadataPageProps) {
  const userId = await getCurrentUserId()
  const userRole = await getCurrentUserRole()

  const result = await getMetadataById(params.id)

  if (!result.success || !result.data) {
    return notFound()
  }

  const metadata = result.data
  const canEdit = userId === metadata.userId || userRole === "ADMIN"

  // Extract categories
  const categories = Array.isArray(metadata.categories)
    ? metadata.categories
    : []

  // Helper function to format dates safely
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null
    try {
      return format(new Date(date), "MMMM d, yyyy")
    } catch (error) {
      console.error("Error formatting date:", error)
      return null
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/search">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </Button>

        {canEdit && (
          <Button size="sm" asChild>
            <Link href={`/metadata/edit/${params.id}`}>Edit Metadata</Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge>{metadata.frameworkType}</Badge>
                  <CardTitle className="mt-2 text-2xl">
                    {metadata.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {metadata.dateFrom && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Date: {formatDate(metadata.dateFrom)}
                      {metadata.dateTo && ` - ${formatDate(metadata.dateTo)}`}
                    </span>
                  </div>
                )}
                {metadata.author && (
                  <div className="flex items-center">
                    <span>Author: {metadata.author}</span>
                  </div>
                )}
                {metadata.organization && (
                  <div className="flex items-center">
                    <span>Organization: {metadata.organization}</span>
                  </div>
                )}
              </div>

              {metadata.abstract && (
                <div>
                  <h3 className="font-semibold mb-2">Abstract</h3>
                  <p className="text-muted-foreground">{metadata.abstract}</p>
                </div>
              )}

              {metadata.purpose && (
                <div>
                  <h3 className="font-semibold mb-2">Purpose</h3>
                  <p className="text-muted-foreground">{metadata.purpose}</p>
                </div>
              )}

              {categories.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metadata.coordinateSystem && (
                <div>
                  <h3 className="text-sm font-medium">Coordinate System</h3>
                  <p className="text-muted-foreground">
                    {metadata.coordinateSystem}
                  </p>
                </div>
              )}

              {metadata.projection && (
                <div>
                  <h3 className="text-sm font-medium">Projection</h3>
                  <p className="text-muted-foreground">{metadata.projection}</p>
                </div>
              )}

              {metadata.scale && (
                <div>
                  <h3 className="text-sm font-medium">Scale</h3>
                  <p className="text-muted-foreground">1:{metadata.scale}</p>
                </div>
              )}

              {metadata.resolution && (
                <div>
                  <h3 className="text-sm font-medium">Resolution</h3>
                  <p className="text-muted-foreground">{metadata.resolution}</p>
                </div>
              )}

              {metadata.fileFormat && (
                <div>
                  <h3 className="text-sm font-medium">File Format</h3>
                  <p className="text-muted-foreground">{metadata.fileFormat}</p>
                </div>
              )}

              {metadata.fileSize ? (
                <div>
                  <h3 className="text-sm font-medium">File Size</h3>
                  <p className="text-muted-foreground">
                    {String(metadata.fileSize)} bytes
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Data Quality Information */}
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metadata.accuracyLevel && (
                <div>
                  <h3 className="text-sm font-medium">Accuracy Level</h3>
                  <p className="text-muted-foreground">
                    {metadata.accuracyLevel}
                  </p>
                </div>
              )}

              {metadata.completeness !== undefined && (
                <div>
                  <h3 className="text-sm font-medium">Completeness</h3>
                  <p className="text-muted-foreground">
                    {metadata.completeness}%
                  </p>
                </div>
              )}

              {metadata.validationStatus && (
                <div>
                  <h3 className="text-sm font-medium">Validation Status</h3>
                  <p className="text-muted-foreground">
                    {metadata.validationStatus}
                  </p>
                </div>
              )}

              {metadata.updateCycle && (
                <div>
                  <h3 className="text-sm font-medium">Update Cycle</h3>
                  <p className="text-muted-foreground">
                    {metadata.updateCycle}
                  </p>
                </div>
              )}

              {metadata.lastUpdate && (
                <div>
                  <h3 className="text-sm font-medium">Last Update</h3>
                  <p className="text-muted-foreground">
                    {formatDate(metadata.lastUpdate)}
                  </p>
                </div>
              )}

              {metadata.nextUpdate && (
                <div>
                  <h3 className="text-sm font-medium">Next Update</h3>
                  <p className="text-muted-foreground">
                    {formatDate(metadata.nextUpdate)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              {metadata.thumbnailUrl ? (
                isExternalUrl(metadata.thumbnailUrl) ? (
                  <Image
                    src={metadata.thumbnailUrl}
                    alt={metadata.title || "Metadata thumbnail"}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg"
                    unoptimized
                  />
                ) : (
                  <Image
                    src={metadata.thumbnailUrl}
                    alt={metadata.title || "Metadata thumbnail"}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg"
                  />
                )
              ) : (
                <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Access Information */}
          <Card>
            <CardHeader>
              <CardTitle>Access Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metadata.distributionFormat && (
                <div>
                  <h3 className="text-sm font-medium">Distribution Format</h3>
                  <p className="text-muted-foreground">
                    {metadata.distributionFormat}
                  </p>
                </div>
              )}

              {metadata.accessMethod && (
                <div>
                  <h3 className="text-sm font-medium">Access Method</h3>
                  <p className="text-muted-foreground">
                    {metadata.accessMethod}
                  </p>
                </div>
              )}

              {metadata.downloadUrl && (
                <div>
                  <h3 className="text-sm font-medium">Download URL</h3>
                  <a
                    href={metadata.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Download Data
                  </a>
                </div>
              )}

              {metadata.apiEndpoint && (
                <div>
                  <h3 className="text-sm font-medium">API Endpoint</h3>
                  <p className="text-muted-foreground break-all">
                    {metadata.apiEndpoint}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* License Information */}
          <Card>
            <CardHeader>
              <CardTitle>License Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metadata.licenseType && (
                <div>
                  <h3 className="text-sm font-medium">License Type</h3>
                  <p className="text-muted-foreground">
                    {metadata.licenseType}
                  </p>
                </div>
              )}

              {metadata.usageTerms && (
                <div>
                  <h3 className="text-sm font-medium">Usage Terms</h3>
                  <p className="text-muted-foreground">{metadata.usageTerms}</p>
                </div>
              )}

              {metadata.attributionRequirements && (
                <div>
                  <h3 className="text-sm font-medium">
                    Attribution Requirements
                  </h3>
                  <p className="text-muted-foreground">
                    {metadata.attributionRequirements}
                  </p>
                </div>
              )}

              {metadata.accessRestrictions &&
                Array.isArray(metadata.accessRestrictions) &&
                metadata.accessRestrictions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium">Access Restrictions</h3>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {metadata.accessRestrictions.map((restriction, index) => (
                        <li key={index}>{restriction}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metadata.contactPerson && (
                <div>
                  <h3 className="text-sm font-medium">Contact Person</h3>
                  <p className="text-muted-foreground">
                    {metadata.contactPerson}
                  </p>
                  {metadata.email && (
                    <p className="text-muted-foreground">{metadata.email}</p>
                  )}
                  {metadata.department && (
                    <p className="text-muted-foreground">
                      {metadata.department}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
