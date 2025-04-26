"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { NGDIMetadataFormData } from "@/types/ngdi-metadata"
import { Loader2 } from "lucide-react"

interface ReviewFormProps {
  step: number
  onStepChange: (step: number) => void
  formData: Partial<NGDIMetadataFormData>
  onChange: (data: Partial<NGDIMetadataFormData>) => void
  isSubmitting: boolean
  onSubmit: () => void
}

export default function ReviewForm({
  step,
  onStepChange,
  formData,
  onChange,
  isSubmitting,
  onSubmit,
}: ReviewFormProps) {
  // Extract form data sections with fallbacks to prevent errors
  const {
    generalInfo = {} as NGDIMetadataFormData["generalInfo"],
    dataQuality = {} as NGDIMetadataFormData["dataQuality"],
    technicalDetails = {} as NGDIMetadataFormData["technicalDetails"],
    accessInfo = {} as NGDIMetadataFormData["accessInfo"],
    distributionInfo,
  } = formData || {}

  // Initialize nested objects if they don't exist
  generalInfo.dataInformation = generalInfo.dataInformation || {}
  generalInfo.description = generalInfo.description || {}

  // Resource constraint now belongs to technicalDetails, not generalInfo
  technicalDetails.resourceConstraint =
    technicalDetails.resourceConstraint || {}
  technicalDetails.spatialInformation =
    technicalDetails.spatialInformation || {}
  technicalDetails.technicalSpecifications =
    technicalDetails.technicalSpecifications || {}
  technicalDetails.spatialDomain = technicalDetails.spatialDomain || {}

  dataQuality.generalSection = dataQuality.generalSection || {}
  dataQuality.positionalAccuracy = dataQuality.positionalAccuracy || {
    horizontal: {},
    vertical: {},
  }
  dataQuality.dataProcessingInformation =
    dataQuality.dataProcessingInformation || {}

  accessInfo.distributionInfo = accessInfo.distributionInfo || {}
  accessInfo.licenseInfo = accessInfo.licenseInfo || {}
  accessInfo.contactInfo = accessInfo.contactInfo || {}

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground">
        Please review your metadata information before submitting. Make sure all
        information is correct.
      </div>

      {/* General Information Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            General Information
          </CardTitle>
          <CardDescription>
            Basic dataset identification details
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Data Type</h4>
              <p className="text-sm text-muted-foreground">
                {generalInfo.dataInformation.dataType || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Data Name</h4>
              <p className="text-sm text-muted-foreground">
                {generalInfo.dataInformation.dataName || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Production Date</h4>
              <p className="text-sm text-muted-foreground">
                {generalInfo.dataInformation.productionDate || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Abstract</h4>
              <p className="text-sm text-muted-foreground truncate">
                {generalInfo.description.abstract || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Purpose</h4>
              <p className="text-sm text-muted-foreground truncate">
                {generalInfo.description.purpose || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Technical Details
          </CardTitle>
          <CardDescription>
            Spatial and technical specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Coordinate System</h4>
              <p className="text-sm text-muted-foreground">
                {technicalDetails.spatialInformation.coordinateSystem || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Projection</h4>
              <p className="text-sm text-muted-foreground">
                {technicalDetails.spatialInformation.projection || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Scale</h4>
              <p className="text-sm text-muted-foreground">
                {technicalDetails.spatialInformation.scale
                  ? `1:${technicalDetails.spatialInformation.scale}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Resolution</h4>
              <p className="text-sm text-muted-foreground">
                {technicalDetails.spatialInformation.resolution || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Coordinate Unit</h4>
              <p className="text-sm text-muted-foreground">
                {technicalDetails.spatialDomain.coordinateUnit || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Bounding Box</h4>
              <p className="text-sm text-muted-foreground">
                {technicalDetails.spatialDomain.minLatitude &&
                technicalDetails.spatialDomain.minLongitude &&
                technicalDetails.spatialDomain.maxLatitude &&
                technicalDetails.spatialDomain.maxLongitude
                  ? `${technicalDetails.spatialDomain.minLatitude}, ${technicalDetails.spatialDomain.minLongitude} to ${technicalDetails.spatialDomain.maxLatitude}, ${technicalDetails.spatialDomain.maxLongitude}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">File Format</h4>
              <p className="text-sm text-muted-foreground">
                {technicalDetails.technicalSpecifications.fileFormat || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">File Size</h4>
              <p className="text-sm text-muted-foreground">
                {technicalDetails.technicalSpecifications.fileSize
                  ? `${technicalDetails.technicalSpecifications.fileSize} MB`
                  : "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Access Constraints</h4>
              <p className="text-sm text-muted-foreground">
                {technicalDetails.resourceConstraint?.accessConstraints ||
                  "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Use Constraints</h4>
              <p className="text-sm text-muted-foreground">
                {technicalDetails.resourceConstraint?.useConstraints || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Data Quality</CardTitle>
          <CardDescription>
            Quality metrics and processing information
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Consistency Report</h4>
              <p className="text-sm text-muted-foreground">
                {dataQuality.generalSection.logicalConsistencyReport || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Completeness Report</h4>
              <p className="text-sm text-muted-foreground">
                {dataQuality.generalSection.completenessReport || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Horizontal Accuracy</h4>
              <p className="text-sm text-muted-foreground">
                {dataQuality.positionalAccuracy?.horizontal?.percentValue
                  ? `${dataQuality.positionalAccuracy.horizontal.percentValue}%`
                  : "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Processing Description</h4>
              <p className="text-sm text-muted-foreground truncate">
                {dataQuality.dataProcessingInformation.description || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Information Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Access Information
          </CardTitle>
          <CardDescription>Distribution and licensing details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Distribution Format</h4>
              <p className="text-sm text-muted-foreground">
                {accessInfo.distributionInfo?.distributionFormat || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Contact Person</h4>
              <p className="text-sm text-muted-foreground">
                {accessInfo.contactInfo?.contactPerson || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Contact Email</h4>
              <p className="text-sm text-muted-foreground">
                {accessInfo.contactInfo?.email || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">License Type</h4>
              <p className="text-sm text-muted-foreground">
                {accessInfo.licenseInfo?.licenseType || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => onStepChange(step - 1)}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Metadata"
          )}
        </Button>
      </div>
    </div>
  )
}
