import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"
import { toast } from "@/components/ui/use-toast"
import { ApiError, ApiResponse } from "@/types/api"
import { getCsrfToken, ensureCsrfToken } from "./utils/csrf-utils"

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _csrfRetry?: boolean
}

class ApiClient {
  private static instance: ApiClient
  private api: AxiosInstance

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Important for CSRF cookies
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config: CustomAxiosRequestConfig) => {
        // Add authorization token if available
        const token = this.getStoredAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add CSRF token for state-changing methods
        const method = config.method?.toUpperCase()
        if (method && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
          // Get CSRF token from cookie or cache
          let csrfToken = getCsrfToken()

          // If no token is available and this is not a CSRF retry, fetch a new one
          if (!csrfToken && !config._csrfRetry) {
            try {
              csrfToken = await ensureCsrfToken()
            } catch (error) {
              console.error("Failed to get CSRF token:", error)
            }
          }

          // Add token to headers if available
          if (csrfToken) {
            config.headers["X-CSRF-Token"] = csrfToken
          }
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as CustomAxiosRequestConfig

        if (!originalRequest) {
          return Promise.reject(error)
        }

        // Handle 401 errors (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const newToken = await this.refreshTokens()
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return this.api(originalRequest)
          } catch (refreshError) {
            this.clearTokens()
            window.location.href = "/login"
            return Promise.reject(refreshError)
          }
        }

        // Handle 403 errors that might be CSRF related
        if (
          error.response?.status === 403 &&
          error.response?.data?.error?.includes("CSRF") &&
          !originalRequest._csrfRetry
        ) {
          originalRequest._csrfRetry = true

          try {
            // Get a fresh CSRF token
            const newCsrfToken = await ensureCsrfToken()

            if (newCsrfToken) {
              // Update the request with the new token
              originalRequest.headers["X-CSRF-Token"] = newCsrfToken
              return this.api(originalRequest)
            }
          } catch (csrfError) {
            console.error("Failed to refresh CSRF token:", csrfError)
          }
        }

        // Handle other errors
        const message = error.response?.data?.message || "An error occurred"
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })

        return Promise.reject(error)
      }
    )
  }

  private getStoredAccessToken(): string | null {
    return localStorage.getItem("accessToken")
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem("refreshToken")
  }

  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
  }

  private clearTokens() {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }

  private async refreshTokens(): Promise<string> {
    const refreshToken = this.getStoredRefreshToken()
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await this.api.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >("/auth/refresh", {
      refreshToken,
    })

    const { accessToken, refreshToken: newRefreshToken } = response.data.data
    this.setTokens(accessToken, newRefreshToken)
    return accessToken
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  // Generic request methods with proper typing
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data)
    return response.data
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url)
    return response.data
  }
}

// Export a singleton instance
export const api = ApiClient.getInstance()
