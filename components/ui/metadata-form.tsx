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
} from "@/types/ngdi-metadata"

export function MetadataForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<NGDIMetadataFormData>>({
    form1: {} as Form1Data,
    form2: {} as Form2Data,
    form3: {} as Form3Data,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = (data: Form1Data | Form2Data) => {
    setFormData((prev) => ({
      ...prev,
      ...(currentStep === 1
        ? { form1: data as Form1Data }
        : { form2: data as Form2Data }),
    }))
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSave = async (data: Form3Data) => {
    try {
      setIsSubmitting(true)
      const finalData = {
        ...formData,
        form3: data,
      } as NGDIMetadataFormData

      const result = await createMetadata(finalData)

      if (result.success) {
        toast.success("Metadata saved successfully")
        router.push("/metadata")
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
        <GeneralInfoForm onNext={handleNext} initialData={formData.form1} />
      )}
      {currentStep === 2 && (
        <DataQualityForm
          onNext={handleNext}
          onBack={handleBack}
          initialData={formData.form2}
        />
      )}
      {currentStep === 3 && (
        <DistributionInfoForm
          onBack={handleBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          initialData={formData.form3}
        />
      )}
    </div>
  )
}
