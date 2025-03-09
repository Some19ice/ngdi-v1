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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Form1Data } from "@/types/ngdi-metadata"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

// Define validation schema using Zod
const formSchema = z.object({
  dataInformation: z.object({
    dataType: z.enum(["Raster", "Vector", "Table"], {
      required_error: "Data type is required",
    }),
    dataName: z.string().min(1, "Data name is required"),
    cloudCoverPercentage: z.string().optional(),
    productionDate: z.string().min(1, "Production date is required"),
  }),
  fundamentalDatasets: z.object({
    geodeticData: z.boolean().optional(),
    topographicData: z.boolean().optional(),
    cadastralData: z.boolean().optional(),
    administrativeBoundaries: z.boolean().optional(),
    hydrographicData: z.boolean().optional(),
    landUseLandCover: z.boolean().optional(),
    geologicalData: z.boolean().optional(),
    demographicData: z.boolean().optional(),
    digitalImagery: z.boolean().optional(),
    transportationData: z.boolean().optional(),
    others: z.boolean().optional(),
    otherDescription: z.string().optional(),
  }),
  description: z.object({
    abstract: z.string().min(1, "Abstract is required"),
    purpose: z.string().min(1, "Purpose is required"),
    thumbnail: z.string().min(1, "Thumbnail URL is required"),
  }),
  spatialDomain: z.object({
    coordinateUnit: z.enum(["DD", "DMS"], {
      required_error: "Coordinate unit is required",
    }),
    minLatitude: z.coerce.number({
      required_error: "Minimum latitude is required",
    }),
    minLongitude: z.coerce.number({
      required_error: "Minimum longitude is required",
    }),
    maxLatitude: z.coerce.number({
      required_error: "Maximum latitude is required",
    }),
    maxLongitude: z.coerce.number({
      required_error: "Maximum longitude is required",
    }),
  }),
  location: z.object({
    country: z.string().min(1, "Country is required"),
    geopoliticalZone: z.string().min(1, "Geopolitical zone is required"),
    state: z.string().min(1, "State is required"),
    lga: z.string().min(1, "LGA is required"),
    townCity: z.string().min(1, "Town/City is required"),
  }),
  dataStatus: z.object({
    assessment: z.enum(["Complete", "Incomplete"], {
      required_error: "Assessment is required",
    }),
    updateFrequency: z.enum(
      ["Monthly", "Quarterly", "Bi-Annually", "Annually"],
      {
        required_error: "Update frequency is required",
      }
    ),
  }),
  resourceConstraint: z.object({
    accessConstraints: z.string().min(1, "Access constraints are required"),
    useConstraints: z.string().min(1, "Use constraints are required"),
    otherConstraints: z.string().min(1, "Other constraints are required"),
  }),
  metadataReference: z.object({
    creationDate: z.string().min(1, "Creation date is required"),
    reviewDate: z.string().min(1, "Review date is required"),
    contactName: z.string().min(1, "Contact name is required"),
    address: z.string().min(1, "Address is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(1, "Phone number is required"),
  }),
})

interface GeneralInfoFormProps {
  onNext: (data: Form1Data) => void
  initialData?: Partial<Form1Data>
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

export default function GeneralInfoForm({
  onNext,
  initialData,
}: GeneralInfoFormProps) {
  const form = useForm<Form1Data>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      dataInformation: {
        dataType: undefined,
        dataName: "",
        cloudCoverPercentage: "",
        productionDate: "",
      },
      fundamentalDatasets: {
        geodeticData: false,
        topographicData: false,
        cadastralData: false,
        administrativeBoundaries: false,
        hydrographicData: false,
        landUseLandCover: false,
        geologicalData: false,
        demographicData: false,
        digitalImagery: false,
        transportationData: false,
        others: false,
        otherDescription: "",
      },
      description: {
        abstract: "",
        purpose: "",
        thumbnail: "",
      },
      spatialDomain: {
        coordinateUnit: undefined,
        minLatitude: 0,
        minLongitude: 0,
        maxLatitude: 0,
        maxLongitude: 0,
      },
      location: {
        country: "",
        geopoliticalZone: "",
        state: "",
        lga: "",
        townCity: "",
      },
      dataStatus: {
        assessment: undefined,
        updateFrequency: undefined,
      },
      resourceConstraint: {
        accessConstraints: "",
        useConstraints: "",
        otherConstraints: "",
      },
      metadataReference: {
        creationDate: "",
        reviewDate: "",
        contactName: "",
        address: "",
        email: "",
        phoneNumber: "",
      },
    },
  })

  function onSubmit(data: Form1Data) {
    onNext(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Data Information Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Data Information</h2>

          <FormField
            control={form.control}
            name="dataInformation.dataType"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Data Type</RequiredFormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-primary/20 focus:ring-primary/20">
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Raster">Raster</SelectItem>
                    <SelectItem value="Vector">Vector</SelectItem>
                    <SelectItem value="Table">Table</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescriptionWithTooltip tooltip="The fundamental approach used to represent spatial information: either as a grid of cells (raster), as points, lines, and polygons (vector), or as tabular data (table). This determines how the data is structured and what types of analysis can be performed.">
                  The method used to represent geographic features in the
                  dataset
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataInformation.dataName"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Data Name/Title</RequiredFormLabel>
                <FormControl>
                  <Input placeholder="Enter data name" {...field} />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="A unique and descriptive title that clearly identifies the dataset. Should be concise yet informative enough to distinguish it from similar datasets.">
                  The official name of the geospatial dataset
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataInformation.cloudCoverPercentage"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>% Cloud Cover of Image</RequiredFormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter cloud cover percentage"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="For remote sensing datasets, the percentage of the area obscured by clouds, which affects data usability for certain applications.">
                  For remote sensing datasets, the percentage of the area
                  obscured by clouds
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataInformation.productionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <RequiredFormLabel>Date of Production</RequiredFormLabel>
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
                <FormDescriptionWithTooltip tooltip="The specific date when this version or edition of the dataset was officially released or made available. Helps track different versions of the same dataset over time.">
                  The date when this version of the dataset was created or
                  published
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fundamental Datasets Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Fundamental Datasets</h2>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fundamentalDatasets.geodeticData"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Geodetic Data</FormLabel>
                    <FormDescriptionWithTooltip tooltip="Datasets that provide the foundation for positioning, including coordinate systems, geodetic control networks, and reference frames.">
                      Datasets that provide the foundation for positioning
                    </FormDescriptionWithTooltip>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundamentalDatasets.topographicData"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Topographic Data/DEM</FormLabel>
                    <FormDescriptionWithTooltip tooltip="Datasets that represent the physical surface of the Earth, including elevation, terrain, and relief information.">
                      Datasets that represent the physical surface of the Earth
                    </FormDescriptionWithTooltip>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundamentalDatasets.cadastralData"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Cadastral Data</FormLabel>
                    <FormDescriptionWithTooltip tooltip="Datasets related to land ownership, property boundaries, and land parcel information.">
                      Datasets related to land ownership and property boundaries
                    </FormDescriptionWithTooltip>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundamentalDatasets.administrativeBoundaries"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Administrative Boundaries</FormLabel>
                    <FormDescriptionWithTooltip tooltip="Datasets that define political and administrative divisions">
                      Datasets that define political and administrative
                      divisions
                    </FormDescriptionWithTooltip>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundamentalDatasets.hydrographicData"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Hydrographic Data</FormLabel>
                    <FormDescriptionWithTooltip tooltip="Datasets related to water bodies and drainage networks">
                      Datasets related to water bodies and drainage networks
                    </FormDescriptionWithTooltip>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundamentalDatasets.landUseLandCover"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Land use/Land Cover</FormLabel>
                    <FormDescriptionWithTooltip tooltip="Datasets that classify how land is used or what covers it">
                      Datasets that classify how land is used or what covers it
                    </FormDescriptionWithTooltip>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundamentalDatasets.geologicalData"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Geological Data</FormLabel>
                    <FormDescriptionWithTooltip tooltip="Datasets related to the Earth's physical structure and rock formations">
                      Datasets related to the Earth&apos;s physical structure
                      and rock formations
                    </FormDescriptionWithTooltip>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundamentalDatasets.demographicData"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Demographic Data</FormLabel>
                    <FormDescriptionWithTooltip tooltip="Datasets related to human populations and characteristics">
                      Datasets related to human populations and characteristics
                    </FormDescriptionWithTooltip>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundamentalDatasets.digitalImagery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Digital Imagery and Image Maps</FormLabel>
                    <FormDescriptionWithTooltip tooltip="Datasets consisting of aerial or satellite imagery">
                      Datasets consisting of aerial or satellite imagery
                    </FormDescriptionWithTooltip>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundamentalDatasets.transportationData"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Transportation Data</FormLabel>
                    <FormDescriptionWithTooltip tooltip="Datasets related to transportation networks and infrastructure">
                      Datasets related to transportation networks and
                      infrastructure
                    </FormDescriptionWithTooltip>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fundamentalDatasets.others"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Others</FormLabel>
                    <FormDescriptionWithTooltip tooltip="Other fundamental dataset types not listed above">
                      Other fundamental dataset types not listed above
                    </FormDescriptionWithTooltip>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="fundamentalDatasets.otherDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other fundamental dataset</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Describe other fundamental datasets"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="Allows specification of additional fundamental dataset types not covered by the standard categories.">
                  Specify additional fundamental dataset types not covered by
                  the standard categories
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Description</h2>

          <FormField
            control={form.control}
            name="description.abstract"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Abstract</RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter abstract"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="A concise narrative that summarizes what the dataset contains, how it was created, and its intended use. The abstract should provide enough information for users to determine if the dataset is relevant to their needs.">
                  A summary of the dataset&apos;s content and purpose
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description.purpose"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Purpose</RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter purpose"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="A statement explaining why the dataset was created and what applications or uses it was intended to support. This helps users understand if the dataset is appropriate for their specific use case.">
                  The reason the dataset was created
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description.thumbnail"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Thumbnail URL</RequiredFormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="Enter thumbnail URL"
                    className="border-primary/20 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="A small image that provides a visual representation of the dataset. For spatial data, this is typically a reduced-resolution map showing the geographic coverage and key features.">
                  A visual preview of the dataset
                </FormDescriptionWithTooltip>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Spatial Domain Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Spatial Domain</h2>

          <FormField
            control={form.control}
            name="spatialDomain.coordinateUnit"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Coordinate Unit</RequiredFormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-primary/20 focus:ring-primary/20">
                      <SelectValue placeholder="Select coordinate unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DD">Decimal Degrees (DD)</SelectItem>
                    <SelectItem value="DMS">
                      Degrees, Minutes, Seconds (DMS)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescriptionWithTooltip tooltip="The measurement system used to express geographic coordinates">
                  The measurement system used to express geographic coordinates
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="spatialDomain.minLatitude"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Min. Latitude X</RequiredFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter minimum latitude"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The southernmost latitude value">
                    The southernmost latitude value
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spatialDomain.minLongitude"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Min. Longitude Y</RequiredFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter minimum longitude"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The westernmost longitude value">
                    The westernmost longitude value
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spatialDomain.maxLatitude"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Max. Latitude X</RequiredFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter maximum latitude"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The northernmost latitude value">
                    The northernmost latitude value
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spatialDomain.maxLongitude"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Max. Longitude Y</RequiredFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter maximum longitude"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The easternmost longitude value">
                    The easternmost longitude value
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Location</h2>

          <FormField
            control={form.control}
            name="location.country"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Country</RequiredFormLabel>
                <FormControl>
                  <Input placeholder="Enter country" {...field} />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The nation whose territory is represented in the dataset">
                  The nation whose territory is represented in the dataset
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.geopoliticalZone"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Geopolitical Zone</RequiredFormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-primary/20 focus:ring-primary/20">
                      <SelectValue placeholder="Select geopolitical zone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="North West">North West</SelectItem>
                    <SelectItem value="North East">North East</SelectItem>
                    <SelectItem value="North Central">North Central</SelectItem>
                    <SelectItem value="South South">South South</SelectItem>
                    <SelectItem value="South West">South West</SelectItem>
                    <SelectItem value="South East">South East</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescriptionWithTooltip tooltip="The geopolitical grouping of states in Nigeria">
                  The geopolitical grouping of states in Nigeria
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.state"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>State</RequiredFormLabel>
                <FormControl>
                  <Input placeholder="Enter state" {...field} />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The primary administrative division within the country">
                  The primary administrative division within the country
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.lga"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>LGA</RequiredFormLabel>
                <FormControl>
                  <Input placeholder="Enter Local Government Area" {...field} />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The local administrative division within a state">
                  The local administrative division within a state
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.townCity"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Town/City</RequiredFormLabel>
                <FormControl>
                  <Input placeholder="Enter town or city" {...field} />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The specific locality represented in the dataset">
                  The specific locality represented in the dataset
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Data Status Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Status of Data</h2>

          <FormField
            control={form.control}
            name="dataStatus.assessment"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Assessment</RequiredFormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-primary/20 focus:ring-primary/20">
                      <SelectValue placeholder="Select assessment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Incomplete">Incomplete</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescriptionWithTooltip tooltip="Indicates whether the dataset is complete or still in development">
                  Indicates whether the dataset is complete or still in
                  development
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataStatus.updateFrequency"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Update Frequency</RequiredFormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-primary/20 focus:ring-primary/20">
                      <SelectValue placeholder="Select update frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Bi-Annually">Bi-Annually</SelectItem>
                    <SelectItem value="Annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescriptionWithTooltip tooltip="The established schedule for reviewing and refreshing the dataset">
                  The established schedule for reviewing and refreshing the
                  dataset
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Resource Constraint Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Resource Constraint</h2>

          <FormField
            control={form.control}
            name="resourceConstraint.accessConstraints"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Access Constraints</RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter access constraints"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="Specific limitations on who is permitted to access the dataset">
                  Specific limitations on who is permitted to access the dataset
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resourceConstraint.useConstraints"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Use Constraints</RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter use constraints"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="Legal or policy restrictions that govern how the dataset may be used">
                  Legal or policy restrictions that govern how the dataset may
                  be used
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resourceConstraint.otherConstraints"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Other Constraints</RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter other constraints"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="Supplementary constraints that don't fit into standard categories">
                  Supplementary constraints that don&apos;t fit into standard
                  categories
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Metadata Reference Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Metadata Reference</h2>

          <FormField
            control={form.control}
            name="metadataReference.creationDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <RequiredFormLabel>Metadata Creation Date</RequiredFormLabel>
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
                <FormDescriptionWithTooltip tooltip="The date when the metadata record itself was created">
                  The date when the metadata record itself was created
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadataReference.reviewDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <RequiredFormLabel>Metadata Review Date</RequiredFormLabel>
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
                <FormDescriptionWithTooltip tooltip="The date when the metadata was last checked for accuracy">
                  The date when the metadata was last checked for accuracy
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadataReference.contactName"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Contact Name</RequiredFormLabel>
                <FormControl>
                  <Input placeholder="Enter contact name" {...field} />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The individual responsible for maintaining the metadata record">
                  The individual responsible for maintaining the metadata record
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadataReference.address"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Address</RequiredFormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter contact address"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The physical or postal address where the metadata contact person can be reached">
                  The physical or postal address where the metadata contact
                  person can be reached
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadataReference.email"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>E-mail</RequiredFormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter contact email"
                    {...field}
                  />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The electronic mail address for contacting the person responsible for the metadata">
                  The electronic mail address for contacting the person
                  responsible for the metadata
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadataReference.phoneNumber"
            render={({ field }) => (
              <FormItem>
                <RequiredFormLabel>Phone Number</RequiredFormLabel>
                <FormControl>
                  <Input placeholder="Enter contact phone number" {...field} />
                </FormControl>
                <FormDescriptionWithTooltip tooltip="The telephone number where the metadata contact person can be reached">
                  The telephone number where the metadata contact person can be
                  reached
                </FormDescriptionWithTooltip>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  )
}
