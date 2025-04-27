import { prisma } from "../src"
import { hash } from "bcryptjs"

/**
 * Seed the database with development data
 * This script is intended for development use only
 */
async function main() {
  console.log("Starting development database seeding...")

  // Create users
  await seedUsers()

  // Create metadata
  await seedMetadata()

  // Create settings
  await seedSettings()

  console.log("Development database seeding completed!")
}

/**
 * Seed users
 */
async function seedUsers() {
  console.log("Seeding users...")

  // Get roles
  const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } })
  const nodeOfficerRole = await prisma.role.findUnique({ where: { name: "Node Officer" } })
  const userRole = await prisma.role.findUnique({ where: { name: "User" } })
  const contentManagerRole = await prisma.role.findUnique({ where: { name: "Content Manager" } })
  const analystRole = await prisma.role.findUnique({ where: { name: "Analyst" } })

  if (!adminRole || !nodeOfficerRole || !userRole || !contentManagerRole || !analystRole) {
    console.error("Required roles not found. Please run seed.ts first.")
    process.exit(1)
  }

  // Create admin user
  const adminEmail = "admin@example.com"
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin User",
        password: await hash("Admin123!", 10),
        role: "ADMIN",
        roleId: adminRole.id,
        emailVerified: new Date(),
        organization: "NGDI",
        department: "Administration",
        phone: "+2348000000000"
      }
    })
    console.log("Created admin user")
  }

  // Create node officer user
  const nodeOfficerEmail = "nodeofficer@example.com"
  const existingNodeOfficer = await prisma.user.findUnique({
    where: { email: nodeOfficerEmail }
  })

  if (!existingNodeOfficer) {
    await prisma.user.create({
      data: {
        email: nodeOfficerEmail,
        name: "Node Officer",
        password: await hash("NodeOfficer123!", 10),
        role: "NODE_OFFICER",
        roleId: nodeOfficerRole.id,
        emailVerified: new Date(),
        organization: "NGDI",
        department: "Node Office",
        phone: "+2348000000001"
      }
    })
    console.log("Created node officer user")
  }

  // Create regular user
  const userEmail = "user@example.com"
  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail }
  })

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: userEmail,
        name: "Regular User",
        password: await hash("User123!", 10),
        role: "USER",
        roleId: userRole.id,
        emailVerified: new Date(),
        organization: "Example Organization",
        department: "Research",
        phone: "+2348000000002"
      }
    })
    console.log("Created regular user")
  }

  // Create content manager user
  const contentManagerEmail = "contentmanager@example.com"
  const existingContentManager = await prisma.user.findUnique({
    where: { email: contentManagerEmail }
  })

  if (!existingContentManager) {
    await prisma.user.create({
      data: {
        email: contentManagerEmail,
        name: "Content Manager",
        password: await hash("ContentManager123!", 10),
        role: "USER",
        roleId: contentManagerRole.id,
        emailVerified: new Date(),
        organization: "Content Organization",
        department: "Content Management",
        phone: "+2348000000003"
      }
    })
    console.log("Created content manager user")
  }

  // Create analyst user
  const analystEmail = "analyst@example.com"
  const existingAnalyst = await prisma.user.findUnique({
    where: { email: analystEmail }
  })

  if (!existingAnalyst) {
    await prisma.user.create({
      data: {
        email: analystEmail,
        name: "Data Analyst",
        password: await hash("Analyst123!", 10),
        role: "USER",
        roleId: analystRole.id,
        emailVerified: new Date(),
        organization: "Analytics Organization",
        department: "Data Analysis",
        phone: "+2348000000004"
      }
    })
    console.log("Created analyst user")
  }

  // Create unverified user
  const unverifiedEmail = "unverified@example.com"
  const existingUnverified = await prisma.user.findUnique({
    where: { email: unverifiedEmail }
  })

  if (!existingUnverified) {
    await prisma.user.create({
      data: {
        email: unverifiedEmail,
        name: "Unverified User",
        password: await hash("Unverified123!", 10),
        role: "USER",
        roleId: userRole.id,
        organization: "Pending Organization",
        department: "Pending",
        phone: "+2348000000005"
      }
    })
    console.log("Created unverified user")
  }

  // Create locked user
  const lockedEmail = "locked@example.com"
  const existingLocked = await prisma.user.findUnique({
    where: { email: lockedEmail }
  })

  if (!existingLocked) {
    await prisma.user.create({
      data: {
        email: lockedEmail,
        name: "Locked User",
        password: await hash("Locked123!", 10),
        role: "USER",
        roleId: userRole.id,
        emailVerified: new Date(),
        organization: "Locked Organization",
        department: "Locked",
        phone: "+2348000000006",
        locked: true,
        lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        failedAttempts: 5,
        lastFailedAttempt: new Date()
      }
    })
    console.log("Created locked user")
  }

  console.log("Users seeded successfully")
}

/**
 * Seed metadata
 */
async function seedMetadata() {
  console.log("Seeding metadata...")

  // Get users
  const admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } })
  const nodeOfficer = await prisma.user.findUnique({ where: { email: "nodeofficer@example.com" } })
  const user = await prisma.user.findUnique({ where: { email: "user@example.com" } })
  const contentManager = await prisma.user.findUnique({ where: { email: "contentmanager@example.com" } })

  if (!admin || !nodeOfficer || !user || !contentManager) {
    console.error("Required users not found")
    return
  }

  // Sample metadata entries
  const sampleMetadata = [
    // Admin's metadata
    {
      title: "Nigeria Administrative Boundaries",
      dataName: "Nigeria Administrative Boundaries",
      dataType: "Vector",
      abstract: "This dataset contains the administrative boundaries of Nigeria, including states, local government areas, and wards.",
      purpose: "To provide a comprehensive reference for administrative boundaries in Nigeria.",
      productionDate: "2023-01-15",
      organization: "NGDI",
      author: "Admin User",
      categories: ["administrativeBoundaries", "referenceData"],
      frameworkType: "Vector",
      thumbnailUrl: "https://example.com/thumbnails/admin-boundaries.jpg",
      imageName: "admin-boundaries.jpg",
      dateFrom: "2023-01-01",
      dateTo: "2023-12-31",
      updateFrequency: "Annually",
      validationStatus: "Validated",
      assessment: "Complete",
      coordinateUnit: "DD",
      minLatitude: 4.277,
      minLongitude: 2.668,
      maxLatitude: 13.892,
      maxLongitude: 14.68,
      coordinateSystem: "WGS 84",
      projection: "Geographic",
      scale: 100000,
      resolution: "1:100,000",
      fileFormat: "Shapefile",
      fileSize: 25000000,
      numFeatures: 774,
      distributionFormat: "Digital",
      accessMethod: "Download",
      downloadUrl: "https://example.com/downloads/admin-boundaries.zip",
      apiEndpoint: "https://api.example.com/datasets/admin-boundaries",
      licenseType: "CC BY 4.0",
      usageTerms: "Attribution required",
      attributionRequirements: "Data provided by NGDI",
      accessRestrictions: [],
      locationInfo: {
        country: "Nigeria",
        geopoliticalZone: "All",
        state: "All",
        lga: "All"
      },
      qualityInfo: {
        accuracyLevel: "High",
        completeness: 100,
        consistencyCheck: true
      },
      contactInfo: {
        contactPerson: "Admin User",
        email: "admin@example.com",
        department: "Administration"
      },
      userId: admin.id
    },
    // Node Officer's metadata
    {
      title: "Nigeria Land Cover 2023",
      dataName: "Nigeria Land Cover 2023",
      dataType: "Raster",
      abstract: "This dataset provides land cover classification for Nigeria based on satellite imagery from 2023.",
      purpose: "To monitor land use and land cover changes in Nigeria.",
      productionDate: "2023-06-30",
      organization: "NGDI",
      author: "Node Officer",
      categories: ["landCover", "environmentalData"],
      frameworkType: "Raster",
      thumbnailUrl: "https://example.com/thumbnails/land-cover.jpg",
      imageName: "land-cover.jpg",
      dateFrom: "2023-01-01",
      dateTo: "2023-12-31",
      updateFrequency: "Annually",
      validationStatus: "Under Review",
      assessment: "Complete",
      coordinateUnit: "DD",
      minLatitude: 4.277,
      minLongitude: 2.668,
      maxLatitude: 13.892,
      maxLongitude: 14.68,
      coordinateSystem: "WGS 84",
      projection: "Geographic",
      scale: 30,
      resolution: "30m",
      fileFormat: "GeoTIFF",
      fileSize: 500000000,
      distributionFormat: "Digital",
      accessMethod: "Download",
      downloadUrl: "https://example.com/downloads/land-cover.zip",
      apiEndpoint: "https://api.example.com/datasets/land-cover",
      licenseType: "CC BY 4.0",
      usageTerms: "Attribution required",
      attributionRequirements: "Data provided by NGDI",
      accessRestrictions: [],
      locationInfo: {
        country: "Nigeria",
        geopoliticalZone: "All",
        state: "All",
        lga: "All"
      },
      qualityInfo: {
        accuracyLevel: "Medium",
        completeness: 95,
        consistencyCheck: true
      },
      contactInfo: {
        contactPerson: "Node Officer",
        email: "nodeofficer@example.com",
        department: "Node Office"
      },
      userId: nodeOfficer.id
    },
    // User's metadata
    {
      title: "Lagos State Road Network",
      dataName: "Lagos State Road Network",
      dataType: "Vector",
      abstract: "This dataset contains the road network of Lagos State, including highways, major roads, and streets.",
      purpose: "To provide a comprehensive reference for road infrastructure in Lagos State.",
      productionDate: "2023-03-15",
      organization: "Example Organization",
      author: "Regular User",
      categories: ["transportation", "infrastructure"],
      frameworkType: "Vector",
      thumbnailUrl: "https://example.com/thumbnails/lagos-roads.jpg",
      imageName: "lagos-roads.jpg",
      dateFrom: "2023-01-01",
      dateTo: "2023-12-31",
      updateFrequency: "Quarterly",
      validationStatus: "Pending",
      assessment: "Complete",
      coordinateUnit: "DD",
      minLatitude: 6.393,
      minLongitude: 2.668,
      maxLatitude: 6.7,
      maxLongitude: 3.47,
      coordinateSystem: "WGS 84",
      projection: "Geographic",
      scale: 10000,
      resolution: "1:10,000",
      fileFormat: "Shapefile",
      fileSize: 15000000,
      numFeatures: 5000,
      distributionFormat: "Digital",
      accessMethod: "Download",
      downloadUrl: "https://example.com/downloads/lagos-roads.zip",
      apiEndpoint: "https://api.example.com/datasets/lagos-roads",
      licenseType: "CC BY 4.0",
      usageTerms: "Attribution required",
      attributionRequirements: "Data provided by Example Organization",
      accessRestrictions: [],
      locationInfo: {
        country: "Nigeria",
        geopoliticalZone: "South West",
        state: "Lagos",
        lga: "All"
      },
      qualityInfo: {
        accuracyLevel: "High",
        completeness: 90,
        consistencyCheck: true
      },
      contactInfo: {
        contactPerson: "Regular User",
        email: "user@example.com",
        department: "Research"
      },
      userId: user.id
    },
    // Content Manager's metadata
    {
      title: "Nigeria Population Density 2023",
      dataName: "Nigeria Population Density 2023",
      dataType: "Raster",
      abstract: "This dataset provides population density estimates for Nigeria based on census data and satellite imagery.",
      purpose: "To support population-based planning and decision making.",
      productionDate: "2023-09-30",
      organization: "Content Organization",
      author: "Content Manager",
      categories: ["demographicData", "populationData"],
      frameworkType: "Raster",
      thumbnailUrl: "https://example.com/thumbnails/population-density.jpg",
      imageName: "population-density.jpg",
      dateFrom: "2023-01-01",
      dateTo: "2023-12-31",
      updateFrequency: "Annually",
      validationStatus: "Validated",
      assessment: "Complete",
      coordinateUnit: "DD",
      minLatitude: 4.277,
      minLongitude: 2.668,
      maxLatitude: 13.892,
      maxLongitude: 14.68,
      coordinateSystem: "WGS 84",
      projection: "Geographic",
      scale: 1000,
      resolution: "1km",
      fileFormat: "GeoTIFF",
      fileSize: 200000000,
      distributionFormat: "Digital",
      accessMethod: "Download",
      downloadUrl: "https://example.com/downloads/population-density.zip",
      apiEndpoint: "https://api.example.com/datasets/population-density",
      licenseType: "CC BY 4.0",
      usageTerms: "Attribution required",
      attributionRequirements: "Data provided by Content Organization",
      accessRestrictions: [],
      locationInfo: {
        country: "Nigeria",
        geopoliticalZone: "All",
        state: "All",
        lga: "All"
      },
      qualityInfo: {
        accuracyLevel: "Medium",
        completeness: 85,
        consistencyCheck: true
      },
      contactInfo: {
        contactPerson: "Content Manager",
        email: "contentmanager@example.com",
        department: "Content Management"
      },
      userId: contentManager.id
    }
  ]

  // Check if metadata already exists
  const existingMetadata = await prisma.metadata.findMany({
    select: { title: true }
  })
  const existingTitles = new Set(existingMetadata.map(m => m.title))

  // Create metadata entries
  for (const metadata of sampleMetadata) {
    if (existingTitles.has(metadata.title)) {
      console.log(`Metadata "${metadata.title}" already exists, skipping`)
      continue
    }

    await prisma.metadata.create({
      data: metadata
    })
    console.log(`Created metadata: ${metadata.title}`)
  }

  console.log("Metadata seeded successfully")
}

/**
 * Seed settings
 */
async function seedSettings() {
  console.log("Seeding settings...")

  // Check if settings already exist
  const existingSettings = await prisma.settings.findUnique({
    where: { id: "default" }
  })

  if (existingSettings) {
    console.log("Settings already exist, skipping")
    return
  }

  // Create settings
  await prisma.settings.create({
    data: {
      id: "default",
      siteName: "NGDI Portal",
      siteDescription: "Nigeria Geospatial Data Infrastructure Portal",
      supportEmail: "support@ngdi.gov.ng",
      maxUploadSize: 100, // 100 MB
      defaultLanguage: "en",
      maintenanceMode: false,
      enableRegistration: true,
      requireEmailVerification: true,
      metadataValidation: true,
      autoBackup: true,
      backupFrequency: "daily",
      storageProvider: "local",
      apiRateLimit: 100,
      updatedAt: new Date()
    }
  })

  console.log("Settings seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
