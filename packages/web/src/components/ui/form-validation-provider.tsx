"use client"

import React, { ReactNode } from "react"
import { Form } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useFormValidation, UseFormValidationProps } from "@/hooks/use-form-validation"
import { FieldValues } from "react-hook-form"

export interface FormValidationProviderProps<TFormValues extends FieldValues>
  extends Omit<UseFormValidationProps<TFormValues>, "onSubmit"> {
  children: ReactNode | ((methods: ReturnType<typeof useFormValidation<TFormValues>>) => ReactNode)
  onSubmit?: (values: TFormValues) => Promise<void> | void
  submitError?: Error | null
  showErrorSummary?: boolean
  className?: string
}

/**
 * Form validation provider component
 * Provides form validation context to child components
 */
export function FormValidationProvider<TFormValues extends FieldValues>({
  children,
  schema,
  defaultValues,
  onSubmit,
  submitError: externalSubmitError,
  showErrorSummary = true,
  className,
  ...formProps
}: FormValidationProviderProps<TFormValues>) {
  const form = useFormValidation<TFormValues>({
    schema,
    defaultValues,
    onSubmit,
    ...formProps,
  })

  const { submitError: internalSubmitError, handleSubmit } = form
  const submitError = externalSubmitError || internalSubmitError

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={className} noValidate>
        {showErrorSummary && submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {submitError.message || "An error occurred while submitting the form."}
            </AlertDescription>
          </Alert>
        )}

        {typeof children === "function" ? children(form) : children}
      </form>
    </Form>
  )
}

export default FormValidationProvider
