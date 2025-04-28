import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export interface User {
  id: string
  name: string
  email: string
  role: string
  emailVerified: Date | null
  organization?: string
  department?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

/**
 * Hook for accessing authentication state
 * Includes email verification status
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me')
        
        if (response.data.success && response.data.user) {
          setState({
            user: response.data.user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          })
        } else {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: error instanceof Error ? error.message : 'Failed to fetch user',
        })
      }
    }

    fetchUser()
  }, [])

  return state
}
