/**
 * User metadata caching utilities
 * This file provides functions for caching and retrieving user metadata
 */

import { AuthUser } from "./auth-types"
import { supabaseAuthConfig } from "./supabase-auth.config"

/**
 * Cache key prefix for user metadata
 */
const USER_METADATA_PREFIX = "user_metadata:"

/**
 * Default cache duration in milliseconds (5 minutes)
 */
const DEFAULT_CACHE_DURATION = supabaseAuthConfig.cache.permissionDuration

/**
 * Cache item interface
 */
interface CacheItem<T> {
  value: T
  expiresAt: number
}

/**
 * Get a cache key for user metadata
 * @param userId User ID
 * @returns Cache key
 */
function getCacheKey(userId: string): string {
  return `${USER_METADATA_PREFIX}${userId}`
}

/**
 * Cache user metadata in localStorage
 * @param user User object
 * @param duration Cache duration in milliseconds
 */
export function cacheUserMetadata(
  user: AuthUser,
  duration: number = DEFAULT_CACHE_DURATION
): void {
  if (!user || !user.id) return
  
  try {
    const cacheKey = getCacheKey(user.id)
    const cacheItem: CacheItem<AuthUser> = {
      value: user,
      expiresAt: Date.now() + duration,
    }
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheItem))
  } catch (error) {
    console.error("Failed to cache user metadata:", error)
  }
}

/**
 * Get cached user metadata from localStorage
 * @param userId User ID
 * @returns Cached user metadata or null if not found or expired
 */
export function getCachedUserMetadata(userId: string): AuthUser | null {
  if (!userId) return null
  
  try {
    const cacheKey = getCacheKey(userId)
    const cachedData = localStorage.getItem(cacheKey)
    
    if (!cachedData) return null
    
    const cacheItem = JSON.parse(cachedData) as CacheItem<AuthUser>
    
    // Check if cache has expired
    if (cacheItem.expiresAt < Date.now()) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    return cacheItem.value
  } catch (error) {
    console.error("Failed to get cached user metadata:", error)
    return null
  }
}

/**
 * Clear cached user metadata
 * @param userId User ID (if not provided, clears all user metadata)
 */
export function clearCachedUserMetadata(userId?: string): void {
  try {
    if (userId) {
      // Clear specific user metadata
      const cacheKey = getCacheKey(userId)
      localStorage.removeItem(cacheKey)
    } else {
      // Clear all user metadata
      const keys = Object.keys(localStorage)
      
      for (const key of keys) {
        if (key.startsWith(USER_METADATA_PREFIX)) {
          localStorage.removeItem(key)
        }
      }
    }
  } catch (error) {
    console.error("Failed to clear cached user metadata:", error)
  }
}

/**
 * Update cached user metadata
 * @param userId User ID
 * @param updates Partial user updates
 * @returns Updated user metadata or null if not found
 */
export function updateCachedUserMetadata(
  userId: string,
  updates: Partial<AuthUser>
): AuthUser | null {
  if (!userId) return null
  
  try {
    const cachedUser = getCachedUserMetadata(userId)
    
    if (!cachedUser) return null
    
    const updatedUser = { ...cachedUser, ...updates }
    cacheUserMetadata(updatedUser)
    
    return updatedUser
  } catch (error) {
    console.error("Failed to update cached user metadata:", error)
    return null
  }
}

/**
 * Get all cached user metadata
 * @returns Array of cached user metadata
 */
export function getAllCachedUserMetadata(): AuthUser[] {
  try {
    const keys = Object.keys(localStorage)
    const users: AuthUser[] = []
    
    for (const key of keys) {
      if (key.startsWith(USER_METADATA_PREFIX)) {
        const cachedData = localStorage.getItem(key)
        
        if (cachedData) {
          const cacheItem = JSON.parse(cachedData) as CacheItem<AuthUser>
          
          // Check if cache has expired
          if (cacheItem.expiresAt >= Date.now()) {
            users.push(cacheItem.value)
          } else {
            localStorage.removeItem(key)
          }
        }
      }
    }
    
    return users
  } catch (error) {
    console.error("Failed to get all cached user metadata:", error)
    return []
  }
}
