import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { 
  requirePermission, 
  requireAllPermissions, 
  requireAnyPermission, 
  requireOwnership, 
  requireActivity 
} from '../../../middleware/permission.middleware'
import { hasPermission, hasAllPermissions, hasAnyPermission, logPermissionCheck } from '../../../utils/permissions'
import { prisma } from '../../../lib/prisma'
import { UserRole } from '@prisma/client'
import { AuthError } from '../../../types/error.types'

// Mock permissions utils
jest.mock('../../../utils/permissions', () => ({
  hasPermission: jest.fn(),
  hasAllPermissions: jest.fn(),
  hasAnyPermission: jest.fn(),
  logPermissionCheck: jest.fn()
}))

// Mock prisma
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    activityLog: {
      findFirst: jest.fn()
    }
  }
}))

describe('Permission Middleware', () => {
  let mockContext: any
  let mockNext: any
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Create mock context
    mockContext = {
      req: {
        header: jest.fn().mockImplementation(header => {
          if (header === 'user-agent') return 'test-agent'
          if (header === 'x-forwarded-for') return '127.0.0.1'
          return null
        }),
        param: jest.fn().mockReturnValue('resource123')
      },
      get: jest.fn().mockImplementation(key => {
        if (key === 'user') {
          return {
            id: 'user1',
            email: 'user@example.com',
            role: UserRole.USER
          }
        }
        return null
      }),
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    }
    
    // Create mock next function
    mockNext = jest.fn()
  })
  
  describe('requirePermission', () => {
    it('should call next if user has permission', async () => {
      // Mock hasPermission to return granted: true
      jest.mocked(hasPermission).mockResolvedValue({ granted: true })
      
      // Call middleware
      await requirePermission('create', 'metadata')(mockContext, mockNext)
      
      // Verify hasPermission was called with correct arguments
      expect(hasPermission).toHaveBeenCalledWith(
        mockContext.get('user'),
        'create',
        'metadata',
        { id: 'resource123' }
      )
      
      // Verify logPermissionCheck was called
      expect(logPermissionCheck).toHaveBeenCalled()
      
      // Verify next was called
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should throw AuthError if user does not have permission', async () => {
      // Mock hasPermission to return granted: false
      jest.mocked(hasPermission).mockResolvedValue({ 
        granted: false,
        reason: 'User does not have the create:metadata permission'
      })
      
      // Call middleware and expect it to throw
      await expect(requirePermission('create', 'metadata')(mockContext, mockNext))
        .rejects
        .toThrow(AuthError)
      
      // Verify hasPermission was called
      expect(hasPermission).toHaveBeenCalled()
      
      // Verify logPermissionCheck was called
      expect(logPermissionCheck).toHaveBeenCalled()
      
      // Verify next was not called
      expect(mockNext).not.toHaveBeenCalled()
    })
    
    it('should throw AuthError if user is not in context', async () => {
      // Mock get to return null for user
      mockContext.get.mockImplementation(key => null)
      
      // Call middleware and expect it to throw
      await expect(requirePermission('create', 'metadata')(mockContext, mockNext))
        .rejects
        .toThrow(AuthError)
      
      // Verify hasPermission was not called
      expect(hasPermission).not.toHaveBeenCalled()
      
      // Verify next was not called
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
  
  describe('requireAllPermissions', () => {
    it('should call next if user has all permissions', async () => {
      // Mock hasAllPermissions to return granted: true
      jest.mocked(hasAllPermissions).mockResolvedValue({ granted: true })
      
      // Call middleware
      await requireAllPermissions([
        { action: 'create', subject: 'metadata' },
        { action: 'update', subject: 'metadata' }
      ])(mockContext, mockNext)
      
      // Verify hasAllPermissions was called with correct arguments
      expect(hasAllPermissions).toHaveBeenCalledWith(
        mockContext.get('user'),
        [
          { action: 'create', subject: 'metadata' },
          { action: 'update', subject: 'metadata' }
        ],
        { id: 'resource123' }
      )
      
      // Verify logPermissionCheck was called
      expect(logPermissionCheck).toHaveBeenCalled()
      
      // Verify next was called
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should throw AuthError if user does not have all permissions', async () => {
      // Mock hasAllPermissions to return granted: false
      jest.mocked(hasAllPermissions).mockResolvedValue({ 
        granted: false,
        reason: 'Missing required permission'
      })
      
      // Call middleware and expect it to throw
      await expect(requireAllPermissions([
        { action: 'create', subject: 'metadata' },
        { action: 'update', subject: 'metadata' }
      ])(mockContext, mockNext))
        .rejects
        .toThrow(AuthError)
      
      // Verify hasAllPermissions was called
      expect(hasAllPermissions).toHaveBeenCalled()
      
      // Verify logPermissionCheck was called
      expect(logPermissionCheck).toHaveBeenCalled()
      
      // Verify next was not called
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
  
  describe('requireAnyPermission', () => {
    it('should call next if user has any of the permissions', async () => {
      // Mock hasAnyPermission to return granted: true
      jest.mocked(hasAnyPermission).mockResolvedValue({ granted: true })
      
      // Call middleware
      await requireAnyPermission([
        { action: 'create', subject: 'metadata' },
        { action: 'update', subject: 'metadata' }
      ])(mockContext, mockNext)
      
      // Verify hasAnyPermission was called with correct arguments
      expect(hasAnyPermission).toHaveBeenCalledWith(
        mockContext.get('user'),
        [
          { action: 'create', subject: 'metadata' },
          { action: 'update', subject: 'metadata' }
        ],
        { id: 'resource123' }
      )
      
      // Verify logPermissionCheck was called
      expect(logPermissionCheck).toHaveBeenCalled()
      
      // Verify next was called
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should throw AuthError if user does not have any of the permissions', async () => {
      // Mock hasAnyPermission to return granted: false
      jest.mocked(hasAnyPermission).mockResolvedValue({ 
        granted: false,
        reason: 'User does not have any of the required permissions'
      })
      
      // Call middleware and expect it to throw
      await expect(requireAnyPermission([
        { action: 'create', subject: 'metadata' },
        { action: 'update', subject: 'metadata' }
      ])(mockContext, mockNext))
        .rejects
        .toThrow(AuthError)
      
      // Verify hasAnyPermission was called
      expect(hasAnyPermission).toHaveBeenCalled()
      
      // Verify logPermissionCheck was called
      expect(logPermissionCheck).toHaveBeenCalled()
      
      // Verify next was not called
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
  
  describe('requireOwnership', () => {
    it('should call next if user is the owner', async () => {
      // Create getUserIdFromResource function
      const getUserIdFromResource = jest.fn().mockResolvedValue('user1')
      
      // Call middleware
      await requireOwnership('metadata', getUserIdFromResource)(mockContext, mockNext)
      
      // Verify getUserIdFromResource was called with context
      expect(getUserIdFromResource).toHaveBeenCalledWith(mockContext)
      
      // Verify next was called
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should call next if user is admin', async () => {
      // Mock user as admin
      mockContext.get.mockImplementation(key => {
        if (key === 'user') {
          return {
            id: 'admin1',
            email: 'admin@example.com',
            role: UserRole.ADMIN
          }
        }
        return null
      })
      
      // Create getUserIdFromResource function
      const getUserIdFromResource = jest.fn().mockResolvedValue('user2')
      
      // Call middleware
      await requireOwnership('metadata', getUserIdFromResource)(mockContext, mockNext)
      
      // Verify getUserIdFromResource was not called (admin bypass)
      expect(getUserIdFromResource).not.toHaveBeenCalled()
      
      // Verify next was called
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should throw AuthError if user is not the owner', async () => {
      // Create getUserIdFromResource function
      const getUserIdFromResource = jest.fn().mockResolvedValue('user2')
      
      // Call middleware and expect it to throw
      await expect(requireOwnership('metadata', getUserIdFromResource)(mockContext, mockNext))
        .rejects
        .toThrow(AuthError)
      
      // Verify getUserIdFromResource was called
      expect(getUserIdFromResource).toHaveBeenCalled()
      
      // Verify next was not called
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
  
  describe('requireActivity', () => {
    it('should call next if user has recent activity', async () => {
      // Mock findFirst to return an activity
      jest.mocked(prisma.activityLog.findFirst).mockResolvedValue({
        id: 'activity1',
        userId: 'user1',
        action: 'review',
        subject: 'metadata',
        createdAt: new Date(),
        subjectId: null,
        metadata: null,
        ipAddress: null,
        userAgent: null
      })
      
      // Call middleware
      await requireActivity('review', 'metadata', 24)(mockContext, mockNext)
      
      // Verify findFirst was called with correct arguments
      expect(prisma.activityLog.findFirst).toHaveBeenCalled()
      
      // Verify next was called
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should call next if user is admin', async () => {
      // Mock user as admin
      mockContext.get.mockImplementation(key => {
        if (key === 'user') {
          return {
            id: 'admin1',
            email: 'admin@example.com',
            role: UserRole.ADMIN
          }
        }
        return null
      })
      
      // Call middleware
      await requireActivity('review', 'metadata', 24)(mockContext, mockNext)
      
      // Verify findFirst was not called (admin bypass)
      expect(prisma.activityLog.findFirst).not.toHaveBeenCalled()
      
      // Verify next was called
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should throw AuthError if user has no recent activity', async () => {
      // Mock findFirst to return null (no activity)
      jest.mocked(prisma.activityLog.findFirst).mockResolvedValue(null)
      
      // Call middleware and expect it to throw
      await expect(requireActivity('review', 'metadata', 24)(mockContext, mockNext))
        .rejects
        .toThrow(AuthError)
      
      // Verify findFirst was called
      expect(prisma.activityLog.findFirst).toHaveBeenCalled()
      
      // Verify next was not called
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
})
