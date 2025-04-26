/**
 * Rate Limiting Utilities
 * 
 * This module provides utilities for client-side rate limiting.
 */

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitState {
  count: number;
  resetTime: number;
}

// Store rate limit state for different endpoints
const rateLimitStore = new Map<string, RateLimitState>();

/**
 * Check if a request should be rate limited
 * @param endpoint The API endpoint to check
 * @param options Rate limiting options
 * @returns Whether the request should be allowed
 */
export function checkRateLimit(
  endpoint: string,
  options: RateLimitOptions = { maxRequests: 10, windowMs: 60000 }
): boolean {
  const now = Date.now();
  const state = rateLimitStore.get(endpoint) || { count: 0, resetTime: now + options.windowMs };
  
  // Reset counter if window has passed
  if (now > state.resetTime) {
    rateLimitStore.set(endpoint, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return true;
  }
  
  // Check if limit exceeded
  if (state.count >= options.maxRequests) {
    return false;
  }
  
  // Increment counter
  rateLimitStore.set(endpoint, {
    count: state.count + 1,
    resetTime: state.resetTime,
  });
  
  return true;
}

/**
 * Get time until rate limit resets
 * @param endpoint The API endpoint to check
 * @returns Time in ms until rate limit resets, or 0 if not limited
 */
export function getRateLimitResetTime(endpoint: string): number {
  const state = rateLimitStore.get(endpoint);
  if (!state) return 0;
  
  const now = Date.now();
  return Math.max(0, state.resetTime - now);
}

/**
 * Wrap a fetch function with rate limiting
 * @param fetchFn The fetch function to wrap
 * @param endpoint The API endpoint
 * @param options Rate limiting options
 * @returns The wrapped fetch function
 */
export function withRateLimit<T>(
  fetchFn: () => Promise<T>,
  endpoint: string,
  options?: RateLimitOptions
): () => Promise<T> {
  return async () => {
    if (!checkRateLimit(endpoint, options)) {
      const resetTime = getRateLimitResetTime(endpoint);
      throw new Error(
        `Rate limit exceeded for ${endpoint}. Try again in ${Math.ceil(
          resetTime / 1000
        )} seconds.`
      );
    }
    
    return fetchFn();
  };
}
