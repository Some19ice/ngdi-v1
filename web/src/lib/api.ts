import axios from 'axios'

/**
 * API client for making requests to the backend
 * Includes CSRF token handling and authentication
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
})

// Request interceptor to add CSRF token
api.interceptors.request.use(async (config) => {
  // Get CSRF token from cookie if available
  const csrfToken = getCsrfToken()
  
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  
  return config
})

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401) {
      // Try to refresh the token
      try {
        await refreshToken()
        
        // Retry the original request
        const originalRequest = error.config
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login?session=expired'
        return Promise.reject(refreshError)
      }
    }
    
    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response?.status === 403) {
      // Check if email verification is required
      if (error.response?.data?.code === 'AUTH008') {
        // Don't redirect, let the component handle it with the verification banner
        return Promise.reject(error)
      }
      
      // For other permission errors, redirect to unauthorized page
      window.location.href = '/unauthorized'
      return Promise.reject(error)
    }
    
    return Promise.reject(error)
  }
)

/**
 * Get CSRF token from cookies
 */
function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * Refresh the authentication token
 */
async function refreshToken(): Promise<void> {
  try {
    await api.post('/auth/refresh')
  } catch (error) {
    console.error('Failed to refresh token:', error)
    throw error
  }
}
