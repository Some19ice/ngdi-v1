"use client"

import React from "react"
import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { InfoIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string
  label?: string
  description?: string
  tooltip?: string
  required?: boolean
  showRequiredIndicator?: boolean
  showCharacterCount?: boolean
  maxLength?: number
}

/**
 * Enhanced textarea input component with built-in validation
 */
export function TextareaInput({
  name,
  label,
  description,
  tooltip,
  required,
  showRequiredIndicator = true,
  showCharacterCount = false,
  maxLength,
  className,
  ...props
}: TextareaInputProps) {
  const { control, watch } = useFormContext()
  const value = watch(name) || ""
  const characterCount = value.length

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
            <Textarea
              {...field}
              {...props}
              aria-invalid={!!fieldState.error}
              aria-required={required}
              maxLength={maxLength}
              className={cn(
                fieldState.error && "border-destructive focus-visible:ring-destructive",
                props.className
              )}
            />
          </FormControl>
          
          {showCharacterCount && (
            <div className="mt-1 text-xs text-muted-foreground text-right">
              {characterCount}
              {maxLength && ` / ${maxLength}`}
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default TextareaInput
