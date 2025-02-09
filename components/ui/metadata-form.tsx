"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import GeneralInfoForm from "@/app/metadata/add/components/general-info-form"
import TechnicalDetailsForm from "@/app/metadata/add/components/technical-details-form"
import AccessInfoForm from "@/app/metadata/add/components/access-info-form"
import { createMetadata } from "@/app/actions/metadata"
import type { MetadataFormData } from "@/app/actions/metadata"

export function MetadataForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<MetadataFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSave = async (data: any) => {
    try {
      setIsSubmitting(true)
      const finalData = { ...formData, ...data }
      const result = await createMetadata(finalData as MetadataFormData)

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
              {["General", "Technical", "Access"][step - 1]}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && (
        <GeneralInfoForm onNext={handleNext} initialData={formData} />
      )}
      {currentStep === 2 && (
        <TechnicalDetailsForm
          onNext={handleNext}
          onBack={handleBack}
          initialData={formData}
        />
      )}
      {currentStep === 3 && (
        <AccessInfoForm
          onBack={handleBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          initialData={formData}
        />
      )}
    </div>
  )
}
