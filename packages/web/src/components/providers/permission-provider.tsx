"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession } from "next-auth/react"
import { permissionsService, Permission } from "@/lib/services/permissions.service"

interface PermissionContextType {
  permissions: Permission[]
  loading: boolean
  error: Error | null
  refreshPermissions: () => Promise<void>
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  loading: true,
  error: null,
  refreshPermissions: async () => {}
})

export function usePermissions() {
  return useContext(PermissionContext)
}

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPermissions = async () => {
    if (status !== "authenticated" || !session?.user) {
      setPermissions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const userPermissions = await permissionsService.getUserPermissions()
      setPermissions(userPermissions.allPermissions)
      
      // Update session with permissions
      if (session.user) {
        session.user.permissions = userPermissions.allPermissions.map(p => ({
          action: p.action,
          subject: p.subject
        }))
      }
    } catch (err) {
      console.error("Error fetching permissions:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch permissions"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchPermissions()
    } else if (status === "unauthenticated") {
      setPermissions([])
      setLoading(false)
    }
  }, [status, session?.user?.id])

  const refreshPermissions = async () => {
    await fetchPermissions()
  }

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        loading,
        error,
        refreshPermissions
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}
