"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { transformFormToApiModel } from "@/lib/transformers/metadata"

// Function to get the current user ID from the auth token
// This is a placeholder - implement based on your auth system
async function getCurrentUserId(): Promise<string | null> {
  const authToken = cookies().get("auth_token")?.value

  if (!authToken) {
    return null
  }

  // In a real implementation, you would decode and validate the token
  // For now, we'll return a placeholder user ID
  return "placeholder-user-id"
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
    maximumResponseTime: z.string().optional(),
  }),
})

// Combined schema for the complete metadata
const ngdiMetadataSchema = z
  .object({
    // Old structure for backward compatibility
    form1: form1Schema.optional(),
    form2: form2Schema.optional(),
    form3: form3Schema.optional(),
    form4: z.any().optional(),

    // New structure with descriptive names
    generalInfo: form1Schema.optional(),
    dataQuality: form2Schema.optional(),
    technicalDetails: z.any().optional(),
    accessInfo: z.any().optional(),
    distributionInfo: form3Schema.optional(),
  })
  .refine(
    (data) => {
      // Ensure either the old structure or the new structure is present
      return (
        (data.form1 || data.generalInfo) &&
        (data.form2 || data.dataQuality) &&
        data.technicalDetails
      )
    },
    {
      message:
        "Either the old or new structure must provide all required form sections",
    }
  )

export type Form1Data = z.infer<typeof form1Schema>
export type Form2Data = z.infer<typeof form2Schema>
export type Form3Data = z.infer<typeof form3Schema>
export type NGDIMetadataFormData = z.infer<typeof ngdiMetadataSchema>

export async function createMetadata(data: NGDIMetadataFormData) {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate the data against the schema
    const validatedData = ngdiMetadataSchema.parse(data)

    // Ensure we have the data in both formats for backward compatibility
    const formData = {
      ...validatedData,
      form1: validatedData.form1 || validatedData.generalInfo,
      form2: validatedData.form2 || validatedData.dataQuality,
      form3: validatedData.form3 || validatedData.distributionInfo,
      form4: validatedData.form4 || validatedData.accessInfo,
      generalInfo: validatedData.generalInfo || validatedData.form1,
      dataQuality: validatedData.dataQuality || validatedData.form2,
      technicalDetails: validatedData.technicalDetails,
      accessInfo: validatedData.accessInfo || validatedData.form4,
      distributionInfo: validatedData.distributionInfo || validatedData.form3,
    }

    // Transform the form data to the API model
    const apiMetadata = transformFormToApiModel(formData)

    // Get the form1 data from either generalInfo or form1
    const form1Data = formData.form1 || formData.generalInfo

    // Create the metadata record in both the NGDIMetadata table (for backward compatibility)
    // and in the consolidated Metadata table
    const [ngdiMetadata, metadata] = await Promise.all([
      // Create in NGDIMetadata (original table)
      prisma.nGDIMetadata.create({
        data: {
          // Form 1: General Information
          dataType: form1Data.dataInformation.dataType,
          dataName: form1Data.dataInformation.dataName,
          cloudCoverPercentage: form1Data.dataInformation.cloudCoverPercentage,
          productionDate: form1Data.dataInformation.productionDate,

          // Fundamental Datasets (stored as JSON)
          fundamentalDatasets: form1Data.fundamentalDatasets,

          // Description
          abstract: form1Data.description.abstract,
          purpose: form1Data.description.purpose,
          thumbnailUrl: form1Data.description.thumbnail,

          // Spatial Domain
          coordinateUnit: form1Data.spatialDomain.coordinateUnit,
          minLatitude: form1Data.spatialDomain.minLatitude,
          minLongitude: form1Data.spatialDomain.minLongitude,
          maxLatitude: form1Data.spatialDomain.maxLatitude,
          maxLongitude: form1Data.spatialDomain.maxLongitude,

          // Location
          country: form1Data.location.country,
          geopoliticalZone: form1Data.location.geopoliticalZone,
          state: form1Data.location.state,
          lga: form1Data.location.lga,
          townCity: form1Data.location.townCity,

          // Data Status
          assessment: form1Data.dataStatus.assessment,
          updateFrequency: form1Data.dataStatus.updateFrequency,

          // Resource Constraint
          accessConstraints: form1Data.resourceConstraint.accessConstraints,
          useConstraints: form1Data.resourceConstraint.useConstraints,
          otherConstraints: form1Data.resourceConstraint.otherConstraints,

          // Metadata Reference
          metadataCreationDate: form1Data.metadataReference.creationDate,
          metadataReviewDate: form1Data.metadataReference.reviewDate,
          metadataContactName: form1Data.metadataReference.contactName,
          metadataContactAddress: form1Data.metadataReference.address,
          metadataContactEmail: form1Data.metadataReference.email,
          metadataContactPhone: form1Data.metadataReference.phoneNumber,

          // Form 2: Data Quality Information
          // General Section
          logicalConsistencyReport:
            formData.form2.generalSection.logicalConsistencyReport,
          completenessReport: formData.form2.generalSection.completenessReport,

          // Attribute Accuracy
          attributeAccuracyReport:
            formData.form2.attributeAccuracy.accuracyReport,

          // Positional Accuracy (stored as JSON)
          positionalAccuracy: formData.form2.positionalAccuracy,

          // Source Information (stored as JSON)
          sourceInformation: formData.form2.sourceInformation,

          // Data Processing Information
          processingDescription:
            formData.form2.dataProcessingInformation.description,
          softwareVersion:
            formData.form2.dataProcessingInformation.softwareVersion,
          processedDate: formData.form2.dataProcessingInformation.processedDate,

          // Processor Contact Information
          processorName: formData.form2.processorContactInformation.name,
          processorEmail: formData.form2.processorContactInformation.email,
          processorAddress: formData.form2.processorContactInformation.address,

          // Form 3: Data Distribution Information
          // Distributor Information
          distributorName: formData.form3.distributorInformation.name,
          distributorAddress: formData.form3.distributorInformation.address,
          distributorEmail: formData.form3.distributorInformation.email,
          distributorPhone: formData.form3.distributorInformation.phoneNumber,
          distributorWebLink:
            formData.form3.distributorInformation.webLink || null,
          distributorSocialMedia:
            formData.form3.distributorInformation.socialMediaHandle,

          // Distribution Details
          distributionLiability: formData.form3.distributionDetails.liability,
          customOrderProcess:
            formData.form3.distributionDetails.customOrderProcess,
          technicalPrerequisites:
            formData.form3.distributionDetails.technicalPrerequisites,

          // Standard Order Process
          fees: formData.form3.standardOrderProcess.fees,
          turnaroundTime: formData.form3.standardOrderProcess.turnaroundTime,
          orderingInstructions:
            formData.form3.standardOrderProcess.orderingInstructions,
          maximumResponseTime:
            formData.form3.standardOrderProcess.maximumResponseTime ||
            "48 hours",

          // User reference
          userId: userId,
        },
      }),

      // Create in Metadata (unified table)
      prisma.metadata.create({
        data: {
          ...apiMetadata,
          userId,
        },
      }),
    ])

    revalidatePath("/metadata")
    revalidatePath("/search/metadata")
    return {
      success: true,
      data: {
        id: ngdiMetadata.id,
        // Other fields as needed
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors,
      }
    }

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: "Failed to create metadata" }
  }
}

export async function searchMetadata({
  page = 1,
  limit = 10,
  search = "",
  category = "",
  author = "",
  organization = "",
  categories = [],
  dataTypes = [],
  dateFrom = "",
  dateTo = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  page?: number
  limit?: number
  search?: string
  category?: string
  author?: string
  organization?: string
  categories?: string[] | string
  dataTypes?: string[] | string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}) {
  try {
    // Calculate pagination
    const skip = (page - 1) * limit

    // Build the where clause for filtering
    const where: any = {}

    // Add search filter if provided
    if (search) {
      where.OR = [
        { dataName: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { purpose: { contains: search, mode: "insensitive" } },
      ]
    }

    // Add author filter if provided
    if (author) {
      if (where.OR) {
        // If we already have an OR condition, add AND condition for author
        where.AND = [
          ...(where.AND || []),
          { author: { contains: author, mode: "insensitive" } },
        ]
      } else {
        where.author = { contains: author, mode: "insensitive" }
      }
    }

    // Add organization filter if provided
    if (organization) {
      if (where.OR || where.AND) {
        // If we already have an OR or AND condition, add to AND
        where.AND = [
          ...(where.AND || []),
          { organization: { contains: organization, mode: "insensitive" } },
        ]
      } else {
        where.organization = { contains: organization, mode: "insensitive" }
      }
    }

    // Handle categories
    const categoryFilters = []
    if (Array.isArray(categories) && categories.length > 0) {
      categoryFilters.push(...categories)
    } else if (typeof categories === "string" && categories) {
      categoryFilters.push(categories)
    }

    // Add the single category if present
    if (category && category !== "all") {
      categoryFilters.push(category)
    }

    if (categoryFilters.length > 0) {
      // Add each category to the query
      const categoryConditions = categoryFilters.map((cat) => ({
        categories: { has: cat },
      }))

      if (where.OR || where.AND) {
        // If we already have conditions, add to AND with an OR for categories
        where.AND = [...(where.AND || []), { OR: categoryConditions }]
      } else {
        where.OR = categoryConditions
      }
    }

    // Handle data types
    const dataTypeFilters = []
    if (Array.isArray(dataTypes) && dataTypes.length > 0) {
      dataTypeFilters.push(...dataTypes)
    } else if (typeof dataTypes === "string" && dataTypes) {
      dataTypeFilters.push(dataTypes)
    }

    if (dataTypeFilters.length > 0) {
      const typeConditions = dataTypeFilters.map((type) => {
        if (type === "vector")
          return { frameworkType: { equals: "Vector", mode: "insensitive" } }
        if (type === "raster")
          return { frameworkType: { equals: "Raster", mode: "insensitive" } }
        if (type === "tabular")
          return { frameworkType: { equals: "Table", mode: "insensitive" } }
        return { frameworkType: { contains: type, mode: "insensitive" } }
      })

      if (where.OR || where.AND) {
        // If we already have conditions, add to AND with an OR for data types
        where.AND = [...(where.AND || []), { OR: typeConditions }]
      } else {
        where.OR = typeConditions
      }
    }

    // Add date filters if provided
    if (dateFrom) {
      where.productionDate = {
        ...where.productionDate,
        gte: dateFrom,
      }
    }

    if (dateTo) {
      where.productionDate = {
        ...where.productionDate,
        lte: dateTo,
      }
    }

    // Get total count for pagination
    const total = await prisma.metadata.count({ where })
    const totalPages = Math.ceil(total / limit)

    // Get metadata items with pagination and sorting
    const metadata = await prisma.metadata.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        title: true,
        author: true,
        organization: true,
        abstract: true,
        purpose: true,
        thumbnailUrl: true,
        dateFrom: true,
        dateTo: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return {
      success: true,
      data: {
        metadata,
        total,
        currentPage: page,
        limit,
        totalPages,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to search metadata" }
  }
}

export async function getMetadataById(id: string) {
  try {
    // Use direct database access with Prisma
    const metadata = await prisma.metadata.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!metadata) {
      return { success: false, error: "Metadata not found" }
    }

    return { success: true, data: metadata }
  } catch (error) {
    console.error("Error fetching metadata:", error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to get metadata" }
  }
}

/**
 * Update an existing metadata record
 */
export async function updateMetadata(id: string, data: NGDIMetadataFormData) {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if the metadata exists and belongs to the current user
    const existingMetadata = await prisma.metadata.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existingMetadata) {
      return { success: false, error: "Metadata not found" }
    }

    if (existingMetadata.userId !== userId) {
      return { success: false, error: "Not authorized to update this metadata" }
    }

    // Validate the data against the schema
    const validatedData = ngdiMetadataSchema.parse(data)

    // Ensure we have the data in both formats for backward compatibility
    const formData = {
      ...validatedData,
      form1: validatedData.form1 || validatedData.generalInfo,
      form2: validatedData.form2 || validatedData.dataQuality,
      form3: validatedData.form3 || validatedData.distributionInfo,
      form4: validatedData.form4 || validatedData.accessInfo,
      generalInfo: validatedData.generalInfo || validatedData.form1,
      dataQuality: validatedData.dataQuality || validatedData.form2,
      technicalDetails: validatedData.technicalDetails,
      accessInfo: validatedData.accessInfo || validatedData.form4,
      distributionInfo: validatedData.distributionInfo || validatedData.form3,
    } as NGDIMetadataFormData

    // Transform the form data to the API model
    const apiMetadata = transformFormToApiModel(formData)

    // Get the form1 data from either generalInfo or form1
    const form1Data = (formData.form1 || formData.generalInfo)!

    // Create the metadata record in both the NGDIMetadata table (for backward compatibility)
    // and in the consolidated Metadata table
    const [ngdiMetadata, metadata] = await Promise.all([
      // Create in NGDIMetadata (original table)
      prisma.nGDIMetadata.create({
        data: {
          // Form 1: General Information
          dataType: form1Data.dataInformation.dataType,
          dataName: form1Data.dataInformation.dataName,
          cloudCoverPercentage: form1Data.dataInformation.cloudCoverPercentage,
          productionDate: form1Data.dataInformation.productionDate,

          // Fundamental Datasets (stored as JSON)
          fundamentalDatasets: form1Data.fundamentalDatasets,

          // Description
          abstract: form1Data.description.abstract,
          purpose: form1Data.description.purpose,
          thumbnailUrl: form1Data.description.thumbnail,

          // Spatial Domain
          coordinateUnit: form1Data.spatialDomain.coordinateUnit,
          minLatitude: form1Data.spatialDomain.minLatitude,
          minLongitude: form1Data.spatialDomain.minLongitude,
          maxLatitude: form1Data.spatialDomain.maxLatitude,
          maxLongitude: form1Data.spatialDomain.maxLongitude,

          // Location
          country: form1Data.location.country,
          geopoliticalZone: form1Data.location.geopoliticalZone,
          state: form1Data.location.state,
          lga: form1Data.location.lga,
          townCity: form1Data.location.townCity,

          // Data Status
          assessment: form1Data.dataStatus.assessment,
          updateFrequency: form1Data.dataStatus.updateFrequency,

          // Resource Constraint
          accessConstraints: form1Data.resourceConstraint.accessConstraints,
          useConstraints: form1Data.resourceConstraint.useConstraints,
          otherConstraints: form1Data.resourceConstraint.otherConstraints,

          // Metadata Reference
          metadataCreationDate: form1Data.metadataReference.creationDate,
          metadataReviewDate: form1Data.metadataReference.reviewDate,
          metadataContactName: form1Data.metadataReference.contactName,
          metadataContactAddress: form1Data.metadataReference.address,
          metadataContactEmail: form1Data.metadataReference.email,
          metadataContactPhone: form1Data.metadataReference.phoneNumber,

          // Form 2: Data Quality Information
          // General Section
          logicalConsistencyReport:
            formData.form2.generalSection.logicalConsistencyReport,
          completenessReport: formData.form2.generalSection.completenessReport,

          // Attribute Accuracy
          attributeAccuracyReport:
            formData.form2.attributeAccuracy.accuracyReport,

          // Positional Accuracy (stored as JSON)
          positionalAccuracy: formData.form2.positionalAccuracy,

          // Source Information (stored as JSON)
          sourceInformation: formData.form2.sourceInformation,

          // Data Processing Information
          processingDescription:
            formData.form2.dataProcessingInformation.description,
          softwareVersion:
            formData.form2.dataProcessingInformation.softwareVersion,
          processedDate: formData.form2.dataProcessingInformation.processedDate,

          // Processor Contact Information
          processorName: formData.form2.processorContactInformation.name,
          processorEmail: formData.form2.processorContactInformation.email,
          processorAddress: formData.form2.processorContactInformation.address,

          // Form 3: Data Distribution Information
          // Distributor Information
          distributorName: formData.form3.distributorInformation.name,
          distributorAddress: formData.form3.distributorInformation.address,
          distributorEmail: formData.form3.distributorInformation.email,
          distributorPhone: formData.form3.distributorInformation.phoneNumber,
          distributorWebLink:
            formData.form3.distributorInformation.webLink || null,
          distributorSocialMedia:
            formData.form3.distributorInformation.socialMediaHandle,

          // Distribution Details
          distributionLiability: formData.form3.distributionDetails.liability,
          customOrderProcess:
            formData.form3.distributionDetails.customOrderProcess,
          technicalPrerequisites:
            formData.form3.distributionDetails.technicalPrerequisites,

          // Standard Order Process
          fees: formData.form3.standardOrderProcess.fees,
          turnaroundTime: formData.form3.standardOrderProcess.turnaroundTime,
          orderingInstructions:
            formData.form3.standardOrderProcess.orderingInstructions,
          maximumResponseTime:
            formData.form3.standardOrderProcess.maximumResponseTime ||
            "48 hours",

          // User reference
          userId: userId,
        },
      }),

      // Create in Metadata (unified table)
      prisma.metadata.create({
        data: {
          ...apiMetadata,
          userId,
        },
      }),
    ])

    revalidatePath("/search/metadata")
    revalidatePath(`/metadata/${id}`)

    return { success: true, metadata: updatedMetadata }
  } catch (error) {
    console.error("Error updating metadata:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      }
    }

    return { success: false, error: "Failed to update metadata" }
  }
}
