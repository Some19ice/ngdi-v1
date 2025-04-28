import { createApiService } from '../service-factory';
import { UserProfile, UserUpdateRequest } from '@/types/user';

/**
 * User API service
 * Provides standardized methods for interacting with the user endpoints
 */
export const userService = createApiService<UserProfile>('/users');

/**
 * Extended user service with additional specialized methods
 */
export const userApi = {
  ...userService,
  
  /**
   * Get the current user's profile
   */
  getCurrentUser: async () => {
    return userService.customGet<UserProfile>('/profile');
  },
  
  /**
   * Update the current user's profile
   */
  updateProfile: async (data: UserUpdateRequest) => {
    return userService.customPut<UserProfile>('/profile', data);
  },
  
  /**
   * Change the user's password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    return userService.customPost<{ success: boolean }>('/change-password', {
      currentPassword,
      newPassword,
    });
  },
  
  /**
   * Get user activity
   */
  getActivity: async (userId?: string, page = 1, limit = 10) => {
    const path = userId ? `/activity/${userId}` : '/activity';
    return userService.customGet(path, { page, limit });
  },
  
  /**
   * Update user role (admin only)
   */
  updateRole: async (userId: string, role: string) => {
    return userService.customPut<UserProfile>(`/${userId}/role`, { role });
  },
  
  /**
   * Get user sessions
   */
  getSessions: async () => {
    return userService.customGet<{
      sessions: Array<{
        id: string;
        createdAt: string;
        lastActive: string;
        ipAddress: string;
        userAgent: string;
        device: string;
        isCurrent: boolean;
      }>;
    }>('/sessions');
  },
  
  /**
   * Revoke a specific session
   */
  revokeSession: async (sessionId: string) => {
    return userService.customDelete<{ success: boolean }>(`/sessions/${sessionId}`);
  },
  
  /**
   * Revoke all sessions except the current one
   */
  revokeAllSessions: async () => {
    return userService.customPost<{ success: boolean }>('/sessions/revoke-all');
  },
  
  /**
   * Request email verification
   */
  requestEmailVerification: async () => {
    return userService.customPost<{ success: boolean }>('/request-verification');
  },
  
  /**
   * Verify email with token
   */
  verifyEmail: async (token: string) => {
    return userService.customPost<{ success: boolean }>('/verify-email', { token });
  },
};

export default userApi;
