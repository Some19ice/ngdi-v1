"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { type Permission } from "@/lib/auth/types"
import { UserRole } from "@/lib/auth/constants"
import { can, canAll, canAny } from "@/lib/auth/rbac"

interface CachedPermission {
  result: boolean
  timestamp: number
}

// Extended user type for RBAC
interface RbacUser {
  id: string
  email: string
  name: string
  role: UserRole
  organization?: string | null
  department?: string | null
  phone?: string | null
  createdAt?: string | null
  image?: string | null
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const permissionCache = new Map<string, CachedPermission>()

export function useAuthWithCache() {
  const { session, user: sessionUser, refreshSession } = useAuthSession()
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  // Clear cache when session changes
  useEffect(() => {
    permissionCache.clear()
    setLastUpdate(Date.now())
  }, [session])

  // Convert session user to RBAC user
  const user = sessionUser?.role
    ? ({
        id: sessionUser.id,
        email: sessionUser.email || "",
        name: sessionUser.name || "",
        role: sessionUser.role as UserRole,
        // These fields might not exist in the session user
        organization: (sessionUser as any).organization || null,
        department: (sessionUser as any).department || null,
        phone: (sessionUser as any).phone || null,
        createdAt: null,
        image: sessionUser.image || null,
      } as RbacUser)
    : null

  const getCacheKey = (permission: Permission | Permission[]) => {
    if (Array.isArray(permission)) {
      return `${user?.id}-${permission.sort().join(",")}`
    }
    return `${user?.id}-${permission}`
  }

  const isPermissionCacheValid = (cacheKey: string) => {
    const cached = permissionCache.get(cacheKey)
    if (!cached) return false
    return Date.now() - cached.timestamp < CACHE_DURATION
  }

  const checkPermission = useCallback(
    (permission: Permission) => {
      if (!user) return false

      const cacheKey = getCacheKey(permission)
      if (isPermissionCacheValid(cacheKey)) {
        return permissionCache.get(cacheKey)!.result
      }

      const result = can(user, permission)
      permissionCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      })

      return result
    },
    [user]
  )

  const checkAllPermissions = useCallback(
    (permissions: Permission[]) => {
      if (!user) return false

      const cacheKey = getCacheKey(permissions)
      if (isPermissionCacheValid(cacheKey)) {
        return permissionCache.get(cacheKey)!.result
      }

      const result = canAll(user, permissions)
      permissionCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      })

      return result
    },
    [user]
  )

  const checkAnyPermission = useCallback(
    (permissions: Permission[]) => {
      if (!user) return false

      const cacheKey = getCacheKey(permissions)
      if (isPermissionCacheValid(cacheKey)) {
        return permissionCache.get(cacheKey)!.result
      }

      const result = canAny(user, permissions)
      permissionCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      })

      return result
    },
    [user]
  )

  const refresh = useCallback(async () => {
    permissionCache.clear()
    await refreshSession()
    setLastUpdate(Date.now())
  }, [refreshSession])

  return {
    user,
    isAuthenticated: !!user,
    isLoading: !session && !sessionUser,
    can: checkPermission,
    canAll: checkAllPermissions,
    canAny: checkAnyPermission,
    refreshSession: refresh,
    lastUpdate,
  }
}
