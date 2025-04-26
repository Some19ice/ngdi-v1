/**
 * CSRF protection client utilities
 * Handles fetching and managing CSRF tokens for form submissions
 */

// Get the CSRF token from cookies
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrf_token='))
  
  if (!csrfCookie) return null
  
  return csrfCookie.split('=')[1]
}

// Fetch a new CSRF token from the server
export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/csrf-token`,
      {
        method: 'GET',
        credentials: 'include', // Important for cookies
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token')
    }
    
    const data = await response.json()
    return data.csrfToken
  } catch (error) {
    console.error('Error fetching CSRF token:', error)
    throw error
  }
}

// Get the CSRF token (from cookie or fetch a new one)
export async function getCsrfToken(): Promise<string> {
  // First try to get from cookie
  const cookieToken = getCsrfTokenFromCookie()
  
  if (cookieToken) {
    return cookieToken
  }
  
  // If not in cookie, fetch a new one
  return fetchCsrfToken()
}

// Add CSRF token to fetch options
export async function withCsrfToken(options: RequestInit = {}): Promise<RequestInit> {
  const token = await getCsrfToken()
  
  return {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': token,
    },
  }
}

// Enhanced fetch with CSRF token
export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const fetchOptions = await withCsrfToken(options)
  return fetch(url, fetchOptions)
}
