import { prisma } from "../lib/prisma"

async function main() {
  console.log("Starting to seed metadata...")

  // Get the admin user to use as creator for the metadata entries
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@ngdi.gov.ng" },
  })

  if (!adminUser) {
    console.error("Admin user not found. Please run seed-users.ts first.")
    process.exit(1)
  }

  // Sample metadata entries
  const sampleMetadata = [
    {
      // Core metadata fields
      title: "Nigeria Administrative Boundaries",
      dataName: "Nigeria Administrative Boundaries 2023",
      dataType: "Vector",
      productionDate: "2023-01-15",
      author: "NGDI Geospatial Division",
      organization: "Nigeria Geospatial Data Infrastructure",
      dateFrom: "2023-01-01",
      dateTo: "2023-12-31",
      abstract:
        "Comprehensive dataset of administrative boundaries across Nigeria, including state, LGA, and ward boundaries. Updated with the latest demarcations as of December 2023.",
      purpose:
        "To provide accurate reference data for governance, planning, and spatial analysis across Nigerian territories.",
      thumbnailUrl: "https://example.com/thumbnails/admin-boundaries.png",
      imageName: "admin-boundaries.png",
      frameworkType: "Vector",
      categories: ["administrativeBoundaries", "governmentData"],

      // Spatial information
      coordinateUnit: "DD",
      coordinateSystem: "WGS 84",
      projection: "UTM Zone 32N",
      scale: 50000,
      resolution: "10m",
      accuracyLevel: "High",
      completeness: 98,
      consistencyCheck: true,
      validationStatus: "Validated",
      minLatitude: 4.277,
      minLongitude: 2.668,
      maxLatitude: 13.892,
      maxLongitude: 14.68,

      // Location information
      country: "Nigeria",
      geopoliticalZone: "All",
      state: "All",
      lga: "All",
      townCity: "All",

      // Technical details
      fileFormat: "Shapefile",
      fileSize: 245000000,
      numFeatures: 1256,
      softwareReqs: "QGIS 3.0+, ArcGIS 10.5+",

      // Status information
      assessment: "Complete",
      updateFrequency: "Annually",
      updateCycle: "Annually",

      // Distribution information
      distributionFormat: "Shapefile, GeoJSON",
      accessMethod: "Direct Download",
      downloadUrl: "https://data.ngdi.gov.ng/datasets/admin-boundaries.zip",
      apiEndpoint: "https://api.ngdi.gov.ng/v1/boundaries",
      licenseType: "NGDI Open Data License",
      usageTerms: "Attribution required. No commercial use without permission.",
      attributionRequirements:
        "Data source: Nigeria Geospatial Data Infrastructure (NGDI)",
      accessRestrictions: [
        "Authentication Required",
        "API Key Required for Bulk Access",
      ],
      accessConstraints:
        "Authentication required for download. API key required for automated access.",
      useConstraints:
        "Attribution required. No commercial use without written permission.",
      otherConstraints:
        "Data must not be altered without documentation. Derivative works must acknowledge the source.",

      // Metadata information
      metadataCreationDate: "2023-02-20",
      metadataReviewDate: "2023-06-10",
      metadataContactName: "Dr. Aisha Mohammed",
      metadataContactAddress:
        "NGDI Headquarters, Central Business District, Abuja, Nigeria",
      metadataContactEmail: "metadata@ngdi.gov.ng",
      metadataContactPhone: "+234 800 123 4567",

      // Quality information
      logicalConsistencyReport:
        "All boundaries conform to national standards. Boundaries are topologically clean with no gaps or overlaps.",
      completenessReport:
        "Dataset is 99% complete, covering all 36 states and the FCT.",
      attributeAccuracyReport:
        "Attributes validated against official gazette records with 98% accuracy.",

      // JSON fields
      positionalAccuracy: {
        horizontal: {
          value: 5,
          unit: "meters",
          method: "GPS survey comparison",
        },
        vertical: null,
      },
      sourceInformation: {
        source: "Office of the Surveyor General of the Federation",
        sourceScale: "1:50,000",
        sourceDate: "2022-12-01",
        methodology:
          "Compilation from official survey records and satellite imagery",
      },
      fundamentalDatasets: {
        type: "boundary",
        subTypes: ["administrative", "political"],
        layer: "national",
      },

      // Processing information
      processingDescription:
        "Data was compiled from official sources, verified against satellite imagery, and processed to ensure topological integrity.",
      softwareVersion: "ArcGIS Pro 2.9, QGIS 3.22",
      processedDate: "2023-01-10",
      processorName: "NGDI Geospatial Team",
      processorEmail: "processing@ngdi.gov.ng",
      processorAddress: "NGDI Technical Office, Abuja, Nigeria",

      // Distribution details
      distributorName: "Nigeria Geospatial Data Infrastructure",
      distributorAddress:
        "NGDI Headquarters, Central Business District, Abuja, Nigeria",
      distributorEmail: "data@ngdi.gov.ng",
      distributorPhone: "+234 800 987 6543",
      distributorWebLink: "https://data.ngdi.gov.ng",
      distributorSocialMedia: "@NGDI_Nigeria",
      isCustodian: true,
      distributionLiability:
        "While NGDI strives for accuracy, the data is provided 'as is' without warranty of any kind.",
      customOrderProcess:
        "Custom extracts or specialized formats can be requested via the data portal.",
      technicalPrerequisites:
        "GIS software capable of reading Shapefile or GeoJSON formats. Minimum 8GB RAM recommended.",
      fees: "Free for government and academic use. Commercial licensing starts at ₦50,000.",
      turnaroundTime:
        "Standard downloads are immediate. Custom orders within 3-5 business days.",
      orderingInstructions:
        "Register on the NGDI portal, browse available datasets, and follow the download instructions.",
      maximumResponseTime: "24 hours for inquiries",

      // Contact information
      contactPerson: "Dr. Aisha Mohammed",
      email: "data@ngdi.gov.ng",
      department: "Geospatial Division",

      // User association
      userId: adminUser.id,
    },
    {
      // Core metadata fields
      title: "Lagos State High-Resolution Satellite Imagery",
      dataName: "Lagos State High-Resolution Satellite Imagery 2023",
      dataType: "Raster",
      productionDate: "2023-03-20",
      author: "Lagos State Geographic Information Systems",
      organization: "Lagos State Government",
      dateFrom: "2023-03-15",
      dateTo: "2023-04-20",
      abstract:
        "High-resolution satellite imagery covering the entire Lagos State area captured during the dry season with less than 5% cloud cover. Resolution of 50cm per pixel.",
      purpose:
        "Urban planning, infrastructure development, and environmental monitoring across Lagos metropolitan area.",
      thumbnailUrl: "https://example.com/thumbnails/lagos-imagery.png",
      imageName: "lagos-imagery.png",
      frameworkType: "Raster",
      categories: ["digitalImagery", "urbanPlanning"],

      // Spatial information
      coordinateUnit: "DD",
      coordinateSystem: "WGS 84",
      projection: "UTM Zone 31N",
      scale: 10000,
      resolution: "50cm",
      accuracyLevel: "Very High",
      completeness: 95,
      consistencyCheck: true,
      validationStatus: "Validated",
      minLatitude: 6.357,
      minLongitude: 2.687,
      maxLatitude: 6.702,
      maxLongitude: 4.351,

      // Location information
      country: "Nigeria",
      geopoliticalZone: "South West",
      state: "Lagos",
      lga: "All",
      townCity: "All",

      // Technical details
      fileFormat: "GeoTIFF",
      fileSize: 2147483647,
      cloudCoverPercentage: "4.2",

      // Status information
      assessment: "Complete",
      updateFrequency: "Bi-Annually",
      updateCycle: "Bi-Annually",

      // Distribution information
      distributionFormat: "GeoTIFF, ECW",
      accessMethod: "Tile Server",
      downloadUrl: "https://data.lagosstate.gov.ng/imagery/2023/bundle.zip",
      apiEndpoint: "https://tiles.lagosstate.gov.ng/wmts",
      licenseType: "Lagos State GIS License",
      usageTerms:
        "Academic and government use only. Commercial licensing available separately.",
      attributionRequirements:
        "Data source: Lagos State Geographic Information Systems (LAGIS)",
      accessRestrictions: [
        "Authentication Required",
        "Usage Reporting Required",
      ],
      accessConstraints:
        "Authentication required. Licensed access based on user category.",
      useConstraints:
        "Academic and government use allowed. Commercial use requires additional licensing.",
      otherConstraints:
        "Redistribution prohibited. No third-party transfers without explicit permission.",

      // Metadata information
      metadataCreationDate: "2023-04-25",
      metadataReviewDate: "2023-05-10",
      metadataContactName: "Michael Adebayo",
      metadataContactAddress: "Lagos State GIS Office, Alausa, Ikeja, Lagos",
      metadataContactEmail: "metadata@lagosstate.gov.ng",
      metadataContactPhone: "+234 802 345 6789",

      // Quality information
      logicalConsistencyReport:
        "Imagery has been radiometrically corrected and orthorectified to ensure spatial accuracy.",
      completenessReport:
        "100% coverage of Lagos State with less than 5% cloud obstruction.",
      attributeAccuracyReport:
        "Spectral bands calibrated to USGS standards for radiometric accuracy.",

      // JSON fields
      positionalAccuracy: {
        horizontal: {
          value: 1.2,
          unit: "meters",
          method: "Ground control point verification",
        },
        vertical: null,
      },
      sourceInformation: {
        source: "WorldView-3 Satellite",
        sourceDate: "2023-02-15",
        methodology: "Multi-pass satellite imaging during dry season",
      },
      fundamentalDatasets: {
        type: "imagery",
        subTypes: ["satellite", "multispectral"],
        resolution: "50cm",
      },

      // Processing information
      processingDescription:
        "Raw imagery was orthorectified using digital elevation model, radiometrically corrected, and mosaicked to create a seamless coverage.",
      softwareVersion: "ERDAS IMAGINE 2022, PCI Geomatica 2021",
      processedDate: "2023-03-15",
      processorName: "Lagos State GIS Technical Team",
      processorEmail: "processing@lagosstate.gov.ng",
      processorAddress:
        "Lagos State GIS Processing Center, Alausa, Ikeja, Lagos",

      // Distribution details
      distributorName: "Lagos State Geographic Information Systems",
      distributorAddress: "LAGIS Headquarters, Alausa, Ikeja, Lagos",
      distributorEmail: "data@lagosstate.gov.ng",
      distributorPhone: "+234 802 987 6543",
      distributorWebLink: "https://gis.lagosstate.gov.ng",
      distributorSocialMedia: "@LAGIS_Official",
      isCustodian: true,
      distributionLiability:
        "Lagos State GIS provides this data without warranty. Users bear all responsibility for conclusions drawn from the data.",
      customOrderProcess:
        "Specialized extracts, additional processing, or different formats can be requested through the LAGIS portal.",
      technicalPrerequisites:
        "Raster processing software capable of handling large GeoTIFF files. 16GB RAM recommended.",
      fees: "Government: Free, Academic: ₦25,000, Commercial: Starting at ₦250,000",
      turnaroundTime:
        "Standard downloads: 24 hours after approval. Custom processing: 5-7 business days.",
      orderingInstructions:
        "Submit request through the LAGIS portal with organization details and intended use case.",
      maximumResponseTime: "48 hours for data requests",

      // Contact information
      contactPerson: "Michael Adebayo",
      email: "gis@lagosstate.gov.ng",
      department: "Geographic Information Systems",

      // User association
      userId: adminUser.id,
    },
    {
      // Core metadata fields
      title: "Nigeria Road Network",
      dataName: "Nigeria Road Network 2023",
      dataType: "Vector",
      productionDate: "2023-02-28",
      author: "Federal Ministry of Works and Housing",
      organization: "Federal Ministry of Works and Housing",
      dateFrom: "2023-01-01",
      dateTo: "2023-12-31",
      abstract:
        "Comprehensive road network dataset for Nigeria including federal highways, state roads, and major urban roads. Includes road classification, surface type, and condition attributes.",
      purpose:
        "Transportation planning, logistics optimization, and infrastructure development projects.",
      thumbnailUrl: "https://example.com/thumbnails/road-network.png",
      imageName: "road-network.png",
      frameworkType: "Vector",
      categories: ["transportationData", "infrastructureData"],

      // Spatial information
      coordinateUnit: "DD",
      coordinateSystem: "WGS 84",
      projection: "UTM Zone 32N",
      scale: 50000,
      resolution: null,
      accuracyLevel: "High",
      completeness: 90,
      consistencyCheck: true,
      validationStatus: "Validated",
      minLatitude: 4.277,
      minLongitude: 2.668,
      maxLatitude: 13.892,
      maxLongitude: 14.68,

      // Location information
      country: "Nigeria",
      geopoliticalZone: "All",
      state: "All",
      lga: "All",
      townCity: "All",

      // Technical details
      fileFormat: "Shapefile",
      fileSize: 320000000,
      numFeatures: 15782,

      // Status information
      assessment: "Complete",
      updateFrequency: "Annually",
      updateCycle: "Annually",

      // Distribution information
      distributionFormat: "Shapefile, GeoJSON",
      accessMethod: "Direct Download, WFS",
      downloadUrl: "https://data.fmw.gov.ng/datasets/roads-2023.zip",
      apiEndpoint: "https://api.fmw.gov.ng/v1/roads",
      licenseType: "Nigeria Government Open Data License",
      usageTerms: "Free for all uses with attribution",
      attributionRequirements:
        "Data source: Federal Ministry of Works and Housing, Nigeria",
      accessRestrictions: [],
      accessConstraints: "Open access with registration.",
      useConstraints:
        "Attribution required. Commercial and non-commercial use allowed.",
      otherConstraints:
        "Users must acknowledge source and date of acquisition in any derived products.",

      // Metadata information
      metadataCreationDate: "2023-03-15",
      metadataReviewDate: "2023-04-10",
      metadataContactName: "Engr. Ibrahim Mohammed",
      metadataContactAddress:
        "Federal Ministry of Works and Housing, Headquarters, Abuja",
      metadataContactEmail: "metadata@fmw.gov.ng",
      metadataContactPhone: "+234 805 678 9012",

      // Quality information
      logicalConsistencyReport:
        "Road network is topologically connected. All intersections are correctly modeled.",
      completenessReport:
        "98% complete for federal and state roads, 85% complete for urban roads.",
      attributeAccuracyReport:
        "Road classification verified against official records. Surface type and condition verified by field surveys.",

      // JSON fields
      positionalAccuracy: {
        horizontal: {
          value: 10,
          unit: "meters",
          method: "GPS survey and satellite imagery comparison",
        },
        vertical: null,
      },
      sourceInformation: {
        source: "Federal Ministry of Works and Housing",
        sourceScale: "1:50,000",
        sourceDate: "2022-09-30",
        methodology:
          "Compilation from existing road maps, satellite imagery, and field surveys",
      },
      fundamentalDatasets: {
        type: "transportation",
        subTypes: ["roads", "highways"],
        scale: "1:50000",
      },

      // Processing information
      processingDescription:
        "Data compiled from multiple sources, conflated with GPS tracks and satellite imagery.",
      softwareVersion: "ArcGIS 10.8, QGIS 3.20",
      processedDate: "2023-02-15",
      processorName: "Federal Ministry of Works GIS Unit",
      processorEmail: "gis@fmw.gov.ng",
      processorAddress:
        "Federal Ministry of Works and Housing, GIS Division, Abuja",

      // Distribution details
      distributorName: "Nigeria Geospatial Data Infrastructure",
      distributorAddress: "NGDI Headquarters, Central Business District, Abuja",
      distributorEmail: "roads@ngdi.gov.ng",
      distributorPhone: "+234 803 456 7890",
      distributorWebLink: "https://roads.ngdi.gov.ng",
      distributorSocialMedia: "@NGDI_Roads",
      isCustodian: false,
      custodianName: "Federal Ministry of Works and Housing",
      custodianContact: "Engr. Biodun Oladipo, Director of Highways",
      distributionLiability:
        "Data is provided as-is without warranty. Users should verify road conditions before relying on the data for navigation.",
      customOrderProcess:
        "Custom extracts by state or region available upon request.",
      technicalPrerequisites:
        "GIS software capable of reading Shapefile or GeoJSON formats.",
      fees: "Free for all uses.",
      turnaroundTime: "Immediate download after registration.",
      orderingInstructions:
        "Register on the NGDI portal, navigate to transportation datasets, and download directly.",
      maximumResponseTime: "24 hours for support inquiries",

      // Contact information
      contactPerson: "Engr. Biodun Oladipo",
      email: "gis@fmw.gov.ng",
      department: "GIS Unit",

      // User association
      userId: adminUser.id,
    },
    {
      // Core metadata fields
      title: "Nigeria Population Density Map",
      dataName: "Nigeria Population Density Map 2023",
      dataType: "Raster",
      productionDate: "2023-05-15",
      author: "National Population Commission",
      organization: "National Population Commission of Nigeria",
      dateFrom: "2023-01-01",
      dateTo: "2023-12-31",
      abstract:
        "Population density map of Nigeria derived from the 2023 census data, showing population distribution at the LGA level. The dataset includes population counts, density calculations, and demographic indicators.",
      purpose:
        "To support demographic analysis, policy planning, and resource allocation based on accurate population distribution data.",
      thumbnailUrl: "https://example.com/thumbnails/population-density.png",
      imageName: "population-density.png",
      frameworkType: "Raster",
      categories: ["demographicData", "censusData", "populationDistribution"],

      // Spatial information
      coordinateUnit: "DD",
      coordinateSystem: "WGS 84",
      projection: "Geographic",
      scale: 100000,
      resolution: "100m",
      accuracyLevel: "Medium",
      completeness: 100,
      consistencyCheck: true,
      validationStatus: "Validated",
      minLatitude: 4.277,
      minLongitude: 2.668,
      maxLatitude: 13.892,
      maxLongitude: 14.68,

      // Location information
      country: "Nigeria",
      geopoliticalZone: "All",
      state: "All",
      lga: "All",
      townCity: "All",

      // Technical details
      fileFormat: "GeoTIFF",
      fileSize: 450000000,

      // Status information
      assessment: "Complete",
      updateFrequency: "Annually",
      updateCycle: "Annually",

      // Distribution information
      distributionFormat: "GeoTIFF, PNG, CSV with coordinates",
      accessMethod: "API, Direct Download",
      downloadUrl: "https://data.population.gov.ng/datasets/density-2023.zip",
      apiEndpoint: "https://api.population.gov.ng/v1/density",
      licenseType: "Nigeria Government Open Data License",
      usageTerms: "Free for all uses with attribution",
      attributionRequirements:
        "Data source: National Population Commission of Nigeria (NPopC)",
      accessRestrictions: [],
      accessConstraints: "Open access with registration.",
      useConstraints:
        "Attribution required. Commercial and non-commercial use allowed.",
      otherConstraints:
        "Users must acknowledge source and date of acquisition in any derived products.",

      // Metadata information
      metadataCreationDate: "2023-06-10",
      metadataReviewDate: "2023-07-15",
      metadataContactName: "Dr. Samuel Akinyemi",
      metadataContactAddress:
        "National Population Commission Headquarters, Abuja",
      metadataContactEmail: "metadata@population.gov.ng",
      metadataContactPhone: "+234 807 123 4567",

      // Quality information
      logicalConsistencyReport:
        "Data is consistent with administrative boundaries and has been validated against official census records.",
      completenessReport:
        "Dataset covers 100% of Nigeria's territory at the LGA level.",
      attributeAccuracyReport:
        "Population counts have been verified against official census records with 99% accuracy.",

      // JSON fields
      positionalAccuracy: {
        horizontal: {
          value: 100,
          unit: "meters",
          method: "Administrative boundary alignment",
        },
        vertical: null,
      },
      sourceInformation: {
        source: "Nigeria Census 2023",
        sourceDate: "2023-04-30",
        methodology: "Compilation from census data and population projections",
      },
      fundamentalDatasets: {
        type: "demographic",
        subTypes: ["population", "density"],
        scale: "100000",
      },

      // Processing information
      processingDescription:
        "Census data was aggregated at LGA level, mapped to administrative boundaries, and converted to population density. Density was calculated as persons per square kilometer.",
      softwareVersion: "ArcGIS Pro 2.9, Python 3.9",
      processedDate: "2023-05-10",
      processorName: "NPopC Data Analytics Team",
      processorEmail: "analytics@population.gov.ng",
      processorAddress: "NPopC Data Processing Center, Abuja",

      // Distribution details
      distributorName: "National Population Commission of Nigeria",
      distributorAddress:
        "NPopC Headquarters, Central Business District, Abuja",
      distributorEmail: "data@population.gov.ng",
      distributorPhone: "+234 807 987 6543",
      distributorWebLink: "https://data.population.gov.ng",
      distributorSocialMedia: "@NPopC_Nigeria",
      isCustodian: true,
      distributionLiability:
        "NPopC provides this data without warranty. Users bear all responsibility for conclusions drawn from the data.",
      customOrderProcess:
        "Custom data extracts at ward or enumeration area level can be requested through the data portal.",
      technicalPrerequisites: "GIS software capable of reading GeoTIFF format.",
      fees: "Free for all uses.",
      turnaroundTime:
        "Standard downloads are immediate. Custom extracts within 3 business days.",
      orderingInstructions:
        "Register on the NPopC data portal with organization details and purpose of use.",
      maximumResponseTime: "48 hours for inquiries",

      // Contact information
      contactPerson: "Dr. Samuel Akinyemi",
      email: "data@population.gov.ng",
      department: "Data Analytics",

      // User association
      userId: adminUser.id,
    },
    {
      // Core metadata fields
      title: "Nigeria Flood Risk Zones",
      dataName: "Nigeria Flood Risk Zones 2023",
      dataType: "Vector",
      productionDate: "2023-06-30",
      author: "Nigeria Hydrological Services Agency",
      organization: "Nigeria Hydrological Services Agency",
      dateFrom: "2023-05-01",
      dateTo: "2023-11-30",
      abstract:
        "Comprehensive mapping of flood risk zones across Nigeria based on 2023 rainfall patterns, river levels, and terrain analysis. Includes five risk categories from very low to extremely high risk.",
      purpose:
        "To support disaster preparedness, urban planning, insurance risk assessment, and emergency response planning.",
      thumbnailUrl: "https://example.com/thumbnails/flood-risk.png",
      imageName: "flood-risk.png",
      frameworkType: "Vector",
      categories: ["hydrographicData", "disasterManagement", "riskAssessment"],

      // Spatial information
      coordinateUnit: "DD",
      coordinateSystem: "WGS 84",
      projection: "UTM Zone 32N",
      scale: 50000,
      resolution: null,
      accuracyLevel: "High",
      completeness: 95,
      consistencyCheck: true,
      validationStatus: "Validated",
      minLatitude: 4.277,
      minLongitude: 2.668,
      maxLatitude: 13.892,
      maxLongitude: 14.68,

      // Location information
      country: "Nigeria",
      geopoliticalZone: "All",
      state: "All",
      lga: "All",
      townCity: "All",

      // Technical details
      fileFormat: "Shapefile",
      fileSize: 180000000,
      numFeatures: 2450,

      // Status information
      assessment: "Complete",
      updateFrequency: "Annually",
      updateCycle: "Annually",

      // Distribution information
      distributionFormat: "Shapefile, GeoPackage",
      accessMethod: "Direct Download",
      downloadUrl: "https://data.nihsa.gov.ng/datasets/flood-risk-2023.zip",
      apiEndpoint: "https://api.nihsa.gov.ng/v1/flood-risk",
      licenseType: "NIHSA Data License",
      usageTerms:
        "Free for government and non-commercial use. Commercial use requires written permission.",
      attributionRequirements:
        "Data source: Nigeria Hydrological Services Agency (NIHSA)",
      accessRestrictions: ["Authentication Required"],
      accessConstraints:
        "Authentication required for download. Registration required for all users.",
      useConstraints:
        "Attribution required. Commercial use requires written permission and may incur fees.",
      otherConstraints:
        "Users must not modify risk categories without explicit approval. Critical infrastructure planning must verify with current field conditions.",

      // Metadata information
      metadataCreationDate: "2023-07-10",
      metadataReviewDate: "2023-08-15",
      metadataContactName: "Dr. Emmanuel Adewale",
      metadataContactAddress: "NIHSA Headquarters, Maitama, Abuja",
      metadataContactEmail: "metadata@nihsa.gov.ng",
      metadataContactPhone: "+234 809 123 4567",

      // Quality information
      logicalConsistencyReport:
        "Risk zones are topologically consistent with no gaps or overlaps. Zones follow natural terrain features and are consistent with river networks.",
      completenessReport:
        "Dataset covers 95% of flood-prone areas in Nigeria, with remaining 5% being areas with limited access or data.",
      attributeAccuracyReport:
        "Risk categories have been verified through field surveys and historical flood data with 90% accuracy.",

      // JSON fields
      positionalAccuracy: {
        horizontal: {
          value: 30,
          unit: "meters",
          method: "Comparison with high-resolution satellite imagery",
        },
        vertical: {
          value: 2,
          unit: "meters",
          method: "Digital Elevation Model comparison",
        },
      },
      sourceInformation: {
        source: "NIHSA Field Surveys, Satellite Imagery, SRTM DEM",
        sourceDate: "2023-04-15",
        methodology:
          "Hydrological modeling combined with historical flood data analysis",
      },
      fundamentalDatasets: {
        type: "hazard",
        subTypes: ["flood", "risk"],
        scale: "50000",
      },

      // Processing information
      processingDescription:
        "Risk zones were delineated using hydrological models considering rainfall patterns, river levels, terrain, soil permeability, and historical flood extents. Five risk categories were established based on flood probability and potential impact.",
      softwareVersion: "ArcGIS Pro 2.9, HEC-RAS 6.1",
      processedDate: "2023-06-15",
      processorName: "NIHSA Hydrological Modeling Team",
      processorEmail: "modeling@nihsa.gov.ng",
      processorAddress: "NIHSA Technical Office, Abuja",

      // Distribution details
      distributorName: "Nigeria Hydrological Services Agency",
      distributorAddress: "NIHSA Headquarters, Maitama, Abuja",
      distributorEmail: "data@nihsa.gov.ng",
      distributorPhone: "+234 809 987 6543",
      distributorWebLink: "https://data.nihsa.gov.ng",
      distributorSocialMedia: "@NIHSA_Nigeria",
      isCustodian: true,
      distributionLiability:
        "NIHSA provides this data as a guide only. Users must conduct site-specific assessments for critical applications. No warranty is provided regarding accuracy for specific locations.",
      customOrderProcess:
        "Custom analyses or higher resolution data for specific areas can be requested through a formal application.",
      technicalPrerequisites:
        "GIS software capable of reading Shapefile or GeoPackage formats.",
      fees: "Government: Free, Academic: Free with registration, Commercial: Starting at ₦100,000",
      turnaroundTime:
        "Standard downloads within 24 hours after approval. Custom requests within 7 business days.",
      orderingInstructions:
        "Submit request through the NIHSA data portal with organization details and specific purpose.",
      maximumResponseTime: "48 hours for standard inquiries",

      // Contact information
      contactPerson: "Dr. Emmanuel Adewale",
      email: "data@nihsa.gov.ng",
      department: "Hydrological Modeling",

      // User association
      userId: adminUser.id,
    },
    {
      // Core metadata fields
      title: "Nigeria National Parks and Protected Areas",
      dataName: "Nigeria National Parks and Protected Areas 2023",
      dataType: "Vector",
      productionDate: "2023-04-25",
      author: "National Park Service",
      organization: "Nigeria National Park Service",
      dateFrom: "2022-06-01",
      dateTo: "2023-06-30",
      abstract:
        "Boundaries and attribute information for all national parks, game reserves, and protected areas in Nigeria. Includes conservation status, biodiversity indices, management information, and key species habitats.",
      purpose:
        "To support conservation planning, environmental impact assessment, ecotourism development, and biodiversity research.",
      thumbnailUrl: "https://example.com/thumbnails/protected-areas.png",
      imageName: "protected-areas.png",
      frameworkType: "Vector",
      categories: ["landUseLandCover", "environmentData", "conservationData"],

      // Spatial information
      coordinateUnit: "DD",
      coordinateSystem: "WGS 84",
      projection: "Geographic",
      scale: 100000,
      resolution: null,
      accuracyLevel: "Medium",
      completeness: 100,
      consistencyCheck: true,
      validationStatus: "Validated",
      minLatitude: 4.277,
      minLongitude: 2.668,
      maxLatitude: 13.892,
      maxLongitude: 14.68,

      // Location information
      country: "Nigeria",
      geopoliticalZone: "All",
      state: "All",
      lga: "All",
      townCity: "All",

      // Technical details
      fileFormat: "Shapefile",
      fileSize: 85000000,
      numFeatures: 147,

      // Status information
      assessment: "Complete",
      updateFrequency: "Annually",
      updateCycle: "Annually",

      // Distribution information
      distributionFormat: "Shapefile, KML",
      accessMethod: "Direct Download",
      downloadUrl: "https://data.nnps.gov.ng/datasets/protected-areas.zip",
      apiEndpoint: "https://api.nnps.gov.ng/v1/protected-areas",
      licenseType: "Creative Commons Attribution 4.0",
      usageTerms: "Free for all uses with attribution",
      attributionRequirements:
        "Data source: Nigeria National Park Service (NNPS)",
      accessRestrictions: [],
      accessConstraints:
        "Open access. Sensitive species location data may be restricted.",
      useConstraints:
        "Attribution required. Commercial and non-commercial use allowed.",
      otherConstraints:
        "Precise locations of endangered species habitats may be generalized for conservation purposes.",

      // Metadata information
      metadataCreationDate: "2023-05-10",
      metadataReviewDate: "2023-06-15",
      metadataContactName: "Dr. Fatima Ibrahim",
      metadataContactAddress: "NNPS Headquarters, Garki, Abuja",
      metadataContactEmail: "metadata@nnps.gov.ng",
      metadataContactPhone: "+234 805 123 4567",

      // Quality information
      logicalConsistencyReport:
        "Protected area boundaries are topologically consistent and align with administrative boundaries where applicable.",
      completenessReport:
        "Dataset includes all officially designated protected areas in Nigeria as of June 2023.",
      attributeAccuracyReport:
        "Conservation status and management information verified with park authorities with 95% accuracy.",

      // JSON fields
      positionalAccuracy: {
        horizontal: {
          value: 50,
          unit: "meters",
          method: "GPS survey and boundary validation",
        },
        vertical: null,
      },
      sourceInformation: {
        source: "NNPS Official Records, Field Surveys",
        sourceDate: "2022-11-30",
        methodology:
          "Compilation from official gazette records, boundary surveys, and management plans",
      },
      fundamentalDatasets: {
        type: "conservation",
        subTypes: ["protected_areas", "national_parks"],
        scale: "100000",
      },

      // Processing information
      processingDescription:
        "Protected area boundaries were digitized from official records, verified through field surveys, and attributed with conservation status, biodiversity indicators, and management information.",
      softwareVersion: "QGIS 3.28, ArcGIS Pro 3.0",
      processedDate: "2023-04-15",
      processorName: "NNPS GIS Unit",
      processorEmail: "gis@nnps.gov.ng",
      processorAddress: "NNPS Technical Office, Abuja",

      // Distribution details
      distributorName: "Nigeria National Park Service",
      distributorAddress: "NNPS Headquarters, Garki, Abuja",
      distributorEmail: "data@nnps.gov.ng",
      distributorPhone: "+234 805 987 6543",
      distributorWebLink: "https://data.nnps.gov.ng",
      distributorSocialMedia: "@NNPS_Nigeria",
      isCustodian: true,
      distributionLiability:
        "NNPS provides this data without warranty. Boundaries should be used for general reference and not for legal delineation without verification.",
      customOrderProcess:
        "Detailed biodiversity data or high-resolution boundaries for specific protected areas can be requested via the data portal.",
      technicalPrerequisites:
        "GIS software capable of reading Shapefile or KML formats.",
      fees: "Free for all uses.",
      turnaroundTime: "Immediate download after registration.",
      orderingInstructions:
        "Register on the NNPS data portal and access the protected areas dataset section.",
      maximumResponseTime: "24 hours for inquiries",

      // Contact information
      contactPerson: "Dr. Fatima Ibrahim",
      email: "conservation@nnps.gov.ng",
      department: "Conservation Data Management",

      // User association
      userId: adminUser.id,
    },
    {
      // Core metadata fields
      title: "Abuja Digital Elevation Model",
      dataName: "Abuja Digital Elevation Model 2023",
      dataType: "Raster",
      productionDate: "2023-03-15",
      author: "FCT Survey and Mapping Department",
      organization: "Federal Capital Territory Administration",
      dateFrom: "2023-01-01",
      dateTo: "2023-03-31",
      abstract:
        "High-resolution digital elevation model (DEM) of the Federal Capital Territory, Abuja. Derived from LiDAR data with 1-meter resolution covering the entire FCT area with high vertical accuracy.",
      purpose:
        "To support urban planning, flood modeling, infrastructure development, viewshed analysis, and precise elevation determination.",
      thumbnailUrl: "https://example.com/thumbnails/abuja-dem.png",
      imageName: "abuja-dem.png",
      frameworkType: "Raster",
      categories: ["topographicData", "elevation", "terrain"],

      // Spatial information
      coordinateUnit: "DD",
      coordinateSystem: "WGS 84",
      projection: "UTM Zone 32N",
      scale: 5000,
      resolution: "1m",
      accuracyLevel: "Very High",
      completeness: 99,
      consistencyCheck: true,
      validationStatus: "Validated",
      minLatitude: 8.4,
      minLongitude: 6.9,
      maxLatitude: 9.3,
      maxLongitude: 7.6,

      // Location information
      country: "Nigeria",
      geopoliticalZone: "North Central",
      state: "Federal Capital Territory",
      lga: "All",
      townCity: "Abuja",

      // Technical details
      fileFormat: "GeoTIFF",
      fileSize: 3200000000,

      // Status information
      assessment: "Complete",
      updateFrequency: "Every 3 years",
      updateCycle: "Every 3 years",

      // Distribution information
      distributionFormat: "GeoTIFF, ASCII Grid",
      accessMethod: "Direct Download",
      downloadUrl: "https://data.fct.gov.ng/datasets/dem-2023.zip",
      apiEndpoint: "https://api.fct.gov.ng/v1/elevation",
      licenseType: "FCT Geospatial Data License",
      usageTerms:
        "Free for government use. Academic and commercial use requires registration and fee.",
      attributionRequirements:
        "Data source: FCT Survey and Mapping Department, Abuja, Nigeria",
      accessRestrictions: [
        "Authentication Required",
        "Fee Required for Commercial Use",
      ],
      accessConstraints:
        "Authentication required. Commercial use requires licensing. Security-sensitive areas may have restricted data.",
      useConstraints:
        "Government and academic use allowed with attribution. Commercial use requires license purchase.",
      otherConstraints:
        "Critical infrastructure planning must verify with ground surveys. Not for navigation without additional verification.",

      // Metadata information
      metadataCreationDate: "2023-04-05",
      metadataReviewDate: "2023-05-10",
      metadataContactName: "Engr. Suleiman Abba",
      metadataContactAddress: "FCT Survey and Mapping Department, Garki, Abuja",
      metadataContactEmail: "metadata@fct.gov.ng",
      metadataContactPhone: "+234 802 123 4567",

      // Quality information
      logicalConsistencyReport:
        "DEM has been hydrologically corrected to ensure proper water flow. No data voids or artifacts present in the dataset.",
      completenessReport:
        "99% coverage of FCT area. Small gaps (1%) exist in areas with security restrictions or dense forest canopy.",
      attributeAccuracyReport:
        "Vertical accuracy validated against 120 ground control points with RMSE of 15cm.",

      // JSON fields
      positionalAccuracy: {
        horizontal: {
          value: 0.5,
          unit: "meters",
          method: "GNSS control point comparison",
        },
        vertical: {
          value: 0.15,
          unit: "meters",
          method: "RTK GPS survey verification",
        },
      },
      sourceInformation: {
        source: "Airborne LiDAR Survey",
        sourceDate: "2023-01-15",
        methodology:
          "Aerial LiDAR acquisition at 8 points per square meter, processed to bare earth DEM",
      },
      fundamentalDatasets: {
        type: "elevation",
        subTypes: ["dem", "terrain"],
        resolution: "1m",
      },

      // Processing information
      processingDescription:
        "Raw LiDAR point cloud was classified, filtered to remove non-ground points, and interpolated to create a bare-earth DEM. Hydrological corrections were applied to ensure proper drainage patterns.",
      softwareVersion: "TerraSolid 2022, ArcGIS Pro 3.0",
      processedDate: "2023-02-28",
      processorName: "FCT GIS Unit",
      processorEmail: "lidar@fct.gov.ng",
      processorAddress: "FCT Survey and Mapping Department, Garki, Abuja",

      // Distribution details
      distributorName: "Federal Capital Territory Administration",
      distributorAddress: "FCT Survey and Mapping Department, Garki, Abuja",
      distributorEmail: "gis@fct.gov.ng",
      distributorPhone: "+234 802 987 6543",
      distributorWebLink: "https://gis.fct.gov.ng",
      distributorSocialMedia: "@FCT_GIS",
      isCustodian: true,
      distributionLiability:
        "FCT Administration provides this data without warranty. Users must verify suitability for their specific applications.",
      customOrderProcess:
        "Specialized derivatives (contours, slope maps, etc.) or subsets can be requested through the FCT GIS portal.",
      technicalPrerequisites:
        "GIS software capable of handling large raster datasets. Minimum 16GB RAM recommended for processing the full dataset.",
      fees: "Government: Free, Academic: ₦50,000, Commercial: Starting at ₦250,000",
      turnaroundTime:
        "Standard downloads within 24 hours after approval. Custom requests within 5 business days.",
      orderingInstructions:
        "Submit request through the FCT GIS portal with organization details and specific purpose.",
      maximumResponseTime: "48 hours for inquiries",

      // Contact information
      contactPerson: "Engr. Suleiman Abba",
      email: "gis@fct.gov.ng",
      department: "Survey and Mapping",

      // User association
      userId: adminUser.id,
    },
  ]

  // Check for existing metadata to avoid duplicates
  const existingMetadata = await prisma.metadata.findMany({
    select: { title: true },
  })
  const existingTitles = new Set(existingMetadata.map((m) => m.title))

  // Create new metadata entries, skipping any that already exist
  let createdCount = 0
  for (const metadata of sampleMetadata) {
    if (existingTitles.has(metadata.title)) {
      console.log(`Skipping existing metadata: ${metadata.title}`)
      continue
    }

    await prisma.metadata.create({
      data: metadata,
    })
    console.log(`Created metadata: ${metadata.title}`)
    createdCount++
  }

  console.log(
    `Seeding completed. Created ${createdCount} new metadata entries.`
  )
}

main()
  .then(() => console.log("Metadata seeding completed."))
  .catch((e) => {
    console.error("Error during metadata seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
