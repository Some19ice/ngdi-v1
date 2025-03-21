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
import { FormSection, FormSectionGrid } from "@/components/form-section"
import {
  FormDescriptionWithTooltip,
  RequiredFormLabel,
} from "@/components/form-elements"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
})

type FormData = z.infer<typeof formSchema>

interface TechnicalDetailsFormProps {
  onNext: (data: FormData) => void
  onBack: () => void
  initialData?: Partial<FormData>
}

export default function TechnicalDetailsForm({
  onNext,
  onBack,
  initialData,
}: TechnicalDetailsFormProps) {
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
    },
  })

  // Form submission handler
  const handleContinue = form.handleSubmit((data) => {
    onNext(data)
  })

  return (
    <Form {...form}>
      <form className="space-y-8">
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
