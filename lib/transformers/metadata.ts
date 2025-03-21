import type {
  Form1Data,
  Form2Data,
  Form3Data,
  TechnicalDetailsData,
  AccessInfoData,
  NGDIMetadataFormData,
  GeneralInfoData,
  DataQualityData,
  DistributionInfoData,
} from "@/types/ngdi-metadata"
import type { MetadataRequest } from "@/types/metadata"

/**
 * Transforms the multi-step form data into a unified API request model
 */
export function transformFormToApiModel(
  formData: NGDIMetadataFormData
): MetadataRequest {
  // Use either new property names or fall back to legacy names
  const generalInfo = formData.generalInfo || formData.form1
  const dataQuality = formData.dataQuality || formData.form2
  const accessInfo = formData.accessInfo || formData.form4
  const { technicalDetails } = formData

  // Extract fundamental datasets as categories
  const categories: string[] = []
  const fundamentalDatasets = generalInfo.fundamentalDatasets

  if (fundamentalDatasets.geodeticData) categories.push("Geodetic Data")
  if (fundamentalDatasets.topographicData) categories.push("Topographic Data")
  if (fundamentalDatasets.cadastralData) categories.push("Cadastral Data")
  if (fundamentalDatasets.administrativeBoundaries)
    categories.push("Administrative Boundaries")
  if (fundamentalDatasets.hydrographicData) categories.push("Hydrographic Data")
  if (fundamentalDatasets.landUseLandCover)
    categories.push("Land Use Land Cover")
  if (fundamentalDatasets.geologicalData) categories.push("Geological Data")
  if (fundamentalDatasets.demographicData) categories.push("Demographic Data")
  if (fundamentalDatasets.digitalImagery) categories.push("Digital Imagery")
  if (fundamentalDatasets.transportationData)
    categories.push("Transportation Data")
  if (
    fundamentalDatasets.others &&
    generalInfo.fundamentalDatasets.otherDescription
  ) {
    categories.push(generalInfo.fundamentalDatasets.otherDescription)
  }

  return {
    // General information from generalInfo
    title: generalInfo.dataInformation.dataName,
    author: dataQuality.processorContactInformation.name,
    organization:
      accessInfo.contactInfo.department || accessInfo.contactInfo.contactPerson,
    dateFrom: generalInfo.dataInformation.productionDate,
    dateTo: generalInfo.dataInformation.productionDate, // Using same date if no range is provided
    abstract: generalInfo.description.abstract,
    purpose: generalInfo.description.purpose,
    thumbnailUrl: generalInfo.description.thumbnail,
    imageName: `${generalInfo.dataInformation.dataName.replace(/\s+/g, "-").toLowerCase()}-thumbnail`,

    // Framework and categorization from generalInfo
    frameworkType: generalInfo.dataInformation.dataType,
    categories,

    // Spatial information from technicalDetails
    coordinateSystem: technicalDetails.spatialInformation.coordinateSystem,
    projection: technicalDetails.spatialInformation.projection,
    scale: technicalDetails.spatialInformation.scale,
    resolution: technicalDetails.spatialInformation.resolution,

    // Quality information from dataQuality
    accuracyLevel:
      dataQuality.positionalAccuracy?.horizontal?.accuracyReport || "Standard",
    completeness: dataQuality.positionalAccuracy?.horizontal?.percentValue,
    consistencyCheck: true,
    validationStatus: "Validated",

    // File information from technicalDetails
    fileFormat: technicalDetails.technicalSpecifications.fileFormat,
    fileSize: technicalDetails.technicalSpecifications.fileSize,
    numFeatures: technicalDetails.technicalSpecifications.numFeatures,
    softwareReqs: technicalDetails.technicalSpecifications.softwareReqs,

    // Update information from generalInfo and dataQuality
    updateCycle: generalInfo.dataStatus.updateFrequency,
    lastUpdate: dataQuality.dataProcessingInformation.processedDate,

    // Distribution information from accessInfo
    distributionFormat: accessInfo.distributionInfo.distributionFormat,
    accessMethod: accessInfo.distributionInfo.accessMethod,
    downloadUrl: accessInfo.distributionInfo.downloadUrl || undefined,
    apiEndpoint: accessInfo.distributionInfo.apiEndpoint || undefined,

    // License information from accessInfo
    licenseType: accessInfo.licenseInfo.licenseType,
    usageTerms: accessInfo.licenseInfo.usageTerms,
    attributionRequirements: accessInfo.licenseInfo.attributionRequirements,
    accessRestrictions: accessInfo.licenseInfo.accessRestrictions,

    // Contact information from accessInfo
    contactPerson: accessInfo.contactInfo.contactPerson,
    email: accessInfo.contactInfo.email,
    department: accessInfo.contactInfo.department,
  }
}

/**
 * Transforms API response model back to form data structure
 * for editing existing metadata
 */
export function transformApiToFormModel(
  apiData: MetadataRequest
): NGDIMetadataFormData {
  // Helper function to check if a category exists
  const hasCategory = (name: string) =>
    apiData.categories.some((cat) =>
      cat.toLowerCase().includes(name.toLowerCase())
    )

  // General Information
  const generalInfo: GeneralInfoData = {
    dataInformation: {
      dataType: apiData.frameworkType as "Raster" | "Vector" | "Table",
      dataName: apiData.title,
      cloudCoverPercentage: "",
      productionDate: apiData.dateFrom,
    },
    fundamentalDatasets: {
      geodeticData: hasCategory("geodetic"),
      topographicData: hasCategory("topographic"),
      cadastralData: hasCategory("cadastral"),
      administrativeBoundaries: hasCategory("administrative"),
      hydrographicData: hasCategory("hydrographic"),
      landUseLandCover: hasCategory("land use"),
      geologicalData: hasCategory("geological"),
      demographicData: hasCategory("demographic"),
      digitalImagery: hasCategory("imagery"),
      transportationData: hasCategory("transportation"),
      others: false,
      otherDescription: "",
    },
    description: {
      abstract: apiData.abstract,
      purpose: apiData.purpose,
      thumbnail: apiData.thumbnailUrl,
    },
    spatialDomain: {
      coordinateUnit: apiData.coordinateSystem as "DD" | "DMS",
      minLatitude: 0, // Default values - these would need to be populated from elsewhere
      minLongitude: 0,
      maxLatitude: 0,
      maxLongitude: 0,
    },
    location: {
      country: "Nigeria", // Default values
      geopoliticalZone: "",
      state: "",
      lga: "",
      townCity: "",
    },
    dataStatus: {
      assessment: "Complete" as "Complete" | "Incomplete",
      updateFrequency: (apiData.updateCycle || "Annually") as
        | "Monthly"
        | "Quarterly"
        | "Bi-Annually"
        | "Annually",
    },
    resourceConstraint: {
      accessConstraints: apiData.accessRestrictions[0] || "",
      useConstraints: apiData.usageTerms,
      otherConstraints: apiData.attributionRequirements,
    },
    metadataReference: {
      creationDate: new Date().toISOString(),
      reviewDate: new Date().toISOString(),
      contactName: apiData.contactPerson,
      address: apiData.department || "",
      email: apiData.email,
      phoneNumber: "",
    },
  }

  // Data Quality
  const dataQuality: DataQualityData = {
    generalSection: {
      logicalConsistencyReport: "",
      completenessReport: "",
    },
    attributeAccuracy: {
      accuracyReport: "",
    },
    positionalAccuracy: {
      horizontal: {
        accuracyReport: apiData.accuracyLevel,
        percentValue: apiData.completeness || 100,
        explanation: "",
      },
      vertical: {
        accuracyReport: "",
        percentValue: 0,
        explanation: "",
      },
    },
    sourceInformation: {
      sourceScaleDenominator: apiData.resolution
        ? parseInt(apiData.resolution)
        : undefined,
      sourceMediaType: "",
      sourceCitation: "",
      citationTitle: "",
      contractReference: "",
      contractDate: "",
    },
    dataProcessingInformation: {
      description: "Standard processing workflow",
      softwareVersion: "",
      processedDate: apiData.lastUpdate || new Date().toISOString(),
    },
    processorContactInformation: {
      name: apiData.author,
      email: apiData.email,
      address: apiData.department || "",
    },
  }

  // Technical Details
  const technicalDetails: TechnicalDetailsData = {
    spatialInformation: {
      coordinateSystem: apiData.coordinateSystem,
      projection: apiData.projection,
      scale: apiData.scale,
      resolution: apiData.resolution,
    },
    technicalSpecifications: {
      fileFormat: apiData.fileFormat,
      fileSize: apiData.fileSize,
      numFeatures: apiData.numFeatures,
      softwareReqs: apiData.softwareReqs || "",
    },
  }

  // Access Information
  const accessInfo: AccessInfoData = {
    distributionInfo: {
      distributionFormat: apiData.distributionFormat,
      accessMethod: apiData.accessMethod,
      downloadUrl: apiData.downloadUrl || "",
      apiEndpoint: apiData.apiEndpoint || "",
    },
    licenseInfo: {
      licenseType: apiData.licenseType,
      usageTerms: apiData.usageTerms,
      attributionRequirements: apiData.attributionRequirements,
      accessRestrictions: apiData.accessRestrictions || [],
    },
    contactInfo: {
      contactPerson: apiData.contactPerson,
      email: apiData.email,
      department: apiData.department || "",
      phone: "",
    },
  }

  // Distribution Info (for backward compatibility)
  const distributionInfo: DistributionInfoData = {
    distributorInformation: {
      name: apiData.organization,
      address: apiData.department || "",
      email: apiData.email,
      phoneNumber: "",
      webLink: apiData.downloadUrl || "",
      socialMediaHandle: "",
      isCustodian: true,
    },
    distributionDetails: {
      liability: "Standard liability terms apply",
      customOrderProcess: "Contact distributor for custom orders",
      technicalPrerequisites: apiData.softwareReqs || "Standard GIS software",
    },
    standardOrderProcess: {
      fees: "Please contact for pricing",
      turnaroundTime: "Typically 3-5 business days",
      orderingInstructions: "Contact via email or phone",
      maximumResponseTime: "5 business days",
    },
  }

  // Return with both new and legacy property names
  return {
    generalInfo,
    dataQuality,
    technicalDetails,
    accessInfo,
    distributionInfo,
    // Legacy names for backward compatibility
    form1: generalInfo,
    form2: dataQuality,
    form3: distributionInfo,
    form4: accessInfo,
  }
}
