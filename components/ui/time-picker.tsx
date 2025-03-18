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

interface TimePickerProps {
  className?: string
  time?: string
  onChange?: (time: string) => void
  placeholder?: string
}

export function TimePicker({
  className,
  time,
  onChange,
  placeholder = "Select time",
}: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  )
  const minutes = ["00", "15", "30", "45"]

  const [selectedHour, setSelectedHour] = React.useState<string>(
    time ? time.split(":")[0] : ""
  )
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    time ? time.split(":")[1] : ""
  )

  const handleHourChange = (value: string) => {
    setSelectedHour(value)
    if (selectedMinute) {
      const newTime = `${value}:${selectedMinute}`
      onChange?.(newTime)
    }
  }

  const handleMinuteChange = (value: string) => {
    setSelectedMinute(value)
    if (selectedHour) {
      const newTime = `${selectedHour}:${value}`
      onChange?.(newTime)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="time"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !time && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {time ? `${time}` : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex space-x-2">
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Hour</span>
              <Select value={selectedHour} onValueChange={handleHourChange}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Minute</span>
              <Select value={selectedMinute} onValueChange={handleMinuteChange}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
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
