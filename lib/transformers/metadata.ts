import type {
  Form1Data,
  Form2Data,
  Form3Data,
  TechnicalDetailsData,
  AccessInfoData,
  NGDIMetadataFormData,
} from "@/types/ngdi-metadata"
import type { MetadataRequest } from "@/types/metadata"

/**
 * Transforms the multi-step form data into a unified API request model
 */
export function transformFormToApiModel(
  formData: NGDIMetadataFormData
): MetadataRequest {
  const { form1, technicalDetails, form2, form4 } = formData

  // Extract fundamental datasets as categories
  const categories: string[] = []
  const fundamentalDatasets = form1.fundamentalDatasets

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
    form1.fundamentalDatasets.otherDescription
  ) {
    categories.push(form1.fundamentalDatasets.otherDescription)
  }

  return {
    // General information from form1
    title: form1.dataInformation.dataName,
    author: form2.processorContactInformation.name,
    organization:
      form4.contactInfo.department || form4.contactInfo.contactPerson,
    dateFrom: form1.dataInformation.productionDate,
    dateTo: form1.dataInformation.productionDate, // Using same date if no range is provided
    abstract: form1.description.abstract,
    purpose: form1.description.purpose,
    thumbnailUrl: form1.description.thumbnail,
    imageName: `${form1.dataInformation.dataName.replace(/\s+/g, "-").toLowerCase()}-thumbnail`,

    // Framework and categorization from form1
    frameworkType: form1.dataInformation.dataType,
    categories,

    // Spatial information from technicalDetails
    coordinateSystem: technicalDetails.spatialInformation.coordinateSystem,
    projection: technicalDetails.spatialInformation.projection,
    scale: technicalDetails.spatialInformation.scale,
    resolution: technicalDetails.spatialInformation.resolution,

    // Quality information from form2
    accuracyLevel:
      form2.positionalAccuracy?.horizontal?.accuracyReport || "Standard",
    completeness: form2.positionalAccuracy?.horizontal?.percentValue,
    consistencyCheck: true,
    validationStatus: "Validated",

    // File information from technicalDetails
    fileFormat: technicalDetails.technicalSpecifications.fileFormat,
    fileSize: technicalDetails.technicalSpecifications.fileSize,
    numFeatures: technicalDetails.technicalSpecifications.numFeatures,
    softwareReqs: technicalDetails.technicalSpecifications.softwareReqs,

    // Update information from form1
    updateCycle: form1.dataStatus.updateFrequency,
    lastUpdate: form2.dataProcessingInformation.processedDate,

    // Distribution information from form4
    distributionFormat: form4.distributionInfo.distributionFormat,
    accessMethod: form4.distributionInfo.accessMethod,
    downloadUrl: form4.distributionInfo.downloadUrl || undefined,
    apiEndpoint: form4.distributionInfo.apiEndpoint || undefined,

    // License information from form4
    licenseType: form4.licenseInfo.licenseType,
    usageTerms: form4.licenseInfo.usageTerms,
    attributionRequirements: form4.licenseInfo.attributionRequirements,
    accessRestrictions: form4.licenseInfo.accessRestrictions,

    // Contact information from form4
    contactPerson: form4.contactInfo.contactPerson,
    email: form4.contactInfo.email,
    department: form4.contactInfo.department,
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

  // Form 1: General Information
  const form1: Form1Data = {
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

  // Form 2: Data Quality
  const form2: Form2Data = {
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

  // Technical Details (Step 2)
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

  // Form 4: Access Information
  const form4: AccessInfoData = {
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

  // Form 3: Distribution Info (for backward compatibility)
  const form3: Form3Data = {
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

  return { form1, form2, form3, form4, technicalDetails }
}
