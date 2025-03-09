"use client";

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type {
  NGDIMetadataFormData,
  Form1Data,
  Form2Data,
  Form3Data,
} from "@/types/ngdi-metadata"

// Import the components from the barrel file
import {
  GeneralInfoForm,
  DataQualityForm,
  DistributionInfoForm,
  Steps,
} from "./index"
import { createNGDIMetadata } from "@/app/actions/ngdi/metadata"

export function MetadataForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<NGDIMetadataFormData>>({})
  const router = useRouter()
  const totalSteps = 3

  const handleNext = (stepData: Form1Data | Form2Data) => {
    if (currentStep === 1) {
      setFormData((prev) => ({ ...prev, form1: stepData as Form1Data }))
    } else if (currentStep === 2) {
      setFormData((prev) => ({ ...prev, form2: stepData as Form2Data }))
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSave = async (data: Form3Data) => {
    try {
      setIsSubmitting(true)

      // Combine all form data
      const completeData = {
        ...formData,
        form3: data,
      } as NGDIMetadataFormData

      const result = await createNGDIMetadata(completeData)

      if (!result?.success) {
        throw new Error(result?.error || "Failed to create metadata")
      }

      toast.success("Metadata created successfully")
      router.push("/metadata")
      router.refresh()
    } catch (error) {
      console.error("Failed to save metadata:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to create metadata"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8">
            Add NGDI Metadata
          </h1>

          <div className="mb-8">
            <Steps currentStep={currentStep} />
          </div>

          <Card className="p-6">
            {currentStep === 1 && (
              <GeneralInfoForm
                onNext={handleNext}
                initialData={formData.form1}
              />
            )}
            {currentStep === 2 && (
              <DataQualityForm
                onNext={handleNext}
                onBack={handlePrevious}
                initialData={formData.form2}
              />
            )}
            {currentStep === 3 && (
              <DistributionInfoForm
                onBack={handlePrevious}
                onSave={handleSave}
                isSubmitting={isSubmitting}
                initialData={formData.form3}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  )
} 