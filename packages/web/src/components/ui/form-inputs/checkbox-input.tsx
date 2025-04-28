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
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { InfoIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface CheckboxInputProps {
  name: string
  label?: string
  description?: string
  tooltip?: string
  required?: boolean
  showRequiredIndicator?: boolean
  className?: string
  disabled?: boolean
}

/**
 * Enhanced checkbox input component with built-in validation
 */
export function CheckboxInput({
  name,
  label,
  description,
  tooltip,
  required,
  showRequiredIndicator = true,
  className,
  disabled,
}: CheckboxInputProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0", className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
              aria-required={required}
            />
          </FormControl>
          
          <div className="space-y-1 leading-none">
            {label && (
              <div className="flex items-center gap-1">
                <FormLabel className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  required && showRequiredIndicator && "after:content-['*'] after:ml-0.5 after:text-red-500"
                )}>
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
            
            {description && (
              <FormDescription>{description}</FormDescription>
            )}
            
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}

export default CheckboxInput
