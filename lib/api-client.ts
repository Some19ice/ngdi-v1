import type {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from "axios"
import axios from "axios"
import { getSession } from "next-auth/react"
import type { Session } from "next-auth"
import { PaginatedResponse } from "@/types/api"
import { UserProfile, UserUpdateRequest } from "@/types/user"
import { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth"
import { MetadataResponse, MetadataRequest } from "@/types/metadata"
import { refreshTokenIfNeeded } from "./auth-utils"
import { supabase } from "./supabase"

interface ApiClientConfig {
  baseURL: string
  timeout?: number
}

interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

class ApiClient {
  private static instance: ApiClient
  private axiosInstance: AxiosInstance

  private constructor(config: ApiClientConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Add request interceptor to add authentication token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          // Ensure token is fresh before making the request
          const session = await refreshTokenIfNeeded()

          if (session) {
            config.headers.Authorization = `Bearer ${session.access_token}`
          }

          return config
        } catch (error) {
          console.error("Error in request interceptor:", error)
          return config
        }
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor to handle token refresh on 401 errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // If the error is 401 and we haven't already tried to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Try to refresh the token
            const { data, error: refreshError } =
              await supabase.auth.refreshSession()

            if (refreshError || !data.session) {
              // If refresh fails, redirect to login
              window.location.href = "/auth/signin"
              return Promise.reject(error)
            }

            // Update the request with the new token
            originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`

            // Retry the request
            return this.axiosInstance(originalRequest)
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError)
            // Redirect to login
            window.location.href = "/auth/signin"
            return Promise.reject(error)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient({
        baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      })
    }
    return ApiClient.instance
  }

  // Generic request methods
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data)
    return response.data
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url)
    return response.data
  }

  /**
   * Check if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return !!session
    } catch (error) {
      console.error("Error checking authentication:", error)
      return false
    }
  }

  /**
   * Get the current user's session
   */
  async getSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  }
}

// Export a singleton instance
export const apiClient = ApiClient.getInstance()

// API endpoints interface
export interface ApiEndpoints {
  // Auth endpoints
  login: (data: LoginRequest) => Promise<AuthResponse>
  register: (data: RegisterRequest) => Promise<AuthResponse>
  logout: () => Promise<void>

  // User endpoints
  getCurrentUser: () => Promise<UserProfile>
  updateUser: (data: UserUpdateRequest) => Promise<UserProfile>
  getUsers: (
    params?: PaginationParams
  ) => Promise<PaginatedResponse<UserProfile>>

  // Metadata endpoints
  getMetadata: (
    params?: PaginationParams
  ) => Promise<PaginatedResponse<MetadataResponse>>
  createMetadata: (data: MetadataRequest) => Promise<MetadataResponse>
  updateMetadata: (
    id: string,
    data: MetadataRequest
  ) => Promise<MetadataResponse>
  deleteMetadata: (id: string) => Promise<void>

  // Admin endpoints
  deleteUser: (id: string) => Promise<void>
  updateUserRole: (id: string, role: string) => Promise<UserProfile>
}

// Create typed API endpoints
export const api: ApiEndpoints = {
  // Auth endpoints
  login: (data) => apiClient.post<AuthResponse>("/auth/login", data),
  register: (data) => apiClient.post<AuthResponse>("/auth/register", data),
  logout: () => apiClient.post("/auth/logout"),

  // User endpoints
  getCurrentUser: () => apiClient.get<UserProfile>("/user/me"),
  updateUser: (data) => apiClient.put<UserProfile>("/user/me", data),
  getUsers: (params) =>
    apiClient.get<PaginatedResponse<UserProfile>>("/admin/users", params),

  // Metadata endpoints
  getMetadata: (params) =>
    apiClient.get<PaginatedResponse<MetadataResponse>>("/metadata", params),
  createMetadata: (data) => apiClient.post<MetadataResponse>("/metadata", data),
  updateMetadata: (id, data) =>
    apiClient.put<MetadataResponse>(`/metadata/${id}`, data),
  deleteMetadata: (id) => apiClient.delete(`/metadata/${id}`),

  // Admin endpoints
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) =>
    apiClient.put<UserProfile>(`/admin/users/${id}/role`, { role }),
}

// Base URL for the API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

/**
 * Utility functions for direct fetch-based API calls
 * Use these when you need more control over the request/response
 */
export const apiUtils = {
  /**
   * Make an authenticated GET request
   */
  get: async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const session = await refreshTokenIfNeeded()

    if (!session) {
      throw new Error("No authenticated session")
    }

    const url = `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${
          errorData.message || "Unknown error"
        }`
      )
    }

    return response.json()
  },

  /**
   * Make an authenticated POST request
   */
  post: async <T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> => {
    const session = await refreshTokenIfNeeded()

    if (!session) {
      throw new Error("No authenticated session")
    }

    const url = `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${
          errorData.message || "Unknown error"
        }`
      )
    }

    return response.json()
  },

  /**
   * Check if the user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return !!session
    } catch (error) {
      console.error("Error checking authentication:", error)
      return false
    }
  },
}
