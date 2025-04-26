import { api } from "@/lib/api"
import { ApiResponse } from "@/types/api"

export interface Permission {
  id: string
  name: string
  action: string
  subject: string
  description?: string
}

export interface Role {
  id: string
  name: string
  description?: string
  isSystem: boolean
  permissions: Permission[]
}

export interface UserPermission {
  id: string
  userId: string
  permissionId: string
  granted: boolean
  conditions?: any
  expiresAt?: string
  permission: Permission
}

export interface UserPermissionsResponse {
  directPermissions: UserPermission[]
  allPermissions: (Permission & { source: "role" | "direct" })[]
}

export const permissionsService = {
  /**
   * Get all permissions for the current user
   */
  async getUserPermissions(): Promise<UserPermissionsResponse> {
    const response = await api.get<ApiResponse<UserPermissionsResponse>>(
      "/user-permissions/user/me"
    )
    return response.data.data
  },

  /**
   * Get all available permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const response = await api.get<ApiResponse<{ permissions: Permission[] }>>(
      "/permissions"
    )
    return response.data.data.permissions
  },

  /**
   * Get all available roles
   */
  async getAllRoles(): Promise<Role[]> {
    const response = await api.get<ApiResponse<{ roles: Role[] }>>(
      "/roles"
    )
    return response.data.data.roles
  },

  /**
   * Get a role by ID with its permissions
   */
  async getRoleWithPermissions(roleId: string): Promise<Role> {
    const response = await api.get<ApiResponse<Role>>(
      `/roles/${roleId}`
    )
    return response.data.data
  },

  /**
   * Check if the current user has a specific permission
   */
  async checkPermission(action: string, subject: string, resource?: any): Promise<boolean> {
    try {
      const response = await api.post<ApiResponse<{ granted: boolean }>>(
        "/user-permissions/check",
        {
          action,
          subject,
          resource
        }
      )
      return response.data.data.granted
    } catch (error) {
      console.error("Permission check error:", error)
      return false
    }
  },

  /**
   * Grant a permission to a user
   */
  async grantPermission(
    userId: string, 
    permissionId: string, 
    conditions?: any, 
    expiresAt?: string
  ): Promise<UserPermission> {
    const response = await api.post<ApiResponse<UserPermission>>(
      `/user-permissions/user/${userId}`,
      {
        permissionId,
        granted: true,
        conditions,
        expiresAt
      }
    )
    return response.data.data
  },

  /**
   * Revoke a permission from a user
   */
  async revokePermission(userId: string, permissionId: string): Promise<void> {
    await api.delete<ApiResponse<void>>(
      `/user-permissions/user/${userId}/permission/${permissionId}`
    )
  },

  /**
   * Assign a role to a user
   */
  async assignRole(userId: string, roleId: string): Promise<void> {
    await api.post<ApiResponse<void>>(
      `/roles/assign/${roleId}/user/${userId}`
    )
  }
}
