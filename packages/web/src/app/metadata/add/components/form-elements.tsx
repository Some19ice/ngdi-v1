import { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { FormDescription } from "@/components/ui/form"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

interface FormLabelProps {
  children: ReactNode
  required?: boolean
}

export function RequiredFormLabel({
  children,
  required = true,
}: FormLabelProps) {
  return (
    <Label className="mb-2 block">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </Label>
  )
}

interface FormDescriptionWithTooltipProps {
  children: ReactNode
  tooltip: string
}

export function FormDescriptionWithTooltip({
  children,
  tooltip,
}: FormDescriptionWithTooltipProps) {
  return (
    <div className="flex items-center space-x-1.5">
      <FormDescription className="text-xs">{children}</FormDescription>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground/70" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
