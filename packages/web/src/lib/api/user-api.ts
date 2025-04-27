import { apiClient } from "./api-client"
import { UserRole } from "@/lib/auth/constants"

export interface CreateUserData {
  name: string
  email: string
  role: UserRole
  organization?: string
  department?: string
}

export interface UserData {
  id: string
  name: string | null
  email: string
  role: UserRole
  organization: string | null
  department: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a new user
 * @param userData User data to create
 * @returns Created user data
 */
export async function createUser(userData: CreateUserData): Promise<UserData> {
  try {
    const response = await apiClient.post('/users', userData)
    
    if (!response || !response.data) {
      throw new Error('Failed to create user')
    }
    
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt)
    }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Get a user by ID
 * @param userId User ID
 * @returns User data
 */
export async function getUser(userId: string): Promise<UserData | null> {
  try {
    const response = await apiClient.get(`/users/${userId}`)
    
    if (!response || !response.data) {
      return null
    }
    
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt)
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

/**
 * Get all users
 * @returns List of users
 */
export async function getUsers(): Promise<UserData[]> {
  try {
    const response = await apiClient.get('/users')
    
    if (!response || !response.data) {
      return []
    }
    
    return response.data.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

/**
 * Update a user
 * @param userId User ID
 * @param userData User data to update
 * @returns Updated user data
 */
export async function updateUser(userId: string, userData: Partial<CreateUserData>): Promise<UserData> {
  try {
    const response = await apiClient.put(`/users/${userId}`, userData)
    
    if (!response || !response.data) {
      throw new Error('Failed to update user')
    }
    
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt)
    }
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Delete a user
 * @param userId User ID
 * @returns Whether the operation was successful
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const response = await apiClient.delete(`/users/${userId}`)
    return response && response.success === true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}
