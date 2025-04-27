import { apiClient } from "./api-client"

export interface UserActivity {
  id: string
  description: string
  createdAt: Date
  type?: string
}

export interface UserDownload {
  id: string
  documentName: string
  timestamp: Date
  url?: string
}

export interface UserStats {
  downloads: number
  uploads: number
  contributions: number
}

export interface UserProfileData {
  user: {
    id: string
    name: string | null
    email: string
    emailVerified: Date | null
    image: string | null
    role: string
    organization: string | null
    department: string | null
    phone: string | null
    createdAt: Date
    updatedAt: Date
    lastLoginAt?: Date
    metadata?: {
      location?: string
      bio?: string
      website?: string
      socialLinks?: Record<string, string>
    }
    activities?: UserActivity[]
    downloadStats?: UserDownload[]
  }
  stats: UserStats
}

/**
 * Fetch user profile data from the API
 * @param userId User ID
 * @returns User profile data
 */
export async function fetchUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    // Fetch user data from the database
    const userData = await apiClient.get(`/users/${userId}`)
    
    if (!userData) {
      return null
    }
    
    // Fetch user activity logs
    const activityLogs = await apiClient.get(`/users/${userId}/activity`)
    
    // Fetch user download stats
    const downloadStats = await apiClient.get(`/users/${userId}/downloads`)
    
    // Fetch user statistics
    const userStats = await apiClient.get(`/users/${userId}/stats`)
    
    // Format activities
    const activities = (activityLogs?.data || []).map((log: any) => ({
      id: log.id,
      description: log.description || `${log.action} ${log.subject}`,
      createdAt: new Date(log.createdAt),
      type: log.action
    }))
    
    // Format downloads
    const downloads = (downloadStats?.data || []).map((download: any) => ({
      id: download.id,
      documentName: download.name || download.documentName,
      timestamp: new Date(download.createdAt || download.timestamp),
      url: download.url
    }))
    
    // Return formatted profile data
    return {
      user: {
        ...userData.data,
        createdAt: new Date(userData.data.createdAt),
        updatedAt: new Date(userData.data.updatedAt),
        emailVerified: userData.data.emailVerified ? new Date(userData.data.emailVerified) : null,
        lastLoginAt: userData.data.lastLoginAt ? new Date(userData.data.lastLoginAt) : undefined,
        activities,
        downloadStats: downloads
      },
      stats: {
        downloads: userStats?.data?.downloads || 0,
        uploads: userStats?.data?.uploads || 0,
        contributions: userStats?.data?.contributions || 0
      }
    }
  } catch (error) {
    console.error("Error fetching user profile data:", error)
    return null
  }
}

/**
 * Fallback function to get basic user profile data when API is unavailable
 * @param userId User ID
 * @returns Basic user profile data
 */
export async function getFallbackUserProfile(userData: any): Promise<UserProfileData> {
  return {
    user: {
      ...userData,
      lastLoginAt: new Date(),
      activities: [],
      downloadStats: [],
    },
    stats: {
      downloads: 0,
      uploads: 0,
      contributions: 0,
    }
  }
}
