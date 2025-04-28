import { UserRole } from "./auth/constants"
import { UserProfile } from "../types/user"
import { Session } from "../types/auth"
import {
  fetchWithCsrf,
  getCsrfToken,
  getCsrfTokenFromCookie,
} from "./csrf-client"
import { getApiUrl } from "./api-config"
import tokenService from "./auth/token-service"
import AUTH_CONFIG from "./auth/auth-config"

// Re-export the Session type
export type { Session }

// Export validateJwtToken function for server-side validation
export async function validateJwtToken(token: string) {
  try {
    const response = await fetch(getApiUrl("/auth/validate-token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      return { isValid: false }
    }

    return await response.json()
  } catch (error) {
    console.error("Token validation error:", error)
    return { isValid: false }
  }
}

// Export authAxios for authenticated requests
export const authAxios = {
  async get(url: string, options = {}) {
    const token = localStorage.getItem("accessToken")
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  },
  async post(url: string, data: any, options = {}) {
    const token = localStorage.getItem("accessToken")
    return fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  },
}

// Types
export interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  image?: string | null
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// Real authentication client
export const authClient = {
  // Test API connection with multiple endpoints and better error handling
  async testApiConnection(): Promise<boolean> {
    // First try the Next.js API proxy route which can avoid CORS issues
    try {
      console.log("Trying API health check via Next.js API proxy route")
      const response = await fetch("/api/health-check", {
        method: "GET",
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.apiServer === "healthy") {
          console.log("API server is healthy via proxy route")
          return true
        }
      }
    } catch (error) {
      console.log(
        "Proxy health check failed, will try direct connections:",
        error instanceof Error ? error.message : "Unknown error"
      )
    }

    // Try multiple health endpoints to increase chances of success
    const healthEndpoints = ["/health", "/api/health"]

    for (const endpoint of healthEndpoints) {
      try {
        console.log(`Testing API connection at ${endpoint}...`)
        const apiUrl = getApiUrl(endpoint)

        // Use a timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
          // Don't include credentials for health check
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          console.log(`API connection successful at ${endpoint}`)
          return true
        }

        console.warn(
          `API returned non-200 status at ${endpoint}: ${response.status}`
        )
      } catch (error) {
        console.warn(
          `API connection test failed at ${endpoint}:`,
          error instanceof Error ? error.message : "Unknown error"
        )
        // Continue to next endpoint
      }
    }

    // If we get here, all endpoints failed
    console.error("All API connection tests failed")
    return false
  },

  // Enhanced login with better error handling and connection checks
  async login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<Session> {
    // First check if API is available
    const apiAvailable = await this.testApiConnection()
    if (!apiAvailable) {
      console.error("API server is not available, cannot proceed with login")
      throw new Error("API Server Connection Error: Server is not available")
    }

    try {
      // Try to get CSRF token but don't fail if it's not available
      let csrfToken = ""
      try {
        console.log("Attempting to get CSRF token...")
        // First try to get from cookie directly to avoid extra request
        const cookieToken = getCsrfTokenFromCookie()
        if (cookieToken) {
          csrfToken = cookieToken
          console.log("CSRF token obtained from cookie")
        } else {
          // If not in cookie, try the API endpoint but with a short timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 3000)

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/csrf-token`,
              {
                method: "GET",
                credentials: "include",
                signal: controller.signal,
              }
            )

            clearTimeout(timeoutId)

            if (response.ok) {
              const data = await response.json()
              csrfToken = data.csrfToken
              console.log("CSRF token obtained from API")
            }
          } catch (fetchError) {
            console.warn("Failed to fetch CSRF token:", fetchError)
            // Continue without CSRF token
          }
        }
      } catch (csrfError) {
        console.warn("Failed to get CSRF token:", csrfError)
        // Continue without CSRF token as a fallback
      }

      // Log the API URL for debugging
      const apiUrl = getApiUrl("/auth/login")
      console.log("Attempting login to API URL:", apiUrl)

      try {
        // Try using the Next.js API proxy first
        const proxyUrl = "/api/auth/proxy"
        console.log("Attempting login via Next.js API proxy:", proxyUrl)

        try {
          // Use a timeout to prevent hanging
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000)

          const proxyResponse = await fetch(proxyUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
            },
            body: JSON.stringify({ email, password }),
            credentials: "include", // Important for cookies
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (proxyResponse.ok) {
            console.log("Login via proxy successful")
            return await proxyResponse.json()
          } else {
            console.log(
              "Login via proxy failed, falling back to direct API call"
            )
          }
        } catch (proxyError) {
          console.warn("Login via proxy failed:", proxyError)
          console.log("Falling back to direct API call")
        }

        // Fall back to direct API call
        console.log("Attempting direct login to API URL:", apiUrl)

        // Use a timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
          },
          body: JSON.stringify({ email, password }),
          credentials: "include", // Important for cookies
          signal: controller.signal,
          mode: "cors", // Explicitly set CORS mode
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorMessage = "Login failed"
          let errorData = null

          try {
            errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch (jsonError) {
            // If response is not JSON, use status text
            errorMessage = `Login failed: ${response.status} ${response.statusText}`
          }

          // Enhanced error with status code
          const error = new Error(errorMessage)
          ;(error as any).status = response.status
          ;(error as any).data = errorData
          throw error
        }

        const data = await response.json()

        // Validate response data
        if (!data.accessToken || !data.refreshToken) {
          console.error("Invalid login response:", data)
          throw new Error("Login failed: Invalid server response")
        }

        // Store tokens using token service
        tokenService.setAccessToken(data.accessToken, rememberMe)
        tokenService.setRefreshToken(data.refreshToken, rememberMe)

        console.log("Login successful, tokens stored using token service")

        return {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expires:
            data.expires ||
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }
      } catch (fetchError) {
        // Handle network errors specifically
        if (fetchError.name === "AbortError") {
          console.error("Login request timed out after 10 seconds")
          throw new Error("API Server Connection Error: Request timed out")
        }

        if (
          fetchError instanceof TypeError &&
          fetchError.message.includes("fetch")
        ) {
          console.error(
            "Network error during login. API server might be down:",
            fetchError
          )
          throw new Error(`API Server Connection Error: ${fetchError.message}`)
        }

        throw fetchError
      }
    } catch (error) {
      console.error("Login error:", error)

      // Enhance error with more context if needed
      if (error instanceof Error) {
        if (
          !error.message.includes("API Server") &&
          !error.message.includes("Login failed")
        ) {
          error.message = `Login failed: ${error.message}`
        }
      }

      throw error
    }
  },

  // Logout with real implementation
  async logout(): Promise<void> {
    try {
      await fetch(getApiUrl("/auth/logout"), {
        method: "POST",
        credentials: "include", // Important for cookies
      })

      // Clear all auth-related tokens using token service
      tokenService.clearTokens()

      console.log("Logout successful, tokens cleared from localStorage")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  },

  // Refresh token with real implementation
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = tokenService.getRefreshToken() || ""

      const response = await fetch(getApiUrl("/auth/refresh-token"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        credentials: "include", // Important for cookies
      })

      if (!response.ok) {
        throw new Error("Failed to refresh token")
      }

      const data = await response.json()

      // Update stored tokens using token service
      tokenService.setAccessToken(
        data.data.accessToken,
        tokenService.hasRememberMe()
      )
      tokenService.setRefreshToken(
        data.data.refreshToken,
        tokenService.hasRememberMe()
      )

      return data.data.accessToken
    } catch (error) {
      console.error("Token refresh error:", error)
      throw error
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(getApiUrl("/auth/check"), {
        credentials: "include", // Important for cookies
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.authenticated
    } catch (error) {
      console.error("Authentication check error:", error)
      return false
    }
  },

  // Get current session
  async getSession(): Promise<Session | null> {
    try {
      const response = await fetch(getApiUrl("/auth/me"), {
        credentials: "include", // Important for cookies
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      if (!data.success || !data.data) {
        return null
      }

      return {
        user: data.data,
        accessToken: tokenService.getAccessToken() || "",
        refreshToken: tokenService.getRefreshToken() || "",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      console.error("Get session error:", error)
      return null
    }
  },

  // Get access token
  getAccessToken(): string | null {
    return tokenService.getAccessToken()
  },

  // Exchange code for session (for OAuth flows)
  async exchangeCodeForSession(code: string): Promise<Session> {
    try {
      const response = await fetch(getApiUrl("/auth/callback"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        credentials: "include", // Important for cookies
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || "Failed to exchange code for session"
        )
      }

      const data = await response.json()

      // Store tokens using token service
      tokenService.setAccessToken(data.accessToken, true)
      tokenService.setRefreshToken(data.refreshToken, true)

      console.log("Registration successful, tokens stored using token service")

      return {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expires:
          data.expires ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      console.error("Code exchange error:", error)
      throw error
    }
  },

  // Register with real implementation
  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<Session> {
    try {
      // Get CSRF token first
      const csrfToken = await getCsrfToken()

      const response = await fetch(getApiUrl("/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ email, password, name }),
        credentials: "include", // Important for cookies
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      const data = await response.json()

      // Store tokens using token service
      tokenService.setAccessToken(data.accessToken, true)
      tokenService.setRefreshToken(data.refreshToken, true)

      console.log("Registration successful, tokens stored using token service")

      return {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expires:
          data.expires ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },

  // Refresh session
  async refreshSession(): Promise<void> {
    try {
      await this.refreshToken()
    } catch (error) {
      console.error("Session refresh error:", error)
      throw error
    }
  },

  // Validate token
  async validateToken(token: string): Promise<any> {
    try {
      const response = await fetch(getApiUrl("/auth/validate-token"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        return { isValid: false }
      }

      return await response.json()
    } catch (error) {
      console.error("Token validation error:", error)
      return { isValid: false }
    }
  },
}
