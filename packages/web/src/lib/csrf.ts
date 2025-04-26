/**
 * CSRF Protection Utilities
 * 
 * This module provides utilities for CSRF protection in the application.
 */

// Get CSRF token from meta tag
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
}

// Add CSRF token to request headers
export function addCsrfHeader(headers: HeadersInit = {}): HeadersInit {
  const csrfToken = getCsrfToken();
  
  if (csrfToken) {
    return {
      ...headers,
      'X-CSRF-Token': csrfToken,
    };
  }
  
  return headers;
}

// Add CSRF token to fetch options
export function withCsrf(options: RequestInit = {}): RequestInit {
  return {
    ...options,
    headers: addCsrfHeader(options.headers),
  };
}
