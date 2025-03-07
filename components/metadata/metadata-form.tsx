import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { metadataService } from "@/lib/services/metadata.service"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { MetadataRequest } from "@/types/metadata"

const metadataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  organization: z.string().min(1, "Organization is required"),
  dateFrom: z.string(),
  dateTo: z.string(),
  abstract: z.string().min(1, "Abstract is required"),
  purpose: z.string().min(1, "Purpose is required"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL"),
  imageName: z.string(),
  frameworkType: z.string(),
  categories: z.array(z.string()),
  coordinateSystem: z.string(),
  projection: z.string(),
  scale: z.number().positive("Scale must be positive"),
  resolution: z.string().optional(),
  accuracyLevel: z.string(),
  completeness: z.number().min(0).max(100).optional(),
  consistencyCheck: z.boolean().optional(),
  validationStatus: z.string().optional(),
  fileFormat: z.string(),
  fileSize: z.number().positive("File size must be positive").optional(),
  numFeatures: z
    .number()
    .positive("Number of features must be positive")
    .optional(),
  softwareReqs: z.string().optional(),
  updateCycle: z.string().optional(),
  lastUpdate: z.string().optional(),
  nextUpdate: z.string().optional(),
  distributionFormat: z.string(),
  accessMethod: z.string(),
  downloadUrl: z.string().url("Invalid download URL").optional(),
  apiEndpoint: z.string().url("Invalid API endpoint").optional(),
  licenseType: z.string(),
  usageTerms: z.string(),
  attributionRequirements: z.string(),
  accessRestrictions: z.array(z.string()),
  contactPerson: z.string(),
  email: z.string().email("Invalid email format"),
  department: z.string().optional(),
})

interface MetadataFormProps {
  initialData?: MetadataRequest
  onSubmit: (data: MetadataRequest) => Promise<void>
}

export function MetadataForm({ initialData, onSubmit }: MetadataFormProps) {
  const { toast } = useToast()
  const form = useForm<MetadataRequest>({
    resolver: zodResolver(metadataSchema),
    defaultValues: initialData || {
      categories: [],
      accessRestrictions: [],
      consistencyCheck: false,
    },
  })

  const handleSubmit = async (data: MetadataRequest) => {
    try {
      await onSubmit(data)
      toast({
        title: "Success",
        description: initialData
          ? "Metadata updated successfully"
          : "Metadata created successfully",
      })
    } catch (error) {
      console.error("Metadata submission failed:", error)
      toast({
        title: "Error",
        description: "Failed to save metadata",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date From</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date To</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
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
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Add remaining form fields similarly */}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Metadata" : "Create Metadata"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
