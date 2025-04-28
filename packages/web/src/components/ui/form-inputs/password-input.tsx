"use client"

import React, { useState } from "react"
import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { PasswordInput as BasePasswordInput } from "@/components/ui/password-input"
import { cn } from "@/lib/utils"
import { InfoIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter"

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
  description?: string
  tooltip?: string
  required?: boolean
  showRequiredIndicator?: boolean
  showStrengthMeter?: boolean
}

/**
 * Enhanced password input component with built-in validation and strength meter
 */
export function FormPasswordInput({
  name,
  label,
  description,
  tooltip,
  required,
  showRequiredIndicator = true,
  showStrengthMeter = false,
  className,
  ...props
}: PasswordInputProps) {
  const { control, watch } = useFormContext()
  const passwordValue = watch(name) || ""

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <div className="flex items-center gap-1">
              <FormLabel className={cn(required && showRequiredIndicator && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
                {label}
              </FormLabel>
              
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
          
          {description && <FormDescription>{description}</FormDescription>}
          
          <FormControl>
            <BasePasswordInput
              {...field}
              {...props}
              aria-invalid={!!fieldState.error}
              aria-required={required}
              className={cn(
                fieldState.error && "border-destructive focus-visible:ring-destructive",
                props.className
              )}
            />
          </FormControl>
          
          {showStrengthMeter && passwordValue && (
            <div className="mt-2">
              <PasswordStrengthMeter password={passwordValue} />
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormPasswordInput
