"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession, useAuth } from "@/lib/auth-context"
import { type Permission, UserRole } from "@/lib/auth/types"
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
  const { data: session, status } = useSession()
  const { refreshSession: refresh } = useAuth()
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  // Clear cache when session changes
  useEffect(() => {
    permissionCache.clear()
    setLastUpdate(Date.now())
  }, [session])

  // Convert session user to RBAC user
  const user = session?.user?.role
    ? {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name || "",
        role: session.user.role as UserRole,
        // These fields might not exist in the session user
        organization: (session.user as any).organization || null,
        department: (session.user as any).department || null,
        phone: (session.user as any).phone || null,
        createdAt: null,
        image: session.user.image || null,
      } as RbacUser
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
    await refresh()
    setLastUpdate(Date.now())
  }, [refresh])

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
