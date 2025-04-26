"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Loader2,
  Save,
  Check,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react"
import { debounce } from "lodash"
import LZString from "lz-string"
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
import { isEqual } from "lodash"

// Auto-save configuration
const AUTO_SAVE_INTERVAL = 60000 // 1 minute periodic save
const SNAPSHOT_INTERVAL = 300000 // 5 minutes snapshot
const MAX_SNAPSHOTS = 5 // Maximum number of snapshots to keep
const MAX_STORAGE_SIZE = 4 * 1024 * 1024 // 4MB max storage size

// Define types for enhanced storage functionality
interface FormSnapshot {
  timestamp: string
  version: number
  data: Partial<NGDIMetadataFormData>
}

interface FormStorageData {
  currentVersion: number
  lastModified: string
  data: Partial<NGDIMetadataFormData>
  snapshots: FormSnapshot[]
}

// Lazy load the form components
const GeneralInfoForm = dynamic(() => import("./general-info-form"), {
  loading: () => (
    <FormSectionLoader label="Loading General Information Form..." />
  ),
  ssr: false,
})

// Replace the dynamic import with direct import
import TechnicalDetailsForm from "./technical-details-form"

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
    "saved" | "saving" | "error" | "conflict" | null
  >(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [conflictData, setConflictData] =
    useState<Partial<NGDIMetadataFormData> | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const lastSavedData = useRef<Partial<NGDIMetadataFormData>>({})
  const currentVersion = useRef(0)
  const isEditing = !!metadataId

  // Cache key for this form
  const cacheKey = isEditing
    ? `ngdi-metadata-form-${metadataId}`
    : "ngdi-metadata-form-draft"
  const snapshotKey = `${cacheKey}-snapshots`

  const form = useForm<Partial<NGDIMetadataFormData>>({
    defaultValues: initialData || {},
    mode: "onChange",
  })

  const { reset, setValue, getValues, watch } = form
  const formValues = watch()

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => {
      setIsOnline(false)
      toast.warning("You are offline. Changes will be saved locally.")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initial check
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Calculate storage size
  const getStorageSize = (): number => {
    let totalSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        totalSize += (key.length + (value?.length || 0)) * 2 // UTF-16 characters are 2 bytes each
      }
    }
    return totalSize
  }

  // Check for storage limit
  const isStorageFull = useCallback((): boolean => {
    return getStorageSize() > MAX_STORAGE_SIZE
  }, [])

  // Compress data for storage
  const compressData = useCallback((data: any): string => {
    return LZString.compressToUTF16(JSON.stringify(data))
  }, [])

  // Decompress stored data
  const decompressData = (compressed: string): any => {
    try {
      const decompressed = LZString.decompressFromUTF16(compressed)
      return decompressed ? JSON.parse(decompressed) : null
    } catch (e) {
      console.error("Failed to decompress data:", e)
      return null
    }
  }

  // Create a deep diff between old and new data
  const createDiff = useCallback(
    (
      oldData: Partial<NGDIMetadataFormData>,
      newData: Partial<NGDIMetadataFormData>
    ) => {
      const diff: Record<string, any> = {}

      // Find changed sections
      if (
        newData.generalInfo &&
        !isEqual(oldData.generalInfo, newData.generalInfo)
      ) {
        diff.generalInfo = newData.generalInfo
      }
      if (
        newData.technicalDetails &&
        !isEqual(oldData.technicalDetails, newData.technicalDetails)
      ) {
        diff.technicalDetails = newData.technicalDetails
      }
      if (
        newData.dataQuality &&
        !isEqual(oldData.dataQuality, newData.dataQuality)
      ) {
        diff.dataQuality = newData.dataQuality
      }
      if (
        newData.accessInfo &&
        !isEqual(oldData.accessInfo, newData.accessInfo)
      ) {
        diff.accessInfo = newData.accessInfo
      }

      return diff
    },
    []
  )

  // Save a snapshot of current form state
  const saveSnapshot = useCallback(() => {
    try {
      // Get existing snapshots if available
      const existingData = localStorage.getItem(snapshotKey)
      let snapshots: FormSnapshot[] = []

      if (existingData) {
        const parsed = decompressData(existingData)
        if (parsed && Array.isArray(parsed)) {
          snapshots = parsed
        }
      }

      // Create new snapshot
      const newSnapshot: FormSnapshot = {
        timestamp: new Date().toISOString(),
        version: currentVersion.current,
        data: { ...formValues },
      }

      // Add new snapshot and limit the number of snapshots
      snapshots.unshift(newSnapshot)
      if (snapshots.length > MAX_SNAPSHOTS) {
        snapshots = snapshots.slice(0, MAX_SNAPSHOTS)
      }

      // Save snapshots
      localStorage.setItem(snapshotKey, compressData(snapshots))
    } catch (err) {
      console.error("Failed to save snapshot:", err)
    }
  }, [formValues, snapshotKey, compressData])

  // Recovery from snapshots
  const recoverFromSnapshots = useCallback(() => {
    try {
      const snapshotsData = localStorage.getItem(snapshotKey)
      if (!snapshotsData) return false

      const snapshots = decompressData(snapshotsData)
      if (!snapshots || !snapshots.length) return false

      // Use the most recent snapshot
      const latestSnapshot = snapshots[0]
      reset(latestSnapshot.data)
      currentVersion.current = latestSnapshot.version
      lastSavedData.current = latestSnapshot.data

      toast.success("Recovered from snapshot", {
        description: `Recovered data from ${new Date(latestSnapshot.timestamp).toLocaleString()}`,
      })
      return true
    } catch (e) {
      console.error("Failed to recover from snapshots:", e)
      return false
    }
  }, [snapshotKey, reset])

  // Load form data with conflict detection
  const loadCachedData = useCallback(() => {
    try {
      // Skip if we have initialData provided
      if (initialData) return

      const cached = localStorage.getItem(cacheKey)
      if (!cached) return

      try {
        let storageData: FormStorageData
        const isCompressed = cached.startsWith("ɵ") // LZString compressed data typically starts with this character

        if (isCompressed) {
          storageData = decompressData(cached)
        } else {
          // Handle legacy data format
          const parsedData = JSON.parse(cached)
          storageData = {
            currentVersion: 1,
            lastModified: new Date().toISOString(),
            data: parsedData,
            snapshots: [],
          }
        }

        if (!storageData) return

        // Set current version reference
        currentVersion.current = storageData.currentVersion
        lastSavedData.current = storageData.data

        reset(storageData.data)
        toast.success("Draft form loaded", {
          description: "Your previously saved draft has been loaded",
        })
      } catch (e) {
        console.error("Error parsing cached data:", e)

        // Try to recover from snapshots
        recoverFromSnapshots()
      }
    } catch (err) {
      console.error("Failed to load cached form data:", err)
    }
  }, [cacheKey, initialData, reset, recoverFromSnapshots])

  // Check for conflicts with stored data
  const checkForConflicts = useCallback(() => {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return false

      let storageData: FormStorageData

      try {
        const isCompressed = cached.startsWith("ɵ")
        if (isCompressed) {
          storageData = decompressData(cached)
        } else {
          // Handle legacy data format
          const parsedData = JSON.parse(cached)
          storageData = {
            currentVersion: 1,
            lastModified: new Date().toISOString(),
            data: parsedData,
            snapshots: [],
          }
        }

        // Check if version is different and there's a conflict
        if (
          storageData &&
          storageData.currentVersion > currentVersion.current
        ) {
          setConflictData(storageData.data)
          setShowConflictDialog(true)
          setSaveStatus("conflict")
          return true
        }
      } catch (e) {
        console.error("Error checking for conflicts:", e)
      }

      return false
    } catch (e) {
      console.error("Failed to check for conflicts:", e)
      return false
    }
  }, [cacheKey])

  // Resolve conflict by keeping current version
  const resolveConflictKeepCurrent = () => {
    setShowConflictDialog(false)
    // Force save with incremented version number
    currentVersion.current += 2 // Jump ahead to ensure it's newer
    saveFormData(formValues, true)
    setSaveStatus("saved")
    setTimeout(() => setSaveStatus(null), 2000)
  }

  // Resolve conflict by using the newer version
  const resolveConflictUseNewer = () => {
    if (conflictData) {
      reset(conflictData)
      lastSavedData.current = conflictData
      setShowConflictDialog(false)
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus(null), 2000)
      toast.success("Updated to newer version")
    }
  }

  // Save form data with optimization
  const saveFormData = useCallback(
    (data: Partial<NGDIMetadataFormData>, forceFullSave = false) => {
      try {
        // Check if storage is near limit
        if (isStorageFull()) {
          // Clean up old snapshots
          localStorage.removeItem(snapshotKey)
          toast.warning(
            "Storage space is limited. Older snapshots have been removed."
          )
        }

        // Prepare storage data
        const now = new Date().toISOString()
        let saveData: FormStorageData

        if (forceFullSave) {
          // Full save
          saveData = {
            currentVersion: currentVersion.current,
            lastModified: now,
            data: data,
            snapshots: [],
          }
          lastSavedData.current = { ...data }
        } else {
          // Create differential update if possible
          const diff = createDiff(lastSavedData.current, data)

          // If diff is empty or has no sections, skip save
          if (Object.keys(diff).length === 0) {
            setSaveStatus(null)
            setIsSaving(false)
            return
          }

          // Update data with diff
          saveData = {
            currentVersion: currentVersion.current + 1,
            lastModified: now,
            data: { ...lastSavedData.current, ...diff },
            snapshots: [],
          }

          currentVersion.current += 1
          lastSavedData.current = { ...saveData.data }
        }

        // Compress and save
        localStorage.setItem(cacheKey, compressData(saveData))
      } catch (err) {
        console.error("Failed to save form data:", err)
        setSaveStatus("error")
        throw err
      }
    },
    [cacheKey, snapshotKey, isStorageFull, compressData, createDiff]
  )

  // Auto-save form data on change
  const debouncedSave = debounce((data: any) => {
    setSaveStatus("saving")
    setIsSaving(true)

    try {
      // Check for conflicts before saving
      if (checkForConflicts()) {
        // Conflict detected and dialog shown
        return
      }

      saveFormData(data)
      setSaveStatus("saved")

      // Only show saved status briefly then clear it
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (err) {
      console.error("Failed to save form data:", err)
      setSaveStatus("error")
    } finally {
      setIsSaving(false)
    }
  }, 1000)

  // Handle periodic auto-save
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(formValues).length > 0 && !isSaving) {
        // For periodic auto-saves, don't show the saved notification
        // This prevents the notification from appearing every minute
        setSaveStatus("saving")
        setIsSaving(true)

        try {
          if (!checkForConflicts()) {
            saveFormData(formValues)
          }
        } catch (err) {
          console.error("Failed to auto-save form data:", err)
          setSaveStatus("error")
        } finally {
          setIsSaving(false)
          // Don't show "Saved" for periodic auto-saves
          setSaveStatus(null)
        }
      }
    }, AUTO_SAVE_INTERVAL)

    return () => {
      clearInterval(autoSaveInterval)
      // Get current form values before component unmounts
      const currentValues = getValues()

      // Save draft if there are any changes and we're not submitting
      if (Object.keys(currentValues).length > 0 && !isSubmitting) {
        saveFormData(currentValues, true)
      }
    }
  }, [
    formValues,
    isSaving,
    checkForConflicts,
    getValues,
    isSubmitting,
    saveFormData,
  ])

  // Handle snapshot creation
  useEffect(() => {
    const snapshotIntervalId = setInterval(() => {
      if (Object.keys(formValues).length > 0) {
        saveSnapshot()
      }
    }, SNAPSHOT_INTERVAL)

    return () => clearInterval(snapshotIntervalId)
  }, [formValues, saveSnapshot])

  // Load cached data on initial render
  useEffect(() => {
    loadCachedData()
  }, [loadCachedData])

  // Auto-save form data on change
  useEffect(() => {
    // Skip empty form data
    if (Object.keys(formValues).length === 0) return

    // Skip if the data hasn't actually changed
    if (isEqual(formValues, lastSavedData.current)) return

    debouncedSave(formValues)

    return () => {
      debouncedSave.cancel()
    }
  }, [formValues, debouncedSave])

  // Clear cached data after successful submission
  const clearCachedData = () => {
    try {
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(snapshotKey)
    } catch (err) {
      console.error("Failed to clear cached form data:", err)
    }
  }

  // Handle loading draft from the draft manager
  const handleLoadDraft = (data: Partial<NGDIMetadataFormData>) => {
    reset(data)
    lastSavedData.current = data
    currentVersion.current += 1
    toast.success("Draft loaded successfully")
  }

  // Save current form as draft
  const saveDraft = () => {
    if (Object.keys(formValues).length === 0 || isSaving) return

    setIsSaving(true)
    setSaveStatus("saving")

    try {
      saveFormData(formValues, true)
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
          {!isOnline && (
            <div className="flex items-center text-sm text-amber-500">
              <AlertTriangle className="mr-1 h-4 w-4" />
              Offline
            </div>
          )}

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

          {saveStatus === "conflict" && (
            <div className="flex items-center text-sm text-amber-500">
              <AlertTriangle className="mr-1 h-4 w-4" />
              Conflict Detected
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

      {/* Conflict Resolution Dialog */}
      <AlertDialog
        open={showConflictDialog}
        onOpenChange={setShowConflictDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Version Conflict Detected</AlertDialogTitle>
            <AlertDialogDescription>
              This form has been modified in another tab or window. Would you
              like to keep your current changes or use the newer version?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resolveConflictKeepCurrent}>
              Keep My Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={resolveConflictUseNewer}>
              Use Newer Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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