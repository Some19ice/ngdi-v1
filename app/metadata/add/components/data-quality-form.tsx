"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form2Data } from "@/types/ngdi-metadata"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormDescriptionWithTooltip, RequiredFormLabel } from "./form-elements"
import {
  FormSection,
  FormSectionGrid,
  FormSectionDivider,
} from "./form-section"

// Define validation schema using Zod
const formSchema = z.object({
  generalSection: z.object({
    logicalConsistencyReport: z.string().optional(),
    completenessReport: z.string().optional(),
  }),
  attributeAccuracy: z.object({
    accuracyReport: z.string().optional(),
  }),
  positionalAccuracy: z.object({
    horizontal: z.object({
      accuracyReport: z.string().optional(),
      percentValue: z.coerce.number().optional(),
      explanation: z.string().optional(),
    }),
    vertical: z.object({
      accuracyReport: z.string().optional(),
      percentValue: z.coerce.number().optional(),
      explanation: z.string().optional(),
    }),
  }),
  sourceInformation: z.object({
    sourceScaleDenominator: z.coerce.number().optional(),
    sourceMediaType: z.string().optional(),
    sourceCitation: z.string().optional(),
    citationTitle: z.string().optional(),
    contractReference: z.string().optional(),
    contractDate: z.string().optional(),
  }),
  dataProcessingInformation: z.object({
    description: z.string().min(1, "Processing description is required"),
    softwareVersion: z.string().optional(),
    processedDate: z.string().min(1, "Processed date is required"),
  }),
  processorContactInformation: z.object({
    name: z.string().min(1, "Processor name is required"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(1, "Processor address is required"),
  }),
})

interface DataQualityFormProps {
  step: number
  onStepChange: (step: number) => void
  formData: Partial<any>
  onChange: (data: Partial<any>) => void
  isSubmitting: boolean
}

export default function DataQualityForm({
  step,
  onStepChange,
  formData,
  onChange,
  isSubmitting,
}: DataQualityFormProps) {
  const initialData = formData?.dataQuality || {}

  const form = useForm<Form2Data>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      generalSection: {
        logicalConsistencyReport: "",
        completenessReport: "",
      },
      attributeAccuracy: {
        accuracyReport: "",
      },
      positionalAccuracy: {
        horizontal: {
          accuracyReport: "",
          percentValue: 0,
          explanation: "",
        },
        vertical: {
          accuracyReport: "",
          percentValue: 0,
          explanation: "",
        },
      },
      sourceInformation: {
        sourceScaleDenominator: 0,
        sourceMediaType: "",
        sourceCitation: "",
        citationTitle: "",
        contractReference: "",
        contractDate: "",
      },
      dataProcessingInformation: {
        description: "",
        softwareVersion: "",
        processedDate: "",
      },
      processorContactInformation: {
        name: "",
        email: "",
        address: "",
      },
    },
  })

  function onSubmit(data: Form2Data) {
    onChange({ dataQuality: data })
    onStepChange(step + 1)
  }

  // Handle going back
  const handleBack = () => {
    // Get current form values without validation
    const currentData = form.getValues()
    // Save current state before navigating back
    onChange({ dataQuality: currentData })
    onStepChange(step - 1)
  }

  // Get current data and continue
  const handleContinue = () => {
    // Get current form values without validation
    const currentData = form.getValues()
    // Pass the data to the next step without validation
    onChange({ dataQuality: currentData })
    onStepChange(step + 1)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection
          title="General Section"
          description="Information about the overall quality of the dataset"
        >
          <FormSectionGrid columns={2}>
            <FormField
              control={form.control}
              name="generalSection.logicalConsistencyReport"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Logical Consistency Report
                  </RequiredFormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter logical consistency report"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="A description of the fidelity of relationships in the data and tests applied to ensure logical consistency. This may include topological consistency for vector data or band consistency for raster data.">
                    Information about the logical integrity of the dataset
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="generalSection.completenessReport"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Completeness Report
                  </RequiredFormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter completeness report"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="A description of how complete the dataset is relative to its intended scope, including any known data gaps or limitations in coverage.">
                    Information about omissions or limitations in coverage
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSectionGrid>
        </FormSection>

        <FormSectionDivider />

        <FormSection
          title="Attribute Accuracy"
          description="Information about the accuracy of attribute data"
        >
          <FormSectionGrid columns={1}>
            <FormField
              control={form.control}
              name="attributeAccuracy.accuracyReport"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Accuracy Report
                  </RequiredFormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter attribute accuracy report"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="An assessment of the accuracy of the identification of entities and assignment of attribute values in the dataset.">
                    Assessment of identification accuracy and attribute values
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSectionGrid>
        </FormSection>

        <FormSectionDivider />

        <FormSection
          title="Positional Accuracy"
          description="Information about the positional accuracy"
        >
          <FormSectionGrid columns={2}>
            <div className="space-y-4 col-span-2">
              <h3 className="text-base font-medium">Horizontal Accuracy</h3>
              <FormField
                control={form.control}
                name="positionalAccuracy.horizontal.accuracyReport"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel required={false}>
                      Accuracy Report
                    </RequiredFormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter horizontal accuracy report"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescriptionWithTooltip tooltip="A description of the accuracy of the horizontal coordinate measurements.">
                      Accuracy of horizontal coordinate measurements
                    </FormDescriptionWithTooltip>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="positionalAccuracy.horizontal.percentValue"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Accuracy Percentage
                  </RequiredFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter percentage value"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The estimated percentage of horizontal coordinate measurements that are correct within the given accuracy level.">
                    Percentage of correct measurements
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="positionalAccuracy.horizontal.explanation"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Explanation
                  </RequiredFormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter explanation"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="Additional explanation about the horizontal accuracy assessment.">
                    Additional details about accuracy assessment
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 col-span-2 mt-6">
              <h3 className="text-base font-medium">Vertical Accuracy</h3>
              <FormField
                control={form.control}
                name="positionalAccuracy.vertical.accuracyReport"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel required={false}>
                      Accuracy Report
                    </RequiredFormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter vertical accuracy report"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescriptionWithTooltip tooltip="A description of the accuracy of the vertical coordinate measurements.">
                      Accuracy of vertical coordinate measurements
                    </FormDescriptionWithTooltip>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="positionalAccuracy.vertical.percentValue"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Accuracy Percentage
                  </RequiredFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter percentage value"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The estimated percentage of vertical coordinate measurements that are correct within the given accuracy level.">
                    Percentage of correct measurements
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="positionalAccuracy.vertical.explanation"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Explanation
                  </RequiredFormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter explanation"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="Additional explanation about the vertical accuracy assessment.">
                    Additional details about accuracy assessment
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSectionGrid>
        </FormSection>

        <FormSectionDivider />

        <FormSection
          title="Source Information"
          description="Information about the source data used to create this dataset"
        >
          <FormSectionGrid columns={2}>
            <FormField
              control={form.control}
              name="sourceInformation.sourceScaleDenominator"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Source Scale Denominator
                  </RequiredFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter scale denominator"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The denominator of the representative fraction of the source data.">
                    Scale of the source data
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceInformation.sourceMediaType"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Source Media Type
                  </RequiredFormLabel>
                  <FormControl>
                    <Input placeholder="Enter media type" {...field} />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The medium of the source data (e.g., paper, digital, satellite imagery).">
                    Medium of the source data
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceInformation.sourceCitation"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Source Citation
                  </RequiredFormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter source citation"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="A reference to the source data used.">
                    Reference to the source data
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceInformation.citationTitle"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Citation Title
                  </RequiredFormLabel>
                  <FormControl>
                    <Input placeholder="Enter citation title" {...field} />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The title of the source cited.">
                    Title of the source cited
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceInformation.contractReference"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Contract Reference
                  </RequiredFormLabel>
                  <FormControl>
                    <Input placeholder="Enter contract reference" {...field} />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="Reference to any contract under which the source data was created or acquired.">
                    Reference to contract for source data
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceInformation.contractDate"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Contract Date
                  </RequiredFormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? date.toISOString() : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescriptionWithTooltip tooltip="The date of the contract under which the source data was created or acquired.">
                    Date of contract for source data
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSectionGrid>
        </FormSection>

        <FormSectionDivider />

        <FormSection
          title="Data Processing Information"
          description="Information about how the data was processed"
        >
          <FormSectionGrid columns={2}>
            <FormField
              control={form.control}
              name="dataProcessingInformation.description"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Processing Description</RequiredFormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter processing description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="A description of the processing steps and methods used to produce the dataset.">
                    Description of processing steps and methods
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataProcessingInformation.softwareVersion"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel required={false}>
                    Software Version
                  </RequiredFormLabel>
                  <FormControl>
                    <Input placeholder="Enter software version" {...field} />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The software and version used to process the data.">
                    Software and version used for processing
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataProcessingInformation.processedDate"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Processed Date</RequiredFormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? date.toISOString() : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescriptionWithTooltip tooltip="The date when the data processing was completed.">
                    Date when processing was completed
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSectionGrid>
        </FormSection>

        <FormSectionDivider />

        <FormSection
          title="Processor Contact Information"
          description="Contact details for the entity that processed the data"
        >
          <FormSectionGrid columns={2}>
            <FormField
              control={form.control}
              name="processorContactInformation.name"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Processor Name</RequiredFormLabel>
                  <FormControl>
                    <Input placeholder="Enter processor name" {...field} />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The name of the person or organization that processed the data.">
                    Name of processor (person or organization)
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="processorContactInformation.email"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Email</RequiredFormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter email address"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The email address of the processor.">
                    Email address of the processor
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="processorContactInformation.address"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Address</RequiredFormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter address"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The physical or postal address of the processor.">
                    Physical or postal address of processor
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSectionGrid>
        </FormSection>

        <div className="flex justify-between mt-8">
          <Button type="button" variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  )
}
