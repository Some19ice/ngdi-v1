"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// Function to get the current user ID from the auth token
// This is a placeholder - implement based on your auth system
async function getCurrentUserId(): Promise<string | null> {
  const authToken = cookies().get("auth_token")?.value

  // In a production environment, you would decode and validate the token
  // For development/testing purposes, we'll use a known test user ID
  try {
    // Use a single query with fallback logic to reduce database connections
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: "test@example.com" }, { role: "ADMIN" }],
      },
      select: { id: true },
    })

    return user?.id || null
  } catch (error) {
    console.error("Error finding user:", error)
    // Return a fallback ID for development purposes
    return process.env.NODE_ENV === "development" ? "fallback-user-id" : null
  }
}

// Form 1: General Information And Description Form
const form1Schema = z.object({
  // Data Information
  dataInformation: z.object({
    dataType: z.enum(["Raster", "Vector", "Table"], {
      required_error: "Data type is required",
    }),
    dataName: z.string().min(1, "Data name is required"),
    cloudCoverPercentage: z.string().optional(),
    productionDate: z.string().min(1, "Production date is required"),
  }),

  // Fundamental Datasets
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

  // Description
  description: z.object({
    abstract: z.string().min(1, "Abstract is required"),
    purpose: z.string().min(1, "Purpose is required"),
    thumbnail: z.string().min(1, "Thumbnail URL is required"),
  }),

  // Spatial Domain
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

  // Location
  location: z.object({
    country: z.string().min(1, "Country is required"),
    geopoliticalZone: z.string().min(1, "Geopolitical zone is required"),
    state: z.string().min(1, "State is required"),
    lga: z.string().min(1, "LGA is required"),
    townCity: z.string().min(1, "Town/City is required"),
  }),

  // Data Status
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

  // Resource Constraint
  resourceConstraint: z.object({
    accessConstraints: z.string().min(1, "Access constraints are required"),
    useConstraints: z.string().min(1, "Use constraints are required"),
    otherConstraints: z.string().min(1, "Other constraints are required"),
  }),

  // Metadata Reference
  metadataReference: z.object({
    creationDate: z.string().min(1, "Creation date is required"),
    reviewDate: z.string().min(1, "Review date is required"),
    contactName: z.string().min(1, "Contact name is required"),
    address: z.string().min(1, "Address is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(1, "Phone number is required"),
  }),
})

// Form 2: Data Quality Information Form
const form2Schema = z.object({
  // General Section
  generalSection: z.object({
    logicalConsistencyReport: z.string().optional(),
    completenessReport: z.string().optional(),
  }),

  // Attribute Accuracy
  attributeAccuracy: z.object({
    accuracyReport: z.string().optional(),
  }),

  // Positional Accuracy
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

  // Source Information
  sourceInformation: z.object({
    sourceScaleDenominator: z.coerce.number().optional(),
    sourceMediaType: z.string().optional(),
    sourceCitation: z.string().optional(),
    citationTitle: z.string().optional(),
    contractReference: z.string().optional(),
    contractDate: z.string().optional(),
  }),

  // Data Processing Information
  dataProcessingInformation: z.object({
    description: z.string().min(1, "Processing description is required"),
    softwareVersion: z.string().optional(),
    processedDate: z.string().min(1, "Processed date is required"),
  }),

  // Processor Contact Information
  processorContactInformation: z.object({
    name: z.string().min(1, "Processor name is required"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(1, "Processor address is required"),
  }),
})

// Form 3: Data Distribution Information Form
const form3Schema = z.object({
  // Distributor Information
  distributorInformation: z.object({
    name: z.string().min(1, "Distributor name is required"),
    address: z.string().min(1, "Distributor address is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    webLink: z.string().url().optional().or(z.literal("")),
    socialMediaHandle: z.string().optional(),
  }),

  // Distribution Details
  distributionDetails: z.object({
    liability: z.string().min(1, "Liability statement is required"),
    customOrderProcess: z.string().min(1, "Custom order process is required"),
    technicalPrerequisites: z
      .string()
      .min(1, "Technical prerequisites are required"),
  }),

  // Standard Order Process
  standardOrderProcess: z.object({
    fees: z.string().min(1, "Fees information is required"),
    turnaroundTime: z.string().min(1, "Turnaround time is required"),
    orderingInstructions: z
      .string()
      .min(1, "Ordering instructions are required"),
  }),
})

// Combined schema for the complete metadata
const ngdiMetadataSchema = z.object({
  form1: form1Schema,
  form2: form2Schema,
  form3: form3Schema,
})

export type Form1Data = z.infer<typeof form1Schema>
export type Form2Data = z.infer<typeof form2Schema>
export type Form3Data = z.infer<typeof form3Schema>
export type NGDIMetadataFormData = z.infer<typeof ngdiMetadataSchema>

export async function createNGDIMetadata(data: NGDIMetadataFormData) {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate the data against the schema
    const validatedData = ngdiMetadataSchema.parse(data)

    // Create the metadata record in the database
    // Note: This assumes you have a ngdiMetadata model in your Prisma schema
    const metadata = await prisma.nGDIMetadata.create({
      data: {
        // Form 1: General Information
        dataType: validatedData.form1.dataInformation.dataType,
        dataName: validatedData.form1.dataInformation.dataName,
        cloudCoverPercentage:
          validatedData.form1.dataInformation.cloudCoverPercentage,
        productionDate: validatedData.form1.dataInformation.productionDate,

        // Fundamental Datasets (stored as JSON)
        fundamentalDatasets: validatedData.form1.fundamentalDatasets,

        // Description
        abstract: validatedData.form1.description.abstract,
        purpose: validatedData.form1.description.purpose,
        thumbnailUrl: validatedData.form1.description.thumbnail,

        // Spatial Domain
        coordinateUnit: validatedData.form1.spatialDomain.coordinateUnit,
        minLatitude: validatedData.form1.spatialDomain.minLatitude,
        minLongitude: validatedData.form1.spatialDomain.minLongitude,
        maxLatitude: validatedData.form1.spatialDomain.maxLatitude,
        maxLongitude: validatedData.form1.spatialDomain.maxLongitude,

        // Location
        country: validatedData.form1.location.country,
        geopoliticalZone: validatedData.form1.location.geopoliticalZone,
        state: validatedData.form1.location.state,
        lga: validatedData.form1.location.lga,
        townCity: validatedData.form1.location.townCity,

        // Data Status
        assessment: validatedData.form1.dataStatus.assessment,
        updateFrequency: validatedData.form1.dataStatus.updateFrequency,

        // Resource Constraint
        accessConstraints:
          validatedData.form1.resourceConstraint.accessConstraints,
        useConstraints: validatedData.form1.resourceConstraint.useConstraints,
        otherConstraints:
          validatedData.form1.resourceConstraint.otherConstraints,

        // Metadata Reference
        metadataCreationDate:
          validatedData.form1.metadataReference.creationDate,
        metadataReviewDate: validatedData.form1.metadataReference.reviewDate,
        metadataContactName: validatedData.form1.metadataReference.contactName,
        metadataContactAddress: validatedData.form1.metadataReference.address,
        metadataContactEmail: validatedData.form1.metadataReference.email,
        metadataContactPhone: validatedData.form1.metadataReference.phoneNumber,

        // Form 2: Data Quality Information
        // General Section
        logicalConsistencyReport:
          validatedData.form2.generalSection.logicalConsistencyReport,
        completenessReport:
          validatedData.form2.generalSection.completenessReport,

        // Attribute Accuracy
        attributeAccuracyReport:
          validatedData.form2.attributeAccuracy.accuracyReport,

        // Positional Accuracy (stored as JSON)
        positionalAccuracy: validatedData.form2.positionalAccuracy,

        // Source Information (stored as JSON)
        sourceInformation: validatedData.form2.sourceInformation,

        // Data Processing Information
        processingDescription:
          validatedData.form2.dataProcessingInformation.description,
        softwareVersion:
          validatedData.form2.dataProcessingInformation.softwareVersion || null,
        processedDate:
          validatedData.form2.dataProcessingInformation.processedDate,

        // Processor Contact Information
        processorName: validatedData.form2.processorContactInformation.name,
        processorEmail: validatedData.form2.processorContactInformation.email,
        processorAddress:
          validatedData.form2.processorContactInformation.address,

        // Form 3: Data Distribution Information
        // Distributor Information
        distributorName: validatedData.form3.distributorInformation.name,
        distributorAddress: validatedData.form3.distributorInformation.address,
        distributorEmail: validatedData.form3.distributorInformation.email,
        distributorPhone:
          validatedData.form3.distributorInformation.phoneNumber,
        distributorWebLink:
          validatedData.form3.distributorInformation.webLink || null,
        distributorSocialMedia:
          validatedData.form3.distributorInformation.socialMediaHandle,

        // Distribution Details
        distributionLiability:
          validatedData.form3.distributionDetails.liability,
        customOrderProcess:
          validatedData.form3.distributionDetails.customOrderProcess,
        technicalPrerequisites:
          validatedData.form3.distributionDetails.technicalPrerequisites,

        // Standard Order Process
        orderFees: validatedData.form3.standardOrderProcess.fees,
        turnaroundTime: validatedData.form3.standardOrderProcess.turnaroundTime,
        orderingInstructions:
          validatedData.form3.standardOrderProcess.orderingInstructions,

        // User reference
        userId: userId,
      },
    })

    // Revalidate all relevant paths to ensure UI is updated
    revalidatePath("/metadata")
    revalidatePath("/metadata/[id]")
    revalidatePath("/search/metadata")
    revalidatePath("/")

    return { success: true, data: metadata }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors to be more user-friendly
      const fieldErrors = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ")

      return {
        success: false,
        error: `Validation failed: ${fieldErrors}`,
        details: error.errors,
      }
    }

    // Handle database-related errors
    if (error instanceof Error) {
      console.error("Error creating NGDI metadata:", error)

      // Check if it's a Prisma error
      if (error.message.includes("Prisma")) {
        return {
          success: false,
          error: "Database error. Please try again or contact support.",
        }
      }

      return { success: false, error: error.message }
    }

    console.error("Unknown error creating NGDI metadata:", error)
    return {
      success: false,
      error: "Failed to create metadata. Please try again.",
    }
  }
}
