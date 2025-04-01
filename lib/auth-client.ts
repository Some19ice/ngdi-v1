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
const isProduction = process.env.NODE_ENV === "production"
const API_URL = isProduction
  ? process.env.NEXT_PUBLIC_API_URL || "/api"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const AUTH_COOKIE_NAME = "auth_token"
const REFRESH_COOKIE_NAME = "refresh_token"

// Track session refresh state globally
let lastSessionRefreshTimestamp = 0;
let pendingSessionRefresh: Promise<Session | null> | null = null;

// Track token validation locally
interface TokenValidationCache {
  token: string;
  result: {
    isValid: boolean;
    userId?: string;
    email?: string;
    role?: UserRole;
  };
  timestamp: number;
}

const localValidationCache: TokenValidationCache[] = [];
const MAX_CACHE_SIZE = 5;

// Helper to cached validation for a token - reduces expensive decode operations
function getCachedValidation(token: string) {
  // Clean old cache entries (older than 5 minutes)
  const now = Date.now();
  const validEntries = localValidationCache.filter(
    entry => now - entry.timestamp < 5 * 60 * 1000
  );
  
  // If we cleaned any entries, update the cache
  if (validEntries.length < localValidationCache.length) {
    localValidationCache.length = 0;
    localValidationCache.push(...validEntries);
  }
  
  // Find cached result for this token
  const cacheEntry = localValidationCache.find(entry => entry.token === token);
  
  if (cacheEntry) {
    return cacheEntry.result;
  }
  
  return null;
}

// Store validation result in cache
function cacheValidationResult(token: string, result: { 
  isValid: boolean; 
  userId?: string; 
  email?: string; 
  role?: UserRole; 
}) {
  // Remove oldest entry if at capacity
  if (localValidationCache.length >= MAX_CACHE_SIZE) {
    localValidationCache.shift();
  }
  
  // Add new entry
  localValidationCache.push({
    token,
    result,
    timestamp: Date.now()
  });
}

// Helper functions to get cookies on the client side
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift() || null
    return cookieValue
  }
  
  return null
}

// Helper function to validate JWT token structure - with local caching
export async function validateJwtToken(token: string): Promise<{
  isValid: boolean
  userId?: string
  email?: string
  role?: UserRole
  error?: string
}> {
  try {
    // Check cache first
    const cachedResult = getCachedValidation(token)
    if (cachedResult) {
      return cachedResult
    }

    // Basic validation
    if (!token || token.trim() === "") {
      const result = { isValid: false, error: "Empty token provided" }
      cacheValidationResult(token, result)
      return result
    }

    // Check token format
    if (!token.includes(".")) {
      const result = {
        isValid: false,
        error: "Invalid token format (not a JWT)",
      }
      cacheValidationResult(token, result)
      return result
    }

    // Decode the token without verification
    try {
      const decoded = jose.decodeJwt(token)

      // Check for expiration
      const currentTime = Math.floor(Date.now() / 1000)
      if (decoded.exp && decoded.exp < currentTime) {
        const result = { isValid: false, error: "Token expired" }
        cacheValidationResult(token, result)
        return result
      }

      // Extract user information - be more lenient with required fields
      const userId = decoded.sub || (decoded.userId as string)
      if (!userId) {
        const result = { isValid: false, error: "Token missing user ID" }
        cacheValidationResult(token, result)
        return result
      }

      const email = (decoded.email as string) || "unknown"
      const roleValue = decoded.role as string

      // Validate role if present
      let role: UserRole | undefined = undefined

      // Simplified role handling for better performance
      if (roleValue) {
        if (roleValue.toUpperCase() === UserRole.ADMIN) {
          role = UserRole.ADMIN
        } else if (roleValue.toUpperCase() === UserRole.NODE_OFFICER) {
          role = UserRole.NODE_OFFICER
        } else {
          role = UserRole.USER
        }
      } else {
        role = UserRole.USER
      }

      const result = {
        isValid: true,
        userId,
        email,
        role,
      }

      cacheValidationResult(token, result)
      return result
    } catch (jwtError: any) {
      const result = {
        isValid: false,
        error: "Invalid JWT format: " + jwtError.message,
      }
      cacheValidationResult(token, result)
      return result
    }
  } catch (error) {
    return { isValid: false, error: String(error) }
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

async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const decoded = jose.decodeJwt(token)
    const currentTime = Date.now() / 1000
    return (decoded.exp as number) < currentTime
  } catch (error) {
    return true
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

    try {
      // Call the login API through our Next.js proxy
      console.log(`Making API request to /api/auth/login`)
      const response = await axios.post(`/api/auth/login`, {
        email,
        password,
        rememberMe,
      })

      // Log response to help with debugging
      console.log("Login response received:", {
        hasAccessToken: !!response.data.accessToken,
        hasRefreshToken: !!response.data.refreshToken,
        hasUser: !!response.data.user,
        status: response.status,
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

      // Verify cookies were set by checking for them directly
      const manualCookieCheck = () => {
        // Check if cookies exist in document
        const hasAuthCookie = getCookie(AUTH_COOKIE_NAME) !== null
        const hasRefreshCookie = getCookie(REFRESH_COOKIE_NAME) !== null

        console.log("Cookie verification:", {
          hasAuthCookie,
          hasRefreshCookie,
          authTokenLength: accessToken?.length || 0,
        })

        if (!hasAuthCookie && accessToken) {
          console.log("Auth cookie not set by server, setting manually")
          document.cookie = `${AUTH_COOKIE_NAME}=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax;`
        }

        if (!hasRefreshCookie && refreshToken) {
          console.log(
            "Refresh cookie not set by server, setting manually (httpOnly not possible)"
          )
          document.cookie = `${REFRESH_COOKIE_NAME}=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 14}; samesite=lax;`
        }
      }

      // Check immediately and after a small delay to ensure cookies are set
      manualCookieCheck()
      setTimeout(manualCookieCheck, 100)

      // Store last login timestamp
      if (typeof window !== "undefined") {
        window.__lastSessionRefresh = Date.now()
      }

      return session
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message)
      throw error
    }
  },

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<Session> {
    console.log(
      `Attempting to register user with email: ${email}, name: ${name || "not provided"}`
    )

    try {
      console.log(`Making API request to ${API_URL}/api/auth/register`)
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name,
      })

      console.log("Registration API response received:", {
        status: response.status,
        hasAccessToken: !!response.data.accessToken,
        hasRefreshToken: !!response.data.refreshToken,
        hasUser: !!response.data.user,
      })

      const { accessToken, refreshToken, user } = response.data

      // Create and return session
      const session = {
        user,
        expires:
          response.data.expires ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        accessToken,
        refreshToken,
      }

      console.log("Registration successful, session created:", {
        userEmail: user.email,
        userRole: user.role,
      })

      return session
    } catch (error: any) {
      console.error("Registration failed:", error)

      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
        })
      }

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
      // Use our Next.js proxy endpoint instead of the direct API
      await axios.post(`/api/auth/logout`, {})
    } catch (error) {
      console.error("Logout failed:", error)
    }
  },

  async refreshToken(): Promise<string | null> {
    console.log("refreshToken called")
    const refreshToken = getCookie(REFRESH_COOKIE_NAME)

    if (!refreshToken) {
      console.log("No refresh token found in cookies")
      return null
    }

    try {
      console.log("Calling refresh token proxy endpoint")
      const response = await axios.post(
        `/api/auth/refresh`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      console.log("Refresh token response:", {
        status: response.status,
        hasAccessToken: !!response.data.data?.accessToken,
      })

      const accessToken = response.data.data?.accessToken

      if (!accessToken) {
        console.error("No access token returned from refresh endpoint")
        return null
      }

      return accessToken
    } catch (error) {
      console.error("Token refresh failed:", error)
      return null
    }
  },

  /**
   * Check if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = getCookie(AUTH_COOKIE_NAME)
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
   * Get current session - with debouncing to prevent excessive API calls
   */
  async getSession(): Promise<Session | null> {
    console.log("getSession called")

    // First, check if cookies exist - this is crucial for handling cleared browser data
    const token = getCookie(AUTH_COOKIE_NAME)
    const refreshToken = getCookie(REFRESH_COOKIE_NAME)

    // If both tokens are missing, immediately return null (no session)
    if (!token && !refreshToken) {
      console.log("No auth cookies found, session is null")
      // Reset any in-memory session state
      lastSessionRefreshTimestamp = 0
      pendingSessionRefresh = null
      return null
    }

    // If there's already a refresh in progress, return that promise instead of making a new one
    if (pendingSessionRefresh) {
      console.log("Reusing pending session refresh request")
      return pendingSessionRefresh
    }

    // Check if we've refreshed recently (within 5 seconds)
    const now = Date.now()
    if (now - lastSessionRefreshTimestamp < 5000) {
      console.log("Session check throttled - last check was too recent")
      // If we had a valid token within the last 5 seconds, assume it's still valid
      if (token) {
        try {
          // Quick validation without network request
          const decoded = jose.decodeJwt(token)
          const currentTime = Math.floor(Date.now() / 1000)

          // Check if token is expired
          if (decoded.exp && decoded.exp < currentTime) {
            console.log("Cached token expired, continuing with session check")
          } else {
            // Create a lightweight session from cached token
            console.log("Using cached token for quick session response")
            const userId = decoded.sub || (decoded.userId as string)
            const email = (decoded.email as string) || "unknown"
            let role = decoded.role as UserRole

            if (!isValidRole(role)) {
              role = UserRole.USER
            }

            return {
              user: {
                id: userId,
                email: email,
                name: (decoded.name as string) || "",
                role: role,
              },
              expires: decoded.exp
                ? new Date(decoded.exp * 1000).toISOString()
                : new Date(Date.now() + 3600 * 1000).toISOString(),
              accessToken: token,
              refreshToken: refreshToken || "",
            }
          }
        } catch (e) {
          console.warn("Error in token validation", e)
          // Continue with actual session check
        }
      }
    }

    // Start a new session refresh
    try {
      // Track request time
      const startTime = Date.now()

      // Create and store the pending refresh promise
      pendingSessionRefresh = (async () => {
        try {
          // Recheck for token in case it changed during async operations
          const token = getCookie(AUTH_COOKIE_NAME)

          console.log("Client-side token check:", {
            hasToken: !!token,
            tokenLength: token?.length,
            documentCookie:
              typeof document !== "undefined" ? document.cookie : "N/A",
            authCookieInDoc:
              typeof document !== "undefined"
                ? document.cookie.includes(AUTH_COOKIE_NAME)
                : false,
          })

          if (!token) {
            console.log("No token found, returning null session")
            return null
          }

          // Quick validation without network request
          const decoded = jose.decodeJwt(token)
          const currentTime = Math.floor(Date.now() / 1000)

          // Check if token is expired
          if (decoded.exp && decoded.exp < currentTime) {
            console.log("Token expired, returning null session")
            return null
          }

          // If we have a valid token with user info, try to verify with server
          if (decoded.sub || decoded.userId) {
            // If online and needed, verify with server
            if (navigator.onLine && Math.random() < 0.2) {
              // 20% chance to verify
              try {
                console.log(
                  "Verifying token with server through auth/check endpoint"
                )

                // Create an AbortController with a timeout
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

                const response = await fetch("/api/auth/check", {
                  method: "GET",
                  credentials: "include",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  signal: controller.signal,
                })

                clearTimeout(timeoutId)

                if (response.ok) {
                  const data = await response.json()

                  if (data.authenticated && data.user) {
                    console.log("Server confirmed authentication")
                    lastSessionRefreshTimestamp = Date.now()

                    return {
                      user: {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name || "",
                        role: data.user.role,
                      },
                      expires: decoded.exp
                        ? new Date(decoded.exp * 1000).toISOString()
                        : new Date(Date.now() + 3600 * 1000).toISOString(),
                      accessToken: token,
                      refreshToken: getCookie(REFRESH_COOKIE_NAME) || "",
                    }
                  } else {
                    console.log("Server reports not authenticated")
                    return null
                  }
                }
              } catch (serverError) {
                console.warn(
                  "Server check failed, falling back to token validation",
                  serverError
                )
                // Continue with client-side validation
              }
            }

            // Create session from client-side token info (fallback or if server check skipped)
            console.log("Creating session from client-side token")
            const userId = decoded.sub || (decoded.userId as string)
            const email = (decoded.email as string) || "unknown"
            let role = decoded.role as UserRole

            if (!isValidRole(role)) {
              role = UserRole.USER
            }

            // Create session from client-side token info
            const clientSession: Session = {
              user: {
                id: userId,
                email: email,
                name: (decoded.name as string) || "",
                role: role,
              },
              expires: decoded.exp
                ? new Date(decoded.exp * 1000).toISOString()
                : new Date(Date.now() + 3600 * 1000).toISOString(),
              accessToken: token,
              refreshToken: getCookie(REFRESH_COOKIE_NAME) || "",
            }

            // After successful check, update the timestamp
            lastSessionRefreshTimestamp = Date.now()

            return clientSession
          }

          // If we couldn't create a session from the token, return null
          return null
        } catch (error) {
          console.error("Error in session check:", error)
          return null
        }
      })()

      // Wait for the refresh to complete
      const session = await pendingSessionRefresh

      // Clear the pending refresh
      pendingSessionRefresh = null

      // Log timing
      const endTime = Date.now()
      console.log(`getSession completed in ${endTime - startTime}ms`)

      return session
    } catch (error) {
      // Reset the pending refresh if it fails
      pendingSessionRefresh = null
      console.error("Error in getSession outer block:", error)
      return null
    }
  },

  getAccessToken(): string | null {
    return getCookie(AUTH_COOKIE_NAME)
  },

  /**
   * Exchange an authorization code for a session
   */
  async exchangeCodeForSession(code: string): Promise<Session> {
    try {
      // Make API request to exchange code for tokens
      const response = await axios.post(`${API_URL}/auth/callback`, { code })

      const { accessToken, refreshToken, user } = response.data

      // Return session
      return {
        user,
        expires:
          response.data.expires ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        accessToken,
        refreshToken,
      }
    } catch (error) {
      console.error("Failed to exchange code for session:", error)
      throw error
    }
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
  
  return config;
}); 