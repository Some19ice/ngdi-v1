import { metadataRepository } from "../db/repositories/metadata.repository"
import { userRepository } from "../db/repositories/user.repository"
import { ApiError, ErrorCode } from "../middleware/error-handler"
import {
  MetadataRequest,
  MetadataResponse,
  MetadataSearchQuery,
  MetadataSearchResponse,
} from "../types/metadata.types"
import { UserRole } from "../types/auth.types"

/**
 * Metadata service
 */
export const metadataService = {
  /**
   * Create new metadata
   */
  createMetadata: async (
    userId: string,
    data: MetadataRequest
  ): Promise<MetadataResponse> => {
    // Check if user exists
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new ApiError("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND)
    }

    // Create metadata
    const metadata = await metadataRepository.create({
      ...data,
      user: {
        connect: {
          id: userId,
        },
      },
    })

    return {
      id: metadata.id,
      title: metadata.title,
      author: metadata.author,
      organization: metadata.organization,
      dateFrom: metadata.dateFrom,
      dateTo: metadata.dateTo,
      abstract: metadata.abstract,
      purpose: metadata.purpose,
      thumbnailUrl: metadata.thumbnailUrl,
      imageName: metadata.imageName,
      frameworkType: metadata.frameworkType,
      categories: metadata.categories,
      coordinateSystem: metadata.coordinateSystem,
      projection: metadata.projection,
      scale: metadata.scale,
      resolution: metadata.resolution || undefined,
      accuracyLevel: metadata.accuracyLevel,
      completeness: metadata.completeness || undefined,
      consistencyCheck: metadata.consistencyCheck || undefined,
      validationStatus: metadata.validationStatus || undefined,
      fileFormat: metadata.fileFormat,
      fileSize: metadata.fileSize || undefined,
      numFeatures: metadata.numFeatures || undefined,
      softwareReqs: metadata.softwareReqs || undefined,
      updateCycle: metadata.updateCycle || undefined,
      lastUpdate: metadata.lastUpdate?.toISOString() || undefined,
      nextUpdate: metadata.nextUpdate?.toISOString() || undefined,
      distributionFormat: metadata.distributionFormat,
      accessMethod: metadata.accessMethod,
      downloadUrl: metadata.downloadUrl || undefined,
      apiEndpoint: metadata.apiEndpoint || undefined,
      licenseType: metadata.licenseType,
      usageTerms: metadata.usageTerms,
      attributionRequirements: metadata.attributionRequirements,
      accessRestrictions: metadata.accessRestrictions,
      contactPerson: metadata.contactPerson,
      email: metadata.email,
      department: metadata.department || undefined,
      userId: metadata.userId,
      createdAt: metadata.createdAt.toISOString(),
      updatedAt: metadata.updatedAt.toISOString(),
    }
  },

  /**
   * Get metadata by ID
   */
  getMetadataById: async (id: string): Promise<MetadataResponse> => {
    const metadata = await metadataRepository.findById(id)

    if (!metadata) {
      throw new ApiError(
        "Metadata not found",
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      )
    }

    return {
      id: metadata.id,
      title: metadata.title,
      author: metadata.author,
      organization: metadata.organization,
      dateFrom: metadata.dateFrom,
      dateTo: metadata.dateTo,
      abstract: metadata.abstract,
      purpose: metadata.purpose,
      thumbnailUrl: metadata.thumbnailUrl,
      imageName: metadata.imageName,
      frameworkType: metadata.frameworkType,
      categories: metadata.categories,
      coordinateSystem: metadata.coordinateSystem,
      projection: metadata.projection,
      scale: metadata.scale,
      resolution: metadata.resolution || undefined,
      accuracyLevel: metadata.accuracyLevel,
      completeness: metadata.completeness || undefined,
      consistencyCheck: metadata.consistencyCheck || undefined,
      validationStatus: metadata.validationStatus || undefined,
      fileFormat: metadata.fileFormat,
      fileSize: metadata.fileSize || undefined,
      numFeatures: metadata.numFeatures || undefined,
      softwareReqs: metadata.softwareReqs || undefined,
      updateCycle: metadata.updateCycle || undefined,
      lastUpdate: metadata.lastUpdate?.toISOString() || undefined,
      nextUpdate: metadata.nextUpdate?.toISOString() || undefined,
      distributionFormat: metadata.distributionFormat,
      accessMethod: metadata.accessMethod,
      downloadUrl: metadata.downloadUrl || undefined,
      apiEndpoint: metadata.apiEndpoint || undefined,
      licenseType: metadata.licenseType,
      usageTerms: metadata.usageTerms,
      attributionRequirements: metadata.attributionRequirements,
      accessRestrictions: metadata.accessRestrictions,
      contactPerson: metadata.contactPerson,
      email: metadata.email,
      department: metadata.department || undefined,
      userId: metadata.userId,
      createdAt: metadata.createdAt.toISOString(),
      updatedAt: metadata.updatedAt.toISOString(),
    }
  },

  /**
   * Update metadata
   */
  updateMetadata: async (
    id: string,
    userId: string,
    userRole: UserRole,
    data: MetadataRequest
  ): Promise<MetadataResponse> => {
    const metadata = await metadataRepository.findById(id)

    if (!metadata) {
      throw new ApiError(
        "Metadata not found",
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      )
    }

    // Check if user is authorized to update this metadata
    if (metadata.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ApiError(
        "Unauthorized to update this metadata",
        403,
        ErrorCode.AUTHORIZATION_ERROR
      )
    }

    // Update metadata
    const updatedMetadata = await metadataRepository.update(id, data)

    return {
      id: updatedMetadata.id,
      title: updatedMetadata.title,
      author: updatedMetadata.author,
      organization: updatedMetadata.organization,
      dateFrom: updatedMetadata.dateFrom,
      dateTo: updatedMetadata.dateTo,
      abstract: updatedMetadata.abstract,
      purpose: updatedMetadata.purpose,
      thumbnailUrl: updatedMetadata.thumbnailUrl,
      imageName: updatedMetadata.imageName,
      frameworkType: updatedMetadata.frameworkType,
      categories: updatedMetadata.categories,
      coordinateSystem: updatedMetadata.coordinateSystem,
      projection: updatedMetadata.projection,
      scale: updatedMetadata.scale,
      resolution: updatedMetadata.resolution || undefined,
      accuracyLevel: updatedMetadata.accuracyLevel,
      completeness: updatedMetadata.completeness || undefined,
      consistencyCheck: updatedMetadata.consistencyCheck || undefined,
      validationStatus: updatedMetadata.validationStatus || undefined,
      fileFormat: updatedMetadata.fileFormat,
      fileSize: updatedMetadata.fileSize || undefined,
      numFeatures: updatedMetadata.numFeatures || undefined,
      softwareReqs: updatedMetadata.softwareReqs || undefined,
      updateCycle: updatedMetadata.updateCycle || undefined,
      lastUpdate: updatedMetadata.lastUpdate?.toISOString() || undefined,
      nextUpdate: updatedMetadata.nextUpdate?.toISOString() || undefined,
      distributionFormat: updatedMetadata.distributionFormat,
      accessMethod: updatedMetadata.accessMethod,
      downloadUrl: updatedMetadata.downloadUrl || undefined,
      apiEndpoint: updatedMetadata.apiEndpoint || undefined,
      licenseType: updatedMetadata.licenseType,
      usageTerms: updatedMetadata.usageTerms,
      attributionRequirements: updatedMetadata.attributionRequirements,
      accessRestrictions: updatedMetadata.accessRestrictions,
      contactPerson: updatedMetadata.contactPerson,
      email: updatedMetadata.email,
      department: updatedMetadata.department || undefined,
      userId: updatedMetadata.userId,
      createdAt: updatedMetadata.createdAt.toISOString(),
      updatedAt: updatedMetadata.updatedAt.toISOString(),
    }
  },

  /**
   * Delete metadata
   */
  deleteMetadata: async (
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> => {
    const metadata = await metadataRepository.findById(id)

    if (!metadata) {
      throw new ApiError(
        "Metadata not found",
        404,
        ErrorCode.RESOURCE_NOT_FOUND
      )
    }

    // Check if user is authorized to delete this metadata
    if (metadata.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ApiError(
        "Unauthorized to delete this metadata",
        403,
        ErrorCode.AUTHORIZATION_ERROR
      )
    }

    await metadataRepository.delete(id)
  },

  /**
   * Search metadata
   */
  searchMetadata: async (
    query: MetadataSearchQuery
  ): Promise<MetadataSearchResponse> => {
    const result = await metadataRepository.findAll(query)

    return {
      metadata: result.metadata.map((metadata) => ({
        id: metadata.id,
        title: metadata.title,
        author: metadata.author,
        organization: metadata.organization,
        dateFrom: metadata.dateFrom,
        dateTo: metadata.dateTo,
        abstract: metadata.abstract,
        purpose: metadata.purpose,
        thumbnailUrl: metadata.thumbnailUrl,
        imageName: metadata.imageName,
        frameworkType: metadata.frameworkType,
        categories: metadata.categories,
        coordinateSystem: metadata.coordinateSystem,
        projection: metadata.projection,
        scale: metadata.scale,
        resolution: metadata.resolution || undefined,
        accuracyLevel: metadata.accuracyLevel,
        completeness: metadata.completeness || undefined,
        consistencyCheck: metadata.consistencyCheck || undefined,
        validationStatus: metadata.validationStatus || undefined,
        fileFormat: metadata.fileFormat,
        fileSize: metadata.fileSize || undefined,
        numFeatures: metadata.numFeatures || undefined,
        softwareReqs: metadata.softwareReqs || undefined,
        updateCycle: metadata.updateCycle || undefined,
        lastUpdate: metadata.lastUpdate?.toISOString() || undefined,
        nextUpdate: metadata.nextUpdate?.toISOString() || undefined,
        distributionFormat: metadata.distributionFormat,
        accessMethod: metadata.accessMethod,
        downloadUrl: metadata.downloadUrl || undefined,
        apiEndpoint: metadata.apiEndpoint || undefined,
        licenseType: metadata.licenseType,
        usageTerms: metadata.usageTerms,
        attributionRequirements: metadata.attributionRequirements,
        accessRestrictions: metadata.accessRestrictions,
        contactPerson: metadata.contactPerson,
        email: metadata.email,
        department: metadata.department || undefined,
        userId: metadata.userId,
        createdAt: metadata.createdAt.toISOString(),
        updatedAt: metadata.updatedAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    }
  },

  /**
   * Get user's metadata
   */
  getUserMetadata: async (
    userId: string,
    query: MetadataSearchQuery
  ): Promise<MetadataSearchResponse> => {
    const result = await metadataRepository.findByUserId(userId, query)

    return {
      metadata: result.metadata.map((metadata) => ({
        id: metadata.id,
        title: metadata.title,
        author: metadata.author,
        organization: metadata.organization,
        dateFrom: metadata.dateFrom,
        dateTo: metadata.dateTo,
        abstract: metadata.abstract,
        purpose: metadata.purpose,
        thumbnailUrl: metadata.thumbnailUrl,
        imageName: metadata.imageName,
        frameworkType: metadata.frameworkType,
        categories: metadata.categories,
        coordinateSystem: metadata.coordinateSystem,
        projection: metadata.projection,
        scale: metadata.scale,
        resolution: metadata.resolution || undefined,
        accuracyLevel: metadata.accuracyLevel,
        completeness: metadata.completeness || undefined,
        consistencyCheck: metadata.consistencyCheck || undefined,
        validationStatus: metadata.validationStatus || undefined,
        fileFormat: metadata.fileFormat,
        fileSize: metadata.fileSize || undefined,
        numFeatures: metadata.numFeatures || undefined,
        softwareReqs: metadata.softwareReqs || undefined,
        updateCycle: metadata.updateCycle || undefined,
        lastUpdate: metadata.lastUpdate?.toISOString() || undefined,
        nextUpdate: metadata.nextUpdate?.toISOString() || undefined,
        distributionFormat: metadata.distributionFormat,
        accessMethod: metadata.accessMethod,
        downloadUrl: metadata.downloadUrl || undefined,
        apiEndpoint: metadata.apiEndpoint || undefined,
        licenseType: metadata.licenseType,
        usageTerms: metadata.usageTerms,
        attributionRequirements: metadata.attributionRequirements,
        accessRestrictions: metadata.accessRestrictions,
        contactPerson: metadata.contactPerson,
        email: metadata.email,
        department: metadata.department || undefined,
        userId: metadata.userId,
        createdAt: metadata.createdAt.toISOString(),
        updatedAt: metadata.updatedAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    }
  },
}
