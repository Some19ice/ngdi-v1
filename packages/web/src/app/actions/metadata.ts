"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { transformFormToApiModel } from "@/lib/transformers/metadata"
import { validateJwtToken } from "@/lib/auth-client"

// Function to get the current user ID from the auth token
async function getCurrentUserId(): Promise<string | null> {
  const authToken = cookies().get("auth_token")?.value

  if (!authToken) {
    console.error("Auth token is missing - user will be unauthorized")
    return null
  }

  try {
    // Validate and decode the token using the auth-client library
    const validationResult = await validateJwtToken(authToken)

    if (!validationResult.isValid) {
      console.error("Invalid auth token:", validationResult.error)
      return null
    }

    // Return the validated user ID from the token
    return validationResult.userId || null
  } catch (error) {
    console.error("Error validating auth token:", error)
    return null
  }
}

// Create schemas for the new consolidated structure
const generalInfoSchema = z.object({
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
      [
        "Daily",
        "Weekly",
        "Monthly",
        "Quarterly",
        "Bi-Annually",
        "Annually",
        "Others",
      ],
      {
        required_error: "Update frequency is required",
      }
    ),
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

const technicalDetailsSchema = z.object({
  spatialInformation: z.object({
    coordinateSystem: z.string().min(1, "Coordinate system is required"),
    projection: z.string().min(1, "Projection is required"),
    scale: z.coerce.number().min(1, "Scale is required"),
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

const dataQualitySchema = z.object({
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

const accessInfoSchema = z.object({
  distributionInfo: z.object({
    distributionFormat: z.string().min(1, "Distribution format is required"),
    accessMethod: z.string().min(1, "Access method is required"),
    downloadUrl: z.string().url().optional().or(z.literal("")),
    apiEndpoint: z.string().url().optional().or(z.literal("")),
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
    email: z.string().email("Invalid email address"),
    department: z.string().optional(),
    phone: z.string().optional(),
  }),
})

// Optional distribution info schema (legacy support)
const distributionInfoSchema = z
  .object({
    // Distributor Information
    distributorInformation: z.object({
      name: z.string().min(1, "Distributor name is required"),
      address: z.string().min(1, "Distributor address is required"),
      email: z.string().email("Invalid email address"),
      phoneNumber: z.string().min(1, "Phone number is required"),
      webLink: z.string().url().optional().or(z.literal("")),
      socialMediaHandle: z.string().optional(),
      isCustodian: z.boolean().default(true),
      custodianName: z.string().optional(),
      custodianContact: z.string().optional(),
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
      maximumResponseTime: z
        .string()
        .min(1, "Maximum response time is required"),
    }),
  })
  .optional()

// Combined schema for the complete metadata
const ngdiMetadataSchema = z.object({
  generalInfo: generalInfoSchema,
  technicalDetails: technicalDetailsSchema,
  dataQuality: dataQualitySchema,
  accessInfo: accessInfoSchema,
  distributionInfo: distributionInfoSchema,
})

export type Form1Data = z.infer<typeof generalInfoSchema>
export type Form2Data = z.infer<typeof dataQualitySchema>
export type Form3Data = z.infer<typeof distributionInfoSchema>
export type NGDIMetadataFormData = z.infer<typeof ngdiMetadataSchema>

export async function createMetadata(data: any) {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate the data against the schema
    const validatedData = ngdiMetadataSchema.parse(data)

    // Transform the form data to the API model
    const apiMetadata = transformFormToApiModel(
      validatedData as NGDIMetadataFormData
    )

    // First prepare the combined data without duplication
    const metadataData = {
      // Required fields for the Metadata table
      title: validatedData.generalInfo.dataInformation.dataName, // Use dataName as title
      dataName: validatedData.generalInfo.dataInformation.dataName,
      userId,

      // Rest of the fields from validatedData
      dataType: validatedData.generalInfo.dataInformation.dataType,
      productionDate: validatedData.generalInfo.dataInformation.productionDate,
      cloudCoverPercentage:
        validatedData.generalInfo.dataInformation.cloudCoverPercentage,

      // Ensure these fields are properly set
      fundamentalDatasets: validatedData.generalInfo.fundamentalDatasets,
      abstract: validatedData.generalInfo.description.abstract,
      purpose: validatedData.generalInfo.description.purpose,
      thumbnailUrl: validatedData.generalInfo.description.thumbnail,

      // Other required fields
      author: validatedData.accessInfo.contactInfo.contactPerson,
      organization: validatedData.accessInfo.contactInfo.department || "",
    }

    // Then create the consolidated record
    const metadata = await prisma.metadata.create({
      data: {
        ...metadataData,
        // Only add fields from apiMetadata that don't conflict with metadataData
        ...Object.entries(apiMetadata).reduce((acc, [key, value]) => {
          if (!(key in metadataData)) {
            acc[key] = value
          }
          return acc
        }, {} as any),
      },
    })

    revalidatePath("/metadata")
    revalidatePath("/search/metadata")
    return {
      success: true,
      data: {
        id: metadata.id,
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
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { purpose: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
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
export async function updateMetadata(id: string, data: any) {
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

    // Transform the form data to the API model
    const apiMetadata = transformFormToApiModel(
      validatedData as NGDIMetadataFormData
    )

    // Update the metadata record - creates a new version in the original table
    // and updates the consolidated table
    const [_, updatedMetadata] = await Promise.all([
      prisma.metadata.create({
        data: {
          // Required title field - using dataName as title
          title: validatedData.generalInfo.dataInformation.dataName,

          // General Information
          dataType: validatedData.generalInfo.dataInformation.dataType,
          dataName: validatedData.generalInfo.dataInformation.dataName,
          cloudCoverPercentage:
            validatedData.generalInfo.dataInformation.cloudCoverPercentage,
          productionDate:
            validatedData.generalInfo.dataInformation.productionDate,

          // Fundamental Datasets (stored as JSON)
          fundamentalDatasets: validatedData.generalInfo.fundamentalDatasets,

          // Description
          abstract: validatedData.generalInfo.description.abstract,
          purpose: validatedData.generalInfo.description.purpose,
          thumbnailUrl: validatedData.generalInfo.description.thumbnail,

          // Spatial Domain
          coordinateUnit:
            validatedData.technicalDetails.spatialDomain.coordinateUnit,
          minLatitude: validatedData.technicalDetails.spatialDomain.minLatitude,
          minLongitude:
            validatedData.technicalDetails.spatialDomain.minLongitude,
          maxLatitude: validatedData.technicalDetails.spatialDomain.maxLatitude,
          maxLongitude:
            validatedData.technicalDetails.spatialDomain.maxLongitude,

          // Location
          country: validatedData.generalInfo.location.country,
          geopoliticalZone: validatedData.generalInfo.location.geopoliticalZone,
          state: validatedData.generalInfo.location.state,
          lga: validatedData.generalInfo.location.lga,
          townCity: validatedData.generalInfo.location.townCity,

          // Data Status
          assessment: validatedData.generalInfo.dataStatus.assessment,
          updateFrequency: validatedData.generalInfo.dataStatus.updateFrequency,

          // Resource Constraint
          accessConstraints:
            validatedData.technicalDetails.resourceConstraint.accessConstraints,
          useConstraints:
            validatedData.technicalDetails.resourceConstraint.useConstraints,
          otherConstraints:
            validatedData.technicalDetails.resourceConstraint.otherConstraints,

          // Metadata Reference
          metadataCreationDate:
            validatedData.generalInfo.metadataReference.creationDate,
          metadataReviewDate:
            validatedData.generalInfo.metadataReference.reviewDate,
          metadataContactName:
            validatedData.generalInfo.metadataReference.contactName,
          metadataContactAddress:
            validatedData.generalInfo.metadataReference.address,
          metadataContactEmail:
            validatedData.generalInfo.metadataReference.email,
          metadataContactPhone:
            validatedData.generalInfo.metadataReference.phoneNumber,

          // Data Quality Information
          // General Section
          logicalConsistencyReport:
            validatedData.dataQuality.generalSection.logicalConsistencyReport,
          completenessReport:
            validatedData.dataQuality.generalSection.completenessReport,

          // Attribute Accuracy
          attributeAccuracyReport:
            validatedData.dataQuality.attributeAccuracy.accuracyReport,

          // Positional Accuracy (stored as JSON)
          positionalAccuracy: validatedData.dataQuality.positionalAccuracy,

          // Source Information (stored as JSON)
          sourceInformation: validatedData.dataQuality.sourceInformation,

          // Data Processing Information
          processingDescription:
            validatedData.dataQuality.dataProcessingInformation.description,
          softwareVersion:
            validatedData.dataQuality.dataProcessingInformation.softwareVersion,
          processedDate:
            validatedData.dataQuality.dataProcessingInformation.processedDate,

          // Processor Contact Information
          processorName:
            validatedData.dataQuality.processorContactInformation.name,
          processorEmail:
            validatedData.dataQuality.processorContactInformation.email,
          processorAddress:
            validatedData.dataQuality.processorContactInformation.address,

          // Distribution Information
          // Distributor Information
          distributorName:
            validatedData.distributionInfo?.distributorInformation.name ||
            validatedData.accessInfo.contactInfo.contactPerson,
          distributorAddress:
            validatedData.distributionInfo?.distributorInformation.address ||
            validatedData.accessInfo.contactInfo.department ||
            "",
          distributorEmail:
            validatedData.distributionInfo?.distributorInformation.email ||
            validatedData.accessInfo.contactInfo.email,
          distributorPhone:
            validatedData.distributionInfo?.distributorInformation
              .phoneNumber ||
            validatedData.accessInfo.contactInfo.phone ||
            "",
          distributorWebLink:
            validatedData.distributionInfo?.distributorInformation.webLink ||
            null,
          distributorSocialMedia:
            validatedData.distributionInfo?.distributorInformation
              .socialMediaHandle || "",

          // Distribution Details
          distributionLiability:
            validatedData.distributionInfo?.distributionDetails.liability ||
            validatedData.accessInfo.licenseInfo.usageTerms,
          customOrderProcess:
            validatedData.distributionInfo?.distributionDetails
              .customOrderProcess || "Contact for custom orders",
          technicalPrerequisites:
            validatedData.distributionInfo?.distributionDetails
              .technicalPrerequisites ||
            validatedData.technicalDetails.technicalSpecifications
              .softwareReqs ||
            "",

          // Standard Order Process
          fees:
            validatedData.distributionInfo?.standardOrderProcess.fees ||
            "Please contact for pricing",
          turnaroundTime:
            validatedData.distributionInfo?.standardOrderProcess
              .turnaroundTime || "Typically 3-5 business days",
          orderingInstructions:
            validatedData.distributionInfo?.standardOrderProcess
              .orderingInstructions || "Contact via email or phone",
          maximumResponseTime:
            validatedData.distributionInfo?.standardOrderProcess
              .maximumResponseTime || "5 business days",

          // User reference
          userId: userId,
        },
      }),

      // Update in Metadata (unified table)
      prisma.metadata.update({
        where: { id },
        data: {
          ...apiMetadata,
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

/**
 * Server action to get admin metadata with pagination and filters
 */
export async function getAdminMetadata({
  page = 1,
  limit = 10,
  search = "",
  category = "",
  status = "",
  validationStatus = "",
  organization = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: string
  validationStatus?: string
  organization?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}) {
  console.log("Fetching admin metadata with params:", {
    page,
    limit,
    search,
    category,
    status,
    validationStatus,
    organization,
    sortBy,
    sortOrder,
  })
  
  try {
    // Get the base metadata using direct Prisma query instead of searchMetadata
    // to avoid potential issues with the result structure

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build the where clause for filtering
    const where: any = {}

    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { purpose: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
      ]
    }

    // Add category filter if provided
    if (category && category !== "All Categories") {
      if (where.OR) {
        where.AND = [
          ...(where.AND || []),
          { frameworkType: { equals: category, mode: "insensitive" } },
        ]
      } else {
        where.frameworkType = { equals: category, mode: "insensitive" }
      }
    }

    // Add organization filter if provided
    if (organization) {
      if (where.OR || where.AND) {
        where.AND = [
          ...(where.AND || []),
          { organization: { contains: organization, mode: "insensitive" } },
        ]
      } else {
        where.organization = { contains: organization, mode: "insensitive" }
      }
    }

    // In a real application, we'd add status and validationStatus to the database query
    // For now, we'll handle it in memory after fetching the results

    // Get total count for pagination - this should ideally include all filters
    const total = await prisma.metadata.count({ where })

    // Get metadata items with pagination and sorting
    const metadataItems = await prisma.metadata.findMany({
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
        dataType: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Transform to admin metadata with status information
    const adminMetadata = metadataItems.map((item: any) => ({
      ...item,
      // In a real app, these would come from the database
      // For now, we're using simulated data
      status: "Published", // Default status - in a real app, this would come from DB
      validationStatus: "Validated", // Default validation status
      downloads: Math.floor(Math.random() * 200), // Mock data - would be real in production
      views: Math.floor(Math.random() * 1000), // Mock data - would be real in production
      tags: item.dataType ? [item.dataType.toLowerCase()] : [], // Use dataType as tag
      lastModified: item.updatedAt || item.createdAt,
    }))

    // Filter by status and validationStatus if provided
    let filteredMetadata = adminMetadata

    if (status && status !== "All Statuses") {
      filteredMetadata = filteredMetadata.filter(
        (item: any) => item.status === status
      )
    }

    if (validationStatus && validationStatus !== "All Validations") {
      filteredMetadata = filteredMetadata.filter(
        (item: any) => item.validationStatus === validationStatus
      )
    }

    // Calculate the correct total and pages based on filtered results
    const filteredTotal = filteredMetadata.length
    const totalPages = Math.ceil(filteredTotal / limit)

    return {
      metadata: filteredMetadata,
      total: filteredTotal,
      currentPage: page,
      limit,
      totalPages,
    }
  } catch (error) {
    console.error("Error fetching admin metadata:", error)
    
    // Return empty data on error
    return {
      metadata: [],
      total: 0,
      currentPage: page,
      limit,
      totalPages: 0
    }
  }
}
