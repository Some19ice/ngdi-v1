import axios from "axios";
import * as jose from "jose";
import { normalizeRole, UserRole, isValidRole } from "./auth/constants"

// Types
export interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  image?: string | null
}

export interface Session {
  user: User | null
  expires: string
  accessToken: string
  refreshToken: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// Constants
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const TOKEN_KEY = "auth_tokens"
const TOKEN_EXPIRY_KEY = "auth_token_expiry"

// Helper functions
function getTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null

  const tokensStr = localStorage.getItem(TOKEN_KEY)
  if (!tokensStr) return null

  try {
    return JSON.parse(tokensStr) as AuthTokens
  } catch (error) {
    console.error("Failed to parse auth tokens:", error)
    return null
  }
}

function setTokens(tokens: AuthTokens, rememberMe: boolean = false): void {
  if (typeof window === "undefined") return

  // Store tokens in localStorage
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))

  // Set token expiry based on remember me preference
  const expiryDate = new Date()
  if (rememberMe) {
    // 30 days if remember me is checked
    expiryDate.setDate(expiryDate.getDate() + 30)
  } else {
    // 1 day if remember me is not checked
    expiryDate.setDate(expiryDate.getDate() + 1)
  }
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString())

  // Set the auth_token cookie for SSR
  document.cookie = `auth_token=${tokens.accessToken}; path=/; expires=${expiryDate.toUTCString()}; ${
    process.env.NODE_ENV === "production" ? "secure; " : ""
  }samesite=lax`
}

function clearTokens(): void {
  if (typeof window === "undefined") return

  // Clear localStorage
  localStorage.removeItem(TOKEN_KEY)

  // Clear the auth_token cookie
  document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
}

async function decodeJwt(token: string): Promise<{ exp: number }> {
  try {
    // Skip verification and just decode the token
    const decoded = jose.decodeJwt(token)
    if (!decoded.exp) {
      throw new Error("Token has no expiration")
    }
    return { exp: decoded.exp as number }
  } catch (error) {
    console.error("Failed to decode JWT:", error)
    // Return a default expiration 1 hour from now as fallback
    return { exp: Math.floor(Date.now() / 1000) + 3600 }
  }
}

async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const decoded = await decodeJwt(token)
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

// Helper function to normalize user data from API
function normalizeUserData(userData: any): User {
  // Ensure role is uppercase for consistency
  const rawRole = userData.role || UserRole.USER
  const normalizedRole = normalizeRole(rawRole) || UserRole.USER

  console.log("[normalizeUserData] Role normalization:", {
    rawRole,
    normalizedRole,
    isAdmin: normalizedRole === UserRole.ADMIN,
  })

  return {
    id: userData.id,
    email: userData.email,
    name: userData.name || null,
    // Use the normalized role
    role: normalizedRole,
    image: userData.image || null,
  }
}

// Helper function to validate JWT token structure
export async function validateJwtToken(token: string): Promise<{
  isValid: boolean
  userId?: string
  email?: string
  role?: UserRole
  error?: string
}> {
  try {
    // For development tokens, be extra lenient
    if (token.startsWith("mock_token_")) {
      console.log("Development token detected, granting ADMIN role")
      return {
        isValid: true,
        userId: "mock-user-id",
        email: "admin@example.com",
        role: UserRole.ADMIN,
      }
    }

    // Decode the token without verification for now
    const decoded = jose.decodeJwt(token)

    // Log token contents for debugging
    console.log("Validating token:", {
      sub: decoded.sub,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : "none",
    })

    // Check for expiration
    const currentTime = Math.floor(Date.now() / 1000)
    if (decoded.exp && decoded.exp < currentTime) {
      return { isValid: false, error: "Token expired" }
    }

    // Extract user information - be more lenient with required fields
    const userId = decoded.sub || (decoded.userId as string)
    const email = decoded.email as string
    const roleValue = decoded.role as string

    // Validate role if present
    let role: UserRole | undefined
    if (roleValue) {
      const normalizedRole = normalizeRole(roleValue)

      // Special handling for ADMIN role to ensure it's properly recognized
      if (
        normalizedRole === UserRole.ADMIN ||
        roleValue.toUpperCase() === "ADMIN" ||
        roleValue === "0" // Some systems use numeric role codes
      ) {
        role = UserRole.ADMIN
        console.log("ADMIN role assigned")
      }
      // Handle NODE_OFFICER role
      else if (
        normalizedRole === UserRole.NODE_OFFICER ||
        roleValue.toUpperCase() === "NODE_OFFICER" ||
        roleValue === "1" // Some systems use numeric role codes
      ) {
        role = UserRole.NODE_OFFICER
        console.log("NODE_OFFICER role assigned")
      }
      // Handle other valid roles
      else if (normalizedRole && isValidRole(normalizedRole)) {
        role = normalizedRole
        console.log(`Role assigned: ${role}`)
      } else {
        console.log(`Invalid role in token: ${roleValue}`)
        // Default to USER role instead of failing validation
        role = UserRole.USER
      }
    } else {
      console.log("No role found in token, defaulting to USER")
      role = UserRole.USER
    }

    return {
      isValid: true,
      userId,
      email,
      role,
    }
  } catch (error) {
    console.error("Token validation error:", error)
    return { isValid: false, error: String(error) }
  }
}

// Auth client
export const authClient = {
  async login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<Session> {
    try {
      // Call the login API
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      })

      // Extract tokens from response
      const { accessToken, refreshToken, expiresIn } = response.data

      // Calculate expiry time
      const expiresAt = Math.floor(Date.now() / 1000) + (expiresIn || 3600)

      // Store tokens
      const tokens = {
        accessToken,
        refreshToken,
        expiresAt,
      }
      setTokens(tokens, rememberMe)

      // Get user data
      const userData = response.data.user || {}
      const user = normalizeUserData(userData)

      // Create and return session
      const session = {
        user,
        expires: new Date(expiresAt * 1000).toISOString(),
        accessToken,
        refreshToken,
      }

      // For debugging purposes, log the token info
      console.log("Login successful, token info:", {
        tokenLength: accessToken.length,
        expiresAt: new Date(expiresAt * 1000).toLocaleString(),
        userRole: user.role,
      })

      return session
    } catch (error) {
      console.error("Login failed:", error)

      // For development/testing, create a mock token if the API call fails
      if (
        process.env.NODE_ENV === "development" &&
        email === "admin@example.com"
      ) {
        console.log("Creating mock admin token for development")

        // Create a mock token with admin role
        const mockToken = {
          accessToken: "mock_token_" + Date.now(),
          refreshToken: "mock_refresh_" + Date.now(),
          expiresAt: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        }

        setTokens(mockToken, true)

        // Create a mock session
        const mockSession = {
          user: {
            id: "mock-user-id",
            email: email,
            name: "Admin User",
            role: UserRole.ADMIN,
          },
          expires: new Date(mockToken.expiresAt * 1000).toISOString(),
          accessToken: mockToken.accessToken,
          refreshToken: mockToken.refreshToken,
        }

        return mockSession
      }

      throw error
    }
  },

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<Session> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name,
      })

      const { accessToken, refreshToken, user } = response.data

      // Decode token to get expiry
      const decoded = await decodeJwt(accessToken)

      setTokens({
        accessToken,
        refreshToken,
        expiresAt: decoded.exp,
      })

      return {
        user,
        expires: new Date(decoded.exp * 1000).toISOString(),
        accessToken,
        refreshToken,
      }
    } catch (error: any) {
      console.error("Registration failed:", error)

      // Extract the error message from the response if available
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again."

      // Create a more informative error
      const enhancedError = new Error(errorMessage)
      enhancedError.name = "RegistrationError"

      throw enhancedError
    }
  },

  async logout(): Promise<void> {
    try {
      const tokens = getTokens()
      if (tokens) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          }
        )
      }
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      clearTokens()
    }
  },

  async refreshToken(): Promise<AuthTokens | null> {
    const tokens = getTokens()
    if (!tokens) return null

    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh`, {
        refreshToken: tokens.refreshToken,
      })

      const { accessToken, refreshToken } = response.data

      // Decode token to get expiry
      const decoded = await decodeJwt(accessToken)

      const newTokens = {
        accessToken,
        refreshToken,
        expiresAt: decoded.exp,
      }

      setTokens(newTokens)
      return newTokens
    } catch (error) {
      console.error("Token refresh failed:", error)
      clearTokens()
      return null
    }
  },

  /**
   * Check if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = this.getAccessToken()
    if (!token) return false

    try {
      const validationResult = await validateJwtToken(token)
      return validationResult.isValid
    } catch (error) {
      console.error("Error checking authentication:", error)
      return false
    }
  },

  /**
   * Get the current session
   */
  async getSession(): Promise<Session | null> {
    const token = this.getAccessToken()
    if (!token) return null

    try {
      const validationResult = await validateJwtToken(token)
      if (!validationResult.isValid) return null

      return {
        user: {
          id: validationResult.userId || "",
          email: validationResult.email || "",
          name: "",
          role: validationResult.role || UserRole.USER,
        },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
        accessToken: token,
        refreshToken: "",
      }
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  },

  getAccessToken(): string | null {
    const tokens = getTokens()
    return tokens?.accessToken || null
  },

  /**
   * Exchange an authorization code for a session
   * This is a placeholder implementation - you'll need to implement the actual code exchange
   * based on your authentication system
   */
  async exchangeCodeForSession(code: string): Promise<Session> {
    try {
      // Make API request to exchange code for tokens
      const response = await axios.post(`${API_URL}/auth/callback`, { code })

      const { accessToken, refreshToken, expiresAt, user } = response.data

      // Store tokens
      setTokens({
        accessToken,
        refreshToken,
        expiresAt,
      })

      // Return session
      return {
        user,
        expires: new Date(expiresAt).toISOString(),
        accessToken,
        refreshToken,
      }
    } catch (error) {
      console.error("Failed to exchange code for session:", error)
      throw error
    }
  },

  // Check if tokens are expired based on the stored expiry date
  isSessionExpired(): boolean {
    if (typeof window === "undefined") return true

    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)
    if (!expiryStr) return true

    try {
      const expiry = new Date(expiryStr)
      return expiry < new Date()
    } catch (error) {
      console.error("Failed to parse token expiry:", error)
      return true
    }
  },
}

// Create an axios instance with auth headers
export const authAxios = axios.create({
  baseURL: API_URL,
});

// Add interceptor to handle token refresh
authAxios.interceptors.request.use(async (config) => {
  let tokens = getTokens();
  
  if (tokens && await isTokenExpired(tokens.accessToken)) {
    tokens = await authClient.refreshToken();
  }
  
  if (tokens) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  
  return config;
}); 