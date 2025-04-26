import { Permission, Role, User, UserPermission } from "@prisma/client"
import { prisma } from "../lib/prisma"

/**
 * Extended permission type with conditions
 */
export interface PermissionWithConditions extends Permission {
  conditions?: {
    organizationId?: string
    userId?: string
    dynamic?: {
      evaluate: (user: User, resource?: any) => boolean
    }
  }
}

/**
 * Resource type for permission checks
 */
export interface Resource {
  id?: string
  userId?: string
  organizationId?: string
  [key: string]: any
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  granted: boolean
  reason?: string
}

/**
 * Get all permissions for a role, including inherited permissions
 */
export async function getAllPermissionsForRole(roleId: string): Promise<Permission[]> {
  // Get the role with its permissions
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      }
    }
  })

  if (!role) {
    return []
  }

  // Return the permissions
  return role.rolePermissions.map(rp => rp.permission)
}

/**
 * Get all permissions for a user, including role permissions and direct permissions
 */
export async function getAllPermissionsForUser(userId: string): Promise<PermissionWithConditions[]> {
  // Get the user with their role and direct permissions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customRole: {
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      },
      userPermissions: {
        where: {
          granted: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          permission: true
        }
      }
    }
  })

  if (!user) {
    return []
  }

  // Collect role permissions
  const rolePermissions: PermissionWithConditions[] = user.customRole
    ? user.customRole.rolePermissions.map(rp => ({
        ...rp.permission
      }))
    : []

  // Collect direct user permissions with their conditions
  const userPermissions: PermissionWithConditions[] = user.userPermissions.map(up => ({
    ...up.permission,
    conditions: up.conditions as any
  }))

  // Combine and deduplicate permissions
  const allPermissions = [...rolePermissions]

  // Add user permissions, overriding role permissions if they exist
  for (const userPerm of userPermissions) {
    const existingIndex = allPermissions.findIndex(
      p => p.action === userPerm.action && p.subject === userPerm.subject
    )

    if (existingIndex >= 0) {
      allPermissions[existingIndex] = userPerm
    } else {
      allPermissions.push(userPerm)
    }
  }

  return allPermissions
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
  user: User,
  action: string,
  subject: string,
  resource?: Resource
): Promise<PermissionCheckResult> {
  // Admin users have all permissions
  if (user.role === 'ADMIN') {
    return { granted: true }
  }

  // Get all permissions for the user
  const userPermissions = await getAllPermissionsForUser(user.id)

  // Check if the user has the permission
  const permission = userPermissions.find(
    p => p.action === action && p.subject === subject
  )

  if (!permission) {
    return { 
      granted: false,
      reason: `User does not have the ${action}:${subject} permission`
    }
  }

  // Check conditions if they exist
  if (permission.conditions || resource) {
    // Check dynamic conditions first
    if (permission.conditions?.dynamic) {
      try {
        const dynamicResult = permission.conditions.dynamic.evaluate(user, resource)
        if (!dynamicResult) {
          return { 
            granted: false,
            reason: 'Dynamic condition evaluation failed'
          }
        }
      } catch (error) {
        console.error('Error evaluating dynamic condition:', error)
        return { 
          granted: false,
          reason: 'Error evaluating dynamic condition'
        }
      }
    }

    // Check organization condition
    if (permission.conditions?.organizationId && resource?.organizationId) {
      if (permission.conditions.organizationId !== resource.organizationId) {
        return { 
          granted: false,
          reason: 'Organization condition not met'
        }
      }
    }

    // Check user condition (ownership)
    if (permission.conditions?.userId && resource?.userId) {
      if (permission.conditions.userId !== resource.userId && user.id !== resource.userId) {
        return { 
          granted: false,
          reason: 'User ownership condition not met'
        }
      }
    }
  }

  // All conditions passed
  return { granted: true }
}

/**
 * Check if a user has all of the specified permissions
 */
export async function hasAllPermissions(
  user: User,
  permissions: { action: string; subject: string }[],
  resource?: Resource
): Promise<PermissionCheckResult> {
  // Admin users have all permissions
  if (user.role === 'ADMIN') {
    return { granted: true }
  }

  // Check each permission
  for (const { action, subject } of permissions) {
    const result = await hasPermission(user, action, subject, resource)
    if (!result.granted) {
      return result
    }
  }

  // All permissions granted
  return { granted: true }
}

/**
 * Check if a user has any of the specified permissions
 */
export async function hasAnyPermission(
  user: User,
  permissions: { action: string; subject: string }[],
  resource?: Resource
): Promise<PermissionCheckResult> {
  // Admin users have all permissions
  if (user.role === 'ADMIN') {
    return { granted: true }
  }

  // Check each permission
  for (const { action, subject } of permissions) {
    const result = await hasPermission(user, action, subject, resource)
    if (result.granted) {
      return result
    }
  }

  // No permissions granted
  return { 
    granted: false,
    reason: 'User does not have any of the required permissions'
  }
}

/**
 * Check if a user can access their own resource or has admin rights
 */
export async function canAccessOwnResource(
  user: User,
  action: string,
  subject: string,
  resourceUserId: string
): Promise<PermissionCheckResult> {
  // Admin users have all permissions
  if (user.role === 'ADMIN') {
    return { granted: true }
  }

  // Check if the user is the owner of the resource
  if (user.id === resourceUserId) {
    return { granted: true }
  }

  // Check if the user has the permission
  return await hasPermission(user, action, subject, { userId: resourceUserId })
}

/**
 * Log permission check for auditing
 */
export async function logPermissionCheck(
  user: User,
  action: string,
  subject: string,
  resource: any,
  result: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action,
        subject,
        subjectId: resource?.id,
        metadata: {
          result,
          resource: resource ? JSON.stringify(resource) : null,
          timestamp: new Date().toISOString()
        },
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Error logging permission check:', error)
  }
}

/**
 * Get recent activity for a user
 */
export async function getUserActivity(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

/**
 * Get activity for a specific resource
 */
export async function getResourceActivity(
  subject: string,
  subjectId: string,
  limit: number = 10
): Promise<any[]> {
  return prisma.activityLog.findMany({
    where: { subject, subjectId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
}

/**
 * Create a dynamic condition function
 */
export function createDynamicCondition(
  conditionFn: (user: User, resource?: any) => boolean
): { evaluate: (user: User, resource?: any) => boolean } {
  return {
    evaluate: conditionFn
  }
}

/**
 * Grant a permission to a user directly
 */
export async function grantPermissionToUser(
  userId: string,
  permissionId: string,
  conditions?: any,
  expiresAt?: Date
): Promise<UserPermission> {
  return prisma.userPermission.upsert({
    where: {
      userId_permissionId: {
        userId,
        permissionId
      }
    },
    update: {
      granted: true,
      conditions,
      expiresAt
    },
    create: {
      userId,
      permissionId,
      granted: true,
      conditions,
      expiresAt
    }
  })
}

/**
 * Revoke a permission from a user
 */
export async function revokePermissionFromUser(
  userId: string,
  permissionId: string
): Promise<void> {
  await prisma.userPermission.delete({
    where: {
      userId_permissionId: {
        userId,
        permissionId
      }
    }
  })
}

/**
 * Get all permissions by subject
 */
export async function getPermissionsBySubject(subject: string): Promise<Permission[]> {
  return prisma.permission.findMany({
    where: { subject }
  })
}

/**
 * Get all permissions by action
 */
export async function getPermissionsByAction(action: string): Promise<Permission[]> {
  return prisma.permission.findMany({
    where: { action }
  })
}

/**
 * Get permission by action and subject
 */
export async function getPermissionByActionAndSubject(
  action: string,
  subject: string
): Promise<Permission | null> {
  return prisma.permission.findUnique({
    where: {
      action_subject: {
        action,
        subject
      }
    }
  })
}
