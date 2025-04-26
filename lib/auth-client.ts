import { UserRole } from "./auth/constants"
import { UserProfile } from "../types/user"
import { Session } from "../types/auth"
import { fetchWithCsrf, getCsrfToken } from "./csrf-client"

// Re-export the Session type
export type { Session }

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

// Mock user data
const MOCK_USER: UserProfile = {
  id: "demo-user-id",
  email: "demo@example.com",
  name: "Demo Admin User",
  role: UserRole.ADMIN,
  organization: null,
  emailVerified: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Mock session data
const MOCK_SESSION: Session = {
  user: MOCK_USER,
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
}

// Real authentication client
export const authClient = {
  // Test API connection
  async testApiConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/health`
      )
      return response.status === 200
    } catch (error) {
      console.error("API connection test failed:", error)
      return false
    }
  },

  // Login with real credentials
  async login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<Session> {
    try {
      // Get CSRF token first
      const csrfToken = await getCsrfToken()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({ email, password }),
          credentials: "include", // Important for cookies
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data = await response.json()

      // Always store tokens in localStorage for client-side access
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)
      localStorage.setItem("authenticated", "true")

      console.log("Login successful, tokens stored in localStorage")

      return {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expires:
          data.expires ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  // Logout with real implementation
  async logout(): Promise<void> {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/logout`,
        {
          method: "POST",
          credentials: "include", // Important for cookies
        }
      )

      // Clear all auth-related items from local storage
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("authenticated")

      console.log("Logout successful, tokens cleared from localStorage")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  },

  // Refresh token with real implementation
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem("refreshToken") || ""

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
          credentials: "include", // Important for cookies
        }
      )

      if (!response.ok) {
        throw new Error("Failed to refresh token")
      }

      const data = await response.json()

      // Update stored tokens
      localStorage.setItem("accessToken", data.data.accessToken)
      localStorage.setItem("refreshToken", data.data.refreshToken)

      return data.data.accessToken
    } catch (error) {
      console.error("Token refresh error:", error)
      throw error
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/check`,
        {
          credentials: "include", // Important for cookies
        }
      )

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/me`,
        {
          credentials: "include", // Important for cookies
        }
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      if (!data.success || !data.data) {
        return null
      }

      return {
        user: data.data,
        accessToken: localStorage.getItem("accessToken") || "",
        refreshToken: localStorage.getItem("refreshToken") || "",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      console.error("Get session error:", error)
      return null
    }
  },

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken")
  },

  // Exchange code for session (for OAuth flows)
  async exchangeCodeForSession(code: string): Promise<Session> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
          credentials: "include", // Important for cookies
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || "Failed to exchange code for session"
        )
      }

      const data = await response.json()

      // Store tokens in localStorage for client-side access
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)
      localStorage.setItem("authenticated", "true")

      console.log("Registration successful, tokens stored in localStorage")

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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({ email, password, name }),
          credentials: "include", // Important for cookies
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      const data = await response.json()

      // Store tokens in localStorage for client-side access
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)
      localStorage.setItem("authenticated", "true")

      console.log("Registration successful, tokens stored in localStorage")

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/validate-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      )

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
