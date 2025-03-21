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
  onNext: (data: Form2Data) => void
  onBack: () => void
  initialData?: Partial<Form2Data>
}

export default function DataQualityForm({
  onNext,
  onBack,
  initialData,
}: DataQualityFormProps) {
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

  // Get current data and continue
  const handleContinue = () => {
    // Get current form values without validation
    const currentData = form.getValues()
    // Pass the data to the next step without validation
    onNext(currentData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* General Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">
            General Section
          </h2>

          <FormField
            control={form.control}
            name="generalSection.logicalConsistencyReport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logical Consistency Report</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter logical consistency report"
                    className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="A description of the fidelity of relationships in the data and tests applied to ensure logical consistency. This may include topological consistency for vector data or band consistency for raster data.">
                  Information about the logical integrity of the dataset and
                  tests applied to ensure logical consistency
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="generalSection.completenessReport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Completeness Report</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter completeness report"
                    className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="A description of how complete the dataset is relative to its intended scope, including any known data gaps or limitations in coverage.">
                  Information about omissions, selection criteria, or other
                  factors affecting completeness
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Attribute Accuracy Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">
            Attribute Accuracy
          </h2>

          <FormField
            control={form.control}
            name="attributeAccuracy.accuracyReport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accuracy Report</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter attribute accuracy report"
                    className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="A narrative assessment of how accurately the attributes in the dataset represent the real-world features they describe.">
                  Description of the accuracy of the attributes
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Positional Accuracy Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">
            Positional Accuracy
          </h2>

          <div className="border p-4 rounded-md space-y-4">
            <h3 className="text-lg font-medium">Horizontal Accuracy</h3>

            <FormField
              control={form.control}
              name="positionalAccuracy.horizontal.accuracyReport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accuracy Report</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter horizontal accuracy report"
                      className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="A narrative assessment of how accurately the horizontal positions in the dataset represent the actual locations of features on the Earth's surface.">
                    Description of the horizontal positional accuracy
                  </FormDescriptionWithTooltip>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="positionalAccuracy.horizontal.percentValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>% Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter percentage value"
                      className="border-primary/20 focus:ring-primary/20"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Quantitative measure of horizontal accuracy
                  </FormDescription>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="positionalAccuracy.horizontal.explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter explanation"
                      className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Details about how horizontal accuracy was determined
                  </FormDescription>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="border p-4 rounded-md space-y-4">
            <h3 className="text-lg font-medium">Vertical Accuracy</h3>

            <FormField
              control={form.control}
              name="positionalAccuracy.vertical.accuracyReport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accuracy Report</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter vertical accuracy report"
                      className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Description of the vertical positional accuracy
                  </FormDescription>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="positionalAccuracy.vertical.percentValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>% Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter percentage value"
                      className="border-primary/20 focus:ring-primary/20"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Quantitative measure of vertical accuracy
                  </FormDescription>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="positionalAccuracy.vertical.explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter explanation"
                      className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Details about how vertical accuracy was determined
                  </FormDescription>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Source Information Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">
            Source Information
          </h2>

          <FormField
            control={form.control}
            name="sourceInformation.sourceScaleDenominator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Scale Denominator</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter scale denominator"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground text-xs">
                  The scale of the source material (e.g., 24000 for a 1:24,000
                  scale map)
                </FormDescription>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sourceInformation.sourceMediaType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type Of Source Media</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter source media type"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground text-xs">
                  The medium of the source material (e.g., aerial photograph,
                  satellite image, paper map)
                </FormDescription>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sourceInformation.sourceCitation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Citation</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter source citation"
                    className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground text-xs">
                  A formal citation for the source material
                </FormDescription>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sourceInformation.citationTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Citation Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter citation title"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground text-xs">
                  The formal title of the source material
                </FormDescription>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sourceInformation.contractReference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract/Grant Reference</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter contract/grant reference"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground text-xs">
                  Identifier for any contract, grant, or project under which the
                  source data was collected
                </FormDescription>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sourceInformation.contractDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Contract/Grant</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
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
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString() : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-muted-foreground text-xs">
                  The date when the contract was signed or the grant was awarded
                </FormDescription>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Data Processing Information Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">
            Data Processing Information
          </h2>

          <FormField
            control={form.control}
            name="dataProcessingInformation.description"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>
                  Data Processing Description
                </RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter data processing description"
                    className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="A narrative description of the procedures, algorithms, or transformations applied to create the dataset from its sources.">
                  A narrative description of the procedures, algorithms, or
                  transformations applied to create the dataset from its sources
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataProcessingInformation.softwareVersion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Software Version Used</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter software version"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground text-xs">
                  The name and version of any software packages used to process
                  the data
                </FormDescription>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataProcessingInformation.processedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Processed</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
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
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString() : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-muted-foreground text-xs">
                  The date when the processing steps were executed
                </FormDescription>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Processor Contact Information Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">
            Processor Contact Information
          </h2>

          <FormField
            control={form.control}
            name="processorContactInformation.name"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Name</RequiredFormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter processor name"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The individual who performed or supervised the data processing steps.">
                  The individual who performed or supervised the data processing
                  steps
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="processorContactInformation.email"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>E-mail</RequiredFormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter processor email"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground text-xs">
                  The electronic mail address of the person responsible for
                  processing
                </FormDescription>
                <FormMessage className="text-destructive text-xs" />
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
                    placeholder="Enter processor address"
                    className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground text-xs">
                  The physical or postal address of the person responsible for
                  processing
                </FormDescription>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  )
}
