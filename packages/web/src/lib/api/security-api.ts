import { apiClient } from "./api-client"

export interface UserSession {
  id: string
  created_at: string
  updated_at: string
  last_sign_in_at: string
  user_id: string
  ip_address: string
  user_agent: string
  location: string
  device_info: {
    browser: string
    os: string
    device: string
  }
  is_current: boolean
}

export interface AccountChange {
  id: string | number
  date: Date
  type: string
  description: string
  ip_address?: string
  location?: string
}

export interface GetSessionsResult {
  sessions: UserSession[]
  error: Error | null
}

export interface GetAccountChangesResult {
  changes: AccountChange[]
  error: Error | null
}

/**
 * Get user sessions from the API
 * @returns User sessions and error if any
 */
export async function getSessions(): Promise<GetSessionsResult> {
  try {
    const response = await apiClient.get('/auth/sessions')
    
    if (!response || !response.data) {
      throw new Error('Failed to fetch sessions')
    }
    
    return {
      sessions: response.data,
      error: null
    }
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return {
      sessions: [],
      error: error instanceof Error ? error : new Error(String(error))
    }
  }
}

/**
 * Get account changes from the API
 * @returns Account changes and error if any
 */
export async function getAccountChanges(): Promise<GetAccountChangesResult> {
  try {
    const response = await apiClient.get('/auth/account-changes')
    
    if (!response || !response.data) {
      throw new Error('Failed to fetch account changes')
    }
    
    // Format dates
    const changes = response.data.map((change: any) => ({
      ...change,
      date: new Date(change.date || change.timestamp || change.created_at)
    }))
    
    return {
      changes,
      error: null
    }
  } catch (error) {
    console.error('Error fetching account changes:', error)
    return {
      changes: [],
      error: error instanceof Error ? error : new Error(String(error))
    }
  }
}

/**
 * Sign out from a specific device
 * @param sessionId Session ID to sign out from
 * @returns Whether the operation was successful
 */
export async function signOutFromDevice(sessionId: string): Promise<boolean> {
  try {
    const response = await apiClient.post('/auth/signout-device', { sessionId })
    return response && response.success === true
  } catch (error) {
    console.error('Error signing out device:', error)
    return false
  }
}

/**
 * Sign out from all devices
 * @returns Whether the operation was successful
 */
export async function signOutFromAllDevices(): Promise<boolean> {
  try {
    const response = await apiClient.post('/auth/signout-all-devices')
    return response && response.success === true
  } catch (error) {
    console.error('Error signing out all devices:', error)
    return false
  }
}
