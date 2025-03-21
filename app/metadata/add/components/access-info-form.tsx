"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormSection, FormSectionGrid } from "./form-section"
import { FormDescriptionWithTooltip, RequiredFormLabel } from "./form-elements"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

// Define form schema specific to Access Information
const formSchema = z.object({
  distributionInfo: z.object({
    distributionFormat: z.string().min(1, "Distribution format is required"),
    accessMethod: z.string().min(1, "Access method is required"),
    downloadUrl: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
    apiEndpoint: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
  }),
  licenseInfo: z.object({
    licenseType: z.string().min(1, "License type is required"),
    usageTerms: z.string().min(1, "Usage terms are required"),
    attributionRequirements: z
      .string()
      .min(1, "Attribution requirements are required"),
    accessRestrictions: z.array(z.string()),
  }),
  contactInfo: z.object({
    contactPerson: z.string().min(1, "Contact person is required"),
    email: z.string().email("Must be a valid email address"),
    department: z.string().optional(),
    phone: z.string().optional(),
  }),
})

type FormData = z.infer<typeof formSchema>

interface AccessInfoFormProps {
  onNext: (data: FormData) => void
  onBack: () => void
  initialData?: Partial<FormData>
}

export default function AccessInfoForm({
  onNext,
  onBack,
  initialData,
}: AccessInfoFormProps) {
  // Initialize form with react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      distributionInfo: {
        distributionFormat:
          initialData?.distributionInfo?.distributionFormat || "",
        accessMethod: initialData?.distributionInfo?.accessMethod || "",
        downloadUrl: initialData?.distributionInfo?.downloadUrl || "",
        apiEndpoint: initialData?.distributionInfo?.apiEndpoint || "",
      },
      licenseInfo: {
        licenseType: initialData?.licenseInfo?.licenseType || "",
        usageTerms: initialData?.licenseInfo?.usageTerms || "",
        attributionRequirements:
          initialData?.licenseInfo?.attributionRequirements || "",
        accessRestrictions: initialData?.licenseInfo?.accessRestrictions || [],
      },
      contactInfo: {
        contactPerson: initialData?.contactInfo?.contactPerson || "",
        email: initialData?.contactInfo?.email || "",
        department: initialData?.contactInfo?.department || "",
        phone: initialData?.contactInfo?.phone || "",
      },
    },
  })

  // Form submission handler
  const handleContinue = form.handleSubmit((data) => {
    onNext(data)
  })

  // Restriction checkboxes options
  const restrictionOptions = [
    { id: "commercial", label: "Commercial use restrictions" },
    { id: "confidential", label: "Confidential information" },
    { id: "sensitive", label: "Sensitive data" },
    { id: "governmental", label: "Government use only" },
    { id: "research", label: "Research use only" },
  ]

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormSection
          title="Distribution Information"
          description="Specify how the dataset is distributed and accessed"
        >
          <FormSectionGrid columns={2}>
            <FormField
              control={form.control}
              name="distributionInfo.distributionFormat"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Distribution Format</RequiredFormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select distribution format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Shapefile">Shapefile</SelectItem>
                      <SelectItem value="GeoJSON">GeoJSON</SelectItem>
                      <SelectItem value="GeoTIFF">GeoTIFF</SelectItem>
                      <SelectItem value="CSV">CSV</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="KML">KML/KMZ</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescriptionWithTooltip tooltip="The format in which the data is distributed to users">
                    Format in which the data is distributed
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="distributionInfo.accessMethod"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Access Method</RequiredFormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select access method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Direct Download">
                        Direct Download
                      </SelectItem>
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="Web Service">Web Service</SelectItem>
                      <SelectItem value="FTP">FTP</SelectItem>
                      <SelectItem value="Email Request">
                        Email Request
                      </SelectItem>
                      <SelectItem value="Physical Media">
                        Physical Media
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescriptionWithTooltip tooltip="How users can access the dataset (download, API, etc.)">
                    How users can access this dataset
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="distributionInfo.downloadUrl"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Download URL</RequiredFormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/download"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="Direct URL where the data can be downloaded (if applicable)">
                    URL where the data can be downloaded
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="distributionInfo.apiEndpoint"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>API Endpoint</RequiredFormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.example.com/dataset"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="URL of the API endpoint that provides access to the data (if applicable)">
                    API endpoint URL for accessing the data
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSectionGrid>
        </FormSection>

        <FormSection
          title="License Information"
          description="Provide details about usage rights and restrictions"
        >
          <FormSectionGrid columns={2}>
            <FormField
              control={form.control}
              name="licenseInfo.licenseType"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>License Type</RequiredFormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CC0">
                        Creative Commons Zero (CC0)
                      </SelectItem>
                      <SelectItem value="CC-BY">
                        Creative Commons Attribution (CC-BY)
                      </SelectItem>
                      <SelectItem value="CC-BY-SA">
                        Creative Commons Attribution-ShareAlike
                      </SelectItem>
                      <SelectItem value="Open Government License">
                        Open Government License
                      </SelectItem>
                      <SelectItem value="NGDI Open Data License">
                        NGDI Open Data License
                      </SelectItem>
                      <SelectItem value="Proprietary">Proprietary</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescriptionWithTooltip tooltip="The type of license under which the data is released">
                    License under which the data is released
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="licenseInfo.usageTerms"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Usage Terms</RequiredFormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe how the data may be used"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="Specific terms describing how the data may be used">
                    Terms describing how the data may be used
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="licenseInfo.attributionRequirements"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>
                    Attribution Requirements
                  </RequiredFormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe how to attribute this dataset"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="Requirements for citing or crediting the dataset when used">
                    How to cite or credit this dataset when used
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <RequiredFormLabel>Access Restrictions</RequiredFormLabel>
              <div className="grid grid-cols-1 gap-2">
                {restrictionOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="licenseInfo.accessRestrictions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, option.id]
                                  : field.value?.filter(
                                      (value) => value !== option.id
                                    )
                                field.onChange(updatedValue)
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormDescriptionWithTooltip
                              tooltip={`Restrict ${option.label.toLowerCase()}`}
                            >
                              {option.label}
                            </FormDescriptionWithTooltip>
                          </div>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </div>
          </FormSectionGrid>
        </FormSection>

        <FormSection
          title="Contact Information"
          description="Provide contact details for dataset inquiries"
        >
          <FormSectionGrid columns={2}>
            <FormField
              control={form.control}
              name="contactInfo.contactPerson"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Contact Person</RequiredFormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="Name of the person to contact for questions about the dataset">
                    Person to contact about this dataset
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo.email"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Email</RequiredFormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="Email address for dataset inquiries">
                    Email address for dataset inquiries
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo.department"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Department/Organization</RequiredFormLabel>
                  <FormControl>
                    <Input
                      placeholder="Department or organization name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="Department or organization responsible for the dataset">
                    Department or organization responsible
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo.phone"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Phone Number</RequiredFormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="Phone number for dataset inquiries">
                    Phone number for dataset inquiries
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSectionGrid>
        </FormSection>

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
