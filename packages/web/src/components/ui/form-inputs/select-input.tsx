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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { InfoIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectInputProps {
  name: string
  label?: string
  description?: string
  tooltip?: string
  required?: boolean
  showRequiredIndicator?: boolean
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

/**
 * Enhanced select input component with built-in validation
 */
export function SelectInput({
  name,
  label,
  description,
  tooltip,
  required,
  showRequiredIndicator = true,
  options,
  placeholder = "Select an option",
  className,
  disabled,
}: SelectInputProps) {
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
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
              disabled={disabled}
            >
              <SelectTrigger 
                className={cn(
                  fieldState.error && "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={!!fieldState.error}
                aria-required={required}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default SelectInput
