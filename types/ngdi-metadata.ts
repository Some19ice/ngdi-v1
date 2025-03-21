import { z } from "zod"

export interface DataInformation {
  dataType: "Raster" | "Vector" | "Table" // Required
  dataName: string // Required
  cloudCoverPercentage?: string // Optional
  productionDate: string // Required
}

export interface FundamentalDatasets {
  geodeticData?: boolean
  topographicData?: boolean
  cadastralData?: boolean
  administrativeBoundaries?: boolean
  hydrographicData?: boolean
  landUseLandCover?: boolean
  geologicalData?: boolean
  demographicData?: boolean
  digitalImagery?: boolean
  transportationData?: boolean
  others?: boolean
  otherDescription?: string
}

export interface Description {
  abstract: string // Required
  purpose: string // Required
  thumbnail: string // Required - URL to the thumbnail image
}

export interface SpatialDomain {
  coordinateUnit: "DD" | "DMS" // Required
  minLatitude: number // Required
  minLongitude: number // Required
  maxLatitude: number // Required
  maxLongitude: number // Required
}

export interface Location {
  country: string // Required
  geopoliticalZone: string // Required
  state: string // Required
  lga: string // Required
  townCity: string // Required
}

export interface DataStatus {
  assessment: "Complete" | "Incomplete" // Required
  updateFrequency: "Monthly" | "Quarterly" | "Bi-Annually" | "Annually" // Required
}

export interface ResourceConstraint {
  accessConstraints: string // Required
  useConstraints: string // Required
  otherConstraints: string // Required
}

export interface MetadataReference {
  creationDate: string // Required
  reviewDate: string // Required
  contactName: string // Required
  address: string // Required
  email: string // Required
  phoneNumber: string // Required
}

export interface GeneralSection {
  logicalConsistencyReport?: string
  completenessReport?: string
}

export interface AttributeAccuracy {
  accuracyReport?: string
}

export interface HorizontalAccuracy {
  accuracyReport?: string
  percentValue?: number
  explanation?: string
}

export interface VerticalAccuracy {
  accuracyReport?: string
  percentValue?: number
  explanation?: string
}

export interface PositionalAccuracy {
  horizontal: HorizontalAccuracy
  vertical: VerticalAccuracy
}

export interface SourceInformation {
  sourceScaleDenominator?: number
  sourceMediaType?: string
  sourceCitation?: string
  citationTitle?: string
  contractReference?: string
  contractDate?: string
}

export interface DataProcessingInformation {
  description: string // Required
  softwareVersion?: string
  processedDate: string // Required
}

export interface ProcessorContactInformation {
  name: string // Required
  email: string // Required
  address: string // Required
}

export interface DistributorInformation {
  name: string // Required
  address: string // Required
  email: string // Required
  phoneNumber: string // Required
  webLink?: string
  socialMediaHandle?: string
  isCustodian: boolean // Required - Indicates if the distributor is also the custodian
  custodianName?: string // Required if isCustodian is false
  custodianContact?: string // Required if isCustodian is false
}

export interface DistributionDetails {
  liability: string // Required
  customOrderProcess: string // Required
  technicalPrerequisites: string // Required
}

export interface StandardOrderProcess {
  fees: string // Required
  turnaroundTime: string // Required
  orderingInstructions: string // Required
  maximumResponseTime: string // Required - Maximum time for dataset availability response
}

export interface TechnicalDetailsData {
  spatialInformation: {
    coordinateSystem: string
    projection: string
    scale: number
    resolution?: string
  }
  technicalSpecifications: {
    fileFormat: string
    fileSize?: number
    numFeatures?: number
    softwareReqs?: string
  }
}

export interface AccessInfoData {
  distributionInfo: {
    distributionFormat: string
    accessMethod: string
    downloadUrl?: string
    apiEndpoint?: string
  }
  licenseInfo: {
    licenseType: string
    usageTerms: string
    attributionRequirements: string
    accessRestrictions: string[]
  }
  contactInfo: {
    contactPerson: string
    email: string
    department?: string
    phone?: string
  }
}

export interface Form1Data {
  dataInformation: DataInformation
  fundamentalDatasets: FundamentalDatasets
  description: Description
  spatialDomain: SpatialDomain
  location: Location
  dataStatus: DataStatus
  resourceConstraint: ResourceConstraint
  metadataReference: MetadataReference
}

export interface Form2Data {
  generalSection: GeneralSection
  attributeAccuracy: AttributeAccuracy
  positionalAccuracy: PositionalAccuracy
  sourceInformation: SourceInformation
  dataProcessingInformation: DataProcessingInformation
  processorContactInformation: ProcessorContactInformation
}

export interface Form3Data {
  distributorInformation: DistributorInformation
  distributionDetails: DistributionDetails
  standardOrderProcess: StandardOrderProcess
}

export interface GeneralInfoData extends Form1Data {}
export interface DataQualityData extends Form2Data {}
export interface DistributionInfoData extends Form3Data {}

export interface NGDIMetadataFormData {
  // Descriptive names
  generalInfo: GeneralInfoData
  technicalDetails: TechnicalDetailsData
  dataQuality: DataQualityData
  accessInfo: AccessInfoData
  distributionInfo?: DistributionInfoData
}

export interface NGDIMetadataResponse extends NGDIMetadataFormData {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
}
