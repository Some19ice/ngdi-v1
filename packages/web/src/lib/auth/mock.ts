/**
 * Helper functions for mock authentication in development
 */
export function getMockAdminToken() {
  return process.env.NEXT_PUBLIC_MOCK_ADMIN_TOKEN || ""
}

export function isMockAuthEnabled() {
  return process.env.NODE_ENV === "development"
}

export const MOCK_ADMIN_USER = {
  id: "demo-user-id",
  email: "admin@example.com",
  role: "ADMIN",
}

/**
 * Utility function to add auth headers to fetch requests
 */
export function withMockAdminAuth(headers: HeadersInit = {}): HeadersInit {
  const newHeaders = { ...headers }

  if (isMockAuthEnabled()) {
    const token = getMockAdminToken()
    if (token) {
      // Add Bearer token to Authorization header
      ;(newHeaders as Record<string, string>)["Authorization"] =
        `Bearer ${token}`
    }
  }

  return newHeaders
}
