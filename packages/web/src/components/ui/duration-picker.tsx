"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface DurationPickerProps {
  className?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

type DurationType = "minutes" | "hours" | "days" | "weeks" | "months"

export function DurationPicker({
  className,
  value = "",
  onChange,
  placeholder = "Select duration",
}: DurationPickerProps) {
  const durationTypes: DurationType[] = [
    "minutes",
    "hours",
    "days",
    "weeks",
    "months",
  ]

  const parseDuration = (
    value: string
  ): { amount: string; type: DurationType } => {
    const match = value.match(/^(\d+)\s+(.+)$/)
    if (match) {
      const amount = match[1]
      const type = match[2].endsWith("s")
        ? (match[2] as DurationType)
        : (`${match[2]}s` as DurationType)
      return { amount, type }
    }
    return { amount: "", type: "days" }
  }

  const { amount, type } = parseDuration(value)

  const [durationAmount, setDurationAmount] = React.useState<string>(amount)
  const [durationType, setDurationType] = React.useState<DurationType>(
    (type as DurationType) || "days"
  )

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value
    setDurationAmount(newAmount)
    if (newAmount) {
      onChange?.(`${newAmount} ${durationType}`)
    }
  }

  const handleTypeChange = (newType: string) => {
    const type = newType as DurationType
    setDurationType(type)
    if (durationAmount) {
      onChange?.(`${durationAmount} ${type}`)
    }
  }

  const displayValue = value || placeholder

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="duration"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            <span>{displayValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex space-x-2">
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Amount</span>
              <Input
                type="number"
                min={1}
                value={durationAmount}
                onChange={handleAmountChange}
                className="w-20"
                placeholder="1"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Unit</span>
              <Select value={durationType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {durationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
