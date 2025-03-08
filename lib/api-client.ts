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

        // If the error is due to an expired token and we haven't tried to refresh yet
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          authClient.isAuthenticated()
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
      ApiClient.instance = new ApiClient({
        baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
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

// Create API client instance
const apiClient = ApiClient.getInstance()

// Define API endpoints
export const api: ApiEndpoints = {
  // Auth endpoints
  login: (data) => authClient.login(data.email, data.password),
  register: (data) => authClient.register(data.email, data.password, data.name),
  logout: () => authClient.logout(),

  // User endpoints
  getCurrentUser: () => apiClient.get("/api/users/me"),
  updateUser: (data) => apiClient.put("/api/users/me", data),
  getUsers: (params) => apiClient.get("/api/users", params),

  // Metadata endpoints
  getMetadata: (params) => apiClient.get("/api/metadata", params),
  createMetadata: (data) => apiClient.post("/api/metadata", data),
  updateMetadata: (id, data) => apiClient.put(`/api/metadata/${id}`, data),
  deleteMetadata: (id) => apiClient.delete(`/api/metadata/${id}`),

  // Admin endpoints
  deleteUser: (id) => apiClient.delete(`/api/users/${id}`),
  updateUserRole: (id, role) => apiClient.put(`/api/users/${id}/role`, { role }),
}

export default api
