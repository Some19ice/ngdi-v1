import { vi } from 'vitest';
import { UserRole } from '@ngdi/types';

/**
 * Mock user for testing
 */
export const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: UserRole.USER,
  emailVerified: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Mock admin user for testing
 */
export const mockAdminUser = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: UserRole.ADMIN,
  emailVerified: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Mock session for testing
 */
export const mockSession = {
  user: mockUser,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Mock Supabase client for testing
 */
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: mockSession },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    refreshSession: vi.fn().mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    }),
  },
};
