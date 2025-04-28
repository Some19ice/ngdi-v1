import { apiClient, StandardizedApiClient } from './standardized-api-client';

/**
 * Factory function to create standardized API services
 * This ensures consistent API client usage across all components
 * 
 * @param basePath The base path for all API endpoints in this service
 * @param customClient Optional custom API client instance
 * @returns A service object with standardized methods
 */
export function createApiService<T = any>(
  basePath: string,
  customClient?: StandardizedApiClient
) {
  // Use provided client or default singleton
  const client = customClient || apiClient;
  
  // Ensure basePath starts with a slash and doesn't end with one
  const normalizedBasePath = basePath.startsWith('/') 
    ? basePath 
    : `/${basePath}`;
    
  // Create and return the service object
  return {
    /**
     * Get all items with optional pagination and filtering
     */
    getAll: async (params?: Record<string, any>) => {
      return client.get<T[]>(normalizedBasePath, { params });
    },
    
    /**
     * Get a paginated list of items
     */
    getPaginated: async (page = 1, limit = 10, params?: Record<string, any>) => {
      return client.get<{
        data: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(normalizedBasePath, { 
        params: { 
          page, 
          limit,
          ...params 
        } 
      });
    },
    
    /**
     * Get a single item by ID
     */
    getById: async (id: string | number) => {
      return client.get<T>(`${normalizedBasePath}/${id}`);
    },
    
    /**
     * Create a new item
     */
    create: async (data: Partial<T>) => {
      return client.post<T>(normalizedBasePath, data);
    },
    
    /**
     * Update an existing item
     */
    update: async (id: string | number, data: Partial<T>) => {
      return client.put<T>(`${normalizedBasePath}/${id}`, data);
    },
    
    /**
     * Partially update an existing item
     */
    patch: async (id: string | number, data: Partial<T>) => {
      return client.patch<T>(`${normalizedBasePath}/${id}`, data);
    },
    
    /**
     * Delete an item
     */
    delete: async (id: string | number) => {
      return client.delete<{ success: boolean }>(`${normalizedBasePath}/${id}`);
    },
    
    /**
     * Custom GET request with path appended to base path
     */
    customGet: async <R = any>(path: string, params?: Record<string, any>) => {
      const fullPath = `${normalizedBasePath}${path.startsWith('/') ? path : `/${path}`}`;
      return client.get<R>(fullPath, { params });
    },
    
    /**
     * Custom POST request with path appended to base path
     */
    customPost: async <R = any>(path: string, data?: any) => {
      const fullPath = `${normalizedBasePath}${path.startsWith('/') ? path : `/${path}`}`;
      return client.post<R>(fullPath, data);
    },
    
    /**
     * Custom PUT request with path appended to base path
     */
    customPut: async <R = any>(path: string, data?: any) => {
      const fullPath = `${normalizedBasePath}${path.startsWith('/') ? path : `/${path}`}`;
      return client.put<R>(fullPath, data);
    },
    
    /**
     * Custom DELETE request with path appended to base path
     */
    customDelete: async <R = any>(path: string) => {
      const fullPath = `${normalizedBasePath}${path.startsWith('/') ? path : `/${path}`}`;
      return client.delete<R>(fullPath);
    },
    
    /**
     * Get the raw client for advanced usage
     */
    getClient: () => client,
  };
}

export default createApiService;
