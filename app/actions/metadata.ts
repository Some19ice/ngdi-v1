"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

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
const ngdiMetadataSchema = z.object({
  form1: form1Schema,
  form2: form2Schema,
  form3: form3Schema,
})

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

    // Create the metadata record in both the NGDIMetadata table (for backward compatibility)
    // and in the consolidated Metadata table
    const [ngdiMetadata, metadata] = await Promise.all([
      // Create in NGDIMetadata (original table)
      prisma.nGDIMetadata.create({
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
          metadataContactName:
            validatedData.form1.metadataReference.contactName,
          metadataContactAddress: validatedData.form1.metadataReference.address,
          metadataContactEmail: validatedData.form1.metadataReference.email,
          metadataContactPhone:
            validatedData.form1.metadataReference.phoneNumber,

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
            validatedData.form2.dataProcessingInformation.softwareVersion,
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
          distributorAddress:
            validatedData.form3.distributorInformation.address,
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
          fees: validatedData.form3.standardOrderProcess.fees,
          turnaroundTime:
            validatedData.form3.standardOrderProcess.turnaroundTime,
          orderingInstructions:
            validatedData.form3.standardOrderProcess.orderingInstructions,
          maximumResponseTime:
            validatedData.form3.standardOrderProcess.maximumResponseTime ||
            "48 hours",

          // User reference
          userId: userId,
        },
      }),
      // Create in Metadata (consolidated table)
      prisma.metadata.create({
        data: {
          // Map NGDI metadata to standard metadata fields
          title: validatedData.form1.dataInformation.dataName,
          author: validatedData.form3.distributorInformation.name,
          organization: validatedData.form3.distributorInformation.name,
          dateFrom: validatedData.form1.dataInformation.productionDate,
          dateTo: validatedData.form1.dataInformation.productionDate,
          abstract: validatedData.form1.description.abstract,
          purpose: validatedData.form1.description.purpose,
          thumbnailUrl: validatedData.form1.description.thumbnail,
          imageName: `${validatedData.form1.dataInformation.dataName.toLowerCase().replace(/\s+/g, "-")}.png`,
          frameworkType: validatedData.form1.dataInformation.dataType,
          categories: [validatedData.form1.dataInformation.dataType],
          coordinateSystem: "WGS 84",
          projection: "UTM Zone 32N",
          scale: 50000, // Default
          resolution: null,
          accuracyLevel: "Medium", // Default
          completeness: 100, // Default
          consistencyCheck: true, // Default
          validationStatus: "Validated", // Default
          fileFormat: "Shapefile", // Default
          fileSize: null,
          distributionFormat: "Shapefile, GeoJSON", // Default
          accessMethod: "Direct Download", // Default
          downloadUrl: null,
          apiEndpoint: null,
          licenseType: "NGDI Open Data License", // Default
          usageTerms: validatedData.form1.resourceConstraint.useConstraints,
          attributionRequirements:
            validatedData.form1.resourceConstraint.accessConstraints,
          accessRestrictions: [],
          contactPerson: validatedData.form1.metadataReference.contactName,
          email: validatedData.form1.metadataReference.email,
          department: validatedData.form3.distributorInformation.name,
          updateCycle: validatedData.form1.dataStatus.updateFrequency,
          userId: userId,
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
