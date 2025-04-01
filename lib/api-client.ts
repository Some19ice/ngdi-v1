import type {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from "axios"
import axios from "axios"
import { PaginatedResponse } from "@/types/api"
import { UserProfile, UserUpdateRequest } from "@/types/user"
import { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth"
import { MetadataResponse, MetadataRequest } from "@/types/metadata"
import { authClient, Session } from "./auth-client"

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

    // Request interceptor for adding auth token
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = authClient.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for handling errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data
      },
      async (error) => {
        const originalRequest = error.config

        // Log detailed error information
        if (error.response) {
          console.error("API Error Response:", {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: originalRequest.url,
            method: originalRequest.method,
            requestData: JSON.parse(originalRequest.data || "{}"),
          })

          // Enhance error message with server details if available
          if (error.response.data) {
            if (error.response.data.message) {
              error.message = `${error.message}: ${error.response.data.message}`
            } else if (typeof error.response.data === "object") {
              // Log the full error data object
              const errorData = JSON.stringify(error.response.data)
              error.message = `${error.message}: ${errorData}`
            }
          }
        }

        // If the error is due to an expired token and we haven't tried to refresh yet
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          (await authClient.isAuthenticated())
        ) {
          originalRequest._retry = true

          try {
            // Refresh the token
            await authClient.refreshToken()

            // Update the authorization header
            const newToken = authClient.getAccessToken()
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }

            // Retry the original request
            return this.axiosInstance(originalRequest)
          } catch (refreshError) {
            // If refresh fails, redirect to login
            console.error("Token refresh failed:", refreshError)
            window.location.href = "/auth/signin"
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      // Get proper API URL based on environment
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

      // If the API URL already includes /api at the end, remove the trailing /api
      // This ensures consistency when appending paths that include /api
      if (apiUrl.endsWith("/api")) {
        apiUrl = apiUrl.substring(0, apiUrl.length - 4) // Remove trailing /api
      }

      console.log("Using API base URL:", apiUrl)
      ApiClient.instance = new ApiClient({
        baseURL: apiUrl,
      })
    }
    return ApiClient.instance
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return this.axiosInstance.get(url, { params })
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.axiosInstance.post(url, data)
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.axiosInstance.put(url, data)
  }

  async delete<T>(url: string): Promise<T> {
    return this.axiosInstance.delete(url)
  }

  async isAuthenticated(): Promise<boolean> {
    return authClient.isAuthenticated()
  }

  async getSession(): Promise<Session | null> {
    return authClient.getSession()
  }
}

// Create API client instance
const apiClient = ApiClient.getInstance()

// Define API endpoints with proper type conversions
export const api = {
  // Auth endpoints
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const session = await authClient.login(data.email, data.password)
    return {
      user: session.user as UserProfile,
      token: session.accessToken,
      refreshToken: session.refreshToken,
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const session = await authClient.register(
      data.email,
      data.password,
      data.name
    )
    return {
      user: session.user as UserProfile,
      token: session.accessToken,
      refreshToken: session.refreshToken,
    }
  },

  logout: () => authClient.logout(),

  // User endpoints
  getCurrentUser: () => apiClient.get<UserProfile>("/api/users/profile"),
  updateUser: (data: UserUpdateRequest) =>
    apiClient.put<UserProfile>("/api/users/profile", data),
  getUsers: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<UserProfile>>("/api/users", params),

  // Metadata endpoints
  getMetadata: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<MetadataResponse>>("/api/metadata", params),
  createMetadata: (data: MetadataRequest) =>
    apiClient.post<MetadataResponse>("/api/metadata", data),
  updateMetadata: (id: string, data: MetadataRequest) =>
    apiClient.put<MetadataResponse>(`/api/metadata/${id}`, data),
  deleteMetadata: (id: string) => apiClient.delete(`/api/metadata/${id}`),

  // Admin endpoints
  deleteUser: (id: string) => apiClient.delete(`/api/users/${id}`),
  updateUserRole: (id: string, role: string) =>
    apiClient.put<UserProfile>(`/api/users/${id}/role`, { role }),

  // Auth token helper
  getAuthToken: () => authClient.getAccessToken(),
} as const

export default api
