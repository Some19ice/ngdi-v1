import { prisma } from "../src"
import { hash } from "bcryptjs"

/**
 * Seed the database with test data
 * This script is intended for testing use only
 */
async function main() {
  console.log("Starting test database seeding...")

  // Create test users
  await seedTestUsers()

  // Create test metadata
  await seedTestMetadata()

  // Create test settings
  await seedTestSettings()

  console.log("Test database seeding completed!")
}

/**
 * Seed test users
 */
async function seedTestUsers() {
  console.log("Seeding test users...")

  // Create test admin user
  const adminEmail = "test-admin@example.com"
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Test Admin",
        password: await hash("TestAdmin123!", 10),
        role: "ADMIN",
        emailVerified: new Date(),
        organization: "Test Organization",
        department: "Test Department",
        phone: "+1234567890"
      }
    })
    console.log("Created test admin user")
  }

  // Create test user
  const userEmail = "test-user@example.com"
  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail }
  })

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: userEmail,
        name: "Test User",
        password: await hash("TestUser123!", 10),
        role: "USER",
        emailVerified: new Date(),
        organization: "Test Organization",
        department: "Test Department",
        phone: "+1234567891"
      }
    })
    console.log("Created test user")
  }

  console.log("Test users seeded successfully")
}

/**
 * Seed test metadata
 */
async function seedTestMetadata() {
  console.log("Seeding test metadata...")

  // Get test users
  const admin = await prisma.user.findUnique({ where: { email: "test-admin@example.com" } })
  const user = await prisma.user.findUnique({ where: { email: "test-user@example.com" } })

  if (!admin || !user) {
    console.error("Test users not found")
    return
  }

  // Sample test metadata entries
  const testMetadata = [
    // Admin's test metadata
    {
      title: "Test Metadata 1",
      dataName: "Test Metadata 1",
      dataType: "Vector",
      abstract: "This is a test metadata entry for testing purposes.",
      purpose: "Testing purposes only.",
      productionDate: "2023-01-01",
      organization: "Test Organization",
      author: "Test Admin",
      categories: ["test"],
      frameworkType: "Vector",
      thumbnailUrl: "https://example.com/test-thumbnail.jpg",
      imageName: "test-thumbnail.jpg",
      dateFrom: "2023-01-01",
      dateTo: "2023-12-31",
      updateFrequency: "Never",
      validationStatus: "Validated",
      assessment: "Complete",
      coordinateUnit: "DD",
      minLatitude: 0,
      minLongitude: 0,
      maxLatitude: 0,
      maxLongitude: 0,
      coordinateSystem: "WGS 84",
      projection: "Geographic",
      scale: 1000,
      resolution: "1:1000",
      fileFormat: "Shapefile",
      fileSize: 1000,
      numFeatures: 10,
      distributionFormat: "Digital",
      accessMethod: "Download",
      downloadUrl: "https://example.com/test-download.zip",
      apiEndpoint: "https://api.example.com/test",
      licenseType: "CC BY 4.0",
      usageTerms: "Attribution required",
      attributionRequirements: "Test attribution",
      accessRestrictions: [],
      userId: admin.id
    },
    // User's test metadata
    {
      title: "Test Metadata 2",
      dataName: "Test Metadata 2",
      dataType: "Raster",
      abstract: "This is another test metadata entry for testing purposes.",
      purpose: "Testing purposes only.",
      productionDate: "2023-01-01",
      organization: "Test Organization",
      author: "Test User",
      categories: ["test"],
      frameworkType: "Raster",
      thumbnailUrl: "https://example.com/test-thumbnail-2.jpg",
      imageName: "test-thumbnail-2.jpg",
      dateFrom: "2023-01-01",
      dateTo: "2023-12-31",
      updateFrequency: "Never",
      validationStatus: "Pending",
      assessment: "Complete",
      coordinateUnit: "DD",
      minLatitude: 0,
      minLongitude: 0,
      maxLatitude: 0,
      maxLongitude: 0,
      coordinateSystem: "WGS 84",
      projection: "Geographic",
      scale: 1000,
      resolution: "1:1000",
      fileFormat: "GeoTIFF",
      fileSize: 1000,
      distributionFormat: "Digital",
      accessMethod: "Download",
      downloadUrl: "https://example.com/test-download-2.zip",
      apiEndpoint: "https://api.example.com/test-2",
      licenseType: "CC BY 4.0",
      usageTerms: "Attribution required",
      attributionRequirements: "Test attribution",
      accessRestrictions: [],
      userId: user.id
    }
  ]

  // Check if test metadata already exists
  const existingMetadata = await prisma.metadata.findMany({
    where: {
      OR: [
        { title: "Test Metadata 1" },
        { title: "Test Metadata 2" }
      ]
    },
    select: { title: true }
  })
  const existingTitles = new Set(existingMetadata.map(m => m.title))

  // Create test metadata entries
  for (const metadata of testMetadata) {
    if (existingTitles.has(metadata.title)) {
      console.log(`Test metadata "${metadata.title}" already exists, skipping`)
      continue
    }

    await prisma.metadata.create({
      data: metadata
    })
    console.log(`Created test metadata: ${metadata.title}`)
  }

  console.log("Test metadata seeded successfully")
}

/**
 * Seed test settings
 */
async function seedTestSettings() {
  console.log("Seeding test settings...")

  // Check if test settings already exist
  const existingSettings = await prisma.settings.findUnique({
    where: { id: "test" }
  })

  if (existingSettings) {
    console.log("Test settings already exist, skipping")
    return
  }

  // Create test settings
  await prisma.settings.create({
    data: {
      id: "test",
      siteName: "Test Portal",
      siteDescription: "Test Portal Description",
      supportEmail: "test@example.com",
      maxUploadSize: 10, // 10 MB
      defaultLanguage: "en",
      maintenanceMode: false,
      enableRegistration: true,
      requireEmailVerification: false,
      metadataValidation: false,
      autoBackup: false,
      backupFrequency: "never",
      storageProvider: "local",
      apiRateLimit: 1000,
      updatedAt: new Date()
    }
  })

  console.log("Test settings seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
