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
