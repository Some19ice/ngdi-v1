import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission, 
  canAccessOwnResource,
  getAllPermissionsForUser,
  getAllPermissionsForRole
} from '../../../utils/permissions'
import { prisma } from '../../../lib/prisma'
import { User, UserRole } from '@prisma/client'

// Mock Prisma
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    role: {
      findUnique: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    permission: {
      findMany: jest.fn()
    }
  }
}))

describe('Permission Utils', () => {
  let mockUser: User
  let mockAdminUser: User
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Create mock users
    mockUser = {
      id: 'user1',
      email: 'user@example.com',
      name: 'Test User',
      role: UserRole.USER,
      roleId: 'role_user',
      password: 'hashed_password',
      emailVerified: new Date(),
      image: null,
      organization: null,
      department: null,
      phone: null,
      locked: false,
      lockedUntil: null,
      failedAttempts: 0,
      lastFailedAttempt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    mockAdminUser = {
      ...mockUser,
      id: 'admin1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      roleId: 'role_admin'
    }
    
    // Mock prisma.user.findUnique
    jest.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockUser,
      customRole: {
        id: 'role_user',
        name: 'User',
        description: 'Regular user with basic access',
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      userPermissions: [
        {
          id: 'up1',
          userId: 'user1',
          permissionId: 'perm1',
          granted: true,
          conditions: null,
          expiresAt: null,
          createdAt: new Date(),
          permission: {
            id: 'perm1',
            name: 'metadata:create',
            action: 'create',
            subject: 'metadata',
            description: 'Create metadata records',
            conditions: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      ]
    })
    
    // Mock prisma.role.findUnique
    jest.mocked(prisma.role.findUnique).mockResolvedValue({
      id: 'role_user',
      name: 'User',
      description: 'Regular user with basic access',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      rolePermissions: [
        {
          id: 'rp1',
          roleId: 'role_user',
          permissionId: 'perm2',
          createdAt: new Date(),
          permission: {
            id: 'perm2',
            name: 'metadata:read',
            action: 'read',
            subject: 'metadata',
            description: 'View metadata records',
            conditions: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      ]
    })
  })
  
  describe('getAllPermissionsForRole', () => {
    it('should return all permissions for a role', async () => {
      const permissions = await getAllPermissionsForRole('role_user')
      
      expect(permissions).toHaveLength(1)
      expect(permissions[0].name).toBe('metadata:read')
      expect(permissions[0].action).toBe('read')
      expect(permissions[0].subject).toBe('metadata')
    })
    
    it('should return empty array if role not found', async () => {
      jest.mocked(prisma.role.findUnique).mockResolvedValue(null)
      
      const permissions = await getAllPermissionsForRole('non_existent_role')
      
      expect(permissions).toHaveLength(0)
    })
  })
  
  describe('getAllPermissionsForUser', () => {
    it('should return all permissions for a user', async () => {
      const permissions = await getAllPermissionsForUser('user1')
      
      expect(permissions).toHaveLength(2)
      expect(permissions.some(p => p.name === 'metadata:create')).toBe(true)
      expect(permissions.some(p => p.name === 'metadata:read')).toBe(true)
    })
    
    it('should return empty array if user not found', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(null)
      
      const permissions = await getAllPermissionsForUser('non_existent_user')
      
      expect(permissions).toHaveLength(0)
    })
  })
  
  describe('hasPermission', () => {
    it('should return true for admin users', async () => {
      const result = await hasPermission(mockAdminUser, 'any', 'action')
      
      expect(result.granted).toBe(true)
    })
    
    it('should return true if user has the permission', async () => {
      jest.mocked(getAllPermissionsForUser).mockResolvedValue([
        {
          id: 'perm1',
          name: 'metadata:create',
          action: 'create',
          subject: 'metadata',
          description: 'Create metadata records',
          conditions: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ] as any)
      
      const result = await hasPermission(mockUser, 'create', 'metadata')
      
      expect(result.granted).toBe(true)
    })
    
    it('should return false if user does not have the permission', async () => {
      jest.mocked(getAllPermissionsForUser).mockResolvedValue([
        {
          id: 'perm1',
          name: 'metadata:create',
          action: 'create',
          subject: 'metadata',
          description: 'Create metadata records',
          conditions: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ] as any)
      
      const result = await hasPermission(mockUser, 'delete', 'metadata')
      
      expect(result.granted).toBe(false)
      expect(result.reason).toBe('User does not have the delete:metadata permission')
    })
    
    it('should check conditions if they exist', async () => {
      jest.mocked(getAllPermissionsForUser).mockResolvedValue([
        {
          id: 'perm1',
          name: 'metadata:update',
          action: 'update',
          subject: 'metadata',
          description: 'Update metadata records',
          conditions: {
            organizationId: 'org1'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ] as any)
      
      // Test with matching condition
      const result1 = await hasPermission(mockUser, 'update', 'metadata', { organizationId: 'org1' })
      expect(result1.granted).toBe(true)
      
      // Test with non-matching condition
      const result2 = await hasPermission(mockUser, 'update', 'metadata', { organizationId: 'org2' })
      expect(result2.granted).toBe(false)
      expect(result2.reason).toBe('Organization condition not met')
    })
    
    it('should check dynamic conditions if they exist', async () => {
      const dynamicEvaluate = jest.fn()
      
      jest.mocked(getAllPermissionsForUser).mockResolvedValue([
        {
          id: 'perm1',
          name: 'metadata:approve',
          action: 'approve',
          subject: 'metadata',
          description: 'Approve metadata records',
          conditions: {
            dynamic: {
              evaluate: dynamicEvaluate
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ] as any)
      
      // Test with passing dynamic condition
      dynamicEvaluate.mockReturnValue(true)
      const result1 = await hasPermission(mockUser, 'approve', 'metadata')
      expect(result1.granted).toBe(true)
      
      // Test with failing dynamic condition
      dynamicEvaluate.mockReturnValue(false)
      const result2 = await hasPermission(mockUser, 'approve', 'metadata')
      expect(result2.granted).toBe(false)
      expect(result2.reason).toBe('Dynamic condition evaluation failed')
    })
  })
  
  describe('hasAllPermissions', () => {
    it('should return true for admin users', async () => {
      const result = await hasAllPermissions(mockAdminUser, [
        { action: 'create', subject: 'metadata' },
        { action: 'delete', subject: 'user' }
      ])
      
      expect(result.granted).toBe(true)
    })
    
    it('should return true if user has all permissions', async () => {
      const hasPermissionMock = jest.mocked(hasPermission)
      hasPermissionMock.mockResolvedValueOnce({ granted: true })
      hasPermissionMock.mockResolvedValueOnce({ granted: true })
      
      const result = await hasAllPermissions(mockUser, [
        { action: 'create', subject: 'metadata' },
        { action: 'read', subject: 'metadata' }
      ])
      
      expect(result.granted).toBe(true)
    })
    
    it('should return false if user does not have all permissions', async () => {
      const hasPermissionMock = jest.mocked(hasPermission)
      hasPermissionMock.mockResolvedValueOnce({ granted: true })
      hasPermissionMock.mockResolvedValueOnce({ granted: false, reason: 'Missing permission' })
      
      const result = await hasAllPermissions(mockUser, [
        { action: 'create', subject: 'metadata' },
        { action: 'delete', subject: 'metadata' }
      ])
      
      expect(result.granted).toBe(false)
      expect(result.reason).toBe('Missing permission')
    })
  })
  
  describe('hasAnyPermission', () => {
    it('should return true for admin users', async () => {
      const result = await hasAnyPermission(mockAdminUser, [
        { action: 'create', subject: 'metadata' },
        { action: 'delete', subject: 'user' }
      ])
      
      expect(result.granted).toBe(true)
    })
    
    it('should return true if user has any of the permissions', async () => {
      const hasPermissionMock = jest.mocked(hasPermission)
      hasPermissionMock.mockResolvedValueOnce({ granted: false, reason: 'Missing permission' })
      hasPermissionMock.mockResolvedValueOnce({ granted: true })
      
      const result = await hasAnyPermission(mockUser, [
        { action: 'delete', subject: 'metadata' },
        { action: 'read', subject: 'metadata' }
      ])
      
      expect(result.granted).toBe(true)
    })
    
    it('should return false if user does not have any of the permissions', async () => {
      const hasPermissionMock = jest.mocked(hasPermission)
      hasPermissionMock.mockResolvedValueOnce({ granted: false, reason: 'Missing permission 1' })
      hasPermissionMock.mockResolvedValueOnce({ granted: false, reason: 'Missing permission 2' })
      
      const result = await hasAnyPermission(mockUser, [
        { action: 'delete', subject: 'metadata' },
        { action: 'approve', subject: 'metadata' }
      ])
      
      expect(result.granted).toBe(false)
      expect(result.reason).toBe('User does not have any of the required permissions')
    })
  })
  
  describe('canAccessOwnResource', () => {
    it('should return true for admin users', async () => {
      const result = await canAccessOwnResource(mockAdminUser, 'update', 'metadata', 'user2')
      
      expect(result.granted).toBe(true)
    })
    
    it('should return true if user is the owner of the resource', async () => {
      const result = await canAccessOwnResource(mockUser, 'update', 'metadata', mockUser.id)
      
      expect(result.granted).toBe(true)
    })
    
    it('should check permission if user is not the owner', async () => {
      const hasPermissionMock = jest.mocked(hasPermission)
      hasPermissionMock.mockResolvedValueOnce({ granted: true })
      
      const result = await canAccessOwnResource(mockUser, 'update', 'metadata', 'user2')
      
      expect(hasPermissionMock).toHaveBeenCalledWith(
        mockUser,
        'update',
        'metadata',
        { userId: 'user2' }
      )
      expect(result.granted).toBe(true)
    })
  })
})
