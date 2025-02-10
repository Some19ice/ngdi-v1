"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth-options"
import { prisma } from "@/lib/prisma"

const metadataSchema = z.object({
  // General Information
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  organizationName: z.string().min(1, "Organization is required"),
  dateFrom: z.string().min(1, "Start date is required"),
  dateTo: z.string().min(1, "End date is required"),
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
  lastUpdate: z.string().optional(),
  nextUpdate: z.string().optional(),

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
  organization: z.string().min(1, "Organization is required"),
  department: z.string().optional(),
})

export type MetadataFormData = z.infer<typeof metadataSchema>

export async function createMetadata(data: MetadataFormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const validatedData = metadataSchema.parse(data)

    const metadata = await prisma.metadata.create({
      data: {
        ...validatedData,
        organization: validatedData.organizationName,
        categories: { set: validatedData.categories },
        accessRestrictions: { set: validatedData.accessRestrictions },
        scale: parseInt(validatedData.scale),
        completeness: validatedData.completeness
          ? parseInt(validatedData.completeness)
          : null,
        fileSize: validatedData.fileSize
          ? parseInt(validatedData.fileSize)
          : null,
        numFeatures: validatedData.numFeatures
          ? parseInt(validatedData.numFeatures)
          : null,
        userId: session.user.id,
        dateFrom: new Date(validatedData.dateFrom),
        dateTo: new Date(validatedData.dateTo),
        lastUpdate: validatedData.lastUpdate
          ? new Date(validatedData.lastUpdate)
          : null,
        nextUpdate: validatedData.nextUpdate
          ? new Date(validatedData.nextUpdate)
          : null,
      },
    })

    revalidatePath("/metadata")
    return { success: true, data: metadata }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors,
      }
    }
    return { success: false, error: "Failed to create metadata" }
  }
}
