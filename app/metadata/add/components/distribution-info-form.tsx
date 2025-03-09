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

// Define validation schema using Zod
const formSchema = z.object({
  distributorInformation: z.object({
    name: z.string().min(1, "Distributor name is required"),
    address: z.string().min(1, "Distributor address is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    webLink: z.string().url().optional().or(z.literal("")),
    socialMediaHandle: z.string().optional(),
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
    turnaroundTime: z.string().min(1, "Turnaround time is required"),
    orderingInstructions: z
      .string()
      .min(1, "Ordering instructions are required"),
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
      },
    },
  })

  function onSubmit(data: Form3Data) {
    onSave(data)
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
            name="distributorInformation.name"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>
                  Distributor/Custodian Name
                </RequiredFormLabel>
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
                <FormDescription className="text-muted-foreground text-xs">
                  The telephone number for contacting the distributor about
                  obtaining the dataset
                </FormDescription>
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
                <FormDescription>
                  The URL of the distributor&apos;s website where additional
                  information about the dataset or the distributor can be found
                </FormDescription>
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
                  <Input
                    placeholder="Enter distributor social media handle"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The social media username or handle where the distributor can
                  be contacted or where updates about the dataset may be posted
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>Custom Order Process *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter custom order process"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Instructions for how users can request customized versions or
                  subsets of the dataset
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distributionDetails.technicalPrerequisites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technical Prerequisites *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter technical prerequisites"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Description of any hardware, software, or technical knowledge
                  required to properly use the dataset
                </FormDescription>
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
                  <Input
                    placeholder="Enter turnaround time"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
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
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="border-primary/20 hover:bg-primary/5"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
