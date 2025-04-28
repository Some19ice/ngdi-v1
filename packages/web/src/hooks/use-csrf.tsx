'use client'

import { useState, useEffect } from 'react'
import { getCsrfToken, ensureCsrfToken, refreshCsrfToken, hasCsrfToken } from '@/lib/utils/csrf-utils'

/**
 * Hook for managing CSRF tokens in forms
 * 
 * This hook provides:
 * - A CSRF token for form submissions
 * - Loading state for the token
 * - Error state if token fetching fails
 * - A function to refresh the token
 * 
 * @returns CSRF token state and management functions
 */
export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(getCsrfToken())
  const [loading, setLoading] = useState<boolean>(!csrfToken)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // If we already have a token, no need to fetch
    if (csrfToken) return

    let isMounted = true
    
    const fetchToken = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = await ensureCsrfToken()
        
        if (isMounted) {
          setCsrfToken(token)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err)
        
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch CSRF token'))
          setLoading(false)
        }
      }
    }

    fetchToken()

    return () => {
      isMounted = false
    }
  }, [csrfToken])

  /**
   * Refresh the CSRF token
   * Useful when a form submission fails due to an invalid token
   */
  const refresh = async (): Promise<string | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const token = await refreshCsrfToken()
      setCsrfToken(token)
      setLoading(false)
      
      return token
    } catch (err) {
      console.error('Failed to refresh CSRF token:', err)
      setError(err instanceof Error ? err : new Error('Failed to refresh CSRF token'))
      setLoading(false)
      return null
    }
  }

  return {
    csrfToken,
    loading,
    error,
    refresh,
    isValid: hasCsrfToken()
  }
}

/**
 * CSRF Form Input Component
 * Renders a hidden input with the CSRF token
 */
export function CsrfToken() {
  const { csrfToken } = useCsrf()
  
  if (!csrfToken) return null
  
  return <input type="hidden" name="_csrf" value={csrfToken} />
}

export default useCsrf
