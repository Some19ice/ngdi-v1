"use client"

import { useState, useEffect } from "react"
import { useForm, UseFormProps, UseFormReturn, FieldValues, Path } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

export interface UseFormValidationProps<TFormValues extends FieldValues> extends UseFormProps<TFormValues> {
  schema: z.ZodType<TFormValues>
  onSubmit?: (values: TFormValues) => Promise<void> | void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

export interface UseFormValidationReturn<TFormValues extends FieldValues> extends UseFormReturn<TFormValues> {
  isSubmitting: boolean
  submitError: Error | null
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  resetSubmitError: () => void
  setFieldErrors: (errors: Record<string, string>) => void
}

/**
 * Custom hook for form validation with React Hook Form and Zod
 * Provides standardized error handling and submission state
 */
export function useFormValidation<TFormValues extends FieldValues>({
  schema,
  onSubmit,
  onError,
  successMessage,
  errorMessage = "An error occurred while submitting the form",
  ...formProps
}: UseFormValidationProps<TFormValues>): UseFormValidationReturn<TFormValues> {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<Error | null>(null)

  // Initialize form with Zod resolver
  const form = useForm<TFormValues>({
    resolver: zodResolver(schema),
    ...formProps,
  })

  // Reset submit error when form values change
  useEffect(() => {
    if (submitError) {
      const subscription = form.watch(() => {
        setSubmitError(null)
      })
      return () => subscription.unsubscribe()
    }
    return undefined
  }, [form, submitError])

  // Handle form submission
  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    if (!onSubmit) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      await form.handleSubmit(async (values) => {
        try {
          await onSubmit(values)
          if (successMessage) {
            toast.success(successMessage)
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(errorMessage)
          setSubmitError(err)
          onError?.(err)
          toast.error(err.message || errorMessage)
          throw err
        }
      })(e)
    } catch (error) {
      // This catch block handles errors from the form validation itself
      console.error("Form validation error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset submit error
  const resetSubmitError = () => {
    setSubmitError(null)
  }

  // Set field errors from API response
  const setFieldErrors = (errors: Record<string, string>) => {
    Object.entries(errors).forEach(([field, message]) => {
      form.setError(field as Path<TFormValues>, {
        type: "manual",
        message,
      })
    })
  }

  return {
    ...form,
    isSubmitting,
    submitError,
    handleSubmit,
    resetSubmitError,
    setFieldErrors,
  }
}

export default useFormValidation
