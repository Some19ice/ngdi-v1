"use client";

import { useState, useEffect, Suspense } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Save, Check, AlertCircle, Info } from "lucide-react"
import { debounce } from "lodash"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type {
  NGDIMetadataFormData,
  GeneralInfoData,
  DataQualityData,
  AccessInfoData,
  TechnicalDetailsData,
} from "@/types/ngdi-metadata"
import { useForm } from "react-hook-form"

// Import the Steps component directly as it's small and always needed
import { Steps } from "./steps"
import { createMetadata, updateMetadata } from "@/app/actions/metadata"
import { DraftManager } from "./draft-manager"

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

// Estimated completion times for each step (in minutes)
const STEP_COMPLETION_TIMES = {
  1: 5, // General Information: 5 minutes
  2: 3, // Technical Details: 3 minutes
  3: 4, // Data Quality: 4 minutes
  4: 3, // Access Information: 3 minutes
  5: 2, // Review: 2 minutes
}

// Function to get total estimated time
function getTotalEstimatedTime(): number {
  return Object.values(STEP_COMPLETION_TIMES).reduce(
    (sum, time) => sum + time,
    0
  )
}

// Function to get estimated time remaining based on current step
function getEstimatedTimeRemaining(currentStep: number): number {
  return Object.entries(STEP_COMPLETION_TIMES)
    .filter(([step]) => parseInt(step) >= currentStep)
    .reduce((sum, [, time]) => sum + time, 0)
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

// Function to get helpful context for the current step
function getStepContext(step: number): string {
  switch (step) {
    case 1:
      return "Fill in basic information about your dataset, including type, name, and description."
    case 2:
      return "Provide technical specifications such as coordinate system, projection, and file details."
    case 3:
      return "Add information about data quality, accuracy, and processing methods."
    case 4:
      return "Specify how your data can be accessed, licensing terms, and contact information."
    case 5:
      return "Review all information before final submission."
    default:
      return ""
  }
}

interface MetadataFormProps {
  initialData?: NGDIMetadataFormData
  metadataId?: string
}

export function MetadataForm({ initialData, metadataId }: MetadataFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "saving" | "error" | null
  >(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
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
          const parsedData = JSON.parse(cached)
          reset(parsedData)
          toast.success("Draft form loaded", {
            description: "Your previously saved draft has been loaded",
          })
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

  // Handle loading draft from the draft manager
  const handleLoadDraft = (data: Partial<NGDIMetadataFormData>) => {
    reset(data)
    toast.success("Draft loaded successfully")
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
  const handleSubmitConfirm = async () => {
    setShowSubmitConfirm(false)
    setIsSubmitting(true)

    try {
      // Make sure we have all required form data sections
      if (
        !formValues.generalInfo ||
        !formValues.dataQuality ||
        !formValues.technicalDetails ||
        !formValues.accessInfo
      ) {
        toast.error("Please complete all form sections before submitting")
        setIsSubmitting(false)
        return
      }

      let result

      if (isEditing && metadataId) {
        // Update existing metadata
        result = await updateMetadata(metadataId, formValues)
      } else {
        // Create new metadata
        result = await createMetadata(formValues)
      }

      if (result.success) {
        // Clear cached data on success
        clearCachedData()

        toast.success(
          `Metadata ${isEditing ? "updated" : "saved"} successfully`
        )
        router.push("/metadata")
      } else {
        toast.error(
          `Failed to ${isEditing ? "update" : "create"} metadata: ${result.error}`
        )
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} metadata:`,
        error
      )
      toast.error(`Failed to ${isEditing ? "update" : "create"} metadata`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit" : "Add"} Metadata
          </h2>
          <div className="flex items-center">
            <p className="text-sm text-muted-foreground">
              Step {currentStep}/5: {getStepTitle(currentStep)}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">More information</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>{getStepContext(currentStep)}</p>
                  <p className="mt-2 text-xs">
                    Estimated time: ~
                    {
                      STEP_COMPLETION_TIMES[
                        currentStep as keyof typeof STEP_COMPLETION_TIMES
                      ]
                    }{" "}
                    minutes for this step
                    <br />
                    Total time left: ~{getEstimatedTimeRemaining(
                      currentStep
                    )}{" "}
                    minutes
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {saveStatus === "saved" && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Check className="mr-1 h-4 w-4 text-green-500" />
              Saved
            </div>
          )}

          {saveStatus === "saving" && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Saving...
            </div>
          )}

          {saveStatus === "error" && (
            <div className="flex items-center text-sm text-red-500">
              <AlertCircle className="mr-1 h-4 w-4" />
              Error Saving
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={saveDraft}
            disabled={Object.keys(formValues).length === 0 || isSaving}
            className="flex items-center"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Draft
          </Button>

          <DraftManager
            onLoadDraft={handleLoadDraft}
            currentData={formValues}
            formTitle={formValues?.generalInfo?.dataInformation?.dataName}
          />
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-4 pb-2">
          <p className="text-sm text-muted-foreground">
            {getStepContext(currentStep)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Estimated time: ~
            {
              STEP_COMPLETION_TIMES[
                currentStep as keyof typeof STEP_COMPLETION_TIMES
              ]
            }{" "}
            minutes
          </p>
        </CardContent>
      </Card>

      <Steps step={currentStep} />

      {currentStep === 1 && (
        <GeneralInfoForm
          step={currentStep}
          onStepChange={setCurrentStep}
          formData={formValues}
          onChange={(data) =>
            Object.entries(data).forEach(([key, value]) => {
              // @ts-ignore - Type safety handled by component validation
              setValue(key, value)
            })
          }
          isSubmitting={isSubmitting}
        />
      )}

      {currentStep === 2 && (
        <TechnicalDetailsForm
          step={currentStep}
          onStepChange={setCurrentStep}
          formData={formValues}
          onChange={(data) =>
            Object.entries(data).forEach(([key, value]) => {
              // @ts-ignore - Type safety handled by component validation
              setValue(key, value)
            })
          }
          isSubmitting={isSubmitting}
        />
      )}

      {currentStep === 3 && (
        <DataQualityForm
          step={currentStep}
          onStepChange={setCurrentStep}
          formData={formValues}
          onChange={(data) =>
            Object.entries(data).forEach(([key, value]) => {
              // @ts-ignore - Type safety handled by component validation
              setValue(key, value)
            })
          }
          isSubmitting={isSubmitting}
        />
      )}

      {currentStep === 4 && (
        <AccessInfoForm
          step={currentStep}
          onStepChange={setCurrentStep}
          formData={formValues}
          onChange={(data) =>
            Object.entries(data).forEach(([key, value]) => {
              // @ts-ignore - Type safety handled by component validation
              setValue(key, value)
            })
          }
          isSubmitting={isSubmitting}
        />
      )}

      {currentStep === 5 && (
        <>
          <ReviewForm
            step={currentStep}
            onStepChange={setCurrentStep}
            formData={formValues}
            onChange={(data) =>
              Object.entries(data).forEach(([key, value]) => {
                // @ts-ignore - Type safety handled by component validation
                setValue(key, value)
              })
            }
            isSubmitting={isSubmitting}
            onSubmit={() => setShowSubmitConfirm(true)}
          />

          <AlertDialog
            open={showSubmitConfirm}
            onOpenChange={setShowSubmitConfirm}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to submit this metadata record? This
                  action cannot be undone. Once submitted, the data will be
                  added to the NGDI metadata catalog and will be available for
                  others to discover and access.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSubmitConfirm}
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Metadata"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
} 