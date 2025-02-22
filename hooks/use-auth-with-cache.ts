"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { type Permission, UserRole } from "@/lib/auth/types"
import { can, canAll, canAny, type User } from "@/lib/auth/rbac"

interface CachedPermission {
  result: boolean
  timestamp: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const permissionCache = new Map<string, CachedPermission>()

export function useAuthWithCache() {
  const { data: session, status, update } = useSession()
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  // Clear cache when session changes
  useEffect(() => {
    permissionCache.clear()
    setLastUpdate(Date.now())
  }, [session])

  const user = session?.user?.role
    ? ({
        id: session.user.id,
        email: session.user.email || "",
        role: session.user.role as UserRole,
        organizationId: session.user.organization || null,
      } as User)
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

  const refreshSession = useCallback(async () => {
    permissionCache.clear()
    await update()
    setLastUpdate(Date.now())
  }, [update])

  return {
    user,
    isAuthenticated: !!user,
    isLoading: status === "loading",
    can: checkPermission,
    canAll: checkAllPermissions,
    canAny: checkAnyPermission,
    refreshSession,
    lastUpdate,
  }
}
