import {
  mockAnalyticsData,
  mockDashboardStats,
  mockUsersData,
  mockOrganizationsData,
  mockMetadataData,
} from "../mock/admin-data"

/**
 * Mock handler for admin API requests
 * This utility intercepts fetch requests to admin API endpoints and returns mock data
 */
export class MockAdminApi {
  /**
   * Initialize the mock API by patching the global fetch
   */
  static init() {
    if (typeof window === "undefined") return

    // Store the original fetch
    const originalFetch = window.fetch

    // Override fetch with our mock-aware version
    window.fetch = async function (
      input: RequestInfo | URL,
      init?: RequestInit
    ) {
      const url = input.toString()

      // Only intercept admin API requests
      if (url.includes("/api/admin/")) {
        const mockResponse = MockAdminApi.handleRequest(url, init)
        if (mockResponse) {
          console.log(`[Mock API] Intercepted request to ${url}`)
          return mockResponse
        }
      }

      // Pass through to the original fetch for non-mocked endpoints
      return originalFetch(input, init)
    }

    console.log("[Mock API] Admin API mock initialized")
  }

  /**
   * Handle a mocked request based on the URL
   */
  static handleRequest(url: string, init?: RequestInit): Response | null {
    // Dashboard stats
    if (url.includes("/api/admin/dashboard-stats")) {
      return MockAdminApi.createSuccessResponse(mockDashboardStats)
    }

    // Analytics data
    if (url.includes("/api/admin/analytics")) {
      return MockAdminApi.createSuccessResponse({
        success: true,
        data: mockAnalyticsData,
      })
    }

    // Users list
    if (url.match(/\/api\/admin\/users(\?|$)/)) {
      return MockAdminApi.createSuccessResponse({
        success: true,
        data: mockUsersData,
      })
    }

    // Organizations list
    if (url.includes("/api/admin/organizations")) {
      return MockAdminApi.createSuccessResponse({
        success: true,
        data: mockOrganizationsData,
      })
    }

    // Metadata list
    if (url.includes("/api/admin/metadata")) {
      return MockAdminApi.createSuccessResponse({
        success: true,
        data: mockMetadataData,
      })
    }

    // Add more mock endpoints as needed

    // Return null for endpoints we don't want to mock
    return null
  }

  /**
   * Create a Response object with success data
   */
  static createSuccessResponse(data: any): Response {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Mock-Api": "true",
      },
    })
  }

  /**
   * Create a Response object with error data
   */
  static createErrorResponse(message: string, status = 400): Response {
    return new Response(
      JSON.stringify({
        success: false,
        message,
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Api": "true",
        },
      }
    )
  }
}
