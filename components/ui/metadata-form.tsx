"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import GeneralInfoForm from "@/app/metadata/add/components/general-info-form"
import DataQualityForm from "@/app/metadata/add/components/data-quality-form"
import DistributionInfoForm from "@/app/metadata/add/components/distribution-info-form"
import { createMetadata } from "@/app/actions/metadata"
import type {
  Form1Data,
  Form2Data,
  Form3Data,
  NGDIMetadataFormData,
  GeneralInfoData,
  DataQualityData,
  AccessInfoData,
  TechnicalDetailsData,
} from "@/types/ngdi-metadata"

export function MetadataForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<{
    generalInfo?: Form1Data
    dataQuality?: Form2Data
    distributionInfo?: Form3Data
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep)
  }

  const handleFormChange = (data: Partial<any>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }))
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSave = async (data: Form3Data) => {
    try {
      setIsSubmitting(true)

      // Construct the final data object according to NGDIMetadataFormData structure
      const finalData: NGDIMetadataFormData = {
        generalInfo: formData.generalInfo as GeneralInfoData,
        dataQuality: formData.dataQuality as DataQualityData,
        technicalDetails: {} as TechnicalDetailsData, // Add default or transform from existing data
        accessInfo: {} as AccessInfoData, // Add default or transform from existing data
        distributionInfo: data,
      }

      const result = await createMetadata(finalData)

      if (result.success) {
        toast.success("Metadata saved successfully")
        router.push("/search/metadata")
      } else {
        if (result.details) {
          result.details.forEach((error) => {
            toast.error(`${error.path.join(".")}: ${error.message}`)
          })
        } else {
          toast.error(result.error || "Failed to save metadata")
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Error saving metadata:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`text-sm ${
                currentStep >= step ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {["General", "Data Quality", "Distribution"][step - 1]}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && (
        <GeneralInfoForm
          step={1}
          onStepChange={handleStepChange}
          formData={formData}
          onChange={handleFormChange}
          isSubmitting={false}
        />
      )}
      {currentStep === 2 && (
        <DataQualityForm
          step={2}
          onStepChange={handleStepChange}
          formData={formData}
          onChange={handleFormChange}
          isSubmitting={false}
        />
      )}
      {currentStep === 3 && (
        <DistributionInfoForm
          onBack={handleBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          initialData={formData.distributionInfo}
        />
      )}
    </div>
  )
}
