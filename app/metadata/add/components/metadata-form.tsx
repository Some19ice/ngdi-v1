"use client";

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type {
  NGDIMetadataFormData,
  GeneralInfoData,
  DataQualityData,
  DistributionInfoData,
  AccessInfoData,
  TechnicalDetailsData,
  Form1Data,
  Form2Data,
  Form3Data,
} from "@/types/ngdi-metadata"

// Import the form components
import {
  GeneralInfoForm,
  DataQualityForm,
  DistributionInfoForm,
  Steps,
} from "./index"
import TechnicalDetailsForm from "./technical-details-form"
import AccessInfoForm from "./access-info-form"
import ReviewForm from "./review-form"
import { createMetadata, updateMetadata } from "@/app/actions/metadata"
import { InfoIcon } from "lucide-react"

interface MetadataFormProps {
  initialData?: NGDIMetadataFormData
  metadataId?: string
}

export function MetadataForm({ initialData, metadataId }: MetadataFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<NGDIMetadataFormData>>(
    initialData || {}
  )
  const router = useRouter()
  const totalSteps = 5
  const isEditing = !!metadataId

  // Handle step 1 (General Info) completion
  const handleGeneralInfoNext = (stepData: GeneralInfoData) => {
    setFormData((prev) => ({ ...prev, generalInfo: stepData, form1: stepData }))
    setCurrentStep(2)
  }

  // Handle step 2 (Technical Details) completion
  const handleTechnicalDetailsNext = (stepData: TechnicalDetailsData) => {
    setFormData((prev) => ({ ...prev, technicalDetails: stepData }))
    setCurrentStep(3)
  }

  // Handle step 3 (Data Quality) completion
  const handleDataQualityNext = (stepData: DataQualityData) => {
    setFormData((prev) => ({ ...prev, dataQuality: stepData, form2: stepData }))
    setCurrentStep(4)
  }

  // Handle step 4 (Access Info) completion
  const handleAccessInfoNext = (stepData: AccessInfoData) => {
    setFormData((prev) => ({ ...prev, accessInfo: stepData, form4: stepData }))
    setCurrentStep(5)
  }

  // Handle back button for all steps
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Final form submission
  const handleSave = async () => {
    try {
      setIsSubmitting(true)

      // Make sure we have all required form data
      if (
        !formData.generalInfo ||
        !formData.dataQuality ||
        !formData.technicalDetails ||
        !formData.accessInfo
      ) {
        toast.error("Please complete all form sections before submitting")
        setIsSubmitting(false)
        return
      }

      // Create distribution info if it doesn't exist
      const distributionInfo: DistributionInfoData =
        formData.distributionInfo || {
          distributorInformation: {
            name: formData.accessInfo.contactInfo.contactPerson || "",
            address: formData.accessInfo.contactInfo.department || "",
            email: formData.accessInfo.contactInfo.email || "",
            phoneNumber: formData.accessInfo.contactInfo.phone || "",
            isCustodian: true,
            custodianName: "",
            custodianContact: "",
          },
          distributionDetails: {
            liability: formData.accessInfo.licenseInfo.usageTerms || "",
            customOrderProcess: "Contact distributor for custom orders",
            technicalPrerequisites:
              formData.technicalDetails.technicalSpecifications.softwareReqs ||
              "Standard GIS software",
          },
          standardOrderProcess: {
            fees: "Please contact for pricing",
            turnaroundTime: "Typically 3-5 business days",
            orderingInstructions: "Contact via email or phone",
            maximumResponseTime: "5 business days",
          },
        }

      // Prepare the final form data with both naming conventions to ensure compatibility
      const finalFormData: NGDIMetadataFormData = {
        // New naming convention
        generalInfo: formData.generalInfo,
        technicalDetails: formData.technicalDetails,
        dataQuality: formData.dataQuality,
        accessInfo: formData.accessInfo,
        distributionInfo: distributionInfo,

        // Legacy naming for backward compatibility
        form1: formData.generalInfo,
        form2: formData.dataQuality,
        form3: distributionInfo,
        form4: formData.accessInfo,
      }

      let result

      if (isEditing && metadataId) {
        // Update existing metadata
        result = await updateMetadata(metadataId, finalFormData)
      } else {
        // Create new metadata
        result = await createMetadata(finalFormData)
      }

      if (result.success) {
        toast.success(
          `Metadata ${isEditing ? "updated" : "saved"} successfully`
        )
        router.push("/search/metadata")
      } else {
        if (result.details) {
          result.details.forEach((error: any) => {
            toast.error(`${error.path.join(".")}: ${error.message}`)
          })
        } else {
          toast.error(
            result.error ||
              `Failed to ${isEditing ? "update" : "save"} metadata`
          )
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(
        `Error ${isEditing ? "updating" : "saving"} metadata:`,
        error
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full py-12 md:py-16">
      <div className="container max-w-5xl px-4 md:px-6">
        <div className="flex flex-col space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {isEditing ? "Edit" : "Add"} NGDI Metadata
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Update the metadata record in the NGDI platform."
                : "Complete the form to add a new metadata record to the NGDI platform."}
            </p>
          </div>

          <Steps currentStep={currentStep} totalSteps={totalSteps} />

          <Card className="overflow-hidden border-border/40 shadow-sm">
            <CardHeader className="bg-muted/20 px-6 py-4">
              <CardTitle className="text-xl">
                {currentStep === 1 && "General Information"}
                {currentStep === 2 && "Technical Details"}
                {currentStep === 3 && "Data Quality"}
                {currentStep === 4 && "Access Information"}
                {currentStep === 5 && "Review & Submit"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              {currentStep === 1 && (
                <GeneralInfoForm
                  onNext={handleGeneralInfoNext}
                  initialData={formData.generalInfo || formData.form1}
                />
              )}
              {currentStep === 2 && (
                <TechnicalDetailsForm
                  onNext={handleTechnicalDetailsNext}
                  onBack={handlePrevious}
                  initialData={formData.technicalDetails}
                />
              )}
              {currentStep === 3 && (
                <DataQualityForm
                  onNext={handleDataQualityNext}
                  onBack={handlePrevious}
                  initialData={formData.dataQuality || formData.form2}
                />
              )}
              {currentStep === 4 && (
                <AccessInfoForm
                  onNext={handleAccessInfoNext}
                  onBack={handlePrevious}
                  initialData={formData.accessInfo || formData.form4}
                />
              )}
              {currentStep === 5 && (
                <ReviewForm
                  onBack={handlePrevious}
                  onSave={handleSave}
                  isSubmitting={isSubmitting}
                  formData={formData as NGDIMetadataFormData}
                />
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/10 px-6 py-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <InfoIcon className="mr-2 h-4 w-4" />
                <p>
                  You can progress through the form with partial data, but final
                  validation will occur when saving the complete metadata
                  record.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 