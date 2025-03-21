"use client"

import { useState } from "react"
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
import {
  FormSection,
  FormSectionGrid,
  FormSectionDivider,
} from "./form-section"
import { FormDescriptionWithTooltip, RequiredFormLabel } from "./form-elements"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Define form schema specific to Technical Details
const formSchema = z.object({
  spatialInformation: z.object({
    coordinateSystem: z.string().min(1, "Coordinate system is required"),
    projection: z.string().min(1, "Projection is required"),
    scale: z.coerce.number().positive("Scale must be a positive number"),
    resolution: z.string().optional(),
  }),
  technicalSpecifications: z.object({
    fileFormat: z.string().min(1, "File format is required"),
    fileSize: z.coerce.number().optional(),
    numFeatures: z.coerce.number().optional(),
    softwareReqs: z.string().optional(),
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
  resourceConstraint: z.object({
    accessConstraints: z.string().min(1, "Access constraints are required"),
    useConstraints: z.string().min(1, "Use constraints are required"),
    otherConstraints: z.string().min(1, "Other constraints are required"),
  }),
})

type FormData = z.infer<typeof formSchema>

interface TechnicalDetailsFormProps {
  step: number
  onStepChange: (step: number) => void
  formData: Partial<any>
  onChange: (data: Partial<any>) => void
  isSubmitting: boolean
}

export default function TechnicalDetailsForm({
  step,
  onStepChange,
  formData,
  onChange,
  isSubmitting,
}: TechnicalDetailsFormProps) {
  const initialData = formData?.technicalDetails || {}

  // Initialize form with react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spatialInformation: {
        coordinateSystem:
          initialData?.spatialInformation?.coordinateSystem || "",
        projection: initialData?.spatialInformation?.projection || "",
        scale: initialData?.spatialInformation?.scale || 0,
        resolution: initialData?.spatialInformation?.resolution || "",
      },
      technicalSpecifications: {
        fileFormat: initialData?.technicalSpecifications?.fileFormat || "",
        fileSize: initialData?.technicalSpecifications?.fileSize || undefined,
        numFeatures:
          initialData?.technicalSpecifications?.numFeatures || undefined,
        softwareReqs: initialData?.technicalSpecifications?.softwareReqs || "",
      },
      spatialDomain: {
        coordinateUnit: initialData?.spatialDomain?.coordinateUnit || undefined,
        minLatitude: initialData?.spatialDomain?.minLatitude || 0,
        minLongitude: initialData?.spatialDomain?.minLongitude || 0,
        maxLatitude: initialData?.spatialDomain?.maxLatitude || 0,
        maxLongitude: initialData?.spatialDomain?.maxLongitude || 0,
      },
      resourceConstraint: {
        accessConstraints:
          initialData?.resourceConstraint?.accessConstraints || "",
        useConstraints: initialData?.resourceConstraint?.useConstraints || "",
        otherConstraints:
          initialData?.resourceConstraint?.otherConstraints || "",
      },
    },
  })

  // Form submission handler
  function onSubmit(data: FormData) {
    onChange({ technicalDetails: data })
    onStepChange(step + 1)
  }

  // Handle going back
  const handleBack = () => {
    // Get current form values without validation
    const currentData = form.getValues()
    // Save current state before navigating back
    onChange({ technicalDetails: currentData })
    onStepChange(step - 1)
  }

  // Form submission handler
  const handleContinue = () => {
    // Get current form values without validation
    const currentData = form.getValues()
    // Pass the data to the next step without validation
    onChange({ technicalDetails: currentData })
    onStepChange(step + 1)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection
          title="Spatial Information"
          description="Provide information about the spatial characteristics of the dataset"
        >
          <FormSectionGrid columns={2}>
            <FormField
              control={form.control}
              name="spatialInformation.coordinateSystem"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Coordinate System</RequiredFormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coordinate system" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="WGS84">WGS 84</SelectItem>
                      <SelectItem value="EPSG:4326">EPSG:4326</SelectItem>
                      <SelectItem value="EPSG:3857">
                        EPSG:3857 (Web Mercator)
                      </SelectItem>
                      <SelectItem value="NAD83">NAD 83</SelectItem>
                      <SelectItem value="ETRS89">ETRS 89</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescriptionWithTooltip tooltip="The reference coordinate system used for the dataset's spatial coordinates">
                    The coordinate reference system used in the dataset
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spatialInformation.projection"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Projection</RequiredFormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select projection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UTM">
                        Universal Transverse Mercator (UTM)
                      </SelectItem>
                      <SelectItem value="Web Mercator">Web Mercator</SelectItem>
                      <SelectItem value="Lambert Conformal Conic">
                        Lambert Conformal Conic
                      </SelectItem>
                      <SelectItem value="Albers Equal Area">
                        Albers Equal Area
                      </SelectItem>
                      <SelectItem value="Equirectangular">
                        Equirectangular
                      </SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescriptionWithTooltip tooltip="The map projection used to transform the Earth's curved surface to a flat representation">
                    The map projection used in the dataset
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spatialInformation.scale"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Scale</RequiredFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 50000 for 1:50000 scale"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The denominator of the representative fraction (e.g., 50,000 for a scale of 1:50,000)">
                    The representative fraction scale of the dataset
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spatialInformation.resolution"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Resolution</RequiredFormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 10m or 30cm" {...field} />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The spatial resolution or ground sample distance for raster data, or the minimum mapping unit for vector data">
                    The spatial resolution of the dataset
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSectionGrid>
        </FormSection>

        <FormSectionDivider />

        <FormSection
          title="Spatial Domain"
          description="Define the geographic extent of the dataset"
        >
          <FormSectionGrid columns={2}>
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
                      <SelectTrigger>
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
                    The measurement system used to express geographic
                    coordinates
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

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
          </FormSectionGrid>
        </FormSection>

        <FormSectionDivider />

        <FormSection
          title="Technical Specifications"
          description="Provide technical details about the dataset format and structure"
        >
          <FormSectionGrid columns={2}>
            <FormField
              control={form.control}
              name="technicalSpecifications.fileFormat"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>File Format</RequiredFormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select file format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Shapefile">Shapefile</SelectItem>
                      <SelectItem value="GeoJSON">GeoJSON</SelectItem>
                      <SelectItem value="GeoTIFF">GeoTIFF</SelectItem>
                      <SelectItem value="CSV">CSV</SelectItem>
                      <SelectItem value="KML">KML/KMZ</SelectItem>
                      <SelectItem value="GDB">File Geodatabase</SelectItem>
                      <SelectItem value="SpatiaLite">SpatiaLite</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescriptionWithTooltip tooltip="The file format in which the data is stored and distributed">
                    The format in which the data is available
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technicalSpecifications.fileSize"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>File Size (MB)</RequiredFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="File size in megabytes"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The approximate size of the dataset in megabytes">
                    The size of the dataset files
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technicalSpecifications.numFeatures"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Number of Features</RequiredFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Approximate feature count"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="The approximate number of features or records in the dataset">
                    The count of features in the dataset
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technicalSpecifications.softwareReqs"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Software Requirements</RequiredFormLabel>
                  <FormControl>
                    <Input
                      placeholder="Software needed to use the data"
                      {...field}
                    />
                  </FormControl>
                  <FormDescriptionWithTooltip tooltip="Any specific software required to use or process the dataset">
                    Software needed to work with this dataset
                  </FormDescriptionWithTooltip>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSectionGrid>
        </FormSection>

        <FormSectionDivider />

        <FormSection
          title="Resource Constraint"
          description="Specify access and use restrictions for the dataset"
        >
          <FormSectionGrid columns={2}>
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
                    Specific limitations on who is permitted to access the
                    dataset
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
          </FormSectionGrid>
        </FormSection>

        <div className="flex justify-between mt-8">
          <Button type="button" variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
          >
            Continue
          </Button>
        </div>
      </form>
    </Form>
  )
}
