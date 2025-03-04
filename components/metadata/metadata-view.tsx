import { Pencil } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Metadata } from "@prisma/client"

interface MetadataViewProps {
  metadata: Metadata & {
    user: {
      id: string
      name: string | null
      organization: string | null
    }
  }
  canEdit: boolean
}

export function MetadataView({ metadata, canEdit }: MetadataViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{metadata.title}</h1>
        {canEdit && (
          <Button asChild>
            <Link href={`/metadata/${metadata.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Metadata
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Author</h3>
              <p>{metadata.author}</p>
            </div>
            <div>
              <h3 className="font-semibold">Organization</h3>
              <p>{metadata.organization}</p>
            </div>
            <div>
              <h3 className="font-semibold">Framework Type</h3>
              <p>{metadata.frameworkType}</p>
            </div>
            <div>
              <h3 className="font-semibold">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {metadata.categories.map((category) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Abstract</h3>
              <p className="whitespace-pre-wrap">{metadata.abstract}</p>
            </div>
            <div>
              <h3 className="font-semibold">Purpose</h3>
              <p className="whitespace-pre-wrap">{metadata.purpose}</p>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Coordinate System</h3>
              <p>{metadata.coordinateSystem}</p>
            </div>
            <div>
              <h3 className="font-semibold">Projection</h3>
              <p>{metadata.projection}</p>
            </div>
            <div>
              <h3 className="font-semibold">Scale</h3>
              <p>1:{metadata.scale}</p>
            </div>
            {metadata.resolution && (
              <div>
                <h3 className="font-semibold">Resolution</h3>
                <p>{metadata.resolution}</p>
              </div>
            )}
            <div>
              <h3 className="font-semibold">File Format</h3>
              <p>{metadata.fileFormat}</p>
            </div>
            {metadata.fileSize && (
              <div>
                <h3 className="font-semibold">File Size</h3>
                <p>{metadata.fileSize} MB</p>
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
            <div>
              <h3 className="font-semibold">Distribution Format</h3>
              <p>{metadata.distributionFormat}</p>
            </div>
            <div>
              <h3 className="font-semibold">Access Method</h3>
              <p>{metadata.accessMethod}</p>
            </div>
            {metadata.downloadUrl && (
              <div>
                <h3 className="font-semibold">Download URL</h3>
                <a
                  href={metadata.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {metadata.downloadUrl}
                </a>
              </div>
            )}
            {metadata.apiEndpoint && (
              <div>
                <h3 className="font-semibold">API Endpoint</h3>
                <p className="font-mono text-sm">{metadata.apiEndpoint}</p>
              </div>
            )}
            <div>
              <h3 className="font-semibold">License Type</h3>
              <p>{metadata.licenseType}</p>
            </div>
            <div>
              <h3 className="font-semibold">Usage Terms</h3>
              <p>{metadata.usageTerms}</p>
            </div>
            <div>
              <h3 className="font-semibold">Attribution Requirements</h3>
              <p>{metadata.attributionRequirements}</p>
            </div>
            <div>
              <h3 className="font-semibold">Access Restrictions</h3>
              <div className="flex flex-wrap gap-2">
                {metadata.accessRestrictions.map((restriction) => (
                  <Badge key={restriction} variant="outline">
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Created By */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Created By</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Author</h3>
                <p>{metadata.user.name}</p>
                <p className="text-muted-foreground">
                  {metadata.user.organization}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Last Updated</h3>
                <p>{new Date(metadata.updatedAt).toLocaleDateString()}</p>
                <p className="text-muted-foreground">
                  Created on {new Date(metadata.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
