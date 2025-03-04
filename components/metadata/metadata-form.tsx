"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { createMetadata } from "@/app/actions/metadata"

const metadataFormSchema = z.object({
  // General Information
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  organizationName: z.string().min(1, "Organization is required"),
  dateFrom: z.date({ required_error: "Start date is required" }),
  dateTo: z.date({ required_error: "End date is required" }),
  abstract: z.string().min(1, "Abstract is required"),
  purpose: z.string().min(1, "Purpose is required"),
  thumbnailUrl: z.string().url("Must be a valid URL"),
  imageName: z.string().min(1, "Image name is required"),
  frameworkType: z.string().min(1, "Framework type is required"),
  categories: z.array(z.string()).min(1, "Select at least one category"),

  // Technical Details
  coordinateSystem: z.string().min(1, "Coordinate system is required"),
  projection: z.string().min(1, "Projection is required"),
  scale: z.string().min(1, "Scale is required"),
  resolution: z.string().optional(),
  accuracyLevel: z.string().min(1, "Accuracy level is required"),
  completeness: z.string().optional(),
  consistencyCheck: z.boolean().optional(),
  validationStatus: z.string().optional(),
  fileFormat: z.string().min(1, "File format is required"),
  fileSize: z.string().optional(),
  numFeatures: z.string().optional(),
  softwareReqs: z.string().optional(),
  updateCycle: z.string().optional(),
  lastUpdate: z.date().optional(),
  nextUpdate: z.date().optional(),

  // Access Information
  distributionFormat: z.string().min(1, "Distribution format is required"),
  accessMethod: z.string().min(1, "Access method is required"),
  downloadUrl: z.string().url().optional(),
  apiEndpoint: z.string().optional(),
  licenseType: z.string().min(1, "License type is required"),
  usageTerms: z.string().min(1, "Usage terms are required"),
  attributionRequirements: z
    .string()
    .min(1, "Attribution requirements are required"),
  accessRestrictions: z
    .array(z.string())
    .min(1, "Select at least one access restriction"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  department: z.string().optional(),
})

type MetadataFormValues = z.infer<typeof metadataFormSchema>

const defaultValues: Partial<MetadataFormValues> = {
  categories: [],
  accessRestrictions: [],
  consistencyCheck: false,
}

export function MetadataForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataFormSchema),
    defaultValues,
  })

  async function onSubmit(data: MetadataFormValues) {
    setIsLoading(true)

    try {
      const result = await createMetadata({
        ...data,
        dateFrom: format(data.dateFrom, "yyyy-MM-dd"),
        dateTo: format(data.dateTo, "yyyy-MM-dd"),
        lastUpdate: data.lastUpdate
          ? format(data.lastUpdate, "yyyy-MM-dd")
          : undefined,
        nextUpdate: data.nextUpdate
          ? format(data.nextUpdate, "yyyy-MM-dd")
          : undefined,
        organization: data.organizationName,
      })
      if (result.success && result.data) {
        router.push(`/metadata/${result.data.id}`)
      } else {
        console.error("Failed to create metadata:", result.error)
        // Handle error (show toast, etc.)
      }
    } catch (error) {
      console.error("Error creating metadata:", error)
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* General Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">General Information</h2>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input placeholder="Enter author" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input placeholder="Enter organization" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateFrom"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
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
                            format(field.value, "PPP")
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
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateTo"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
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
                            format(field.value, "PPP")
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
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < form.getValues("dateFrom") ||
                          date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="abstract"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Abstract</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter abstract"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter purpose"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thumbnailUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter thumbnail URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter image name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frameworkType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Framework Type</FormLabel>
                <FormControl>
                  <Input placeholder="Enter framework type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Technical Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Technical Details</h2>
          <FormField
            control={form.control}
            name="coordinateSystem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coordinate System</FormLabel>
                <FormControl>
                  <Input placeholder="Enter coordinate system" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projection</FormLabel>
                <FormControl>
                  <Input placeholder="Enter projection" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scale</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter scale"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resolution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resolution</FormLabel>
                <FormControl>
                  <Input placeholder="Enter resolution" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accuracyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accuracy Level</FormLabel>
                <FormControl>
                  <Input placeholder="Enter accuracy level" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consistencyCheck"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Consistency Check</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fileFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File Format</FormLabel>
                <FormControl>
                  <Input placeholder="Enter file format" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Access Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Access Information</h2>
          <FormField
            control={form.control}
            name="distributionFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distribution Format</FormLabel>
                <FormControl>
                  <Input placeholder="Enter distribution format" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accessMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Method</FormLabel>
                <FormControl>
                  <Input placeholder="Enter access method" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="downloadUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Download URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter download URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiEndpoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Endpoint</FormLabel>
                <FormControl>
                  <Input placeholder="Enter API endpoint" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Type</FormLabel>
                <FormControl>
                  <Input placeholder="Enter license type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="usageTerms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usage Terms</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter usage terms"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attributionRequirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attribution Requirements</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter attribution requirements"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="Enter department" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Metadata"}
        </Button>
      </form>
    </Form>
  )
}
