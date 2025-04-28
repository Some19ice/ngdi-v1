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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, InfoIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface DateInputProps {
  name: string
  label?: string
  description?: string
  tooltip?: string
  required?: boolean
  showRequiredIndicator?: boolean
  className?: string
  disabled?: boolean
  placeholder?: string
  fromYear?: number
  toYear?: number
}

/**
 * Enhanced date input component with built-in validation
 */
export function DateInput({
  name,
  label,
  description,
  tooltip,
  required,
  showRequiredIndicator = true,
  className,
  disabled,
  placeholder = "Select a date",
  fromYear,
  toYear,
}: DateInputProps) {
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground",
                    fieldState.error && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={disabled}
                  aria-invalid={!!fieldState.error}
                  aria-required={required}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP") : placeholder}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={disabled}
                  initialFocus
                  fromYear={fromYear}
                  toYear={toYear}
                />
              </PopoverContent>
            </Popover>
          </FormControl>
          
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default DateInput
