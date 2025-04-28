import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authClient } from '../auth-client';
import { getApiUrl } from '../api-config';
import { toast } from 'sonner';

// Define retry configuration
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryStatusCodes: number[];
}

// Define API client options
interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  retry?: Partial<RetryConfig>;
  withCredentials?: boolean;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Standardized API client with retry logic and consistent error handling
 */
export class StandardizedApiClient {
  private axiosInstance: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor(options: ApiClientOptions = {}) {
    // Set up default options
    const baseURL = options.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const timeout = options.timeout || 30000;
    const withCredentials = options.withCredentials !== undefined ? options.withCredentials : true;
    
    // Merge retry config with defaults
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...options.retry,
    };

    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      withCredentials,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Set up request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Get token from auth client
        const token = authClient.getAccessToken();
        
        // Add token to headers if available
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Get CSRF token from cookie if available
        const csrfToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1];
          
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Set up response interceptor with retry logic
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Get the original request config
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: number };
        
        // If no config is available, reject immediately
        if (!originalRequest) {
          return Promise.reject(error);
        }
        
        // Initialize retry count if not set
        if (originalRequest._retry === undefined) {
          originalRequest._retry = 0;
        }
        
        // Check if we should retry the request
        const shouldRetry = 
          originalRequest._retry < this.retryConfig.maxRetries && 
          error.response && 
          this.retryConfig.retryStatusCodes.includes(error.response.status);
          
        // Handle 401 errors (unauthorized) - attempt to refresh token
        if (error.response && error.response.status === 401 && originalRequest._retry === 0) {
          try {
            // Try to refresh the token
            await authClient.refreshToken();
            
            // Get new token
            const newToken = authClient.getAccessToken();
            
            // Update the Authorization header
            if (newToken) {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newToken}`,
              };
            }
            
            // Retry the request with the new token
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // If token refresh fails, redirect to login
            console.error('Token refresh failed:', refreshError);
            
            // Only show toast if we're in a browser environment
            if (typeof window !== 'undefined') {
              toast.error('Your session has expired. Please sign in again.');
              
              // Redirect to login after a short delay
              setTimeout(() => {
                window.location.href = '/auth/signin';
              }, 1500);
            }
            
            return Promise.reject(error);
          }
        }
        
        // Handle retryable errors
        if (shouldRetry) {
          originalRequest._retry++;
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.retryConfig.retryDelay));
          
          // Log retry attempt
          console.log(`Retrying request (${originalRequest._retry}/${this.retryConfig.maxRetries}):`, 
            originalRequest.url);
            
          // Retry the request
          return this.axiosInstance(originalRequest);
        }
        
        // If we shouldn't retry or have exceeded max retries, reject with error
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, `GET ${url}`);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, `POST ${url}`);
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, `PUT ${url}`);
      throw error;
    }
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, `PATCH ${url}`);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, `DELETE ${url}`);
      throw error;
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any, requestInfo: string): void {
    // Log the error
    console.error(`API Error (${requestInfo}):`, error);
    
    // Extract error message
    let errorMessage = 'An unexpected error occurred';
    
    if (axios.isAxiosError(error)) {
      // Handle Axios errors
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // Server responded with an error status
        const data = axiosError.response.data as any;
        errorMessage = data?.message || data?.error || `Error ${axiosError.response.status}: ${axiosError.response.statusText}`;
      } else if (axiosError.request) {
        // Request was made but no response received
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        // Error in setting up the request
        errorMessage = axiosError.message || 'Error setting up the request';
      }
    } else if (error instanceof Error) {
      // Handle standard JS errors
      errorMessage = error.message;
    }
    
    // Don't show toast for 401 errors as they're handled in the interceptor
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return;
    }
    
    // Show toast notification for errors in browser environment
    if (typeof window !== 'undefined') {
      toast.error(errorMessage);
    }
  }
}

// Create a singleton instance
export const apiClient = new StandardizedApiClient();

// Export default instance
export default apiClient;
