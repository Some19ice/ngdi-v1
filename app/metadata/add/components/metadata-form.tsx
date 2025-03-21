"use client";

import { useState, useEffect, Suspense } from "react"
import dynamic from "next/dynamic"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Save, Check, AlertCircle, FileText } from "lucide-react"
import { debounce } from "lodash"
import type {
  NGDIMetadataFormData,
  GeneralInfoData,
  DataQualityData,
  AccessInfoData,
  TechnicalDetailsData,
} from "@/types/ngdi-metadata"

// Import the Steps component directly as it's small and always needed
import { Steps } from "./steps"
import { InfoIcon } from "lucide-react"
import { createMetadata, updateMetadata } from "@/app/actions/metadata"
import { useForm } from "react-hook-form"
import { DraftManager } from "./draft-manager"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

// Lazy load the form components
const GeneralInfoForm = dynamic(() => import("./general-info-form"), {
  loading: () => (
    <FormSectionLoader label="Loading General Information Form..." />
  ),
  ssr: false,
})

const TechnicalDetailsForm = dynamic(() => import("./technical-details-form"), {
  loading: () => (
    <FormSectionLoader label="Loading Technical Details Form..." />
  ),
  ssr: false,
})

const DataQualityForm = dynamic(() => import("./data-quality-form"), {
  loading: () => <FormSectionLoader label="Loading Data Quality Form..." />,
  ssr: false,
})

const AccessInfoForm = dynamic(() => import("./access-info-form"), {
  loading: () => (
    <FormSectionLoader label="Loading Access Information Form..." />
  ),
  ssr: false,
})

const ReviewForm = dynamic(() => import("./review-form"), {
  loading: () => <FormSectionLoader label="Loading Review Form..." />,
  ssr: false,
})

// Simple loading component for form sections
function FormSectionLoader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

interface MetadataFormProps {
  initialData?: NGDIMetadataFormData
  metadataId?: string
}

export function MetadataForm({ initialData, metadataId }: MetadataFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "saving" | "error" | null
  >(null)
  const [formData, setFormData] = useState<Partial<NGDIMetadataFormData>>(
    initialData || {}
  )
  const router = useRouter()
  const totalSteps = 5
  const isEditing = !!metadataId

  // Cache key for this form
  const cacheKey = isEditing
    ? `ngdi-metadata-form-${metadataId}`
    : "ngdi-metadata-form-draft"

  const form = useForm<Partial<NGDIMetadataFormData>>({
    defaultValues: initialData || {},
    mode: "onChange",
  })

  const { reset, setValue, getValues, watch } = form
  const formValues = watch()

  // Load cached form data on initial render
  useEffect(() => {
    const loadCachedData = () => {
      try {
        // Skip if we have initialData provided
        if (initialData) return

        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const parsedData = JSON.parse(cached) as Partial<NGDIMetadataFormData>
          reset(parsedData)
          toast.info("Loaded your previously saved draft")
        }
      } catch (err) {
        console.error("Failed to load cached form data:", err)
      }
    }

    loadCachedData()
  }, [cacheKey, initialData, reset])

  // Auto-save form data on change
  const debouncedSave = debounce((data: any) => {
    try {
      setSaveStatus("saving")
      setIsSaving(true)
      localStorage.setItem(cacheKey, JSON.stringify(data))
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (err) {
      console.error("Failed to save form data:", err)
      setSaveStatus("error")
    } finally {
      setIsSaving(false)
    }
  }, 1000)

  useEffect(() => {
    if (Object.keys(formValues).length > 0) {
      debouncedSave(formValues)
    }
    return () => {
      debouncedSave.cancel()
    }
  }, [formValues, debouncedSave])

  // Clear cached data after successful submission
  const clearCachedData = () => {
    try {
      localStorage.removeItem(cacheKey)
    } catch (err) {
      console.error("Failed to clear cached form data:", err)
    }
  }

  // Handle step 1 (General Info) completion
  const handleGeneralInfoNext = (stepData: GeneralInfoData) => {
    setFormData((prev) => ({ ...prev, generalInfo: stepData }))
    setCurrentStep(2)
  }

  // Handle step 2 (Technical Details) completion
  const handleTechnicalDetailsNext = (stepData: TechnicalDetailsData) => {
    setFormData((prev) => ({
      ...prev,
      technicalDetails: stepData,
    }))
    setCurrentStep(3)
  }

  // Handle step 3 (Data Quality) completion
  const handleDataQualityNext = (stepData: DataQualityData) => {
    setFormData((prev) => ({ ...prev, dataQuality: stepData }))
    setCurrentStep(4)
  }

  // Handle step 4 (Access Info) completion
  const handleAccessInfoNext = (stepData: AccessInfoData) => {
    setFormData((prev) => ({ ...prev, accessInfo: stepData }))
    setCurrentStep(5)
  }

  // Handle back button for all steps
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Save current form as draft
  const saveDraft = () => {
    if (Object.keys(formValues).length === 0 || isSaving) return

    setIsSaving(true)
    setSaveStatus("saving")

    try {
      localStorage.setItem(cacheKey, JSON.stringify(formValues))
      setSaveStatus("saved")
      toast.success("Draft saved successfully")
    } catch (err) {
      console.error("Error saving draft:", err)
      setSaveStatus("error")
      toast.error("Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  // Final form submission
  const handleSave = async () => {
    try {
      setIsSubmitting(true)

      // Make sure we have all required form data sections
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

      const finalFormData = formData as NGDIMetadataFormData

      let result

      if (isEditing && metadataId) {
        // Update existing metadata
        result = await updateMetadata(metadataId, finalFormData)
      } else {
        // Create new metadata
        result = await createMetadata(finalFormData)
      }

      if (result.success) {
        // Clear cached data on success
        clearCachedData()

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

  // Handle loading draft from the draft manager
  const handleLoadDraft = (data: Partial<NGDIMetadataFormData>) => {
    reset(data)
  }

  // Form section update handler
  const handleFormChange = (data: Partial<NGDIMetadataFormData>) => {
    Object.entries(data).forEach(([key, value]) => {
      // @ts-ignore - Type safety handled by schema
      setValue(key, value)
    })
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {currentStep === 1 && "General Information"}
                  {currentStep === 2 && "Technical Details"}
                  {currentStep === 3 && "Data Quality"}
                  {currentStep === 4 && "Access Information"}
                  {currentStep === 5 && "Review & Submit"}
                </CardTitle>

                {/* Save status indicator */}
                <div className="flex items-center text-sm">
                  {saveStatus === "saved" && (
                    <span className="flex items-center text-green-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="mr-1.5 h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Saved
                    </span>
                  )}
                  {saveStatus === "saving" && (
                    <span className="flex items-center text-amber-600">
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  )}
                  {saveStatus === "error" && (
                    <span className="flex items-center text-red-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="mr-1.5 h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Error Saving
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-6">
              {currentStep === 1 && (
                <GeneralInfoForm
                  onNext={handleGeneralInfoNext}
                  initialData={formData.generalInfo}
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
                  initialData={formData.dataQuality}
                />
              )}
              {currentStep === 4 && (
                <AccessInfoForm
                  onNext={handleAccessInfoNext}
                  onBack={handlePrevious}
                  initialData={formData.accessInfo}
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
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center text-sm text-muted-foreground">
                  <InfoIcon className="mr-2 h-4 w-4" />
                  <p>
                    You can navigate through steps with incomplete data, but
                    final validation will occur when submitting the complete
                    form.
                  </p>
                </div>
                {currentStep !== 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveDraft}
                    disabled={isSaving || Object.keys(formValues).length === 0}
                    className="ml-4 flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                          <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                        </svg>
                        Save Draft
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Add Metadata
              </h2>
              <p className="text-sm text-muted-foreground">
                Step {currentStep}/5: {getStepTitle(currentStep)}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <DraftManager onLoadDraft={handleLoadDraft} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Function to get title for the current step
function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return "General Information"
    case 2:
      return "Technical Details"
    case 3:
      return "Data Quality"
    case 4:
      return "Access Information"
    case 5:
      return "Review & Submit"
    default:
      return "Metadata Form"
  }
} 