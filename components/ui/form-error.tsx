import * as React from "react"
import { useEffect, useRef } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FormErrorProps {
  title?: string
  error: string | null
  id?: string
}

export function FormError({ title = "Error", error, id }: FormErrorProps) {
  const errorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus()
    }
  }, [error])

  if (!error) return null

  return (
    <Alert
      variant="destructive"
      ref={errorRef}
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      id={id}
    >
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}
