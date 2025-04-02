import axios from "axios";
import * as jose from "jose";
import { normalizeRole, UserRole, isValidRole } from "./auth/constants"
import { quickValidateToken, TokenValidationResult } from "../packages/api/src/utils/token-validation"
import { UserProfile } from "../types/user"
import { Session } from "../types/auth"
import {
  setCookie,
  getCookie,
  deleteCookie,
  areCookiesEnabled,
} from "./utils/cookie-utils"

// Re-export the Session type
export type { Session }

// Cookie constants
export const AUTH_COOKIE_NAME = "auth_token"
export const REFRESH_COOKIE_NAME = "refresh_token"

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

// Get API URL from environment or use default
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.ngdi-v1.vercel.app"

// Helper function to get the correct auth endpoint
function getAuthEndpoint(path: string): string {
  // For local development, use localhost directly
  if (process.env.NODE_ENV !== "production") {
    return `http://localhost:3001/api/auth/${path}`
  }

  // For production, use the API_URL
  return `${API_URL}/api/auth/${path}`
}

// Helper function to validate JWT token structure - with local caching
let tokenCache: Record<string, TokenValidationResult & { timestamp: number }> =
  {}

export const validateToken = async (
  token: string
): Promise<TokenValidationResult> => {
  // Return from cache if available (short validity to catch immediate expirations)
  if (
    tokenCache[token] &&
    tokenCache[token].timestamp > Date.now() - 1000 * 60 * 5
  ) {
    // token is valid for 5 minutes in cache
    return tokenCache[token]
  }

  try {
    const result = await quickValidateToken(token)
    // Cache result
    tokenCache[token] = { ...result, timestamp: Date.now() }
    return result
  } catch (error) {
    // If validation fails, return invalid result
    const result = {
      isValid: false,
      error: "Invalid token format",
      timestamp: Date.now(),
    } as TokenValidationResult & { timestamp: number }
    tokenCache[token] = result
    return result
  }
}

// Export validateJwtToken as an alias for validateToken for backward compatibility
export const validateJwtToken = validateToken

// Helper function to normalize user data from API
function normalizeUserData(userData: any): UserProfile {
  // Ensure role is uppercase for consistency
  const rawRole = userData.role || UserRole.USER
  // Normalize role - handle case differences, defaulting to USER
  const normalizedRole = isValidRole(rawRole)
    ? normalizeRole(rawRole)
    : UserRole.USER

  return {
    id: userData.id,
    name: userData.name || "",
    email: userData.email,
    role: normalizedRole as UserRole, // Force type as UserRole to avoid null
    organization: userData.organization || null,
    emailVerified: userData.emailVerified || null,
    createdAt: userData.createdAt || new Date().toISOString(),
    updatedAt: userData.updatedAt || new Date().toISOString(),
  }
}

// Auth client
export const authClient = {
  async login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<Session> {
    console.log(`Attempting login for ${email} with rememberMe=${rememberMe}`)

    // First check if cookies are enabled
    if (!areCookiesEnabled()) {
      throw new Error(
        "Cookies are required for authentication but are disabled in your browser."
      )
    }

    try {
      // Measure network performance
      const startTime = Date.now()

      // Get CSRF token if available
      const csrfToken = getCookie("csrf_token")
      const headers: Record<string, string> = {
        "X-Client-Version": "1.0.0",
        "X-Client-Platform":
          typeof navigator !== "undefined" ? navigator.platform : "unknown",
      }

      // Add CSRF token to headers if available
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken
      }

      // Call the API directly
      const loginEndpoint = getAuthEndpoint("login")
      console.log(`Making API request to ${loginEndpoint}`)
      const response = await axios.post(
        loginEndpoint,
        {
          email,
          password,
          rememberMe,
        },
        {
          headers,
          timeout: parseInt(process.env.API_REQUEST_TIMEOUT_MS || "15000"),
          withCredentials: true, // Essential for CORS with cookies
        }
      )

      // Record performance metrics
      const networkTime = Date.now() - startTime
      console.log(`Network request completed in ${networkTime}ms`)

      // Log response to help with debugging
      console.log("Login response received:", {
        hasAccessToken: !!response.data.accessToken,
        hasRefreshToken: !!response.data.refreshToken,
        hasUser: !!response.data.user,
        status: response.status,
        responseTime: networkTime,
      })

      // Extract data from response
      const { accessToken, refreshToken, user } = response.data

      // Create the session object
      const session: Session = {
        user: user ? normalizeUserData(user) : null,
        accessToken,
        refreshToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }

      // Verify we have valid tokens before returning
      if (!accessToken || !refreshToken) {
        console.error("Login response missing tokens:", response.data)
        throw new Error("Invalid login response: missing tokens")
      }

      // Enhanced cookie verification with cross-domain support
      const verifyCookies = () => {
        // Check if cookies exist
        const hasAuthCookie = getCookie(AUTH_COOKIE_NAME) !== null
        const hasRefreshCookie = getCookie(REFRESH_COOKIE_NAME) !== null

        console.log("Cookie verification:", {
          hasAuthCookie,
          hasRefreshCookie,
          authTokenLength: accessToken?.length || 0,
        })

        if (!hasAuthCookie && accessToken) {
          console.log("Auth cookie not set by server, setting manually")
          // Set for 1 day (24 hours) or 7 days if remember me is true
          const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24
          setCookie(AUTH_COOKIE_NAME, accessToken, { maxAge })
        }

        if (!hasRefreshCookie && refreshToken) {
          console.log(
            "Refresh cookie not set by server, setting manually (httpOnly not possible)"
          )
          // Set for 14 days
          setCookie(REFRESH_COOKIE_NAME, refreshToken, {
            maxAge: 60 * 60 * 24 * 14,
          })
        }
      }

      // Verify cookies immediately after login
      verifyCookies()

      // And after a delay to catch any race conditions with cookie setting
      setTimeout(verifyCookies, 100)

      // Try one more time after longer delay if needed
      setTimeout(() => {
        if (!getCookie(AUTH_COOKIE_NAME)) {
          console.warn(
            "Auth cookie still not set after delay, trying one more time"
          )
          verifyCookies()
        }
      }, 1000)

      // Store last login timestamp
      if (typeof window !== "undefined") {
        ;(window as any).__lastSessionRefresh = Date.now()
      }

      return session
    } catch (error: any) {
      // Enhanced error reporting
      const errorDetails = {
        message: error.message || "Unknown error",
        status: error.response?.status,
        data: error.response?.data,
        network: !!error.isAxiosError,
        timeout: error.code === "ECONNABORTED",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }

      console.error("Login error:", errorDetails)

      // Report error to monitoring system if enabled
      if (
        process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === "true" &&
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(
          new CustomEvent("auth:error", {
            detail: { type: "login_failed", ...errorDetails },
          })
        )
      }

      throw error
    }
  },

  async logout(): Promise<void> {
    // Clear cookies using the utility function
    deleteCookie(AUTH_COOKIE_NAME)
    deleteCookie(REFRESH_COOKIE_NAME)

    try {
      // Call logout API directly
      await axios.post(getAuthEndpoint("logout"))
    } catch (error) {
      console.error("Error during logout:", error)
    }
  },

  async refreshToken(): Promise<string> {
    try {
      const response = await axios.post(
        getAuthEndpoint("refresh-token"),
        {},
        {
          headers: {
            "X-Request-ID": crypto.randomUUID(),
          },
        }
      )
      return response.data.accessToken
    } catch (error) {
      console.error("Token refresh failed:", error)
      throw error
    }
  },

  // Add isAuthenticated method
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = getCookie(AUTH_COOKIE_NAME)
      if (!token) {
        return false
      }

      const validationResult = await validateToken(token)
      return validationResult.isValid
    } catch (error) {
      console.error("Error checking authentication status:", error)
      return false
    }
  },

  // Add getSession method to retrieve the current session
  async getSession(): Promise<Session | null> {
    try {
      const token = getCookie(AUTH_COOKIE_NAME)
      if (!token) {
        return null
      }

      const validationResult = await validateToken(token)
      if (!validationResult.isValid) {
        return null
      }

      // Construct a session from the token information
      return {
        user: {
          id: validationResult.userId || "",
          email: validationResult.email || "",
          name: "", // Use empty string since name is not in validationResult
          role: (validationResult.role as UserRole) || UserRole.USER,
          organization: null,
          emailVerified: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        accessToken: token,
        refreshToken: getCookie(REFRESH_COOKIE_NAME) || "",
        expires: validationResult.exp
          ? new Date(validationResult.exp * 1000).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  },

  // Add getAccessToken method to retrieve the current access token
  getAccessToken(): string | null {
    return getCookie(AUTH_COOKIE_NAME)
  },

  // Add exchangeCodeForSession method for handling auth code exchange
  async exchangeCodeForSession(code: string): Promise<Session> {
    try {
      console.log(
        `Exchanging auth code for session: ${code.substring(0, 8)}...`
      )

      const response = await axios.post(
        getAuthEndpoint("exchange-code"),
        { code },
        {
          headers: {
            "X-Client-Version": "1.0.0",
            "X-Request-ID": crypto.randomUUID(),
          },
        }
      )

      const { accessToken, refreshToken, user } = response.data

      // Create the session object
      const session: Session = {
        user: user ? normalizeUserData(user) : null,
        accessToken,
        refreshToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }

      // Set auth cookies
      if (accessToken) {
        setCookie(AUTH_COOKIE_NAME, accessToken, { maxAge: 60 * 60 * 24 }) // 1 day
      }

      if (refreshToken) {
        setCookie(REFRESH_COOKIE_NAME, refreshToken, {
          maxAge: 60 * 60 * 24 * 14,
        }) // 14 days
      }

      // Update session refresh timestamp
      if (typeof window !== "undefined") {
        ;(window as any).__lastSessionRefresh = Date.now()
      }

      return session
    } catch (error: any) {
      console.error("Code exchange error:", error)
      throw new Error(
        error.response?.data?.message || "Failed to exchange code for session"
      )
    }
  },

  // Add register method for user registration
  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<Session> {
    try {
      const response = await axios.post(
        getAuthEndpoint("register"),
        {
          email,
          password,
          name: name || "",
        },
        {
          headers: {
            "X-Request-ID": crypto.randomUUID(),
          },
        }
      )

      const { accessToken, refreshToken, user } = response.data

      // Create the session object
      const session: Session = {
        user: user ? normalizeUserData(user) : null,
        accessToken,
        refreshToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }

      // Set auth cookies
      if (accessToken) {
        setCookie(AUTH_COOKIE_NAME, accessToken, { maxAge: 60 * 60 * 24 }) // 1 day
      }

      if (refreshToken) {
        setCookie(REFRESH_COOKIE_NAME, refreshToken, {
          maxAge: 60 * 60 * 24 * 14,
        }) // 14 days
      }

      // Update session refresh timestamp
      if (typeof window !== "undefined") {
        ;(window as any).__lastSessionRefresh = Date.now()
      }

      return session
    } catch (error: any) {
      console.error("Registration error:", error)
      throw new Error(
        error.response?.data?.message || "Failed to register user"
      )
    }
  },

  // Add refreshSession method to refresh the current session
  async refreshSession(): Promise<void> {
    try {
      const token = await this.refreshToken()

      if (token) {
        // Update the auth cookie with the new token
        setCookie(AUTH_COOKIE_NAME, token, { maxAge: 60 * 60 * 24 }) // 1 day

        // Update session refresh timestamp
        if (typeof window !== "undefined") {
          ;(window as any).__lastSessionRefresh = Date.now()
        }
      }
    } catch (error) {
      console.error("Session refresh failed:", error)
      throw error
    }
  },

  // Implement any other auth client methods here
  async validateToken(token: string): Promise<TokenValidationResult> {
    return validateToken(token)
  },
}

// Create an axios instance with auth headers
export const authAxios = axios.create({
  baseURL: API_URL,
});

// Add interceptor to handle token refresh
authAxios.interceptors.request.use(async (config) => {
  let token = getCookie(AUTH_COOKIE_NAME)

  if (token && (await isTokenExpired(token))) {
    token = await authClient.refreshToken()
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const decoded = jose.decodeJwt(token)
    const currentTime = Date.now() / 1000
    return (decoded.exp as number) < currentTime
  } catch (error) {
    return true
  }
} 