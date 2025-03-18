"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form3Data } from "@/types/ngdi-metadata"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"
import { DurationPicker } from "@/components/ui/duration-picker"
import { Checkbox } from "@/components/ui/checkbox"

// Define validation schema using Zod
const formSchema = z.object({
  distributorInformation: z.object({
    name: z.string().min(1, "Distributor name is required"),
    address: z.string().min(1, "Distributor address is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    webLink: z.string().url().optional().or(z.literal("")),
    socialMediaHandle: z.string().optional(),
    isCustodian: z.boolean().default(true),
    custodianName: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length > 0,
        "Custodian name is required when distributor is not the custodian"
      ),
    custodianContact: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length > 0,
        "Custodian contact is required when distributor is not the custodian"
      ),
  }),
  distributionDetails: z.object({
    liability: z.string().min(1, "Liability statement is required"),
    customOrderProcess: z.string().min(1, "Custom order process is required"),
    technicalPrerequisites: z
      .string()
      .min(1, "Technical prerequisites are required"),
  }),
  standardOrderProcess: z.object({
    fees: z.string().min(1, "Fees information is required"),
    turnaroundTime: z
      .string()
      .min(1, "Turnaround time is required")
      .regex(
        /^\d+\s+(minutes|hours|days|weeks|months)$/,
        "Invalid duration format"
      ),
    orderingInstructions: z
      .string()
      .min(1, "Ordering instructions are required"),
    maximumResponseTime: z
      .string()
      .min(1, "Maximum response time is required")
      .regex(/^\d+\s+(hours|days|weeks|months)$/, "Invalid duration format")
      .refine((val) => {
        const [amount, unit] = val.split(" ")
        const numAmount = parseInt(amount, 10)
        if (unit === "hours" && numAmount < 48) return false
        if (unit === "days" && numAmount < 2) return false
        return true
      }, "Maximum response time must be at least 48 hours"),
  }),
})

interface DistributionInfoFormProps {
  onSave: (data: Form3Data) => void
  onBack: () => void
  isSubmitting: boolean
  initialData?: Partial<Form3Data>
}

// Custom FormLabel with red asterisk for required fields
function RequiredFormLabel({ children }: { children: React.ReactNode }) {
  return (
    <FormLabel>
      {children} <span className="text-destructive">*</span>
    </FormLabel>
  )
}

// Create a custom FormDescription with tooltip
function FormDescriptionWithTooltip({
  children,
  tooltip,
}: {
  children: React.ReactNode
  tooltip: string
}) {
  return (
    <div className="flex items-center gap-1">
      <FormDescription className="text-muted-foreground text-xs">
        {children}
      </FormDescription>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-sm text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default function DistributionInfoForm({
  onSave,
  onBack,
  isSubmitting,
  initialData,
}: DistributionInfoFormProps) {
  const form = useForm<Form3Data>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      distributorInformation: {
        name: "",
        address: "",
        email: "",
        phoneNumber: "",
        webLink: "",
        socialMediaHandle: "",
        isCustodian: true,
        custodianName: "",
        custodianContact: "",
      },
      distributionDetails: {
        liability: "",
        customOrderProcess: "",
        technicalPrerequisites: "",
      },
      standardOrderProcess: {
        fees: "",
        turnaroundTime: "",
        orderingInstructions: "",
        maximumResponseTime: "",
      },
    },
    mode: "onSubmit", // Only validate on submit
  })

  // Set up a watch for the isCustodian field
  const watchIsCustodian = form.watch("distributorInformation.isCustodian")

  function onSubmit(data: Form3Data) {
    onSave(data)
  }

  // Get current data and save
  const handleSave = () => {
    // Get current form values
    const currentData = form.getValues()
    // Save the data
    onSave(currentData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Distributor Information Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">
            Distributor Information
          </h2>

          <FormField
            control={form.control}
            name="distributorInformation.isCustodian"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Distributor is also the Custodian</FormLabel>
                  <FormDescriptionWithTooltip tooltip="Check this box if the distributor is also the custodian of the dataset. If not, you'll need to provide custodian details.">
                    Check this box if the distributor is also the custodian of
                    the dataset
                  </FormDescriptionWithTooltip>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distributorInformation.name"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Distributor Name</RequiredFormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter distributor name"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The name of the entity responsible for distributing the dataset to users.">
                  The name of the entity responsible for distributing the
                  dataset to users
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distributorInformation.address"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Address</RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter distributor address"
                    className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The physical or postal address of the distributing organization.">
                  The physical or postal address of the distributing
                  organization
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distributorInformation.email"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>E-mail</RequiredFormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter distributor email"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The electronic mail address for contacting the distributor about obtaining the dataset.">
                  The electronic mail address for contacting the distributor
                  about obtaining the dataset
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distributorInformation.phoneNumber"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Phone Number</RequiredFormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter distributor phone number"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The telephone number for contacting the distributor about obtaining the dataset. Include country code if applicable.">
                  The telephone number for contacting the distributor about
                  obtaining the dataset
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distributorInformation.webLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Web Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter distributor website URL"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The URL of the distributor's website where additional information about the dataset or the distributor can be found. Must be a valid URL including http:// or https://.">
                  The URL of the distributor&apos;s website where additional
                  information about the dataset or the distributor can be found
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distributorInformation.socialMediaHandle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Media Handle</FormLabel>
                <FormControl>
                  <Input placeholder="Enter social media handle" {...field} />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The social media handle or username of the distributor organization. Include the platform name if applicable (e.g., @ngdi_nigeria on Twitter).">
                  The social media handle or username of the distributor
                  organization
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          {!watchIsCustodian && (
            <>
              <FormField
                control={form.control}
                name="distributorInformation.custodianName"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>Custodian Name</RequiredFormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter custodian name"
                        className="border-primary/20 focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescriptionWithTooltip tooltip="The name of the entity that maintains and is responsible for the dataset.">
                      The name of the entity that maintains and is responsible
                      for the dataset
                    </FormDescriptionWithTooltip>
                    <FormMessage className="text-destructive text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="distributorInformation.custodianContact"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>Custodian Contact</RequiredFormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter custodian contact information"
                        className="border-primary/20 focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescriptionWithTooltip tooltip="Contact information for the custodian including email or phone number.">
                      Contact information for the custodian
                    </FormDescriptionWithTooltip>
                    <FormMessage className="text-destructive text-xs" />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        {/* Distribution Details Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">
            Distribution Details
          </h2>

          <FormField
            control={form.control}
            name="distributionDetails.liability"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Distribution Liability</RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter liability statement"
                    className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="A statement of the liability assumed by the distributor and any limitations on the dataset's use related to liability concerns.">
                  A statement of the liability assumed by the distributor and
                  any limitations on the dataset&apos;s use related to liability
                  concerns
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distributionDetails.customOrderProcess"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Custom Order Process</RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter custom order process"
                    className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="Instructions for how users can request customized versions or subsets of the dataset. Include contact methods, expected response times, and any special requirements.">
                  Instructions for how users can request customized versions or
                  subsets of the dataset
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distributionDetails.technicalPrerequisites"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Technical Prerequisites</RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter technical prerequisites"
                    className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="Description of any hardware, software, or technical knowledge required to properly use the dataset. Include minimum system requirements, software versions, and any specialized skills needed.">
                  Description of any hardware, software, or technical knowledge
                  required to properly use the dataset
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Standard Order Process Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">
            Standard Order Process
          </h2>

          <FormField
            control={form.control}
            name="standardOrderProcess.fees"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Fees</RequiredFormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter fees information"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The monetary cost or other fees associated with obtaining the dataset.">
                  The monetary cost or other fees associated with obtaining the
                  dataset
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="standardOrderProcess.turnaroundTime"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Turnaround Time</RequiredFormLabel>
                <FormControl>
                  <DurationPicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select turnaround time"
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The typical time period between ordering the dataset and receiving it.">
                  The typical time period between ordering the dataset and
                  receiving it
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="standardOrderProcess.orderingInstructions"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Ordering Instructions</RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter ordering instructions"
                    className="min-h-[100px] border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="Detailed instructions on the procedures for ordering or requesting the dataset.">
                  Detailed instructions on the procedures for ordering or
                  requesting the dataset
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="standardOrderProcess.maximumResponseTime"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Maximum Response Time</RequiredFormLabel>
                <FormControl>
                  <DurationPicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select maximum response time"
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The maximum time users should expect for receiving a response about dataset availability. Must be at least 48 hours.">
                  The maximum time users should expect for receiving a response
                  about dataset availability (minimum 48 hours)
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
