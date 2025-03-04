import { Metadata, PrismaClient, User, UserRole } from "@prisma/client"
import { testDb } from "./test-db"
import { hash } from "bcryptjs"

interface CreateUserParams {
  email?: string
  name?: string
  role?: UserRole
  password?: string
  phone?: string
  isVerified?: boolean
}

interface CreateMetadataParams {
  title?: string
  author?: string
  abstract?: string
  dateFrom?: string
  dateTo?: string
  purpose?: string
  frameworkType?: string
  coordinateSystem?: string
  projection?: string
  scale?: number
  accuracyLevel?: string
  organization?: string
  thumbnailUrl?: string
  imageName?: string
  fileFormat?: string
  distributionFormat?: string
  accessMethod?: string
  licenseType?: string
  usageTerms?: string
  attributionRequirements?: string
  contactPerson?: string
  contactEmail?: string
}

class TestDataFactory {
  private testDataIds: string[] = []

  async createUser({
    email = `test-${Date.now()}@example.com`,
    name = "Test User",
    role = UserRole.USER,
    password = "Test@123456",
    phone = "+1234567890",
    isVerified = true,
  }: CreateUserParams = {}): Promise<User> {
    const hashedPassword = await hash(password, 12)

    const user = await testDb.user.create({
      data: {
        email,
        name,
        role,
        password: hashedPassword,
        phone,
        emailVerified: isVerified ? new Date() : null,
      },
    })

    this.testDataIds.push(user.id)
    return user
  }

  async createMetadata(
    userId: string,
    {
      title = "Test Dataset",
      author = "Test Author",
      abstract = "Test abstract description",
      dateFrom = "2024-01-01",
      dateTo = "2024-12-31",
      purpose = "Test purpose",
      frameworkType = "Test Framework",
      coordinateSystem = "WGS84",
      projection = "UTM",
      scale = 1000,
      accuracyLevel = "High",
      organization = "Test Organization",
      thumbnailUrl = "https://example.com/thumb.jpg",
      imageName = "test-image.jpg",
      fileFormat = "GeoJSON",
      distributionFormat = "Download",
      accessMethod = "Direct",
      licenseType = "MIT",
      usageTerms = "Free to use",
      attributionRequirements = "Cite source",
      contactPerson = "Test Contact",
      contactEmail = "contact@test.com",
    }: CreateMetadataParams = {}
  ): Promise<Metadata> {
    const metadata = await testDb.metadata.create({
      data: {
        title,
        author,
        abstract,
        dateFrom,
        dateTo,
        purpose,
        frameworkType,
        coordinateSystem,
        projection,
        scale,
        accuracyLevel,
        organization,
        thumbnailUrl,
        imageName,
        fileFormat,
        distributionFormat,
        accessMethod,
        licenseType,
        usageTerms,
        attributionRequirements,
        contactPerson,
        email: contactEmail,
        userId,
      },
    })

    this.testDataIds.push(metadata.id)
    return metadata
  }

  async cleanupTestData(): Promise<void> {
    await testDb.metadata.deleteMany({
      where: { id: { in: this.testDataIds } },
    })
    await testDb.user.deleteMany({
      where: { id: { in: this.testDataIds } },
    })
    this.testDataIds = []
  }
}

export const testDataFactory = new TestDataFactory()
