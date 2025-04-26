Implementing a Proper Test Suite for the Admin Dashboard
Based on my analysis of the codebase, I'll outline a comprehensive test suite for the admin dashboard. I'll provide implementation details for various test types to ensure proper coverage of functionality, API integration, accessibility, and performance.

1. Test Structure Overview
The test suite will be organized as follows:

tests/  
├── admin/  
│   ├── admin.test.ts           # E2E tests  
│   ├── admin.api.test.ts       # API integration tests  
│   ├── admin.component.test.ts # Component tests  
│   ├── admin.accessibility.test.ts # Accessibility tests  
│   └── admin.performance.test.ts   # Performance tests  
├── helpers/  
│   ├── admin-helpers.ts        # Admin-specific test helpers  
│   └── admin-test-data.ts      # Test data factory for admin tests  
2. E2E Tests Implementation (admin.test.ts)
Let's start with end-to-end tests that verify the main admin dashboard functionality:

// tests/admin/admin.test.ts  
import { test, expect, type Page } from "@playwright/test"  
import { UserRole } from "@prisma/client"  
import {   
  setupTestUser,   
  clearSession,  
  signIn  
} from "../helpers/auth"  
import { setupAdminTestData } from "../helpers/admin-helpers"  
  
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"  
  
test.describe("Admin Dashboard", () => {  
  test.beforeEach(async ({ page }) => {  
    await clearSession(page)  
  })  
  
  test("should redirect non-admin users", async ({ page }) => {  
    // Setup regular user  
    await setupTestUser(page, UserRole.USER)  
      
    // Try to access admin dashboard  
    await page.goto(`${BASE_URL}/admin`)  
      
    // Should redirect to unauthorized page  
    await expect(page.url()).toContain("/unauthorized")  
  })  
  
  test("should display dashboard for admin users", async ({ page }) => {  
    // Setup admin user  
    await setupTestUser(page, UserRole.ADMIN)  
      
    // Go to admin dashboard  
    await page.goto(`${BASE_URL}/admin`)  
      
    // Verify key dashboard elements are visible  
    await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible()  
    await expect(page.getByText("System Overview")).toBeVisible()  
    await expect(page.getByText("Total Users")).toBeVisible()  
    await expect(page.getByText("Organizations")).toBeVisible()  
    await expect(page.getByText("Metadata Entries")).toBeVisible()  
  })  
  
  test("should display correct stats on dashboard", async ({ page }) => {  
    // Setup admin user and test data  
    await setupTestUser(page, UserRole.ADMIN)  
    const testData = await setupAdminTestData()  
      
    // Go to admin dashboard  
    await page.goto(`${BASE_URL}/admin`)  
      
    // Wait for stats to load  
    await page.waitForSelector(".text-2xl.font-bold", { state: "visible" })  
      
    // Verify total users count is displayed and not zero  
    const userCountElement = page.locator("text=Total Users").locator("xpath=./following::h3").first()  
    await expect(userCountElement).not.toHaveText("0")  
      
    // Verify metadata count  
    const metadataCountElement = page.locator("text=Metadata Entries").locator("xpath=./following::h3").first()  
    await expect(metadataCountElement).not.toHaveText("0")  
  })  
  
  test("should navigate to user management page", async ({ page }) => {  
    await setupTestUser(page, UserRole.ADMIN)  
    await page.goto(`${BASE_URL}/admin`)  
      
    // Click on Manage Users button  
    await page.getByRole("link", { name: "Manage Users" }).click()  
      
    // Verify navigation to users page  
    await expect(page.url()).toContain("/admin/users")  
    await expect(page.getByText("User Management")).toBeVisible()  
  })  
  
  test("should navigate to organizations page", async ({ page }) => {  
    await setupTestUser(page, UserRole.ADMIN)  
    await page.goto(`${BASE_URL}/admin`)  
      
    // Click on View Organizations button  
    await page.getByRole("link", { name: "View Organizations" }).click()  
      
    // Verify navigation to organizations page  
    await expect(page.url()).toContain("/admin/organizations")  
    await expect(page.getByText("Organizations")).toBeVisible()  
  })  
  
  test("should navigate to system settings page", async ({ page }) => {  
    await setupTestUser(page, UserRole.ADMIN)  
    await page.goto(`${BASE_URL}/admin`)  
      
    // Click on System Settings button  
    await page.getByRole("link", { name: "System Settings" }).click()  
      
    // Verify navigation to settings page  
    await expect(page.url()).toContain("/admin/settings")  
    await expect(page.getByText("System Settings")).toBeVisible()  
  })  
})
3. API Tests Implementation (admin.api.test.ts)
Next, let's implement tests for the admin API endpoints:

// tests/admin/admin.api.test.ts  
import { test, expect } from "@playwright/test"  
import { testDataFactory } from "../helpers/test-data-factory"  
import { UserRole } from "@prisma/client"  
  
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"  
  
test.describe("Admin API", () => {  
  let adminAuthToken: string  
  let regularUserAuthToken: string  
  
  test.beforeAll(async ({ request }) => {  
    // Create an admin user  
    const adminUser = await testDataFactory.createUser({  
      role: UserRole.ADMIN,  
      email: "admin-test@example.com"  
    })  
      
    // Create a regular user  
    const regularUser = await testDataFactory.createUser({  
      role: UserRole.USER,  
      email: "user-test@example.com"  
    })  
      
    // Get auth tokens for both users  
    adminAuthToken = await testDataFactory.getAuthToken(adminUser.email)  
    regularUserAuthToken = await testDataFactory.getAuthToken(regularUser.email)  
  })  
  
  test.afterAll(async () => {  
    await testDataFactory.cleanupTestData()  
  })  
  
  test("should fetch dashboard stats for admin user", async ({ request }) => {  
    const response = await request.get(`${BASE_URL}/api/admin/dashboard-stats`, {  
      headers: {  
        "Authorization": `Bearer ${adminAuthToken}`  
      }  
    })  
      
    expect(response.ok()).toBeTruthy()  
      
    const data = await response.json()  
    expect(data.totalUsers).toBeDefined()  
    expect(data.totalMetadata).toBeDefined()  
    expect(data.userRoleDistribution).toBeDefined()  
    expect(data.recentMetadata).toBeDefined()  
  })  
  
  test("should deny dashboard stats to non-admin user", async ({ request }) => {  
    const response = await request.get(`${BASE_URL}/api/admin/dashboard-stats`, {  
      headers: {  
        "Authorization": `Bearer ${regularUserAuthToken}`  
      }  
    })  
      
    expect(response.status()).toBe(403)  
  })  
  
  test("should fetch user listing", async ({ request }) => {  
    const response = await request.get(`${BASE_URL}/api/admin/users`, {  
      headers: {  
        "Authorization": `Bearer ${adminAuthToken}`  
      }  
    })  
      
    expect(response.ok()).toBeTruthy()  
      
    const data = await response.json()  
    expect(data.success).toBeTruthy()  
    expect(data.data.users).toBeDefined()  
    expect(data.data.pagination).toBeDefined()  
  })  
  
  test("should update user role", async ({ request }) => {  
    // Create a test user  
    const testUser = await testDataFactory.createUser({  
      role: UserRole.USER,  
      email: "role-update-test@example.com"  
    })  
      
    const response = await request.put(`${BASE_URL}/api/admin/users/${testUser.id}/role`, {  
      headers: {  
        "Authorization": `Bearer ${adminAuthToken}`  
      },  
      data: {  
        role: UserRole.NODE_OFFICER  
      }  
    })  
      
    expect(response.ok()).toBeTruthy()  
      
    const data = await response.json()  
    expect(data.success).toBeTruthy()  
    expect(data.data.role).toBe(UserRole.NODE_OFFICER)  
  })  
  
  test("should delete user", async ({ request }) => {  
    // Create a test user to delete  
    const testUser = await testDataFactory.createUser({  
      role: UserRole.USER,  
      email: "delete-test@example.com"  
    })  
      
    const response = await request.delete(`${BASE_URL}/api/admin/users/${testUser.id}`, {  
      headers: {  
        "Authorization": `Bearer ${adminAuthToken}`  
      }  
    })  
      
    expect(response.ok()).toBeTruthy()  
      
    const data = await response.json()  
    expect(data.success).toBeTruthy()  
      
    // Verify user no longer exists  
    const checkResponse = await request.get(`${BASE_URL}/api/admin/users/${testUser.id}`, {  
      headers: {  
        "Authorization": `Bearer ${adminAuthToken}`  
      }  
    })  
      
    expect(checkResponse.status()).toBe(404)  
  })  
})
4. Accessibility Tests (admin.accessibility.test.ts)
Let's implement accessibility tests using axe-core:

// tests/admin/admin.accessibility.test.ts  
import { test, expect } from "@playwright/test"  
import { UserRole } from "@prisma/client"  
import { setupTestUser, clearSession } from "../helpers/auth"  
import AxeBuilder from "@axe-core/playwright"  
  
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"  
  
test.describe("Admin Dashboard Accessibility", () => {  
  test.beforeEach(async ({ page }) => {  
    await clearSession(page)  
    await setupTestUser(page, UserRole.ADMIN)  
  })  
  
  test("admin dashboard should not have accessibility violations", async ({ page }) => {  
    await page.goto(`${BASE_URL}/admin`)  
      
    const accessibilityScanResults = await new AxeBuilder({ page })  
      .include("#root")  
      .analyze()  
      
    expect(accessibilityScanResults.violations).toHaveLength(0)  
  })  
  
  test("admin users page should not have accessibility violations", async ({ page }) => {  
    await page.goto(`${BASE_URL}/admin/users`)  
      
    const accessibilityScanResults = await new AxeBuilder({ page })  
      .include("#root")  
      .analyze()  
      
    expect(accessibilityScanResults.violations).toHaveLength(0)  
  })  
  
  test("admin settings page should not have accessibility violations", async ({ page }) => {  
    await page.goto(`${BASE_URL}/admin/settings`)  
      
    const accessibilityScanResults = await new AxeBuilder({ page })  
      .include("#root")  
      .analyze()  
      
    expect(accessibilityScanResults.violations).toHaveLength(0)  
  })  
})
5. Performance Tests (admin.performance.test.ts)
// tests/admin/admin.performance.test.ts  
import { test, expect } from "@playwright/test"  
import { UserRole } from "@prisma/client"  
import { setupTestUser, clearSession } from "../helpers/auth"  
  
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"  
const PERFORMANCE_THRESHOLD = 3000 // 3 seconds  
  
test.describe("Admin Dashboard Performance", () => {  
  test.beforeEach(async ({ page }) => {  
    await clearSession(page)  
    await setupTestUser(page, UserRole.ADMIN)  
  })  
  
  test("admin dashboard should load within performance threshold", async ({ page }) => {  
    const startTime = Date.now()  
      
    await page.goto(`${BASE_URL}/admin`)  
      
    // Wait for key element that indicates page is loaded  
    await page.waitForSelector("text=System Overview", { state: "visible" })  
      
    const loadTime = Date.now() - startTime  
    console.log(`Admin dashboard load time: ${loadTime}ms`)  
      
    // Assert that load time is within acceptable threshold  
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLD)  
  })  
  
  test("users page should load within performance threshold", async ({ page }) => {  
    const startTime = Date.now()  
      
    await page.goto(`${BASE_URL}/admin/users`)  
      
    // Wait for table to be visible  
    await page.waitForSelector("table", { state: "visible" })  
      
    const loadTime = Date.now() - startTime  
    console.log(`Admin users page load time: ${loadTime}ms`)  
      
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLD)  
  })  
  
  test("dashboard API response time should be within threshold", async ({ request }) => {  
    // Get auth token  
    const authToken = await page.evaluate(() => localStorage.getItem("authToken"))  
      
    const startTime = Date.now()  
      
    const response = await request.get(`${BASE_URL}/api/admin/dashboard-stats`, {  
      headers: {  
        "Authorization": `Bearer ${authToken}`  
      }  
    })  
      
    const responseTime = Date.now() - startTime  
    console.log(`Dashboard stats API response time: ${responseTime}ms`)  
      
    expect(response.ok()).toBeTruthy()  
    expect(responseTime).toBeLessThan(1000) // API should respond in less than 1 second  
  })  
})
6. Helper Functions (admin-helpers.ts)
// tests/helpers/admin-helpers.ts  
import { PrismaClient, UserRole, User } from "@prisma/client"  
import { hash } from "bcryptjs"  
  
const prisma = new PrismaClient()  
  
export async function setupAdminTestData() {  
  // Create test users with different roles  
  const users = await Promise.all([  
    prisma.user.create({  
      data: {  
        email: `test-admin-user-${Date.now()}@example.com`,  
        name: "Test Admin",  
        password: await hash("Test@123456", 12),  
        role: UserRole.ADMIN,  
        emailVerified: true,  
        organization: "Test Organization",  
      },  
    }),  
    prisma.user.create({  
      data: {  
        email: `test-regular-user-${Date.now()}@example.com`,  
        name: "Test User",  
        password: await hash("Test@123456", 12),  
        role: UserRole.USER,  
        emailVerified: true,  
        organization: "Test Organization",  
      },  
    }),  
    prisma.user.create({  
      data: {  
        email: `test-node-officer-${Date.now()}@example.com`,  
        name: "Test Node Officer",  
        password: await hash("Test@123456", 12),  
        role: UserRole.NODE_OFFICER,  
        emailVerified: true,  
        organization: "Test Organization",  
      },  
    })  
  ])  
  
  // Create test metadata entries  
  const metadata = await Promise.all([  
    prisma.metadata.create({  
      data: {  
        title: "Test Metadata 1",  
        description: "Test description 1",  
        author: "Test Author 1",  
        organization: "Test Organization",  
        frameworkType: "ISO 19115",  
        userId: users[0].id,  
      }  
    }),  
    prisma.metadata.create({  
      data: {  
        title: "Test Metadata 2",  
        description: "Test description 2",  
        author: "Test Author 2",  
        organization: "Another Organization",  
        frameworkType: "Dublin Core",  
        userId: users[1].id,  
      }  
    })  
  ])  
  
  return {  
    users,  
    metadata  
  }  
}  
  
export async function cleanupAdminTestData() {  
  // Delete test metadata  
  await prisma.metadata.deleteMany({  
    where: {  
      OR: [  
        { title: { startsWith: "Test Metadata" } },  
        { author: { startsWith: "Test Author" } }  
      ]  
    }  
  })  
  
  // Delete test users  
  await prisma.user.deleteMany({  
    where: {  
      email: { contains: "test-" }  
    }  
  })  
}
7. Test Runner Configuration Update
Update the playwright.config.ts to include metadata for the admin tests:

// Add to the metadata section in playwright.config.ts  
metadata: {  
  // ... existing metadata entries  
  "admin/e2e": {  
    testDir: "tests/admin/admin.test.ts",  
    description: "Admin dashboard end-to-end tests",  
  },  
  "admin/api": {  
    testDir: "tests/admin/admin.api.test.ts",  
    description: "Admin API integration tests",  
  },  
  "admin/accessibility": {  
    testDir: "tests/admin/admin.accessibility.test.ts",  
    description: "Admin accessibility tests",  
  },  
  "admin/performance": {  
    testDir: "tests/admin/admin.performance.test.ts",  
    description: "Admin performance tests",  
  },  
}
8. Update package.json Scripts
Add new scripts to package.json for running admin-specific tests:

"scripts": {  
  // ... existing scripts  
  "test:admin": "playwright test tests/admin",  
  "test:admin:e2e": "playwright test tests/admin/admin.test.ts",  
  "test:admin:api": "playwright test tests/admin/admin.api.test.ts",  
  "test:admin:accessibility": "playwright test tests/admin/admin.accessibility.test.ts",  
  "test:admin:performance": "playwright test tests/admin/admin.performance.test.ts"  
}

Notes
The implementation follows the existing testing patterns in the project while adding comprehensive test coverage for the admin dashboard.
The tests cover E2E functionality, API integration, accessibility, and performance aspects.
I've created helper functions to set up test data specifically for admin tests.
Each test suite focuses on a specific aspect of the admin dashboard to maintain test clarity.
The test implementation assumes that the necessary database setup and teardown is handled correctly to avoid test pollution.
The performance thresholds should be adjusted based on actual application performance requirements.
Review other parts of the project to ensure the tests are integrated correctly and that the application is ready for production deployment.


