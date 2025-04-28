"use client"

import React from "react"
import { useFormContext, Controller } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { InfoIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
  description?: string
  tooltip?: string
  required?: boolean
  showRequiredIndicator?: boolean
}

/**
 * Enhanced text input component with built-in validation
 */
export function TextInput({
  name,
  label,
  description,
  tooltip,
  required,
  showRequiredIndicator = true,
  className,
  ...props
}: TextInputProps) {
  const { control } = useFormContext()

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
            <Input
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
          
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default TextInput
