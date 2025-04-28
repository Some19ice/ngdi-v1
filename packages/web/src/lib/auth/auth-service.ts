"use client"

import tokenService from "./token-service"
import AUTH_CONFIG from "./auth-config"
import { UserRole } from "./constants"

// Types
export interface User {
  id: string
  email: string
  name?: string | null
  role: UserRole
  image?: string | null
}

export interface Session {
  user: User
  accessToken: string
  refreshToken?: string
  expiresAt?: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  email: string
  password: string
  name?: string
}

export interface AuthError {
  message: string
  code?: string
  status?: number
}

/**
 * Authentication service for handling user authentication
 */
export const authService = {
  /**
   * Logs in a user with email and password
   * @param credentials The login credentials
   * @returns A session object with user and token information
   */
  async login(credentials: LoginCredentials): Promise<Session> {
    try {
      // Get the API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      
      // Make the login request
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
        cache: "no-store",
      })

      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          message: errorData.message || AUTH_CONFIG.ERROR_MESSAGES.INVALID_CREDENTIALS,
          code: errorData.code,
          status: response.status,
        }
      }

      // Parse the response
      const data = await response.json()
      
      // Store the tokens
      tokenService.setAccessToken(data.accessToken, credentials.rememberMe)
      if (data.refreshToken) {
        tokenService.setRefreshToken(data.refreshToken, credentials.rememberMe)
      }

      // Return the session
      return {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      }
    } catch (error: any) {
      console.error("Login error:", error)
      throw {
        message: error.message || AUTH_CONFIG.ERROR_MESSAGES.SERVER_ERROR,
        code: error.code,
        status: error.status,
      }
    }
  },

  /**
   * Registers a new user
   * @param credentials The registration credentials
   * @returns A session object with user and token information
   */
  async register(credentials: RegisterCredentials): Promise<Session> {
    try {
      // Get the API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      
      // Make the register request
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
        }),
        cache: "no-store",
      })

      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          message: errorData.message || AUTH_CONFIG.ERROR_MESSAGES.SERVER_ERROR,
          code: errorData.code,
          status: response.status,
        }
      }

      // Parse the response
      const data = await response.json()
      
      // Store the tokens
      tokenService.setAccessToken(data.accessToken, true)
      if (data.refreshToken) {
        tokenService.setRefreshToken(data.refreshToken, true)
      }

      // Return the session
      return {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      throw {
        message: error.message || AUTH_CONFIG.ERROR_MESSAGES.SERVER_ERROR,
        code: error.code,
        status: error.status,
      }
    }
  },

  /**
   * Logs out the current user
   */
  async logout(): Promise<void> {
    try {
      // Get the API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      
      // Get the access token
      const accessToken = tokenService.getAccessToken()
      
      // Make the logout request if we have a token
      if (accessToken) {
        await fetch(`${apiUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          cache: "no-store",
        }).catch(error => {
          console.error("Logout request error:", error)
          // Continue with local logout even if the request fails
        })
      }
    } finally {
      // Always clear tokens locally
      tokenService.clearTokens()
    }
  },

  /**
   * Gets the current session
   * @returns The current session or null if not authenticated
   */
  async getSession(): Promise<Session | null> {
    try {
      // Check if we have a token
      const accessToken = tokenService.getAccessToken()
      if (!accessToken) return null

      // Check if the token is valid
      if (!tokenService.isAuthenticated()) {
        // Try to refresh the token
        try {
          return await this.refreshSession()
        } catch (error) {
          console.error("Session refresh error:", error)
          return null
        }
      }

      // Get user info from the token
      const userInfo = tokenService.getUserInfo()
      if (!userInfo) return null

      // Return the session
      return {
        user: {
          id: userInfo.id,
          email: userInfo.email,
          role: userInfo.role,
        },
        accessToken,
      }
    } catch (error) {
      console.error("Get session error:", error)
      return null
    }
  },

  /**
   * Refreshes the current session
   * @returns The refreshed session or null if refresh fails
   */
  async refreshSession(): Promise<Session | null> {
    try {
      // Get the refresh token
      const refreshToken = tokenService.getRefreshToken()
      if (!refreshToken) return null

      // Get the API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      
      // Make the refresh request
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
        cache: "no-store",
      })

      // Handle error responses
      if (!response.ok) {
        // Clear tokens on refresh failure
        tokenService.clearTokens()
        return null
      }

      // Parse the response
      const data = await response.json()
      
      // Store the new tokens
      tokenService.setAccessToken(data.accessToken, tokenService.hasRememberMe())
      if (data.refreshToken) {
        tokenService.setRefreshToken(data.refreshToken, tokenService.hasRememberMe())
      }

      // Return the session
      return {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      }
    } catch (error) {
      console.error("Refresh session error:", error)
      // Clear tokens on refresh failure
      tokenService.clearTokens()
      return null
    }
  },

  /**
   * Checks if the user is authenticated
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return tokenService.isAuthenticated()
  },

  /**
   * Checks if the user has the specified role
   * @param role The role to check
   * @returns True if the user has the role, false otherwise
   */
  hasRole(role: UserRole | UserRole[]): boolean {
    try {
      // Get user info from the token
      const userInfo = tokenService.getUserInfo()
      if (!userInfo) return false

      // Check if the user has the role
      const roles = Array.isArray(role) ? role : [role]
      return roles.includes(userInfo.role as UserRole)
    } catch (error) {
      console.error("Has role error:", error)
      return false
    }
  },

  /**
   * Gets the current user
   * @returns The current user or null if not authenticated
   */
  getUser(): User | null {
    try {
      // Get user info from the token
      const userInfo = tokenService.getUserInfo()
      if (!userInfo) return null

      // Return the user
      return {
        id: userInfo.id,
        email: userInfo.email,
        role: userInfo.role,
      }
    } catch (error) {
      console.error("Get user error:", error)
      return null
    }
  },
}

export default authService
