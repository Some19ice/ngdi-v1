/**
 * API Service Registry
 * 
 * This file centralizes access to all API services in the application.
 * It ensures consistent API client usage across all components.
 */

// Import existing services
import { metadataApi } from './services/metadata.service';
import { userApi } from './services/user.service';

// Import the API client and service factory
import { apiClient } from './standardized-api-client';
import { createApiService } from './service-factory';

// Import types
import { SearchResult } from '@/types/search';
import { ActivityLog } from '@/types/activity';
import { Permission, Role } from '@/types/permissions';
import { Setting } from '@/types/settings';

/**
 * Search API service
 */
export const searchApi = createApiService<SearchResult>('/search');

/**
 * Activity logs API service
 */
export const activityApi = createApiService<ActivityLog>('/activity-logs');

/**
 * Permissions API service
 */
export const permissionsApi = createApiService<Permission>('/permissions');

/**
 * Roles API service
 */
export const rolesApi = createApiService<Role>('/roles');

/**
 * Settings API service
 */
export const settingsApi = createApiService<Setting>('/settings');

/**
 * Admin API service
 */
export const adminApi = {
  getDashboardStats: async () => {
    return apiClient.get('/admin/dashboard-stats');
  },
  
  getUserStats: async () => {
    return apiClient.get('/admin/user-stats');
  },
  
  getMetadataStats: async () => {
    return apiClient.get('/admin/metadata-stats');
  },
  
  getSystemHealth: async () => {
    return apiClient.get('/admin/system-health');
  }
};

/**
 * Export all services in a single object for easy access
 */
export const services = {
  metadata: metadataApi,
  user: userApi,
  search: searchApi,
  activity: activityApi,
  permissions: permissionsApi,
  roles: rolesApi,
  settings: settingsApi,
  admin: adminApi,
};

export default services;
