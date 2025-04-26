import { Page } from "@playwright/test"
import { UserRole } from "@prisma/client"
import { testDataFactory } from "./test-data-factory"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

export async function loginUser(
  page: Page,
  email: string,
  password: string = "Test@123456"
) {
  await page.goto(`${BASE_URL}/auth/signin`)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
}

export async function createAndLoginUser(
  page: Page,
  role: UserRole = UserRole.USER
) {
  const user = await testDataFactory.createUser({ role })
  await loginUser(page, user.email || "")
  return user
}

export async function fillMetadataForm(
  page: Page,
  data: {
    title?: string
    author?: string
    abstract?: string
    dateFrom?: string
    dateTo?: string
    purpose?: string
    frameworkType?: string
    coordinateSystem?: string
    projection?: string
    scale?: string
    accuracyLevel?: string
  } = {}
) {
  const defaultData = {
    title: "Test Dataset",
    author: "Test Author",
    abstract: "Test abstract description",
    dateFrom: "2024-01-01",
    dateTo: "2024-12-31",
    purpose: "Test purpose",
    frameworkType: "Test Framework",
    coordinateSystem: "WGS84",
    projection: "UTM",
    scale: "1000",
    accuracyLevel: "High",
    ...data,
  }

  await page.fill('input[name="title"]', defaultData.title)
  await page.fill('input[name="author"]', defaultData.author)
  await page.fill('textarea[name="abstract"]', defaultData.abstract)
  await page.fill('input[name="dateFrom"]', defaultData.dateFrom)
  await page.fill('input[name="dateTo"]', defaultData.dateTo)
  await page.fill('textarea[name="purpose"]', defaultData.purpose)
  await page.selectOption(
    'select[name="frameworkType"]',
    defaultData.frameworkType
  )
  await page.fill(
    'input[name="coordinateSystem"]',
    defaultData.coordinateSystem
  )
  await page.fill('input[name="projection"]', defaultData.projection)
  await page.fill('input[name="scale"]', defaultData.scale)
  await page.fill('input[name="accuracyLevel"]', defaultData.accuracyLevel)
}

export async function fillProfileForm(
  page: Page,
  data: {
    name?: string
    organization?: string
    phone?: string
  } = {}
) {
  const defaultData = {
    name: "Updated Name",
    organization: "Updated Organization",
    phone: "+9876543210",
    ...data,
  }

  await page.fill('input[name="name"]', defaultData.name)
  await page.fill('input[name="organization"]', defaultData.organization)
  await page.fill('input[name="phone"]', defaultData.phone)
}

export async function changePassword(
  page: Page,
  { currentPassword = "Test@123456", newPassword = "NewTest@123456" } = {}
) {
  await page.click('button:has-text("Change Password")')
  await page.fill('input[name="currentPassword"]', currentPassword)
  await page.fill('input[name="newPassword"]', newPassword)
  await page.fill('input[name="confirmPassword"]', newPassword)
  await page.click('button[type="submit"]')
}

type NavigationSection =
  | "profile"
  | "metadata"
  | "metadata-add"
  | "metadata-search"
  | "admin-users"

export async function navigateToSection(
  page: Page,
  section: NavigationSection
) {
  const sectionMap: Record<NavigationSection, () => Promise<void>> = {
    profile: async () => {
      await page.click('[aria-label="Open user menu"]')
      await page.click('a[href="/profile"]')
    },
    metadata: async () => {
      await page.click('a[href="/metadata"]')
    },
    "metadata-add": async () => {
      await page.click('a[href="/metadata/add"]')
    },
    "metadata-search": async () => {
      await page.click('a[href="/metadata/search"]')
    },
    "admin-users": async () => {
      await page.click('a[href="/admin/users"]')
    },
  }

  const navigate = sectionMap[section]
  if (navigate) {
    await navigate()
  } else {
    throw new Error(`Unknown section: ${section}`)
  }
}

export async function applyMetadataFilters(
  page: Page,
  filters: {
    search?: string
    dateFrom?: string
    dateTo?: string
    frameworkType?: string
  } = {}
) {
  if (filters.search) {
    await page.fill('input[name="search"]', filters.search)
    await page.click('button[aria-label="Search"]')
  }

  if (filters.dateFrom) {
    await page.fill('input[name="dateFrom"]', filters.dateFrom)
  }

  if (filters.dateTo) {
    await page.fill('input[name="dateTo"]', filters.dateTo)
  }

  if (filters.frameworkType) {
    await page.selectOption(
      'select[name="frameworkType"]',
      filters.frameworkType
    )
  }

  if (Object.keys(filters).length > 0) {
    await page.click('button[aria-label="Apply filters"]')
  }
}

export async function clearMetadataFilters(page: Page) {
  await page.click('button[aria-label="Clear filters"]')
}
