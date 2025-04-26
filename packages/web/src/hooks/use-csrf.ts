'use client'

import { useState, useEffect } from 'react'
import { getCsrfToken } from '@/lib/csrf-client'

/**
 * Hook to get and manage CSRF tokens for forms
 * @returns {Object} CSRF token and loading state
 */
export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true)
        const token = await getCsrfToken()
        setCsrfToken(token)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch CSRF token'))
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [])

  // Function to refresh the token
  const refreshToken = async () => {
    try {
      setLoading(true)
      const token = await getCsrfToken()
      setCsrfToken(token)
      setError(null)
      return token
    } catch (err) {
      console.error('Failed to refresh CSRF token:', err)
      setError(err instanceof Error ? err : new Error('Failed to refresh CSRF token'))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    csrfToken,
    loading,
    error,
    refreshToken
  }
}

export default useCsrf
