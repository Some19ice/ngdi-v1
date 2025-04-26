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

    // Request interceptor to add real auth headers
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage or cookies
        const token = localStorage.getItem("accessToken")

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
        console.error("API Error:", error.message)
        return Promise.reject(error)
      }
    )
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      // Get API URL directly
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

      console.log("API Client initialized with base URL:", apiUrl)

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

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    return authClient.isAuthenticated()
  }

  // Get current session
  async getSession(): Promise<Session | null> {
    return authClient.getSession()
  }
}

// Create API client instance
const apiClient = ApiClient.getInstance()

// Define API endpoints with mock implementations
export const api = {
  // Auth endpoints with mock implementations
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
  getCurrentUser: () => {
    return apiClient.get<UserProfile>("/users/profile")
  },
  updateUser: (data: UserUpdateRequest) =>
    apiClient.put<UserProfile>("/users/profile", data),
  getUsers: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<UserProfile>>("/users", params),

  // Metadata endpoints
  getMetadata: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<MetadataResponse>>("/metadata", params),
  createMetadata: (data: MetadataRequest) =>
    apiClient.post<MetadataResponse>("/metadata", data),
  updateMetadata: (id: string, data: MetadataRequest) =>
    apiClient.put<MetadataResponse>(`/metadata/${id}`, data),
  deleteMetadata: (id: string) => apiClient.delete(`/metadata/${id}`),

  // Admin endpoints
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),
  updateUserRole: (id: string, role: string) =>
    apiClient.put<UserProfile>(`/users/${id}/role`, { role }),

  // Auth token helper - returns real token
  getAuthToken: () => authClient.getAccessToken(),
} as const

export default api
