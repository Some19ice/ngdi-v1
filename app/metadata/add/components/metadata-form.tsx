"use client";

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { MetadataFormData } from "@/app/actions/metadata"
import GeneralInfoForm from "./general-info-form"
import TechnicalDetailsForm from "./technical-details-form"
import AccessInfoForm from "./access-info-form"
import { Steps } from "./steps"
import { createMetadata } from "@/app/actions/metadata"

export function MetadataForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<MetadataFormData>>({})
  const router = useRouter()
  const totalSteps = 3

  const handleNext = (stepData: Partial<MetadataFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = async (accessData: Partial<MetadataFormData>) => {
    try {
      setIsSubmitting(true)
      const completeData = {
        ...formData,
        ...accessData,
      } as MetadataFormData

      const result = await createMetadata(completeData)

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
            Add Metadata
          </h1>

          <div className="mb-8">
            <Steps currentStep={currentStep} />
          </div>

          <Card className="p-6">
            {currentStep === 1 && <GeneralInfoForm onNext={handleNext} />}
            {currentStep === 2 && (
              <TechnicalDetailsForm
                onNext={handleNext}
                onBack={handlePrevious}
              />
            )}
            {currentStep === 3 && (
              <AccessInfoForm
                onBack={handlePrevious}
                onSave={handleSave}
                isSubmitting={isSubmitting}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  )
} 