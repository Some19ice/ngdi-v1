import axios from 'axios';
import { authClient } from './auth-client';

// Types
interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}

// Refresh token state
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 10 * 1000; // 10 seconds
const failedQueue: QueueItem[] = [];

/**
 * Process the queue of requests that were waiting for a token refresh
 */
function processQueue(error: any = null) {
  if (error) {
    // Reject all queued requests
    failedQueue.forEach(({ reject }) => reject(error));
  } else {
    // Resolve all queued requests
    failedQueue.forEach(({ resolve }) => resolve(null));
  }
  
  // Clear the queue
  failedQueue.length = 0;
}

/**
 * Add a request to the queue
 */
function enqueueRequest(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  });
}

/**
 * Refresh the authentication token
 * - Handles concurrency with a queue
 * - Implements retry logic
 * - Ensures minimum time between refresh attempts
 */
export async function refreshAuthToken(retryCount = 0): Promise<void> {
  const now = Date.now();
  
  // Check if we've refreshed recently
  if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
    if (refreshPromise) {
      // If a refresh is in progress, wait for it
      return refreshPromise;
    } else {
      // Skip if we refreshed recently and there's no ongoing refresh
      return Promise.resolve();
    }
  }

  // If already refreshing, return the existing promise or enqueue
  if (isRefreshing) {
    return enqueueRequest() as Promise<void>;
  }

  try {
    // Set refreshing state
    isRefreshing = true;
    lastRefreshTime = now;

    // Create the refresh promise
    refreshPromise = authClient.refreshSession();

    // Wait for refresh to complete
    await refreshPromise;
    
    // Process the queue on success
    processQueue();
    
    return;
  } catch (error) {
    // Handle specific error scenarios
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        // Token is invalid/expired and can't be refreshed
        // Reject all queued requests
        processQueue(error);
        
        // Force logout if retry attempts are exhausted
        if (retryCount >= 2) {
          await authClient.logout();
          window.location.href = '/auth/signin';
        } else if (retryCount === 0) {
          // Try once more after a short delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          return refreshAuthToken(retryCount + 1);
        }
      } else if (error.response.status === 429) {
        // Rate limited - back off and retry
        const backoffTime = 2000 * (retryCount + 1);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
        if (retryCount < 3) {
          return refreshAuthToken(retryCount + 1);
        }
      }
    }
    
    // For other errors, reject all queued requests
    processQueue(error);
    
    // Rethrow the error
    throw error;
  } finally {
    // Reset state
    isRefreshing = false;
    refreshPromise = null;
  }
}

/**
 * Set up an axios interceptor for automatic token refresh
 */
export function setupAxiosTokenRefresh(axiosInstance: typeof axios) {
  // Response interceptor
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      // Only retry once to prevent infinite loops
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Refresh the token
          await refreshAuthToken();
          
          // Get the updated token
          const session = await authClient.getSession();
          if (session?.accessToken) {
            // Update the request header with the new token
            originalRequest.headers['Authorization'] = `Bearer ${session.accessToken}`;
            
            // Retry the request
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
}

// Set up a timer to refresh the token before it expires
export function setupTokenRefreshTimer() {
  const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  // Check token expiration periodically
  setInterval(async () => {
    try {
      const session = await authClient.getSession();
      if (!session) return;
      
      // Get the token from the session
      const { accessToken } = session;
      if (!accessToken) return;
      
      // Validate the token to check its expiration
      const validation = await authClient.validateToken(accessToken);
      
      // If token is valid but will expire soon (within 15 minutes), refresh it
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = validation.exp || 0;
      const timeToExpiry = expiresAt - now;
      
      // If token expires in less than 15 minutes, refresh it
      if (validation.isValid && timeToExpiry < 15 * 60) {
        console.log('Token will expire soon, refreshing...');
        await refreshAuthToken();
      }
    } catch (error) {
      console.error('Token refresh check failed:', error);
    }
  }, CHECK_INTERVAL);
} 