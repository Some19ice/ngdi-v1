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
// This is a placeholder - implement based on your auth system
async function getCurrentUserId(): Promise<string | null> {
  const authToken = cookies().get("auth_token")?.value

  if (!authToken) {
    return null
  }

  // In a real implementation, you would decode and validate the token
  // For now, we'll return a placeholder user ID
  return "placeholder-user-id"
}

// Function to get the current user role
// This is a placeholder - implement based on your auth system
async function getCurrentUserRole(): Promise<string | null> {
  // In a real implementation, you would decode and validate the token
  // For now, we'll return a placeholder role
  return "USER"
}

// Helper function to check if a URL is external
function isExternalUrl(url: string): boolean {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
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

  return {
    title: `${result.data.dataName} - Metadata Details`,
    description: result.data.abstract.substring(0, 160),
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

  // Extract fundamental datasets that are true
  const fundamentalDatasets = Object.entries(
    metadata.fundamentalDatasets as Record<string, boolean>
  )
    .filter(([_, value]) => value)
    .map(([key]) => {
      // Convert camelCase to Title Case with spaces
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim()
    })

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/metadata">
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
                  <Badge>{metadata.dataType}</Badge>
                  <CardTitle className="mt-2 text-2xl">
                    {metadata.dataName}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Production Date:{" "}
                    {format(new Date(metadata.productionDate), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>
                    Location: {metadata.state}, {metadata.country}
                  </span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>Coordinate System: {metadata.coordinateUnit}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Abstract</h3>
                <p className="text-muted-foreground">{metadata.abstract}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Purpose</h3>
                <p className="text-muted-foreground">{metadata.purpose}</p>
              </div>

              {fundamentalDatasets.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {fundamentalDatasets.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spatial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Coordinate Unit</h3>
                  <p className="text-muted-foreground">
                    {metadata.coordinateUnit}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Bounding Box</h3>
                  <p className="text-muted-foreground">
                    Min: {metadata.minLatitude}°, {metadata.minLongitude}°<br />
                    Max: {metadata.maxLatitude}°, {metadata.maxLongitude}°
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">Location Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Country
                    </span>
                    <p>{metadata.country}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Geopolitical Zone
                    </span>
                    <p>{metadata.geopoliticalZone}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">State</span>
                    <p>{metadata.state}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">LGA</span>
                    <p>{metadata.lga}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Town/City
                    </span>
                    <p>{metadata.townCity}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Quality Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Assessment</h3>
                <p className="text-muted-foreground">{metadata.assessment}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Update Frequency</h3>
                <p className="text-muted-foreground">
                  {metadata.updateFrequency}
                </p>
              </div>

              {metadata.logicalConsistencyReport && (
                <div>
                  <h3 className="text-sm font-medium">Logical Consistency</h3>
                  <p className="text-muted-foreground">
                    {metadata.logicalConsistencyReport}
                  </p>
                </div>
              )}

              {metadata.completenessReport && (
                <div>
                  <h3 className="text-sm font-medium">Completeness</h3>
                  <p className="text-muted-foreground">
                    {metadata.completenessReport}
                  </p>
                </div>
              )}

              {metadata.attributeAccuracyReport && (
                <div>
                  <h3 className="text-sm font-medium">Attribute Accuracy</h3>
                  <p className="text-muted-foreground">
                    {metadata.attributeAccuracyReport}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              {metadata.thumbnailUrl ? (
                isExternalUrl(metadata.thumbnailUrl) ? (
                  <Image
                    src={metadata.thumbnailUrl}
                    alt={metadata.dataName}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg"
                    unoptimized
                  />
                ) : (
                  <Image
                    src={metadata.thumbnailUrl}
                    alt={metadata.dataName}
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

          <Card>
            <CardHeader>
              <CardTitle>Resource Constraints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Access Constraints</h3>
                <p className="text-muted-foreground">
                  {metadata.accessConstraints}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Use Constraints</h3>
                <p className="text-muted-foreground">
                  {metadata.useConstraints}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Other Constraints</h3>
                <p className="text-muted-foreground">
                  {metadata.otherConstraints}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Metadata Contact</h3>
                <p className="text-muted-foreground">
                  {metadata.metadataContactName}
                </p>
                <p className="text-muted-foreground">
                  {metadata.metadataContactEmail}
                </p>
                <p className="text-muted-foreground">
                  {metadata.metadataContactPhone}
                </p>
                <p className="text-muted-foreground">
                  {metadata.metadataContactAddress}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Distributor</h3>
                <p className="text-muted-foreground">
                  {metadata.distributorName}
                </p>
                <p className="text-muted-foreground">
                  {metadata.distributorEmail}
                </p>
                <p className="text-muted-foreground">
                  {metadata.distributorPhone}
                </p>
                <p className="text-muted-foreground">
                  {metadata.distributorAddress}
                </p>
                {metadata.distributorWebLink && (
                  <a
                    href={metadata.distributorWebLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Website
                  </a>
                )}
              </div>

              {/* Show custodian info if available */}
              {(metadata as any)?.isCustodian === false &&
                (metadata as any)?.custodianName && (
                  <div>
                    <h3 className="text-sm font-medium">Custodian</h3>
                    <p className="text-muted-foreground">
                      {(metadata as any).custodianName}
                    </p>
                    {(metadata as any)?.custodianContact && (
                      <p className="text-muted-foreground">
                        {(metadata as any).custodianContact}
                      </p>
                    )}
                  </div>
                )}

              <div>
                <h3 className="text-sm font-medium">Processing Times</h3>
                <div className="grid grid-cols-2 gap-x-2">
                  <span className="text-xs">Turnaround Time:</span>
                  <p className="text-muted-foreground text-xs">
                    {metadata.turnaroundTime}
                  </p>
                  {(metadata as any)?.maximumResponseTime && (
                    <>
                      <span className="text-xs">Max Response Time:</span>
                      <p className="text-muted-foreground text-xs">
                        {(metadata as any).maximumResponseTime}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
