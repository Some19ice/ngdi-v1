import { createApiService } from '../service-factory';
import { MetadataResponse, MetadataRequest } from '@/types/metadata';

/**
 * Metadata API service
 * Provides standardized methods for interacting with the metadata endpoints
 */
export const metadataService = createApiService<MetadataResponse>('/metadata');

/**
 * Extended metadata service with additional specialized methods
 */
export const metadataApi = {
  ...metadataService,
  
  /**
   * Get metadata by validation status
   */
  getByValidationStatus: async (status: string, page = 1, limit = 10) => {
    return metadataService.getPaginated(page, limit, { validationStatus: status });
  },
  
  /**
   * Get metadata by user ID
   */
  getByUserId: async (userId: string, page = 1, limit = 10) => {
    return metadataService.getPaginated(page, limit, { userId });
  },
  
  /**
   * Submit metadata for validation
   */
  submitForValidation: async (id: string) => {
    return metadataService.customPost<{ success: boolean }>(`/${id}/submit`);
  },
  
  /**
   * Approve metadata
   */
  approve: async (id: string, comments?: string) => {
    return metadataService.customPost<{ success: boolean }>(`/${id}/approve`, { comments });
  },
  
  /**
   * Reject metadata
   */
  reject: async (id: string, reason: string) => {
    return metadataService.customPost<{ success: boolean }>(`/${id}/reject`, { reason });
  },
  
  /**
   * Request changes to metadata
   */
  requestChanges: async (id: string, changes: string) => {
    return metadataService.customPost<{ success: boolean }>(`/${id}/request-changes`, { changes });
  },
  
  /**
   * Get metadata statistics
   */
  getStats: async () => {
    return metadataService.customGet<{
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      draft: number;
    }>('/stats');
  },
  
  /**
   * Search metadata
   */
  search: async (query: string, page = 1, limit = 10) => {
    return metadataService.customGet<{
      data: MetadataResponse[];
      total: number;
      page: number;
      limit: number;
    }>('/search', { query, page, limit });
  },
};

export default metadataApi;
