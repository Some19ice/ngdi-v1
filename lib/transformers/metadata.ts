import type {
  Form1Data,
  Form2Data,
  Form3Data,
  NGDIMetadataFormData,
} from "@/app/actions/metadata"
import type { MetadataRequest } from "@/types/metadata"

/**
 * Transforms the multi-step form data into a unified API request model
 */
export function transformFormToApiModel(
  formData: NGDIMetadataFormData
): MetadataRequest {
  const { form1, form2, form3 } = formData

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
    // General information
    title: form1.dataInformation.dataName,
    author: form2.processorContactInformation.name,
    organization: form3.distributorInformation.name,
    dateFrom: form1.dataInformation.productionDate,
    dateTo: form1.dataInformation.productionDate, // Using same date if no range is provided
    abstract: form1.description.abstract,
    purpose: form1.description.purpose,
    thumbnailUrl: form1.description.thumbnail,
    imageName: `${form1.dataInformation.dataName.replace(/\s+/g, "-").toLowerCase()}-thumbnail`,

    // Framework and categorization
    frameworkType: form1.dataInformation.dataType,
    categories,

    // Spatial information
    coordinateSystem: form1.spatialDomain.coordinateUnit,
    projection: "WGS84", // Default projection, adjust based on your needs
    scale: 1, // Default scale, adjust based on your needs

    // Quality information
    resolution: form2.sourceInformation.sourceScaleDenominator?.toString(),
    accuracyLevel:
      form2.positionalAccuracy.horizontal.accuracyReport || "Standard",
    completeness: form2.positionalAccuracy.horizontal.percentValue,
    consistencyCheck: true,
    validationStatus: "Validated",

    // File information
    fileFormat:
      form1.dataInformation.dataType === "Vector"
        ? "Shapefile"
        : form1.dataInformation.dataType === "Raster"
          ? "GeoTIFF"
          : "CSV",

    // Update information
    updateCycle: form1.dataStatus.updateFrequency,
    lastUpdate: form2.dataProcessingInformation.processedDate,

    // Distribution information
    distributionFormat:
      form1.dataInformation.dataType === "Vector"
        ? "Shapefile"
        : form1.dataInformation.dataType === "Raster"
          ? "GeoTIFF"
          : "CSV",
    accessMethod: "API",
    downloadUrl: form3.distributorInformation.webLink || undefined,
    apiEndpoint: form3.distributorInformation.webLink || undefined,

    // License information
    licenseType: "Standard",
    usageTerms: form1.resourceConstraint.useConstraints,
    attributionRequirements: form1.resourceConstraint.otherConstraints,
    accessRestrictions: [form1.resourceConstraint.accessConstraints],

    // Contact information
    contactPerson: form3.distributorInformation.name,
    email: form3.distributorInformation.email,
    department: form1.metadataReference.address,
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

  const form3: Form3Data = {
    distributorInformation: {
      name: apiData.organization,
      address: apiData.department || "",
      email: apiData.email,
      phoneNumber: "",
      webLink: apiData.downloadUrl || "",
      socialMediaHandle: "",
    },
    distributionDetails: {
      liability: "Standard liability terms apply",
      customOrderProcess: "Contact distributor for custom orders",
      technicalPrerequisites: "Standard GIS software",
    },
    standardOrderProcess: {
      fees: "Please contact for pricing",
      turnaroundTime: "Typically 3-5 business days",
      orderingInstructions: "Contact via email or phone",
      maximumResponseTime: "5 business days",
    },
  }

  return { form1, form2, form3 }
}
